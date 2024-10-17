import { TEMPLATE_PROGRAM_TYPES, TRACKER_TEA_MAP } from "../../configs/TemplateConstants.js";
import { buildHNQIS2Summary, buildTrackerSummary, countChanges, getBasicForm } from "../../utils/importerUtils.js";
import { setUpProgramStageSections } from "../../utils/Utils.js";
import { readTemplateData, readTemplateDataMWI } from "../STG_Details/importReader.js";

export const importReadingHNQIS = (
    { templateData },
    { programDetails, mappingDetails },
    { programMetadata, currentSectionsData, previous }
) => {
    const importSummaryValues = buildHNQIS2Summary();
    const { importedSections, importedScores } = readTemplateData({
        templateData: templateData[0].data,
        currentData: previous,
        programPrefix: programDetails.dePrefix || programDetails.id,
        optionSets: mappingDetails.optionSets,
        legendSets: mappingDetails.legendSets,
        currentSectionsData,
        mode: TEMPLATE_PROGRAM_TYPES.hnqis2,
        importSummaryValues
    });

    importSummaryValues.program = programDetails;
    importSummaryValues.mapping = mappingDetails;

    const newScoresSection = previous.scoresSection;
    newScoresSection.dataElements = importedScores;
    delete newScoresSection.errors;

    previous.setSections(importedSections);
    previous.setScoresSection(newScoresSection);

    const programMetadata_new = programMetadata.programMetadata;
    programMetadata_new.dePrefix = programDetails.dePrefix;
    programMetadata_new.useCompetencyClass = programDetails.useCompetencyClass;
    programMetadata_new.healthArea = mappingDetails.healthAreas.find(ha => ha.name == programDetails.healthArea)?.code;
    programMetadata.setProgramMetadata(programMetadata_new);

    return importSummaryValues;
}

