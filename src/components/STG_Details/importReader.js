const { HNQIS2_TEMPLATE_MAP, TEMPLATE_PROGRAM_TYPES, TRACKER_TEMPLATE_MAP, TRACKER_TEA_MAP } = require("../../configs/TemplateConstants");
const { mapImportedDEHNQIS2, mapImportedDE, countChanges, getBasicForm } = require("../Excel/importerUtils");

const readTemplateData = (
    {
        teaData,
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
    let ignoredSections = [];
    let importedSections = [];
    let importedScores = [];
    let dataElementsPool = currentSectionsData?.map(section => section.dataElements)
        .flat().reduce((acu, cur) => {
        acu[cur.id] = { sharing: cur.sharing, attributeValues: cur.attributeValues, style: cur.style, categoryCombo: cur.categoryCombo };
        return acu;
    }, {}) || [];

    const dataElementsName = (isHNQIS) ? 'questions' : 'dataElements';
    
    const templateMap = (isHNQIS) ? HNQIS2_TEMPLATE_MAP : TRACKER_TEMPLATE_MAP;
    
    templateData.forEach((row, rowNum) => {
        switch (row[templateMap.structure]) {
            case 'Section':
                if (row[templateMap.programSection] === 'basic-form' && sectionIndex === -1) isBasicForm = true;
                if ((isBasicForm && importedSections.length > 0)) {
                    ignoredSections.push({ name: row[templateMap.formName], rowNum: rowNum+3})
                    break;
                }
                sectionIndex += 1;
                if (isHNQIS && (row[HNQIS2_TEMPLATE_MAP.formName] == "Critical Steps Calculations" || row[HNQIS2_TEMPLATE_MAP.formName] == "Scores")) break;
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
                importedSections[isBasicForm?0:sectionIndex].dataElements.push(mapImportedDE(row, programPrefix, currentData.stageNumber, optionSets, legendSets, dataElementsPool));
                break;
            case 'question':
            case 'label':
                importedSections[sectionIndex].dataElements.push(mapImportedDEHNQIS2(row, programPrefix, row[HNQIS2_TEMPLATE_MAP.structure], optionSets, legendSets, dataElementsPool));
                break;
            case 'score':
                importedScores.push(mapImportedDEHNQIS2(row, programPrefix, 'score', optionSets, legendSets, dataElementsPool));
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
        let removedScores = currentData.scoresSection.dataElements.filter(de =>
            !importedScores.find(i_score => i_score.id == de.id)
        );
        importSummaryValues.scores.removed = removedScores.length;
        importSummaryValues.scores.removedItems = removedScores;

        return { importedSections, importedScores };
    }

    

    return { importedSections, ignoredSections };

};

module.exports = {
    readTemplateData
};