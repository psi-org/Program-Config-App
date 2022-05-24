import { CircularLoader, NoticeBox, Tag } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { useState } from "react";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import { BUILD_VERSION, METADATA, COMPETENCY_CLASS } from "../../configs/Constants";

const competencyClassAttribute = {
    "mandatory": false,
    "searchable": false,
    "renderOptionsAsRadio": false,
    "displayInList": false,
    "valueType": "TEXT",
    "sortOrder": 5,
    "program": { "id": null },
    "trackedEntityAttribute": { "id": "ulU9KKgSLYe" },
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
            fields: ["id", "name", "shortName", "publicAccess", "ignoreOverdueEvents", "skipOffline", "enrollmentDateLabel", "onlyEnrollOnce", "maxTeiCountToReturn", "selectIncidentDatesInFuture", "selectEnrollmentDatesInFuture", "registration", "useFirstStageDuringRegistration", "completeEventsExpiryDays", "withoutRegistration", "minAttributesRequiredToSearch", "displayFrontPageList", "programType", "accessLevel", "displayIncidentDate", "expiryDays", "style", "trackedEntityType", "programIndicators", "translations", "userGroupAccesses", "attributeValues", "userAccesses", "programRuleVariables", "programTrackedEntityAttributes[id,name,mandatory,renderOptionsAsRadio,valueType,searchable,displayInList,sortOrder,program,trackedEntityAttribute,programTrackedEntityAttributeGroups,translations,userGroupAccesses,attributeValues,userAccesses]", "organisationUnits", "programSections", "programStages", "user"]
        }
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const getParentUid = (parentName, dataElements) => {
    return dataElements.find(de => de.parentName == parentName)?.id
};

const parseErrors = (e) => {
    let data = e.typeReports.map(tr => {
        let type = tr.klass.split('.').pop()
        return tr.objectReports.map(or => or.errorReports.map(er => ({ type, uid: or.uid, errorCode: er.errorCode, message: er.message })))
    })
    return data.flat().flat()
}

