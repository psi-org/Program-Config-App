import { useState, useRef } from "react";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import { DialogActions, DialogContent, FormControl, InputLabel, TextField, Select, ButtonGroup, Button, MenuItem, Box, CircularProgress } from "@mui/material";

const BackupScreen = (props) => {

    const programMetadata = {
        results: {
            resource: 'programs/' + props.id + '/metadata.json'
        }
    }

    let nameInput = useRef();
    let versionInput = useRef();
    let commentInput = useRef();

    const { loading: loadingMetadata, error: errorMetadata, data: metaData } = useDataQuery(programMetadata);

    if (!loadingMetadata)
    {
        versionInput.current = metaData.results?.programs[0].version;
    }

    const hideFormHandler = () => {
        props.setBackupProgramId(undefined)
    };

    const programBackupHandler = () => {
        let backup = {
            "name": nameInput.current,
            "version": versionInput.current,
            "comment": commentInput.current,
            "metadata": metaData.result
        };
        console.log("Backup: ", backup);
    }

    return  <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                { loadingMetadata && <Box sx={{ display: 'inline-flex' }}><CircularProgress /></Box>}
                {!loadingMetadata &&
                <>
                    <CustomMUIDialogTitle onClose={hideFormHandler} id={"orgUnit_assignemnt_dialog_title"}>Backup
                        Program ({metaData.results?.programs[0].name})</CustomMUIDialogTitle>
                    <DialogContent dividers style={{padding: '1em 2em'}}>
                        <TextField
                            margin="normal"
                            id="name"
                            label="Backup Name (*)"
                            type="text"
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                            ref={nameInput}
                            />
                        <TextField
                            margin="normal"
                            id="version"
                            label="Version"
                            type="text"
                            fullWidth
                            variant="standard"
                            autoComplete="off"
                            ref={versionInput}
                            />
                        <TextField
                            id="comments"
                            label="Comments"
                            multiline
                            rows={4}
                            fullWidth
                            variant="standard"
                            ref={commentInput}
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