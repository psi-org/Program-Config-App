import { useState, useRef, useEffect } from "react";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import { DialogActions, DialogContent, FormControl, InputLabel, TextField, Select, ButtonGroup, Button, MenuItem, Box, CircularProgress } from "@mui/material";
import { NAMESPACE } from "../../configs/Constants";

const BackupScreen = (props) => {
    const programMetadata = {
        results: {
            resource: `programs/${props.program.id}/metadata.json`
        }
    }

    const queryDataStore = {
        results: {
            resource: `dataStore/${NAMESPACE}/${props.program.id}`
        }
    };

    const dsCreateMutation = {
        resource: `dataStore/${NAMESPACE}/${props.program.id}`,
        type: 'create',
        data: ({data}) => data
    };

    const dsUpdateMutation = {
        resource: `dataStore/${NAMESPACE}/${props.program.id}`,
        type: 'update',
        data: ({data}) => data
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
    const [programName, setProgramName] = useState(props.program.name+'_'+  formatDate(new Date(), "_", "_"));
    const [programVersion, setProgramVersion] = useState(props.program.version);
    const [processing, setProcessing] = useState(false);
    let nameInput = useRef();
    let versionInput = useRef();
    let commentInput = useRef();

    const { loading: dsLoading, data: dsData } = useDataQuery(queryDataStore);
    const { loading: loadingMetadata, error: errorMetadata, data: metaData } = useDataQuery(programMetadata);

    const dsCreateDM = useDataMutation(dsCreateMutation);
    const dsUpdateDM = useDataMutation(dsUpdateMutation);

    let dsBackups = {};

    if (!dsLoading)
    {
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
        if(nameInput.current.value.trim() === "")
        {
            setValidationError(true);
            return;
        }
        setValidationError(false);
        let backup = {
            "id" : new Date().valueOf(),
            "name": nameInput.current.value,
            "backup_date":timestamp,
            "version": versionInput.current.value,
            "comment": commentInput.current.value,
            "metadata": metaData.results
        };
        dsBackups.backups.push(backup);
        let backupToDatastore = !dsData?.results ? dsCreateRequest : dsUpdateRequest
        backupToDatastore.mutate({data: dsBackups})
            .then(response=>{
                setProcessing(false);
                hideFormHandler();
                if(response.status != 'OK') {
                    props.setNotification({
                        message: `Some errors occured while backing up your Program. Please contact the administrator.`,
                        severity: 'error'
                    })
                }
                else {
                    props.setNotification({
                        message: `The program is backed up successfully.`,
                        severity: 'success'
                    })
                }
            });
    }

    return  <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                { (loadingMetadata || processing) && <Box sx={{ display: 'inline-flex', margin: "50px", display: 'flex' }}><CircularProgress /></Box>}
                {!(loadingMetadata || processing) &&
                <>
                    <CustomMUIDialogTitle onClose={hideFormHandler} id={"program_backup_dialog_title"}>Backup
                        Program ({metaData.results?.programs[0].name})</CustomMUIDialogTitle>
                    <DialogContent dividers style={{padding: '1em 2em'}}>
                        <TextField margin="normal" id="name" label="Backup Name (*)" type="text" value={programName} onChange={e => setProgramName(e.target.value)} fullWidth variant="standard" autoComplete="off" inputRef={nameInput} helperText={ validationError ? "Please provide a name" : " "} error={validationError} />
                        <TextField
                            margin="normal"
                            id="version"
                            label="Version"
                            type="text"
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                            inputRef={versionInput}
                            value={programVersion}
                            onChange={e => setProgramVersion(e.target.value)}
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
                    <DialogActions style={{ padding: '1em'}}>
                        <Button onClick={hideFormHandler} color={"error"}>Close</Button>
                        <Button onClick={programBackupHandler} color={"primary"}>Backup</Button>
                    </DialogActions>
                </>
                }
            </CustomMUIDialog>
            </>
}

export default BackupScreen