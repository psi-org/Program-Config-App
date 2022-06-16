import { useState, useRef, useEffect } from "react";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import { DialogActions, DialogContent, FormControl, InputLabel, TextField, Select, ButtonGroup, Button, MenuItem, Box, CircularProgress } from "@mui/material";
import { NAMESPACE } from "../../configs/Constants";

const BackupScreen = (props) => {

    const programMetadata = {
        results: {
            resource: `programs/${props.id}/metadata.json`
        }
    }

    const queryDataStore = {
        results: {
            resource: `dataStore/programconfigapp/${props.id}`
        }
    };

    const dsCreateMutation = {
        resource: `dataStore/${NAMESPACE}/${props.id}`,
        type: 'create',
        data: ({data}) => data
    };

    const dsUpdateMutation = {
        resource: `dataStore/${NAMESPACE}/${props.id}`,
        type: 'update',
        data: ({data}) => data
    };

    const [validationError, setValidationError] = useState(false);
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
        const dt = new Date();
        const timestamp = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + 'T' +dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
        if(nameInput.current.value.trim() === "")
        {
            setValidationError(true);
            return;
        }
        setValidationError(false);
        let backup = {
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
                { loadingMetadata && <Box sx={{ display: 'inline-flex', margin: "50px", display: 'flex' }}><CircularProgress /></Box>}
                {!loadingMetadata &&
                <>
                    <CustomMUIDialogTitle onClose={hideFormHandler} id={"orgUnit_assignemnt_dialog_title"}>Backup
                        Program ({metaData.results?.programs[0].name})</CustomMUIDialogTitle>
                    <DialogContent dividers style={{padding: '1em 2em'}}>
                        <TextField margin="normal" id="name" label="Backup Name (*)" type="text" fullWidth variant="standard" autoComplete="off" inputRef={nameInput} helperText={ validationError ? "Please provide a name" : " "} error={validationError} />
                        <TextField
                            margin="normal"
                            id="version"
                            label="Version"
                            type="text"
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                            inputRef={versionInput}
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