const SaveMetadata = ({ hnqisMode, newDEQty, programStage, importedSections, importedScores, criticalSection, setSavingMetadata, setSavedAndValidated, removedItems, programMetadata, setImportResults, setErrorReports, refetchProgramStage }) => {

    const [completed, setCompleted] = useState(false);
    const [errorStatus, setErrorStatus] = useState(false);
    const [successStatus, setSuccessStatus] = useState(false);
    const [typeReports, setTypeReports] = useState({});

    // Create Mutation
    let metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };

    // Get Program payload
    const programQuery = useDataQuery(queryProgram, { variables: { id: programStage.program.id } });
    let programPayload = programQuery.data?.results;

    // Get Ids for new Data Elements
    const idsQuery = useDataQuery(queryId, { variables: { n: newDEQty + 5 } });
    const uidPool = idsQuery.data?.results.codes;

    if (uidPool && programPayload && !completed && !metadataRequest.called /* && !programRequest.called */) {

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
        importedSections.forEach((section, secIdx) => { //v1.4.0 WORK

            if (section.importStatus == 'new') section.id = uidPool.shift();

            section.dataElements.forEach((dataElement, deIdx) => {

                let DE_metadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");

                let newVarName = hnqisMode?`_S${secIdx + 1}Q${deIdx + 1}`:`_S${secIdx + 1}E${deIdx + 1}`;
                let newCode = `${programMetadata.dePrefix}_${newVarName}`;
                // Name max: 230
                // CODE_FORMNAME
                // REST : 230 - CODE.LENGTH - FIXED
                // FORMNAME.SLICE(0,REST)

                const FIXED_VALUES = 5;
                const formNameMaxLength = 230 - newCode.length - FIXED_VALUES;
                let formName = ""
                if (hnqisMode) {
                    formName = DE_metadata.elemType == 'label' ? DE_metadata.labelFormName : dataElement.formName;

                    formName = formName.replaceAll(' [C]', '');
                    if (DE_metadata.isCritical == 'Yes') formName += ' [C]'
                    DE_metadata.elemType == 'label' ? DE_metadata.labelFormName = formName : dataElement.formName = formName;
                }else{
                    formName = dataElement.formName;
                }
                

                let name = (newCode + '_' + formName).slice(0, formNameMaxLength)
                let shortName = (newCode + '_' + formName).slice(0, 50)

                DE_metadata.varName = newVarName;

                dataElement.name = name
                dataElement.shortName = shortName
                dataElement.code = newCode

                // Check if new DE
                if (dataElement.importStatus == 'new') {
                    dataElement.id = uidPool.shift();
                    //new_dataElements.push(dataElement);
                }
                delete dataElement.importStatus;
                new_programStageDataElements.push({
                    compulsory: (DE_metadata.isCompulsory == 'Yes' && !DE_metadata.parentQuestion), // True: mandatory is Yes and has no parents.
                    //programStage: { id : programStage.id},
                    sortOrder: deIdx + 1,
                    dataElement: { id: dataElement.id }
                });

                dataElement.attributeValues.find(att => att.attribute.id == METADATA).value = JSON.stringify(DE_metadata)
                //return dataElement;
            });


            delete section.importStatus;
            section.sortOrder = secIdx + 1;
            //return section
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
                    //console.log(metadata);

                    attributeValues[metadataIndex].value = JSON.stringify(metadata);
                }

                // delete de.parentQuestion;
                // delete de.parentName;
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
                    //new_dataElements.push(score);
                }

                delete score.importStatus;
                new_programStageDataElements.push({
                    //name:score.name,
                    compulsory: false,
                    //programStage: programStage.id,
                    sortOrder: scoreIdx + 1,
                    dataElement: { id: score.id }
                });

                new_dataElements.push(score);
            });

            /**
             * Set new critical scores section : order
             */

            criticalSection.sortOrder = importedSections.length + 1;

            /**
             * Set new scores section : order
             */

            importedScores.sortOrder = importedSections.length + 2;

        }

        /**
         * Update Items with suffix [X] to ensure no Update conflicts
         */
        //let suffix = `${String(+ new Date()).slice(-7)}[X]`;
        let removed = removedItems.map(de => {
            let suffix = `${String(+ new Date()).slice(-7)}[X]`;
            de.name = de.name.slice(0, 220) + suffix;
            de.shortName = de.id + ' ' + suffix;
            delete de.code;
            return de
        });
        let toUpdateDE = JSON.parse(JSON.stringify(new_dataElements));
        let tempUpdate = toUpdateDE.map(de => {
            let suffix = `${String(+ new Date()).slice(-7)}[X]`;
            de.name = de.name.slice(0, 220) + suffix;
            de.shortName = de.id + ' ' + suffix;
            delete de.code;
            return de
        });

        let tempMetadata = {
            dataElements: removed.concat(tempUpdate)
        };

        /**
         * Replace sections and Data Elements on program stage
         */

        programStage.programStageSections = [].concat(importedSections, hnqisMode?importedScores:[], hnqisMode?criticalSection:[]);
        programStage.programStageDataElements = new_programStageDataElements;


        /**
         * PROGRAM UPDATE ==> trackedEntityAttributes, attributeValues[metadata]
         */
        // ATTRIBUTE VALUES
        let programMetadataIdx = programPayload.attributeValues.findIndex(att => att.attribute.id === METADATA);
        let new_programMetadata = JSON.parse(programPayload.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}");
        if(hnqisMode){
            new_programMetadata.dePrefix = programMetadata.dePrefix;
            new_programMetadata.useCompetencyClass = programMetadata.useCompetencyClass;
            new_programMetadata.healthArea = programMetadata.healthArea;
        }
        new_programMetadata.buildVersion = BUILD_VERSION;

        programPayload.attributeValues[programMetadataIdx] = {
            attribute: { id: METADATA },
            value: JSON.stringify(new_programMetadata)
        };

        // PROGRAM TRACKED ENTITY ATTRIBUTES
        let currentCompetencyAttribute = programPayload.programTrackedEntityAttributes.find(att => att.trackedEntityAttribute.id === "ulU9KKgSLYe");
        if (hnqisMode && new_programMetadata.useCompetencyClass == "Yes" && !currentCompetencyAttribute) {
            competencyClassAttribute.program.id = programPayload.id;
            programPayload.programTrackedEntityAttributes.push(competencyClassAttribute);
            criticalSection.dataElements.push({ id: COMPETENCY_CLASS })
        } else if (hnqisMode && new_programMetadata.useCompetencyClass == "No") {
            programPayload.programTrackedEntityAttributes = programPayload.programTrackedEntityAttributes.filter(att => att.trackedEntityAttribute.id != "ulU9KKgSLYe");
            criticalSection.dataElements = criticalSection.dataElements.filter(de => de.id != COMPETENCY_CLASS);
        }

        // ========================================================== //
        let metadata = {
            programs: [programPayload],
            dataElements: new_dataElements,
            programStages: [programStage],
            programStageSections: programStage.programStageSections,
            programStageDataElements: programStage.programStageDataElements
        };
        // ========================================================== //
        const gotResponseError = (response) => {
            setErrorStatus(true);
            setTypeReports(response);
            setCompleted(true);
            setErrorReports(parseErrors(response))
        };

        /**
         * CALL METADATA REQUESTS - POST DHIS2
         */

        metadataRequest.mutate({ data: tempMetadata }).then(response => {
            if (response.status != 'OK') {
                gotResponseError(response);
                return;
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
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={()=>setSavingMetadata(false)}>
            Save Assessment
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

            <NoticeBox title="Saving content" error={errorStatus}>
                {!completed && <CircularLoader small />}
                {
                    successStatus && 
                    (
                    <div>
                        <p><strong>Process completed! "Set up program" button is now enabled</strong></p>
                        {typeReports.length>0 && typeReports.map(tr => {
                            <div> {tr.klass} | <Tag>{"Created: "+tr.stats.created}</Tag>
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
            <Button variant='outlined' disabled={!completed} onClick={()=>{setSavingMetadata(false); /* refetchProgramStage() */}}> Done </Button>
        </DialogActions>

    </CustomMUIDialog>)
};


export default SaveMetadata;