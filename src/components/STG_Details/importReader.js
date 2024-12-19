const { METADATA } = require("../../configs/Constants.js");
const { HNQISMWI_ActionPlanElements, HNQISMWI_SectionDataElements } = require("../../configs/ProgramTemplate.js");
const { HNQIS2_TEMPLATE_MAP, TEMPLATE_PROGRAM_TYPES, TRACKER_TEMPLATE_MAP, HNQISMWI_TEMPLATE_MAP } = require("../../configs/TemplateConstants.js");
const { mapImportedDEHNQIS2, mapImportedDE, countChanges, getBasicForm, mapImportedDEHNQISMWI } = require("../../utils/importerUtils.js");
const { DeepCopy } = require("../../utils/Utils.js");

const readTemplateData = (
    {
        templateData,
        currentData,
        programPrefix = 'Prefix',
        optionSets,
        legendSets,
        currentSectionsData,
        mode,
        importSummaryValues
    }
) => {

    const isHNQIS = mode === TEMPLATE_PROGRAM_TYPES.hnqis2;
    let sectionIndex = -1;
    let isBasicForm = false;
    const ignoredSections = [];
    const importedSections = [];
    const importedScores = [];
    const dataElementsPool = currentSectionsData?.map(section => section.dataElements)
        .flat().reduce((acu, cur) => {
        acu[cur.id] = { sharing: cur.sharing, attributeValues: cur.attributeValues, style: cur.style, categoryCombo: cur.categoryCombo };
        return acu;
    }, {}) || [];

    const dataElementsName = (isHNQIS) ? 'questions' : 'dataElements';
    
    const templateMap = (isHNQIS) ? HNQIS2_TEMPLATE_MAP : TRACKER_TEMPLATE_MAP;
    
    templateData.forEach((row, rowNum) => {
        switch (row[templateMap.structure]) {
            case 'Section':
                if (row[templateMap.programSection] === 'basic-form' && sectionIndex === -1) { isBasicForm = true }
                if ((isBasicForm && importedSections.length > 0)) {
                    ignoredSections.push({ name: row[templateMap.formName], rowNum: rowNum + 3 })
                    break;
                }
                sectionIndex += 1;
                if (isHNQIS && (row[HNQIS2_TEMPLATE_MAP.formName] == "Critical Steps Calculations" || row[HNQIS2_TEMPLATE_MAP.formName] == "Scores")) { break }
                importedSections[sectionIndex] = {
                    id: row[templateMap.programSection] || undefined,
                    name: row[templateMap.formName],
                    displayName: row[templateMap.formName],
                    sortOrder: sectionIndex,
                    dataElements: [],
                    importStatus: row[templateMap.programSection] ? 'update' : 'new',
                    isBasicForm
                }
                row[templateMap.programSection] ? importSummaryValues.sections.updated++ : importSummaryValues.sections.new++;
                break;
            case 'Data Element':
                if (sectionIndex === -1) {
                    sectionIndex += 1;
                    isBasicForm = true;
                    importedSections[sectionIndex] = getBasicForm('DE');
                }
                importedSections[isBasicForm ? 0 : sectionIndex].dataElements.push(mapImportedDE({
                    data: row,
                    programPrefix,
                    stageNumber: currentData.stageNumber,
                    optionSets,
                    legendSets,
                    dataElementsPool
                }));
                break;
            case 'question':
            case 'label':
                importedSections[sectionIndex].dataElements.push(mapImportedDEHNQIS2({
                    data: row,
                    programPrefix,
                    type: row[HNQIS2_TEMPLATE_MAP.structure],
                    optionSets,
                    legendSets,
                    dataElementsPool
                }));
                break;
            case 'score':
                importedScores.push(mapImportedDEHNQIS2({
                    data: row,
                    programPrefix,
                    type: 'score',
                    optionSets,
                    legendSets,
                    dataElementsPool
                }));
                break;
        }
    });

    countChanges({
        sections: importedSections,
        sectionsSummary: importSummaryValues.sections,
        countObject: 'dataElements',
        summaryObject: importSummaryValues[dataElementsName],
        currentData: currentData.sections
    })

    if (mode === TEMPLATE_PROGRAM_TYPES.hnqis2) {
        // New scores
        importedScores.forEach(i_score => {
            i_score.importStatus = i_score.id == null ? 'new' : 'update';
            i_score.id == null ? importSummaryValues.scores.new++ : importSummaryValues.scores.updated++;
        });

        // Removed Scores
        const removedScores = currentData.scoresSection.dataElements.filter(de =>
            !importedScores.find(i_score => i_score.id == de.id)
        );
        importSummaryValues.scores.removed = removedScores.length;
        importSummaryValues.scores.removedItems = removedScores;

        return { importedSections, importedScores };
    }

    

    return { importedSections, ignoredSections };

};

