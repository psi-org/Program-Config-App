import { CircularLoader, NoticeBox, Tag } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import { BUILD_VERSION, METADATA, COMPETENCY_CLASS, COMPETENCY_ATTRIBUTE, MAX_FORM_NAME_LENGTH, MAX_SHORT_NAME_LENGTH } from "../../configs/Constants";
import { getProgramQuery, parseErrorsSaveMetadata, setPCAMetadata } from "../../configs/Utils";

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
    de.name = de.name.slice(0, MAX_FORM_NAME_LENGTH - suffix.length) + suffix;
    de.shortName = de.id + ' ' + suffix;
    delete de.code;
    return de
}

const processStageData = (
    {
        hnqisMode,
        programStage,
        importedSections,
        importedScores,
        criticalSection,
        removedItems,
        programMetadata,
        stagesList,
        programPayload
    }
) => {
    let new_dataElements = [];
    let new_programStageDataElements = [];

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
                //new_dataElements.push(dataElement);
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
    let removed = removedItems.map(de => buildRemovedDE(de));
    let toUpdateDE = JSON.parse(JSON.stringify(new_dataElements));
    let tempUpdate = toUpdateDE.map(de => buildRemovedDE(de));

    let tempMetadata = {
        dataElements: removed.concat(tempUpdate)
    };

    //*Replace sections and Data Elements on program stage
    programStage.programStageSections = [].concat(importedSections, hnqisMode ? importedScores : [], hnqisMode ? criticalSection : []);
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
        programs: [programPayload],
        dataElements: new_dataElements,
        programStages: [programStage],
        programStageSections: programStage.programStageSections,
        programStageDataElements: programStage.programStageDataElements
    };

    return { tempMetadata, metadata };
}

const processProgramData = () => {

}

const SaveMetadata = (
    {
        hnqisMode,
        newObjectsQtty,
        programStage,
        importedSections,
        importedScores,
        criticalSection,
        setSavingMetadata,
        setSavedAndValidated,
        removedItems,
        programMetadata,
        setImportResults,
        setErrorReports,
        stagesList,
        saveType
    }
) => {

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
    //TODO: Use ProgramID from programMetadata
    const { refetch: getProgramPayload } = useDataQuery(queryProgram, { lazy: true, variables: { id: programStage.program.id } });

    // Get Ids for new Data Elements
    const idsQuery = useDataQuery(queryId, { variables: { n: newObjectsQtty } });
    let uidPool = idsQuery.data?.results.codes;

    const gotResponseError = (response) => {
        setErrorStatus(true);
        setTypeReports(parseErrorsSaveMetadata(response));
        setCompleted(true);
        setErrorReports(parseErrorsSaveMetadata(response))
    };

    useEffect(() => {
        getProgramPayload({ id: programStage.program.id }).then(payload => {
            setProgramPayload(payload?.results)
            setProgramPayloadBackup(payload?.results)
        })
    }, [])

    if (uidPool && programPayload && !completed && !metadataRequest.called) {

        const { tempMetadata, metadata } = (saveType === 'stage')
            ? processStageData(
                {
                    hnqisMode,
                    programStage,
                    importedSections,
                    importedScores,
                    criticalSection,
                    removedItems,
                    programMetadata,
                    stagesList,
                    programPayload
                }
            )
            : processProgramData();

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
            metadataRequest.mutate({ data: metadata }).then(response => {
                if (response.status != 'OK') {
                    gotResponseError(response);
                    return;
                }

                setCompleted(true);
                setSuccessStatus(true);
                setSavedAndValidated(true);
                setImportResults(false);

            });
        });
    }

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setSavingMetadata(false)}>
            {hnqisMode ? 'Save Assessment' : 'Save Stage'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

            <NoticeBox title="Saving content" error={errorStatus}>
                {!completed && <CircularLoader small />}
                {
                    successStatus &&
                    (
                        <div>
                            <p><strong>Process completed! {hnqisMode && '"Set up program" button is now enabled'}</strong></p>
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
            <Button variant='outlined' disabled={!completed} onClick={() => { setSavingMetadata(false); /* refetchProgramStage() */ }}> Done </Button>
        </DialogActions>

    </CustomMUIDialog>)
};


export default SaveMetadata;