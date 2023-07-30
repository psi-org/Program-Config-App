const { HNQIS2_TEMPLATE_MAP, TEMPLATE_PROGRAM_TYPES, TRACKER_TEMPLATE_MAP, TRACKER_TEA_MAP } = require("../../configs/TemplateConstants");
const { mapImportedDEHNQIS2, mapImportedDE, countChanges } = require("../Excel/importerUtils");

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
                sectionIndex += 1;
                if (isHNQIS && (row[HNQIS2_TEMPLATE_MAP.formName] == "Critical Steps Calculations" || row[HNQIS2_TEMPLATE_MAP.formName] == "Scores")) break;
                importedSections[sectionIndex] = {
                    id: row[templateMap.programSection] || undefined,
                    name: row[templateMap.formName],
                    displayName: row[templateMap.formName],
                    sortOrder: sectionIndex,
                    dataElements: [],
                    importStatus: row[templateMap.programSection] ? 'update' : 'new',
                    isBasicForm: row[templateMap.programSection] === 'basic-form'
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

    

    return { importedSections };

};

module.exports = {
    readTemplateData
};

/*
const existingTEAs = props.data ? 
props.data.programTrackedEntityAttributes.map(tea => ({
    trackedEntityAttribute: tea.trackedEntityAttribute,
    valueType: tea.valueType,
    allowFutureDate: tea.allowFutureDate,
    displayInList: tea.displayInList,
    mandatory: tea.mandatory,
    searchable: tea.searchable,
    renderType:tea.renderType
})) : []

const availableTEAs = data.results.trackedEntityAttributes.filter(
    tea => !existingTEAs.map(tea => tea.trackedEntityAttribute.id).includes(tea.id)
).map(
    tea => ({
        trackedEntityAttribute: { id: tea.id, name: tea.name },
        valueType: tea.valueType,
        allowFutureDate: false,
        displayInList: false,
        mandatory: false,
        searchable: false 
    })
)
*/