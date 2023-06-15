//metadata file to clean
const program = require("./metadata (38).json");
const fs = require("fs");

const toBeDeleted = ['trackedEntityTypes', 'trackedEntityAttributes', 'categories', 'categoryCombos', 'categoryOptionCombos', 'categoryOptions'];
const attributesToKeep = ['haUflNqP85K', 'LP171jpctBm', 'yB5tFAAN7bI', 'DVzuBdj9kli', 'yhKEe6BLEer'] //PCA METADATA - FeedbackOrder - PRG Program Type - OptionFactor - FeedbackText
let cleanMetadata = {}
try {
    Object.keys(program).forEach((key) => {
        //DELETE PARENT KEYS NOT NEEDED
        if (!toBeDeleted.includes(key)) {
            cleanMetadata[key] = program[key];
        }

    });

    //DELETE HNQIS 1.6 ATTRIBUTES NOT NEEDED
    let attributes = cleanMetadata.attributes

    //Because splice changes the array length, using forEach is not possible
    for (let i = attributes.length - 1; i >= 0; i--) {
        if (!attributesToKeep.includes(attributes[i].id)) {
            attributes.splice(attributes.findIndex(a => a.id === attributes[i].id), 1);
        }
    }

    //DELETE DE ATTRIBUTEVALUES ASSOCIATED WITH THE ONES REMOVED IN PREVIOUS STEP

    let de = cleanMetadata.dataElements;
    de.forEach((element) => {

        let attrValues = element.attributeValues;

        for (let i = attrValues.length - 1; i >= 0; i--) {

            if (!attributesToKeep.includes(attrValues[i].attribute.id)) {
                attrValues.splice(attrValues.findIndex(a => a.attribute.id === attrValues[i].attribute.id), 1);
            }

        }
    });

    removeKey(cleanMetadata, 'lastUpdatedBy');
    removeKey(cleanMetadata, 'createdBy');
    removeKey(cleanMetadata, 'categoryCombo');
    function removeKey(obj, key) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            obj.forEach((item) => removeKey(item, key));
        } else {
            Object.keys(obj).forEach((k) => {
                if (k === key) {
                    delete obj[k];
                } else {
                    removeKey(obj[k], key);
                }
            });
        }

        return obj;
    }

    fs.writeFileSync('FIXED.json', JSON.stringify(cleanMetadata));
} catch (e) {
    console.log(e);
}
/*
if (programMetadata && !documentReady) {
    delete programMetadata.date;
    delete programMetadata.categories;
    delete programMetadata.categoryCombos;
    delete programMetadata.categoryOptions;
    delete programMetadata.categoryOptionCombos;

    programMetadata.programs?.forEach(program => {

        program.organisationUnits = []

        delete program.created;
        delete program.createdBy;
        delete program.lastUpdated;
        delete program.lastUpdatedBy;
        delete program.categoryCombo;

        program.programTrackedEntityAttributes?.forEach(tea => {
            delete tea.created;
            delete tea.createdBy;
            delete tea.lastUpdated;
            delete tea.access;
        });

    });

    programMetadata.programRuleVariables?.forEach(prv => {
        delete prv.created;
        delete prv.lastUpdated;
        delete prv.lastUpdatedBy;
    });

    programMetadata.programStageSections?.forEach(stageSection => {
        delete stageSection.created;
        delete stageSection.lastUpdated;
        delete stageSection.lastUpdatedBy;
    });

    programMetadata.programStages?.forEach(stage => {

        delete stage.created;
        delete stage.createdBy;
        delete stage.lastUpdated;
        delete stage.lastUpdatedBy;

        stage.programStageDataElements?.forEach(psde => {
            delete psde.created;
            delete psde.lastUpdated;
            delete psde.access;
        });

    });

    programMetadata.options?.forEach(option => {
        delete option.created;
        delete option.lastUpdated;
    });

    programMetadata.attributes?.forEach(att => {
        delete att.created;
        delete att.createdBy;
        delete att.lastUpdated;
        delete att.lastUpdatedBy;
    });

    programMetadata.programTrackedEntityAttributes?.forEach(ptea => {
        delete ptea.created;
        delete ptea.lastUpdated;
    });

    let programRuleActionsDict = {}

    //* Keep
    programMetadata.programRules?.forEach(pr => {
        delete pr.created;
        delete pr.lastUpdated;
        delete pr.lastUpdatedBy;
        pr.programRuleActions.forEach(pra => {
            programRuleActionsDict[pra.id] = pr.id
        })
    });

    programMetadata.dataElements?.forEach(de => {
        delete de.created;
        delete de.createdBy;
        delete de.lastUpdated;
        delete de.lastUpdatedBy;
        delete de.categoryCombo;
    });

    programMetadata.trackedEntityTypes?.forEach(tet => {

        delete tet.created;
        delete tet.createdBy;
        delete tet.lastUpdated;
        delete tet.lastUpdatedBy;

        tet.trackedEntityTypeAttributes?.forEach(tea => {
            delete tea.created;
            delete tea.createdBy;
            delete tea.lastUpdated;
            delete tea.access;
        });

    });

    programMetadata.trackedEntityAttributes?.forEach(tea => {
        delete tea.created;
        delete tea.createdBy;
        delete tea.lastUpdated;
        delete tea.lastUpdatedBy;
    });

    programMetadata.programStageDataElements?.forEach(psde => {
        delete psde.created;
        delete psde.lastUpdated;
    });

    //* Keep
    programMetadata.programRuleActions?.forEach(pra => {
        delete pra.created;
        delete pra.lastUpdated;
        delete pra.lastUpdatedBy;
        pra.programRule = {
            id: programRuleActionsDict[pra.id]
        }
    });

    programMetadata.optionSets?.forEach(optionSet => {
        delete optionSet.created;
        delete optionSet.createdBy;
        delete optionSet.lastUpdated;
        delete optionSet.lastUpdatedBy;
    });

    programMetadata.programIndicators?.forEach(pInd => {
        delete pInd.created;
        delete pInd.createdBy;
        delete pInd.lastUpdated;
        delete pInd.lastUpdatedBy;
    });

    setCleanMetadata(programMetadata)
    if (!documentReady) setDocumentReady(true);
}*/