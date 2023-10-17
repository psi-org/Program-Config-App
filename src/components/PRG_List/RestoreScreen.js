import { useDataQuery } from "@dhis2/app-runtime";
import { Alert, Box, Button, CircularProgress, DialogActions, DialogContent, Divider, List } from "@mui/material";
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { BACKUPS_NAMESPACE } from "../../configs/Constants.js";
import { truncateString } from "../../utils/Utils.js";
import CustomMUIDialog from "../UIElements/CustomMUIDialog.js";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle.js";
import RestoreItem from "./RestoreItem.js";
import RestoreOptions from "./RestoreOptions.js";

``
const RestoreScreen = (props) => {

    const queryDataStore = {
        results: {
            resource: `dataStore/${BACKUPS_NAMESPACE}/${props.program.id}`
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
            {loading && <Box sx={{ display: 'inline-flex', margin: "50px" }}><CircularProgress /></Box>}
            {!loading &&
                <>
                    <CustomMUIDialogTitle onClose={hideFormHandler} id={"program_restore_dialog_title"}>
                        {(dataStore && restoreBackup) ? "Restoring " + restoreBackup.name : "Available Backups for Program " + truncateString(props.program.name, 40)}
                    </CustomMUIDialogTitle>
                    {!dataStore &&
                        <Alert severity="error">No Backups found for the selected Program.</Alert>
                    }
                    {dataStore && !(typeof restoreBackup !== "undefined") &&
                        <>
                            <DialogContent dividers style={{ padding: '1em 2em' }}>
                                <List sx={{ width: '100%', bgColor: 'background.paper' }}>
                                    {dataStore.backups.map((backup, index, elements) => {
                                        return <>
                                            <RestoreItem backup={backup} key={index} restoreHandler={onRestoreHandler} />
                                            {(elements[index + 1]) && <Divider key={`divider_${index}`} />}
                                        </>
                                    })}
                                </List>
                            </DialogContent>
                            <DialogActions style={{ padding: '1em' }}>
                                <Button onClick={hideFormHandler} color={"error"}>Close</Button>
                            </DialogActions>
                        </>
                    }
                    {dataStore && restoreBackup &&
                        <RestoreOptions backup={restoreBackup} key={props.setRestoreProgramId} setRestoreProgramId={props.setRestoreProgramId} setNotification={props.setNotification} />
                    }
                </>
            }
        </CustomMUIDialog>
    </>
}

RestoreScreen.propTypes = {
    program: PropTypes.object,
    setNotification: PropTypes.func,
    setRestoreProgramId: PropTypes.func

}

export default RestoreScreen