export const importReadingTracker = (
    { teaData, templateData },
    { programDetails, mappingDetails },
    { programSpecificType, currentStagesData, previous }
) => {
    const importSummaryValues = buildTrackerSummary(programSpecificType, currentStagesData.length);
    const importedStages = [];
    let importError = undefined;
    const skippedSections = [];

    currentStagesData.forEach((currentStage, index) => {
        const stageIndex = templateData.findIndex(elem => elem.stageId === currentStage.id);
        if (stageIndex === -1) {
            importError = `The import process has failed. Some Stages are missing in the imported file (${currentStage.name}), please download a new Template and try again.`;
        } else {
            importSummaryValues.stages[index].stageName = currentStage.name;
            importSummaryValues.stages[index].id = currentStage.id;
            const { importedSections, ignoredSections } = readTemplateData({
                currentData: { sections: setUpProgramStageSections(previous.stages.find(stage => stage.id === currentStage.id)), stageNumber: index + 1 },
                templateData: templateData[stageIndex].data,
                programPrefix: (programDetails.dePrefix) || programDetails.id,
                optionSets: mappingDetails.optionSets,
                legendSets: mappingDetails.legendSets,
                currentSectionsData: setUpProgramStageSections(currentStage.programStageSections),
                mode: programSpecificType,
                importSummaryValues: importSummaryValues.stages[index]
            });

            if (ignoredSections.length > 0) { skippedSections.push({ stage: currentStage.name, ignoredSections }) }

            importedStages.push({
                id: currentStage.id,
                name: currentStage.name,
                stageNumber: index + 1,
                importedSections
            });
        }
    })

    if (importError) { return { error: importError } }

    const importedProgramSections = [];
    const ignoredProgramSections = [];
    if (teaData) {
        let programSectionIndex = -1;
        let isBasicForm = false;
        teaData.forEach((row, rowNum) => {
            switch (row[TRACKER_TEA_MAP.structure]) {
                case 'Section':
                    if (row[TRACKER_TEA_MAP.programSection] === 'basic-form' && programSectionIndex === -1) { isBasicForm = true }
                    if ((isBasicForm && importedProgramSections.length > 0)) {
                        ignoredProgramSections.push({ name: row[TRACKER_TEA_MAP.name], rowNum: rowNum + 3 });
                        break;
                    }
                    programSectionIndex += 1;
                    importedProgramSections[programSectionIndex] = {
                        id: row[TRACKER_TEA_MAP.programSection] || undefined,
                        name: row[TRACKER_TEA_MAP.name],
                        sortOrder: programSectionIndex,
                        trackedEntityAttributes: [],
                        importStatus: row[TRACKER_TEA_MAP.programSection] ? 'update' : 'new',
                        isBasicForm
                    }
                    row[TRACKER_TEA_MAP.programSection] ? importSummaryValues.teaSummary.programSections.updated++ : importSummaryValues.teaSummary.programSections.new++;
                    break;
                case 'TEA':
                    if (programSectionIndex === -1) {
                        programSectionIndex += 1;
                        isBasicForm = true;
                        importedProgramSections[programSectionIndex] = getBasicForm('TEA');
                    }
                    importedProgramSections[programSectionIndex].trackedEntityAttributes.push({
                        trackedEntityAttribute: { id: row[TRACKER_TEA_MAP.uid]?.result, name: row[TRACKER_TEA_MAP.name] },
                        valueType: row[TRACKER_TEA_MAP.valueType]?.result,
                        allowFutureDate: row[TRACKER_TEA_MAP.allowFutureDate] === 'Yes',
                        displayInList: row[TRACKER_TEA_MAP.displayInList] === 'Yes',
                        mandatory: row[TRACKER_TEA_MAP.mandatory] === 'Yes',
                        searchable: row[TRACKER_TEA_MAP.searchable] === 'Yes',
                        programTrackedEntityAttribute: row[TRACKER_TEA_MAP.programTea]
                    });
                    break;
            }
        });

        if (ignoredProgramSections.length > 0) { skippedSections.push({ stage: 'Tracked Entity Attributes', ignoredSections: ignoredProgramSections }) }

        const currentTEAData = {
            sections: []
        };
        if (previous.programSections.length === 0) {
            currentTEAData.sections.push({
                id: 'basic-form',
                trackedEntityAttributes: previous.teas
            })
        } else {
            previous.programSections.forEach(ps => {
                const previousPS = {
                    id: ps.id,
                    trackedEntityAttributes: previous.teas.filter(tea =>
                        ps.trackedEntityAttributes.find(psTEA =>
                            psTEA.id === tea.trackedEntityAttribute.id
                        )
                    )
                };

                currentTEAData.sections.push(previousPS)
            })
        }

        countChanges({
            sections: importedProgramSections,
            sectionsSummary: importSummaryValues.teaSummary.programSections,
            countObject: 'trackedEntityAttributes',
            summaryObject: importSummaryValues.teaSummary.teas,
            currentData: currentTEAData.sections,
            impObjId: 'programTrackedEntityAttribute',
        })
    }

    importSummaryValues.program = programDetails;
    importSummaryValues.mapping = mappingDetails;
    importSummaryValues.configurations = { teas: importedProgramSections, importedStages, skippedSections };

    return importSummaryValues;
}

export const importReadingHNQISMWI = (
    { templateData },
    { programDetails, mappingDetails },
    { programMetadata, currentSectionsData, previous }
) => {
    const importSummaryValues = buildHNQIS2Summary();
    const { importedSections } = readTemplateDataMWI({
        templateData: templateData[0].data,
        currentData: previous,
        programPrefix: programDetails.dePrefix || programDetails.id,
        optionSets: mappingDetails.optionSets,
        legendSets: mappingDetails.legendSets,
        currentSectionsData,
        importSummaryValues
    });

    importSummaryValues.program = programDetails;
    importSummaryValues.mapping = mappingDetails;

    previous.setSections(importedSections);

    const programMetadata_new = programMetadata.programMetadata;
    programMetadata_new.dePrefix = programDetails.dePrefix;
    programMetadata_new.useCompetencyClass = programDetails.useCompetencyClass;
    programMetadata_new.healthArea = mappingDetails.healthAreas.find(ha => ha.name == programDetails.healthArea)?.code;
    programMetadata.setProgramMetadata(programMetadata_new);

    console.log(importSummaryValues);

    return importSummaryValues;
}