import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { CircularLoader, NoticeBox, Tag } from "@dhis2/ui";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from "react";
import { BUILD_VERSION, METADATA, COMPETENCY_CLASS, COMPETENCY_ATTRIBUTE, MAX_FORM_NAME_LENGTH, MAX_SHORT_NAME_LENGTH } from "../../configs/Constants.js";
import { TEMPLATE_PROGRAM_TYPES } from "../../configs/TemplateConstants.js";
import { resetMWISectionNumbering } from "../../utils/importerUtils.js";
import { DeepCopy, getProgramQuery, mergeWithPriority, parseErrorsSaveMetadata, extractMetadataPermissionsAllLevels, setPCAMetadata, padValue, programIsHNQIS, isLabelType, getSectionType, programIsHNQISMWI } from "../../utils/Utils.js";
import CustomMUIDialog from './CustomMUIDialog.js';
import CustomMUIDialogTitle from './CustomMUIDialogTitle.js';

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
    const suffix = `${String(+ new Date()).slice(-7)}[X]`;
    de.name = de.name.replaceAll(/\d{7}\[X\]/g, '').slice(0, MAX_FORM_NAME_LENGTH - suffix.length) + suffix;
    de.shortName = de.id + ' ' + suffix;
    delete de.code;

    return de
}