const readTemplateDataMWI = (
    {
        templateData,
        currentData,
        programPrefix = 'Prefix',
        legendSets,
        currentSectionsData,
        importSummaryValues
    }
) => {

    let sectionIndex = -1;
    let isBasicForm = false;
    const ignoredSections = [];
    const importedSections = [];
    const dataElementsPool = currentSectionsData?.map(section => section.dataElements)
        .flat().reduce((acu, cur) => {
            acu[cur.id] = { sharing: cur.sharing, attributeValues: cur.attributeValues, style: cur.style, categoryCombo: cur.categoryCombo };
            return acu;
        }, {}) || [];

    const dataElementsName = 'questions';

    const templateMap = HNQISMWI_TEMPLATE_MAP;

    let sectionNumber = 0;
    let standardNumber = 0;
    let criterionNumber = 0;
    let dataElementNumber = 1;
    let logicDataElements = [];

    templateData.forEach((row, rowNum) => {
        const structure = row[templateMap.structure];
        let numeration = '';
        if (structure === 'Section') {
            sectionNumber++;
            standardNumber = 0;
            criterionNumber = 0;
            numeration = `Section ${sectionNumber} : `;
            logicDataElements = row[templateMap.dataElementId]
                ? JSON.parse(row[templateMap.dataElementId]).map(de => {
                    de.formName = `Section ${sectionNumber}`
                    de.code = `${programPrefix} - Section ${sectionNumber}`;
                    de.attributeValues = [{
                        "attribute": { "id": METADATA },
                        "value": "{\"elemType\":\"holder\",\"isCompulsory\":\"No\",\"labelFormName\":\"-\"}"
                    }];
                    return de;
                })
                : (DeepCopy(HNQISMWI_SectionDataElements).map(de => {
                    de.code = `${programPrefix} - Section ${sectionNumber}`;
                    de.name = `${programPrefix} - Section ${sectionNumber}`;
                    de.shortName = `${programPrefix} - Section ${sectionNumber}`;
                    de.formName = `Section ${sectionNumber}`
                    return de;
                }));
        } else if (structure === 'Standard') {
            standardNumber++;
            criterionNumber = 0;
            numeration = `> Standard ${sectionNumber}.${standardNumber} : `;
        } else if (structure === 'Criterion') {
            criterionNumber++;
            numeration = `> > Criterion ${sectionNumber}.${standardNumber}.${criterionNumber} : `;

            logicDataElements = row[templateMap.dataElementId]
                ? JSON.parse(row[templateMap.dataElementId]).map((de, index) => { 
                    de.formName = `${sectionNumber}.${standardNumber}.${criterionNumber} ${de.formName.replace(/\d+.\d+.\d+ /, "")}`
                    de.code = `${programPrefix} - ${sectionNumber}.${standardNumber}.${criterionNumber} MWI_AP_DE${index + 1}`;
                    return de;
                })
                : (DeepCopy(HNQISMWI_ActionPlanElements).map(de => {
                    de.code = `${programPrefix} - ${sectionNumber}.${standardNumber}.${criterionNumber} ${de.code}`;
                    de.name = `${programPrefix} - ${sectionNumber}.${standardNumber}.${criterionNumber} ${de.name}`;
                    de.shortName = `${programPrefix} - ${sectionNumber}.${standardNumber}.${criterionNumber} ${de.shortName}`;
                    de.formName = `${sectionNumber}.${standardNumber}.${criterionNumber} ${de.formName}`;
                    return de;
                }));
        }

        switch (structure) {
            case 'Section':
            case 'Standard':
            case 'Criterion': {
                dataElementNumber = 1;
                if (row[templateMap.programSection] === 'basic-form' && sectionIndex === -1) { isBasicForm = true }
                
                if ((isBasicForm && importedSections.length > 0)) {
                    ignoredSections.push({ name: row[templateMap.formName], rowNum: rowNum + 3 })
                    break;
                }

                importedSections[sectionIndex]?.dataElements?.push(
                    ...importedSections[sectionIndex].logicDataElements
                );

                sectionIndex += 1;

                importedSections[sectionIndex] = {
                    id: row[templateMap.programSection] || undefined,
                    name: numeration + (row[templateMap.formName].replace(/(> > Criterion \d+(\.\d+)*|> Standard \d+(\.\d+)*|Section \d+) : /g, "")),
                    displayName: numeration + (row[templateMap.formName].replace(/(> > Criterion \d+(\.\d+)*|> Standard \d+(\.\d+)*|Section \d+) : /g, "")),
                    sortOrder: sectionIndex,
                    dataElements: [],
                    logicDataElements,
                    importStatus: row[templateMap.programSection] ? 'update' : 'new',
                    isBasicForm
                }

                if (structure === 'Criterion' && row[templateMap.isCritical] === 'Yes') {
                    importedSections[sectionIndex].description = "*";
                }

                logicDataElements = [];
                row[templateMap.programSection] ? importSummaryValues.sections.updated++ : importSummaryValues.sections.new++;
                
                break;
            }
            case 'question':
            case 'label':
                row[HNQISMWI_TEMPLATE_MAP.feedbackOrder] = `${sectionNumber}.${standardNumber}.${criterionNumber}.${dataElementNumber}`
                dataElementNumber++;
            // eslint-disable-next-line no-fallthrough
            case 'Std Overview':
                importedSections[sectionIndex].dataElements.push(mapImportedDEHNQISMWI({
                    data: row,
                    programPrefix,
                    type: row[HNQISMWI_TEMPLATE_MAP.structure],
                    legendSets,
                    dataElementsPool
                }));
                break;
        }
    });

    importedSections[sectionIndex]?.dataElements?.push(
        ...importedSections[sectionIndex].logicDataElements
    );

    countChanges({
        sections: importedSections,
        sectionsSummary: importSummaryValues.sections,
        countObject: 'dataElements',
        summaryObject: importSummaryValues[dataElementsName],
        currentData: currentData.sections
    })

    return { importedSections, ignoredSections };

};

module.exports = {
    readTemplateData,
    readTemplateDataMWI
};
