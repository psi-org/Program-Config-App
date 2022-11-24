import {useRef, useState} from "react";
import {useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import {Box, Button, CircularProgress, DialogActions, DialogContent, TextField} from "@mui/material";
import {
    ACTION_PLAN_ACTION,
    ACTION_PLAN_DUE_DATE,
    ACTION_PLAN_RESPONSIBLE,
    ASSESSMENT_DATE_ATTRIBUTE,
    BACKUPS_NAMESPACE,
    COMPETENCY_ATTRIBUTE,
    COMPETENCY_CLASS,
    CRITICAL_STEPS,
    GLOBAL_SCORE_ATTRIBUTE,
    HEALTH_AREA_ATTRIBUTE,
    NON_CRITICAL_STEPS,
    ORGANISATION_UNIT_ATTRIBUTE,
    ASSESSMENT_TET
} from "../../configs/Constants";
import SaveAsIcon from '@mui/icons-material/SaveAs';

import {DeepCopy, parseErrorsJoin, truncateString} from "../../configs/Utils";

const BackupScreen = (props) => {
    const programMetadata = {
        results: {
            resource: `programs/${props.program.id}/metadata.json`
        }
    }

    const queryDataStore = {
        results: {
            resource: `dataStore/${BACKUPS_NAMESPACE}/${props.program.id}`
        }
    };

    const dsCreateMutation = {
        resource: `dataStore/${BACKUPS_NAMESPACE}/${props.program.id}`,
        type: 'create',
        data: ({ data }) => data
    };

    const dsUpdateMutation = {
        resource: `dataStore/${BACKUPS_NAMESPACE}/${props.program.id}`,
        type: 'update',
        data: ({ data }) => data
    };

    const pad2Digits = num => {
        return num.toString().padStart(2, '0');
    }

    const formatDate = (date, dateSplit, hourSplit) => {
        return (
            [
                date.getFullYear(),
                pad2Digits(date.getMonth() + 1),
                pad2Digits(date.getDate()),
            ].join(dateSplit) +
            ' ' +
            [
                pad2Digits(date.getHours()),
                pad2Digits(date.getMinutes()),
                pad2Digits(date.getSeconds()),
            ].join(hourSplit)
        );
    }

    const [validationError, setValidationError] = useState(false);
    const [versionValidationError, setVersionValidationError] = useState(false);
    const [programName, setProgramName] = useState(truncateString(props.program.name, 30, false) + '_' + formatDate(new Date(), "_", "_"));
    const [programVersion, setProgramVersion] = useState(props.program.version);
    const [processing, setProcessing] = useState(false);
    let nameInput = useRef();
    let versionInput = useRef();
    let commentInput = useRef();

    const { loading: dsLoading, data: dsData } = useDataQuery(queryDataStore);
    const { loading: loadingMetadata, data: metaData } = useDataQuery(programMetadata, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            setProcessing(false);
            hideFormHandler();
        }
    });

    const dsCreateDM = useDataMutation(dsCreateMutation, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            setProcessing(false);
            hideFormHandler();
        }
    });
    const dsUpdateDM = useDataMutation(dsUpdateMutation, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            setProcessing(false);
            hideFormHandler();
        }
    });

    let dsBackups = {};

    if (!dsLoading) {
        if (!dsData?.results) {
            dsBackups.backups = [];
        } else {
            dsBackups = dsData.results;
        }
    }

    const dsCreateRequest = {
        mutate: dsCreateDM[0],
        loading: dsCreateDM[1].loading,
        data: dsCreateDM[1].data
    }
    const dsUpdateRequest = {
        mutate: dsUpdateDM[0],
        loading: dsUpdateDM[1].loading,
        data: dsUpdateDM[1].data
    }

    const hideFormHandler = () => {
        props.setBackupProgramId(undefined)
    };

    const programBackupHandler = () => {
        setProcessing(true);
        const timestamp = formatDate(new Date(), "-", ":");
        if (nameInput.current.value.trim() === "" || versionInput.current.value.trim() === "") {
            (nameInput.current.value.trim() === "") ? setValidationError(true) : setValidationError(false);
            (versionInput.current.value.trim() === "") ? setVersionValidationError(true) : setVersionValidationError(false);
            setProcessing(false);
            return;
        }
        setValidationError(false);
        setVersionValidationError(false);
        let backup = {
            "id": new Date().valueOf(),
            "name": nameInput.current.value,
            "backup_date": timestamp,
            "version": versionInput.current.value,
            "comment": commentInput.current.value,
            "metadata": processMetadata(metaData.results)
        };
        dsBackups.backups.push(backup);
        let backupToDatastore = !dsData?.results ? dsCreateRequest : dsUpdateRequest
        backupToDatastore.mutate({ data: dsBackups })
            .then(response => {
                if (response.status !== 'OK') {
                    props.setNotification({
                        message: `Some errors occured while backing up your Program. Please contact the administrator.`,
                        severity: 'error'
                    })
                }
                else {
                    props.setNotification({
                        message: `The backup for the selected Program has been created successfully.`,
                        severity: 'success'
                    })
                }
                setProcessing(false);
                hideFormHandler();
            });
    }

    const processMetadata = metadata => {
        const hnqis_attributes = [ORGANISATION_UNIT_ATTRIBUTE, HEALTH_AREA_ATTRIBUTE, ASSESSMENT_DATE_ATTRIBUTE, GLOBAL_SCORE_ATTRIBUTE, COMPETENCY_ATTRIBUTE]
        const hnqis_elements = [ACTION_PLAN_RESPONSIBLE, ACTION_PLAN_DUE_DATE, ACTION_PLAN_ACTION, NON_CRITICAL_STEPS, CRITICAL_STEPS, COMPETENCY_CLASS]
        const hnqis_tet_exception = [ASSESSMENT_TET]
        if (metaData) {
            delete metadata.date;
            delete metadata.categories;
            delete metadata.categoryCombos;
            delete metadata.categoryOptions;
            delete metadata.categoryOptionCombos;

            metadata.programs?.forEach(program => {
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

            metadata.programStageSections?.forEach(stageSection => {
                delete stageSection.created;
                delete stageSection.lastUpdated;
                delete stageSection.lastUpdatedBy;
            });

            metadata.programStages?.forEach(stage => {
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

            metadata.options?.forEach(option => {
                delete option.created;
                delete option.lastUpdated;
            });

            metadata.attributes?.forEach((att) => {
                delete att.created;
                delete att.createdBy;
                delete att.lastUpdated;
                delete att.lastUpdatedBy;
            });

            metadata.programTrackedEntityAttributes?.forEach(ptea => {
                delete ptea.created;
                delete ptea.lastUpdated;
            });

            metadata.dataElements = DeepCopy(filterComponent(metadata.dataElements, hnqis_elements))

            metadata.trackedEntityTypes = DeepCopy(filterComponent(metadata?.trackedEntityTypes, hnqis_tet_exception));


            metadata.trackedEntityTypes?.forEach(tet => {
                tet.trackedEntityTypeAttributes?.forEach(tea => {
                    delete tea.created;
                    delete tea.createdBy;
                    delete tea.lastUpdated;
                    delete tea.access;
                });

            });

            metadata.trackedEntityAttributes = DeepCopy(filterComponent(metadata.trackedEntityAttributes, hnqis_attributes))

            metadata.programStageDataElements?.forEach(psde => {
                delete psde.created;
                delete psde.lastUpdated;
            });

            metadata.optionSets?.forEach(optionSet => {
                delete optionSet.created;
                delete optionSet.createdBy;
                delete optionSet.lastUpdated;
                delete optionSet.lastUpdatedBy;
            });

            return metadata;
        }
        return null;
    }

    const filterComponent = (elements, filterList) => {
        let results = []
        elements?.forEach((element) => {
            if(!filterList.includes(element.id)) {
                delete element.created;
                delete element.createdBy;
                delete element.lastUpdated;
                delete element.lastUpdatedBy;
                delete element?.categoryCombo;

                results.push(element)
            }
        })
        return results;
    }

    return <>
        <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
            {(loadingMetadata || processing) && <Box sx={{ display: 'inline-flex', margin: "50px" }}><CircularProgress /></Box>}
            {!(loadingMetadata || processing) &&
                <>
                    <CustomMUIDialogTitle onClose={hideFormHandler} id={"program_backup_dialog_title"}>Create Backup
                        for Program {truncateString(metaData.results?.programs[0].name, 40)}</CustomMUIDialogTitle>
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        <TextField
                            margin="normal"
                            id="name"
                            label="Backup Name (*)"
                            type="text"
                            value={programName}
                            onChange={e => setProgramName(e.target.value)}
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                        inputRef={nameInput}
                            inputProps={{
                                maxLength: 50
                            }}
                            helperText={validationError ? "Please provide a Backup Name" : ""}
                            error={validationError}
                        />
                        <TextField
                            margin="normal"
                            id="version"
                            label="Version (*)"
                            type="text"
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                            inputRef={versionInput}
                            value={programVersion}
                            onChange={e => setProgramVersion(e.target.value)}
                            helperText={versionValidationError ? "Please provide a valid Version identifier" : ""}
                            error={versionValidationError}
                        />
                        <TextField
                            id="comments"
                            label="Comments"
                            multiline
                            rows={4}
                            fullWidth
                            variant="standard"
                            inputRef={commentInput}
                        />
                    </DialogContent>
                    <DialogActions style={{ padding: '1em' }}>
                        <Button onClick={hideFormHandler} color={"error"}>Close</Button>
                        <Button onClick={programBackupHandler} color={"primary"} variant='outlined' startIcon={<SaveAsIcon />}>Save Backup</Button>
                    </DialogActions>
                </>
            }
        </CustomMUIDialog>
    </>
}

export default BackupScreen