const processStageData = (
    {
        uidPool,
        hnqisType,
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
    const new_programStageDataElements = [];
    let isBasicForm = false;

    if (hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2) {
        criticalSection.dataElements.forEach((de, i) => {
            new_programStageDataElements.push(
                {
                    compulsory: false,
                    sortOrder: i + 1,
                    dataElement: { id: de.id }
                }
            )
        });
    }

    // For HNQISMWI, we need to re-order the numbers for programStageSections
    // const processingSections = JSON.parse(JSON.stringify(importedSections))
    const processingSections = importedSections;

    /**
     * Delete importStatus: section & Data Elements
     * Prepare new data elements (payloads)
     * Get program stage data elements for each question
     */
    let psdeSortOrder = 1;
    let sectionOrder = 1;
    const stageIndex = stagesList?.findIndex(stage => stage.id === programStage.id) || 0;

    let secIdx = 0;
    let deIdx = 1;

    processingSections.forEach(section => {

        if (hnqisType === 'HNQISMWI') {
            const sectionType = getSectionType(section)
            if (sectionType === "Section") {
                secIdx += 1;
                deIdx = 1;
            }
        } else {
            secIdx += 1;
            deIdx = 1;
        }

        if (section.isBasicForm || section.formType === 'DEFAULT' || section.id === 'basic-form') { isBasicForm = true }
        if (section.importStatus == 'new') { section.id = uidPool.shift() }

        section.dataElements.forEach(dataElement => {

            let isLogicDE = false;

            const DE_metadata = JSON.parse(dataElement.attributeValues?.find(att => att.attribute.id === METADATA)?.value || "{}");

            let newVarName = programIsHNQIS(hnqisType) ? `_S${padValue(secIdx, "00")}Q${padValue(deIdx, "000")}` : `_PS${padValue(stageIndex + 1, "00")}_S${padValue(secIdx, "00")}E${padValue(deIdx, "000")}`;
            const prefixOption = section.id === 'basic-form' ? programStage.id : section.id;
            let newCode = `${programMetadata.dePrefix || prefixOption}${newVarName}`;

            let formName = ""
            if (programIsHNQIS(hnqisType)) {
                formName = isLabelType(DE_metadata.elemType) ? DE_metadata.labelFormName : dataElement.formName;

                formName = formName?.replaceAll(' [C]', '') || '';
                if (DE_metadata.isCritical == 'Yes') { formName += ' [C]' }
                isLabelType(DE_metadata.elemType) ? DE_metadata.labelFormName = formName : dataElement.formName = formName;
            } else {
                formName = dataElement.formName;
            }

            // This code is applied for data which import from Excel file
            if (dataElement.code?.match(/MWI_AP_DE/)) {
                isLogicDE = true;
                newCode = dataElement.code;
                newVarName = `_GEN_${formName}`
            }

            const name = (newCode + '_' + formName).slice(0, MAX_FORM_NAME_LENGTH)
            const shortName = (newCode + '_' + formName).slice(0, MAX_SHORT_NAME_LENGTH)

            DE_metadata.varName = newVarName;

            if (DE_metadata.autoNaming !== 'No') {
                dataElement.name = name;
                dataElement.shortName = shortName;
                dataElement.code = newCode;
            }

            // Check if new DE
            if (dataElement.importStatus == 'new') {
                dataElement.id = uidPool.shift();
                delete (stageSharings.owner);
                dataElement.sharing = DeepCopy(stageSharings);
                //new_dataElements.push(dataElement);
            }

            const existingPSDE = originalStageDataElements?.find(psde => psde.dataElement.id === dataElement.id);
            if (existingPSDE) {
                dataElement = mergeWithPriority(dataElement, existingPSDE.dataElement);
            }

            let allowFutureDate = existingPSDE?.allowFutureDate;

            // Matches if form name is #.#.# Due Date in HNQIS MWI Programs to define if future date is enabled
            if (hnqisType === 'HNQISMWI' && dataElement.formName?.match(/\w+.\w+.\w+ Due Date/)) {
                allowFutureDate = true;
            }

            delete dataElement.importStatus;
            new_programStageDataElements.push({
                compulsory: (DE_metadata.isCompulsory == 'Yes' && !DE_metadata.parentQuestion), // True: mandatory is Yes and has no parents.
                displayInReports: existingPSDE?.displayInReports,
                sortOrder: psdeSortOrder,
                dataElement: { id: dataElement.id },

                // Keep original settings if exists
                allowFutureDate,
                allowProvidedElsewhere: existingPSDE?.allowProvidedElsewhere,
                skipSynchronization: existingPSDE?.skipSynchronization,
                renderType: existingPSDE?.renderType
            });
            psdeSortOrder += 1
            delete dataElement.displayInReports;

            if (!programIsHNQIS(hnqisType)) { ['isCritical', 'labelFormName'].forEach(key => delete DE_metadata[key]) }

            setPCAMetadata(dataElement, DE_metadata);

            if (!isLogicDE) {
                deIdx += 1;
            }
        });


        delete section.importStatus;
        section.sortOrder = sectionOrder;
        sectionOrder += 1;
    });
    resetMWISectionNumbering(processingSections);

    console.log(processingSections);

    // Map parent name with data element uid
    const importedDataElements = processingSections.map(sec => sec.dataElements).flat();
    processingSections.forEach(section => {
        section.dataElements.map(de => {
            const attributeValues = de.attributeValues;
            if (de.parentQuestion) {
                const metadataIndex = de.attributeValues.findIndex(att => att.attribute.id == METADATA);

                const metadata = JSON.parse(de.attributeValues[metadataIndex]?.value || "{}");

                const parentId = importedDataElements.find(ide => ide.parentName == de.parentQuestion)?.id;
                metadata.parentQuestion = parentId;

                attributeValues[metadataIndex].value = JSON.stringify(metadata);
            }
            return de
        });
    });

    new_dataElements = new_dataElements.concat(
        processingSections.map(is => is.dataElements.map(de => {
            delete de.parentQuestion
            delete de.parentName
            return de
        })).flat()
    );

    /**
     * Edit imported scores
     * Prepare new scores data elements payload
     */
    if (hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2) {
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
        criticalSection.sortOrder = processingSections.length + 1;
        importedScores.sortOrder = processingSections.length + 2;

    }

    //*Update Items with suffix [X] to avoid Update conflicts
    let tempUpdate;
    const removed = (removedItems && removedItems.length > 0) ? removedItems.map(de => buildRemovedDE(de)) : [];
    if (new_dataElements && new_dataElements.length > 0) {
        const toUpdateDE = DeepCopy(new_dataElements);
        tempUpdate = toUpdateDE.map(de => buildRemovedDE(de));
    }

    const tempMetadata = {
        dataElements: removed.concat(tempUpdate || [])
    };

    //*Replace sections and Data Elements on program stage
    const specialSections = hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2 ? [importedScores].concat(criticalSection) : [];
    programStage.programStageSections = !isBasicForm ? [...processingSections, ...specialSections] : [];
    programStage.programStageDataElements = new_programStageDataElements;

    //*PROGRAM UPDATE ==> trackedEntityAttributes, attributeValues[metadata]
    const programMetadataIdx = programPayload.attributeValues.findIndex(att => att.attribute.id === METADATA);
    const new_programMetadata = JSON.parse(programPayload.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
    new_programMetadata.dePrefix = programMetadata.dePrefix;

    if (programIsHNQIS(hnqisType)) {
        if (hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2) {
            new_programMetadata.useCompetencyClass = programMetadata.useCompetencyClass;
        }
        new_programMetadata.healthArea = programMetadata.healthArea;
        new_programMetadata.buildVersion = programMetadata.buildVersion;
    }

    new_programMetadata.saveVersion = BUILD_VERSION;

    const metadataObject = {
        attribute: { id: METADATA },
        value: JSON.stringify(new_programMetadata)
    };

    if (programMetadataIdx >= 0) {
        programPayload.attributeValues[programMetadataIdx] = metadataObject;
    } else {
        programPayload.attributeValues.push(metadataObject)
    }

    //* PROGRAM TRACKED ENTITY ATTRIBUTES
    const currentCompetencyAttribute = programPayload.programTrackedEntityAttributes.find(att => att.trackedEntityAttribute.id === COMPETENCY_ATTRIBUTE);
    if (hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2 && new_programMetadata.useCompetencyClass == "Yes" && !currentCompetencyAttribute) {
        competencyClassAttribute.program.id = programPayload.id;
        programPayload.programTrackedEntityAttributes.push(competencyClassAttribute);
        criticalSection.dataElements.push({ id: COMPETENCY_CLASS })
    } else if (hnqisType === TEMPLATE_PROGRAM_TYPES.hnqis2 && new_programMetadata.useCompetencyClass == "No") {
        programPayload.programTrackedEntityAttributes = programPayload.programTrackedEntityAttributes.filter(att => att.trackedEntityAttribute.id != COMPETENCY_ATTRIBUTE);
        criticalSection.dataElements = criticalSection.dataElements.filter(de => de.id != COMPETENCY_CLASS);
    }

    //* Result Object
    const metadata = {
        dataElements: new_dataElements,
        programStages: [programStage],
        programStageSections: !isBasicForm ? programStage.programStageSections : [],
        programStageDataElements: programStage.programStageDataElements
    };

    importedSections = processingSections;
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
        hnqisType,
        importedStages,
        importedTEAs,
        importResults,
        programMetadata,
        stagesList,
        programPayload
    }
) => {

    const groupedMetadata = {
        dataElements: [],
        programStages: [],
        programStageSections: [],
        programStageDataElements: []
    };

    const teaConfigurations = {
        programSections: [],
        programTrackedEntityAttributes: []
    };

    let tempMetadataDEs = [];

    const programPCAMetadata = JSON.parse(programPayload.attributeValues?.find(att => att.attribute.id === METADATA)?.value || "{}");
    programMetadata.dePrefix = programPCAMetadata.dePrefix;

    importedStages.forEach(programStage => {

        const currentExistingStage = stagesList.find(stage => stage.id === programStage.id);
        programStage.sortOrder = programStage.stageNumber;
        programStage = mergeWithPriority(programStage, currentExistingStage);

        const { tempMetadata, metadata } = processStageData(
            {
                uidPool,
                hnqisType,
                programStage,
                importedSections: programStage.processingSections,
                removedItems: importResults.stages.find(stage => stage.id === programStage.id)?.dataElements?.removedItems || [],
                programMetadata,
                stagesList: stagesList,
                originalStageDataElements: currentExistingStage.programStageDataElements,
                stageSharings: extractMetadataPermissionsAllLevels(DeepCopy(currentExistingStage.sharing)),
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

            const programTrackedEntityAttributes = teaSection.trackedEntityAttributes.map(ptea => {
                ptea.id = ptea.programTrackedEntityAttribute || uidPool.shift();
                return ptea;
            });

            teaSection.id = teaSection.id || uidPool.shift();

            if (teaSection.id !== 'basic-form') {
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
            }

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

//* HNQIS/Stage Props: programId, hnqisType, newObjectsQtty, programStage, importedSections, importedScores, criticalSection, setSavingMetadata, setSavedAndValidated, removedItems, programMetadata, setImportResults, setErrorReports, stagesList, saveType
//* Program Props: programId, newObjectsQtty, importedStages, importedTEAs, setSavingMetadata, setSavedAndValidated, removedItems, programMetadata, setImportResults, setErrorReports, saveType

const SaveMetadata = (props) => {

    const [completed, setCompleted] = useState(false);
    const [errorStatus, setErrorStatus] = useState(false);
    const [successStatus, setSuccessStatus] = useState(false);
    const [typeReports, setTypeReports] = useState({});
    const [programPayload, setProgramPayload] = useState();
    const [programPayloadBackup, setProgramPayloadBackup] = useState();
    const [importFlag, setImportFlag] = useState(false);

    // Create Mutation
    const metadataDM = useDataMutation(metadataMutation, {
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
    const uidPool = idsQuery.data?.results.codes;

    const gotResponseError = (response) => {
        setErrorStatus(true);
        setTypeReports(parseErrorsSaveMetadata(response));
        setCompleted(true);
        props.setErrorReports(parseErrorsSaveMetadata(response));
    };

    useEffect(() => {
        setImportFlag(props.fromImport);
        getProgramPayload({ id: props.programId }).then(payload => {
            setProgramPayload(payload?.results)
            setProgramPayloadBackup(payload?.results)
        });
    }, [])

    useEffect(() => {
        if (uidPool && programPayload && !completed && !metadataRequest.called) {

            const programConfigurations = DeepCopy(programPayload);

            const removedItems = (props.saveType === 'stage') ? (props.removedItems || []) : (props.removedItems?.dataElements || []);
            const { tempMetadata, metadata, teaConfigurations } = (props.saveType === 'stage')
                ? processStageData(
                    {
                        uidPool,
                        hnqisType: props.hnqisType,
                        programStage: props.programStage,
                        importedSections: props.importedSections.map(section => {
                            if (programIsHNQISMWI(props.hnqisType)) {
                                section.name = section.name.replaceAll("‼️", "");
                                section.displayName = section.displayName.replaceAll("‼️", "");

                                if (section.description === "*") {
                                    section.name = section.name + " ‼️";
                                    section.displayName = section.displayName + " ‼️";
                                }
                            }
                            return section;
                        }),
                        importedScores: props.importedScores,
                        criticalSection: props.criticalSection,
                        removedItems,
                        programMetadata: props.programMetadata,
                        stagesList: props.stagesList,
                        originalStageDataElements: props.programStage.programStageDataElements,
                        stageSharings: extractMetadataPermissionsAllLevels(DeepCopy(props.programStage.sharing)),
                        programPayload: programConfigurations
                    }
                )
                : processProgramData(
                    {
                        uidPool,
                        hnqisType: props.hnqisType,
                        importedStages: props.importedStages,
                        importedTEAs: props.importedTEAs,
                        importResults: props.importResults,
                        programMetadata: props.programMetadata,
                        stagesList: programConfigurations.programStages,
                        programPayload: programConfigurations
                    }
                );

            const newMetadata = {
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
                    if (props.stageRefetch) {
                        props.stageRefetch();
                    }
                    props.setSavedAndValidated(true);
                    props.setImportResults(false);

                });
            });
        }
    }, [uidPool, programPayload, completed, metadataRequest])


    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setSavingMetadata(false)}>
            {props.hnqisType ? 'Save Assessment' : 'Save Configurations'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

            <NoticeBox title="Saving content" error={errorStatus}>
                {!completed && !errorStatus && <CircularLoader small />}
                {
                    successStatus &&
                    (
                        <div>
                            <p><strong>Process completed! {props.hnqisType && '"Set up program" button is now enabled'}</strong></p>
                            {importFlag &&
                                <p style={{ marginTop: '1em' }}>
                                    <strong>Please Note:</strong>
                                    As you imported Metadata from an Excel Template, make sure you download an updated Template before making more changes.
                                </p>
                            }
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
            {importFlag &&
                <Button
                    startIcon={<FileDownloadIcon />}
                    variant='outlined'
                    color='success'
                    disabled={!completed}
                    onClick={() => {
                        props.setExportToExcel(true);
                        props.setSavingMetadata(false);
                    }}
                >
                    Download Template and Close
                </Button>
            }
            <Button variant='outlined' disabled={!completed} onClick={() => { props.setSavingMetadata(false); }}> Done </Button>
        </DialogActions>

    </CustomMUIDialog>)
};

SaveMetadata.propTypes = {
    criticalSection: PropTypes.object,
    fromImport: PropTypes.bool,
    hnqisType: PropTypes.string,
    importResults: PropTypes.object,
    importedScores: PropTypes.object,
    importedSections: PropTypes.array,
    importedStages: PropTypes.array,
    importedTEAs: PropTypes.array,
    newObjectsQtty: PropTypes.number,
    programId: PropTypes.string,
    programMetadata: PropTypes.object,
    programStage: PropTypes.object,
    removedItems: PropTypes.array,
    saveType: PropTypes.string,
    setErrorReports: PropTypes.func,
    setExportToExcel: PropTypes.func,
    setImportResults: PropTypes.func,
    setSavedAndValidated: PropTypes.func,
    setSavingMetadata: PropTypes.func,
    stageRefetch: PropTypes.func,
    stagesList: PropTypes.array,
}

export default SaveMetadata;