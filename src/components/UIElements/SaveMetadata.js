import { CircularLoader, NoticeBox, Tag } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './CustomMUIDialogTitle'
import CustomMUIDialog from './CustomMUIDialog'
import { BUILD_VERSION, METADATA, COMPETENCY_CLASS, COMPETENCY_ATTRIBUTE, MAX_FORM_NAME_LENGTH, MAX_SHORT_NAME_LENGTH } from "../../configs/Constants";
import { DeepCopy, getProgramQuery, mergeWithPriority, parseErrorsSaveMetadata, setPCAMetadata } from "../../configs/Utils";

const competencyClassAttribute = {
    "mandatory": false,
    "searchable": false,
    "renderOptionsAsRadio": false,
    "displayInList": false,
    "valueType": "TEXT",
    "sortOrder": 5,
    "program": { "id": null },
    "trackedEntityAttribute": { "id": COMPETENCY_ATTRIBUTE },
    "userGroupAccesses": [],
    "attributeValues": [],
    "programTrackedEntityAttributeGroups": [],
    "translations": [],
    "userAccesses": []
};
const queryId = {
    results: {
        resource: 'system/id.json',
        params: ({ n }) => ({ limit: n })
    }
};

const queryProgram = {
    results: {
        resource: 'programs',
        id: ({ id }) => id,
        params: {
            fields: getProgramQuery()
        }
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const buildRemovedDE = (de) => {
    let suffix = `${String(+ new Date()).slice(-7)}[X]`;
    de.name = de.name.replaceAll(/\d{7}\[X\]/g,'').slice(0, MAX_FORM_NAME_LENGTH - suffix.length) + suffix;
    de.shortName = de.id + ' ' + suffix;
    delete de.code;
    return de
}

const processStageData = (
    {
        uidPool,
        hnqisMode,
        programStage,
        importedSections,
        removedItems,
        importedScores,
        criticalSection,
        programMetadata,
        stagesList,
        originalStageDataElements,
        stageSharings,
        programPayload
    }
) => {
    let new_dataElements = [];
    let new_programStageDataElements = [];
    let isBasicForm = false;

    if (hnqisMode) criticalSection.dataElements.forEach((de, i) => {
        new_programStageDataElements.push(
            {
                compulsory: false,
                sortOrder: i + 1,
                dataElement: { id: de.id }
            }
        )
    });

    /**
     * Delete importStatus: section & Data Elements
     * Prepare new data elements (payloads)
     * Get program stage data elements for each question
     */
    let psdeSortOrder = 1
    const stageIndex = stagesList?.findIndex(stage => stage.id === programStage.id) || 0;
    importedSections.forEach((section, secIdx) => {

        if (section.isBasicForm) isBasicForm = true;
        if (section.importStatus == 'new') section.id = uidPool.shift();

        section.dataElements.forEach((dataElement, deIdx) => {

            let DE_metadata = JSON.parse(dataElement.attributeValues?.find(att => att.attribute.id === METADATA)?.value || "{}");

            let newVarName = hnqisMode ? `_S${secIdx + 1}Q${deIdx + 1}` : `_PS${stageIndex + 1}_S${secIdx + 1}E${deIdx + 1}`;
            let newCode = `${programMetadata.dePrefix || section.id}_${newVarName}`;

            let formName = ""
            if (hnqisMode) {
                formName = DE_metadata.elemType == 'label' ? DE_metadata.labelFormName : dataElement.formName;

                formName = formName.replaceAll(' [C]', '');
                if (DE_metadata.isCritical == 'Yes') formName += ' [C]'
                DE_metadata.elemType == 'label' ? DE_metadata.labelFormName = formName : dataElement.formName = formName;
            } else {
                formName = dataElement.formName;
            }


            let name = (newCode + '_' + formName).slice(0, MAX_FORM_NAME_LENGTH)
            let shortName = (newCode + '_' + formName).slice(0, MAX_SHORT_NAME_LENGTH)

            DE_metadata.varName = newVarName;

            if (DE_metadata.autoNaming !== 'No') {
                dataElement.name = name
                dataElement.shortName = shortName
                dataElement.code = newCode
            }

            // Check if new DE
            if (dataElement.importStatus == 'new') {
                dataElement.id = uidPool.shift();
                dataElement.sharing = stageSharings;
                //new_dataElements.push(dataElement);
            }

            let existingPSDE = originalStageDataElements?.find(psde => psde.dataElement.id === dataElement.id);
            if (existingPSDE) {
                dataElement = mergeWithPriority(dataElement, existingPSDE.dataElement)
            }

            delete dataElement.importStatus;
            new_programStageDataElements.push({
                compulsory: (DE_metadata.isCompulsory == 'Yes' && !DE_metadata.parentQuestion), // True: mandatory is Yes and has no parents.
                displayInReports: dataElement.displayInReports,
                sortOrder: psdeSortOrder,
                dataElement: { id: dataElement.id }
            });
            psdeSortOrder += 1
            delete dataElement.displayInReports;

            if (!hnqisMode) ['isCritical', 'labelFormName'].forEach(key => delete DE_metadata[key])

            setPCAMetadata(dataElement, DE_metadata);
        });


        delete section.importStatus;
        section.sortOrder = secIdx + 1;
    });

    // Map parent name with data element uid
    let importedDataElements = importedSections.map(sec => sec.dataElements).flat();
    importedSections.map(section => {
        section.dataElements.map(de => {
            let attributeValues = de.attributeValues;
            if (de.parentQuestion) {
                let metadataIndex = de.attributeValues.findIndex(att => att.attribute.id == METADATA);

                let metadata = JSON.parse(de.attributeValues[metadataIndex]?.value || "{}");

                let parentId = importedDataElements.find(ide => ide.parentName == de.parentQuestion)?.id;
                metadata.parentQuestion = parentId;

                attributeValues[metadataIndex].value = JSON.stringify(metadata);
            }
            return de
        });
    });

    new_dataElements = new_dataElements.concat(
        importedSections.map(is => is.dataElements.map(de => {
            delete de.parentQuestion
            delete de.parentName
            return de
        })).flat()
    );

    /**
     * Edit imported scores
     * Prepare new scores data elements payload
     */
    if (hnqisMode) {
        importedScores.dataElements.forEach((score, scoreIdx) => {

            // Check if new DE
            if (score.importStatus == 'new') {
                score.id = uidPool.shift();
            }

            delete score.importStatus;
            new_programStageDataElements.push({
                compulsory: false,
                sortOrder: scoreIdx + 1,
                dataElement: { id: score.id }
            });

            new_dataElements.push(score);
        });

        //*Set new critical steps and scores section order
        criticalSection.sortOrder = importedSections.length + 1;
        importedScores.sortOrder = importedSections.length + 2;

    }

    //*Update Items with suffix [X] to avoid Update conflicts
    let tempUpdate;
    let removed = (removedItems && removedItems.length) > 0 ? removedItems.map(de => buildRemovedDE(de)) : [];
    if (new_dataElements && new_dataElements.length > 0) {
        let toUpdateDE = DeepCopy(new_dataElements);
        tempUpdate = toUpdateDE.map(de => buildRemovedDE(de));
    }

    let tempMetadata = {
        dataElements: removed.concat(tempUpdate || [])
    };

    //*Replace sections and Data Elements on program stage
    programStage.programStageSections = !isBasicForm ? [].concat(importedSections, hnqisMode ? importedScores : [], hnqisMode ? criticalSection : []): [];
    programStage.programStageDataElements = new_programStageDataElements;

    //*PROGRAM UPDATE ==> trackedEntityAttributes, attributeValues[metadata]
    let programMetadataIdx = programPayload.attributeValues.findIndex(att => att.attribute.id === METADATA);
    let new_programMetadata = JSON.parse(programPayload.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
    new_programMetadata.dePrefix = programMetadata.dePrefix;

    if (hnqisMode) {
        new_programMetadata.useCompetencyClass = programMetadata.useCompetencyClass;
        new_programMetadata.healthArea = programMetadata.healthArea;
        new_programMetadata.buildVersion = programMetadata.buildVersion;
    }

    new_programMetadata.saveVersion = BUILD_VERSION;

    let metadataObject = {
        attribute: { id: METADATA },
        value: JSON.stringify(new_programMetadata)
    };

    if (programMetadataIdx >= 0) {
        programPayload.attributeValues[programMetadataIdx] = metadataObject;
    } else {
        programPayload.attributeValues.push(metadataObject)
    }

    //* PROGRAM TRACKED ENTITY ATTRIBUTES
    let currentCompetencyAttribute = programPayload.programTrackedEntityAttributes.find(att => att.trackedEntityAttribute.id === COMPETENCY_ATTRIBUTE);
    if (hnqisMode && new_programMetadata.useCompetencyClass == "Yes" && !currentCompetencyAttribute) {
        competencyClassAttribute.program.id = programPayload.id;
        programPayload.programTrackedEntityAttributes.push(competencyClassAttribute);
        criticalSection.dataElements.push({ id: COMPETENCY_CLASS })
    } else if (hnqisMode && new_programMetadata.useCompetencyClass == "No") {
        programPayload.programTrackedEntityAttributes = programPayload.programTrackedEntityAttributes.filter(att => att.trackedEntityAttribute.id != COMPETENCY_ATTRIBUTE);
        criticalSection.dataElements = criticalSection.dataElements.filter(de => de.id != COMPETENCY_CLASS);
    }

    //* Result Object
    let metadata = {
        dataElements: new_dataElements,
        programStages: [programStage],
        programStageSections: !isBasicForm ? programStage.programStageSections : [],
        programStageDataElements: programStage.programStageDataElements
    };

    return {
        tempMetadata,
        metadata,
        teaConfigurations: {
            programSections: programPayload.programSections,
            programTrackedEntityAttributes: programPayload.programTrackedEntityAttributes
        }
    };
}

const processProgramData = (
    {
        uidPool,
        hnqisMode,
        importedStages,
        importedTEAs,
        importResults,
        programMetadata,
        stagesList,
        programPayload
    }
) => {

    let groupedMetadata = {
        dataElements: [],
        programStages: [],
        programStageSections: [],
        programStageDataElements: []
    };

    let teaConfigurations = {
        programSections: [],
        programTrackedEntityAttributes: []
    };

    let tempMetadataDEs = [];

    let programPCAMetadata = JSON.parse(programPayload.attributeValues?.find(att => att.attribute.id === METADATA)?.value || "{}");
    programMetadata.dePrefix = programPCAMetadata.dePrefix;

    importedStages.forEach(programStage => {

        const currentExistingStage = stagesList.find(stage => stage.id === programStage.id);
        programStage.sortOrder = programStage.stageNumber;
        programStage = mergeWithPriority(programStage, currentExistingStage);

        let { tempMetadata, metadata } = processStageData(
            {
                uidPool,
                hnqisMode,
                programStage,
                importedSections: programStage.importedSections,
                removedItems: importResults.stages.find(stage => stage.id === programStage.id)?.dataElements?.removedItems || [],
                programMetadata,
                stagesList: stagesList,
                originalStageDataElements: currentExistingStage.programStageDataElements,
                stageSharings: currentExistingStage.sharing,
                programPayload
            }
        );

        Object.keys(metadata).forEach(key => {
            groupedMetadata[key] = groupedMetadata[key].concat(metadata[key]);
        });

        tempMetadataDEs = tempMetadataDEs.concat(tempMetadata.dataElements);

    })

    if (programPayload.withoutRegistration === false) {
        //*TEAs must be constructed
        importedTEAs.forEach((teaSection, index) => {
            
            let programTrackedEntityAttributes = teaSection.trackedEntityAttributes.map(ptea => {
                ptea.id = ptea.programTrackedEntityAttribute || uidPool.shift();
                return ptea;
            });

            teaSection.id = teaSection.id || uidPool.shift();

            teaConfigurations.programSections.push({
                name: teaSection.name,
                id: teaSection.id,
                sortOrder: index,
                renderType: {
                    MOBILE: {
                        type: "LISTING"
                    },
                    DESKTOP: {
                        type: "LISTING"
                    }
                },
                program: {
                    id: programPayload.id
                },
                trackedEntityAttributes: programTrackedEntityAttributes.map(ptea => ({ id: ptea.trackedEntityAttribute.id }))
            });

            teaConfigurations.programTrackedEntityAttributes = teaConfigurations.programTrackedEntityAttributes.concat(programTrackedEntityAttributes);

            programPayload.programSections = teaConfigurations.programSections;
            programPayload.programTrackedEntityAttributes = teaConfigurations.programTrackedEntityAttributes;
        });
    }
    

    //* Result Object
    return {
        tempMetadata:
            { dataElements: tempMetadataDEs },
        metadata: groupedMetadata,
        teaConfigurations
    };
}

//* HNQIS/Stage Props: programId, hnqisMode, newObjectsQtty, programStage, importedSections, importedScores, criticalSection, setSavingMetadata, setSavedAndValidated, removedItems, programMetadata, setImportResults, setErrorReports, stagesList, saveType
//* Program Props: programId, newObjectsQtty, importedStages, importedTEAs, setSavingMetadata, setSavedAndValidated, removedItems, programMetadata, setImportResults, setErrorReports, saveType

const SaveMetadata = (props) => {

    const [completed, setCompleted] = useState(false);
    const [errorStatus, setErrorStatus] = useState(false);
    const [successStatus, setSuccessStatus] = useState(false);
    const [typeReports, setTypeReports] = useState({});
    const [programPayload, setProgramPayload] = useState();
    const [programPayloadBackup, setProgramPayloadBackup] = useState();

    // Create Mutation
    let metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            gotResponseError(err.details);
        }
    });
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };

    // Get Program payload
    const { refetch: getProgramPayload } = useDataQuery(queryProgram, { lazy: true, variables: { id: props.programId } });

    // Get Ids for new Data Elements
    const idsQuery = useDataQuery(queryId, { variables: { n: props.newObjectsQtty } });
    let uidPool = idsQuery.data?.results.codes;

    const gotResponseError = (response) => {
        setErrorStatus(true);
        setTypeReports(parseErrorsSaveMetadata(response));
        setCompleted(true);
        props.setErrorReports(parseErrorsSaveMetadata(response))
    };

    useEffect(() => {
        getProgramPayload({ id: props.programId }).then(payload => {
            setProgramPayload(payload?.results)
            setProgramPayloadBackup(payload?.results)
        })
    }, [])

    useEffect(() => {
        if (uidPool && programPayload && !completed && !metadataRequest.called) {

            let programConfigurations = DeepCopy(programPayload);

            let removedItems = (props.saveType === 'stage') ? props.removedItems || [] : props.removedItems?.dataElements || [];
            const { tempMetadata, metadata, teaConfigurations } = (props.saveType === 'stage')
                ? processStageData(
                    {
                        uidPool,
                        hnqisMode: props.hnqisMode,
                        programStage: props.programStage,
                        importedSections: props.importedSections,
                        importedScores: props.importedScores,
                        criticalSection: props.criticalSection,
                        removedItems,
                        programMetadata: props.programMetadata,
                        stagesList: props.stagesList,
                        originalStageDataElements: props.programStage.programStageDataElements,
                        stageSharings: props.programStage.sharing,
                        programPayload: programConfigurations
                    }
                )
                : processProgramData(
                    {
                        uidPool,
                        hnqisMode: props.hnqisMode,
                        importedStages: props.importedStages,
                        importedTEAs: props.importedTEAs,
                        importResults: props.importResults,
                        programMetadata: props.programMetadata,
                        stagesList: programConfigurations.programStages,
                        programPayload: programConfigurations
                    }
                );

            let newMetadata = {
                ...metadata,
                ...teaConfigurations,
                programs: [programConfigurations],
                
            }

            //? CALL METADATA REQUESTS - POST DHIS2

            metadataRequest.mutate({ data: tempMetadata }).then(response => {
                if (response.status != 'OK') {
                    //* Rollback after error
                    metadataRequest.mutate({ data: programPayloadBackup }).then(response2 => {
                        if (response.status != 'OK') {
                            gotResponseError(response2);
                            return;
                        }
                        gotResponseError(response);
                        return;
                    });
                }
                metadataRequest.mutate({ data: newMetadata }).then(response => {
                    if (response.status != 'OK') {
                        gotResponseError(response);
                        return;
                    }

                    setCompleted(true);
                    setSuccessStatus(true);
                    props.setSavedAndValidated(true);
                    props.setImportResults(false);

                });
            });
        }
    }, [uidPool, programPayload, completed, metadataRequest])


    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setSavingMetadata(false)}>
            {props.hnqisMode ? 'Save Assessment' : 'Save Configurations'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

            <NoticeBox title="Saving content" error={errorStatus}>
                {!completed && !errorStatus && <CircularLoader small />}
                {
                    successStatus &&
                    (
                        <div>
                            <p><strong>Process completed! {props.hnqisMode && '"Set up program" button is now enabled'}</strong></p>
                            {typeReports.length > 0 && typeReports.map(tr => {
                                <div> {tr.klass} | <Tag>{"Created: " + tr.stats.created}</Tag>
                                    <Tag>{"Deleted :" + tr.stats.deleted}</Tag>
                                    <Tag>{"Ignored :" + tr.stats.ignored}</Tag>
                                    <Tag>{"Updated :" + tr.stats.updated}</Tag>
                                    <Tag>{"Total :" + tr.stats.total}</Tag></div>
                            })}
                        </div>
                    )
                }
                {
                    errorStatus &&
                    <div>
                        <p><strong>Process ended with errors </strong></p>
                        <p><strong>Please check the Errors Summary </strong></p>
                    </div>
                }
            </NoticeBox>

        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button variant='outlined' disabled={!completed} onClick={() => { props.setSavingMetadata(false); /* refetchProgramStage() */ }}> Done </Button>
        </DialogActions>

    </CustomMUIDialog>)
};


export default SaveMetadata;