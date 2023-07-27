const { HNQIS2_TEMPLATE_MAP, TEMPLATE_PROGRAM_TYPES, TRACKER_TEMPLATE_MAP } = require("../../configs/TemplateConstants");
const { mapImportedDEHNQIS2, mapImportedDE } = require("../Excel/importerUtils");

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
    let importedSections = [];
    let importedScores = [];
    let dataElementsPool = currentSectionsData?.map(section => section.dataElements)
        .flat().reduce((acu, cur) => {
        acu[cur.id] = { sharing: cur.sharing, attributeValues: cur.attributeValues, style: cur.style, categoryCombo: cur.categoryCombo };
        return acu;
    }, {}) || [];

    const dataElementsName = (isHNQIS) ? 'questions' : 'dataElements';
    
    const templateMap = (isHNQIS) ? HNQIS2_TEMPLATE_MAP : TRACKER_TEMPLATE_MAP;
    
    templateData.forEach(row => {
        switch (row[templateMap.structure]) {
            case 'Section':
                if (isHNQIS && (row[HNQIS2_TEMPLATE_MAP.formName] == "Critical Steps Calculations" || row[HNQIS2_TEMPLATE_MAP.formName] == "Scores")) break;
                sectionIndex++;
                importedSections[sectionIndex] = {
                    id: row[templateMap.programSection] || undefined,
                    name: row[templateMap.formName],
                    displayName: row[templateMap.formName],
                    sortOrder: sectionIndex + 1,
                    dataElements: [],
                    importStatus: row[templateMap.programSection] ? 'update' : 'new'
                }
                row[templateMap.programSection] ? importSummaryValues.sections.updated++ : importSummaryValues.sections.new++;
                break;
            case 'Data Element':
                importedSections[sectionIndex].dataElements.push(mapImportedDE(row, programPrefix, optionSets, legendSets, dataElementsPool));
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

    // Get new Data Elements (no uid)
    
    console.log(importedSections)

    importedSections.forEach(i_section => {
        i_section.newDataElements = 0;
        i_section.updatedDataElements = 0;

        i_section.dataElements.map(i_de => {
            if (i_de.id == null) {
                //New DE
                i_de.importStatus = 'new';
                importSummaryValues[dataElementsName].new++;
                i_section.newDataElements++;
            } else {
                //Updated DE
                i_de.importStatus = 'update';
                importSummaryValues[dataElementsName].updated++;
                i_section.updatedDataElements++;
            }

            return i_de;
        })
    });

    // Compare previous questions with imported data -> Get removed data
    var removedDataElements = currentData.sections.map(sec => {
        // Section removed -> Increase counter
        if (!importedSections.find(i_sec => i_sec.id == sec.id)) importSummaryValues.sections.removed++;
        return sec.dataElements.filter(de =>
            !importedSections.find(i_sec => i_sec.dataElements.find(i_de => i_de.id == de.id))
        )
    }).flat();

    importSummaryValues[dataElementsName].removed = removedDataElements.length;
    importSummaryValues[dataElementsName].removedItems = removedDataElements;

    if (mode === TEMPLATE_PROGRAM_TYPES.hnqis2) {
        // New scores
        importedScores.forEach(i_score => {
            i_score.importStatus = i_score.id == null ? 'new' : 'update';
            i_score.id == null ? importSummaryValues.scores.new++ : importSummaryValues.scores.updated++;
        });

        // Removed Scores
        var removedScores = currentData.scoresSection.dataElements.filter(de =>
            !importedScores.find(i_score => i_score.id == de.id)
        );
        importSummaryValues.scores.removed = removedScores.length;
        importSummaryValues.scores.removedItems = removedScores;

        return { importedSections, importedScores };
    }

    return { importedSections };

};

module.exports = {
    readTemplateData
};