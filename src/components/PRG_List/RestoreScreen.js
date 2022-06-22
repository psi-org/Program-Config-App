import { useState, useRef, useEffect } from "react";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import CustomMUIDialog from "../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle";
import { DialogActions, DialogContent, Alert, Box, CircularProgress, Button, List } from "@mui/material";
import { NAMESPACE } from "../../configs/Constants";

import RestoreItem from "./RestoreItem";
import RestoreOptions from "./RestoreOptions";

const RestoreScreen = (props) => {

    const queryDataStore = {
        results: {
            resource: `dataStore/${NAMESPACE}/${props.program.id}`
        }
    };

    const [restoreBackup, setRestoreBackup] = useState(undefined);

    const { loading, data } = useDataQuery(queryDataStore);
    let dataStore;
    if (!loading && data) {
        dataStore = data.results;
    }

    const hideFormHandler = () => {
        props.setRestoreProgramId(undefined);
    };

    const onRestoreHandler = (backup) => {
        setRestoreBackup(backup);
    };


    return <>
                <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                    {loading && <Box sx={{ display: 'inline-flex', margin: "50px", display: 'flex' }}><CircularProgress /></Box>}
                    {!loading &&
                        <>
                            <CustomMUIDialogTitle onClose={hideFormHandler} id={"program_restore_dialog_title"}>Program Backups for - {props.program.name}</CustomMUIDialogTitle>
                                {!dataStore &&
                                    <Alert severity="error">No Backups found. Please do backup</Alert>
                                }
                                {dataStore && !(typeof restoreBackup !== "undefined") &&
                                    <>
                                        <DialogContent dividers style={{padding: '1em 2em'}}>
                                            <List sx={{width: '100%', bgColor: 'background.paper'}}>
                                                {dataStore.backups.map((backup) => {
                                                    return <RestoreItem backup={backup} key={backup.id} restoreHandler={onRestoreHandler}/>
                                                })}
                                            </List>
                                        </DialogContent>
                                        <DialogActions style={{ padding: '1em'}}>
                                            <Button onClick={hideFormHandler} color={"error"}>Close</Button>
                                        </DialogActions>
                                    </>
                                }
                                {dataStore && restoreBackup &&
                                    <RestoreOptions backup={restoreBackup} hideFormHandler={hideFormHandler}/>
                                }
                        </>
                    }
                </CustomMUIDialog>
            </>
}

export default RestoreScreen