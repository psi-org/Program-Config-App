import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";

import { CircularLoader } from "@dhis2/ui";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CustomMUIDialogTitle from "./../UIElements/CustomMUIDialogTitle";
import CustomMUIDialog from "./../UIElements/CustomMUIDialog";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import UpgradeIcon from "@mui/icons-material/SwitchAccessShortcutAdd";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LabelIcon from "@mui/icons-material/LabelImportant";
import QuizIcon from "@mui/icons-material/Quiz";
import PercentIcon from "@mui/icons-material/Percent";

import { useState, useEffect } from "react";
import {
    DialogTitle,
    FormControl,
    FormControlLabel,
    Switch,
} from "@mui/material";
import SelectOptions from "../UIElements/SelectOptions";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import AlertDialogSlide from "../UIElements/AlertDialogSlide";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

import { parseErrors } from "../../configs/Utils";

import { DeepCopy } from "../../configs/Utils";

const queryProgramMetadata = {
    results: {
        resource: "programs",
        params: ({ program }) => ({
            fields: ["id", "name", "attributeValues"],
            filter: [`id:eq:${program}`],
        }),
    },
};

const queryProgramEvents = {
    results: {
        resource: "events",
        params: ({ program }) => ({
            program,
            fields: [
                "program",
                "orgUnit",
                "eventDate",
                "status",
                "completedDate",
                "dataValues[(dataElement, value)]"
            ],
            filter: [],
            paging: false
        }),
    },
};


const metadataMutation = {
    resource: "trackedEntityInstances",
    type: "create",
    data: ({ data }) => data,
};

const H2Transfer = ({program, setTransferH2ProgramID, setNotification, doSearch}) => {
    let metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called,
    };

    const [dialogStatus, setDialogStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingConversion, setLoadingConversion] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [conversionError, setConversionError] = useState(undefined);

    const { data: programData } = useDataQuery(queryProgramMetadata, {
        variables: { program },
    });

    useEffect(() => {

    }, [programData]);


    const hideForm = () => {
        setTransferH2ProgramID(undefined);
    };

    const submission = async () => {
        
    };

    return (
        <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                <CustomMUIDialogTitle
                    id="customized-dialog-title"
                    onClose={() => hideForm()}
                >
                    Transfer all HNQIS 1.X Data to HNQIS 2.0
                </CustomMUIDialogTitle>
                <DialogContent
                    dividers
                    style={{
                        padding: "1em 2em",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {loading && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CircularLoader />
                            <span
                                style={{
                                    fontSize: "1.1em",
                                    marginTop: "0.5em",
                                }}
                            >
                                Preparing Data
                            </span>
                        </div>
                    )}
                    {!loading && (
                        <p>
                            <strong>Selected Program: </strong>
                            {programData?.results?.programs[0].name}
                        </p>

                    )}
                    
                </DialogContent>

                <DialogActions style={{ padding: "1em" }}>
                    <Button onClick={() => hideForm()} color="error">
                        Cancel
                    </Button>
                    {!loading && (
                        <Button
                            onClick={() => {
                                submission();
                            }}
                            variant="outlined"
                            disabled={!programData?.results}
                            startIcon={<UpgradeIcon />}
                        >
                            Begin Data Transfer
                        </Button>
                    )}
                </DialogActions>
            </CustomMUIDialog>
            <AlertDialogSlide
                open={dialogStatus}
                title={
                    "Are you sure you want to begin the Data Transfer process?"
                }
                content={
                    "All the original Assessment Data will be copied and modified to fit the new HNQIS 2.0 structure."
                }
                primaryText={"Yes, continue"}
                secondaryText={"Cancel"}
                color={"success"}
                actions={{
                    primary: function () {
                        setDialogStatus(false);
                        convertProgram();
                    },
                    secondary: function () {
                        setDialogStatus(false);
                    },
                }}
            />
            <CustomMUIDialog open={statusModal} maxWidth="sm" fullWidth={true}>
                <DialogTitle id="alert-dialog-title">
                    Transfer Status
                </DialogTitle>
                <DialogContent
                    dividers
                    style={{
                        padding: "1em 2em",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {loadingConversion && (
                        <Box sx={{ width: "100%" }}>
                            <LinearProgress />
                        </Box>
                    )}
                    {conversionError && (
                        <p style={{ color: "#AA0000" }}>{conversionError}</p>
                    )}
                </DialogContent>
                <DialogActions>
                    {!loadingConversion && (
                        <Button
                            onClick={() => setStatusModal(false)}
                            color="primary"
                        >
                            Close
                        </Button>
                    )}
                </DialogActions>
            </CustomMUIDialog>
        </>
    );
};

export default H2Transfer;
