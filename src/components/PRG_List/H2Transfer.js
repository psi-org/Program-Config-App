import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";

import { CircularLoader } from "@dhis2/ui";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CustomMUIDialogTitle from "./../UIElements/CustomMUIDialogTitle";
import CustomMUIDialog from "./../UIElements/CustomMUIDialog";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

import MoveDownIcon from "@mui/icons-material/MoveDown";

import { useState, useEffect } from "react";
import {
    DialogTitle,
} from "@mui/material";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import AlertDialogSlide from "../UIElements/AlertDialogSlide";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

import { parseErrors } from "../../configs/Utils";

import {
    METADATA,
    COMPETENCY_ATTRIBUTE,
    GLOBAL_SCORE_ATTRIBUTE,
    ASSESSMENT_DATE_ATTRIBUTE,
    HEALTH_AREA_ATTRIBUTE,
    ORGANISATION_UNIT_ATTRIBUTE,
    COMPETENCY_CLASS,
    CRITICAL_STEPS,
    NON_CRITICAL_STEPS,
    ACTION_PLAN_ACTION,
    ACTION_PLAN_DUE_DATE,
    ACTION_PLAN_RESPONSIBLE,
    ASSESSMENT_TET,
    H1_OVERALL_SCORE,
    H1_COMPETENCY_CLASS
} from "../../configs/Constants";

import { DeepCopy } from "../../configs/Utils";

const queryProgramMetadata = {
    results: {
        resource: "programs",
        params: ({ program }) => ({
            fields: ["id", "name", "attributeValues","programStages[programStageDataElements[compulsory,dataElement[id,attributeValues]]]"],
            filter: [`id:eq:${program}`]
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
                "storedBy",
                "dataValues[dataElement, value]",
            ],
            filter: [],
            skipPaging: true,
        }),
    },
};

const metadataMutation = {
    resource: "trackedEntityInstances",
    type: "create",
    data: ({ data }) => data,
};

const H2Transfer = ({
    programConfig,
    setTransferH2Program,
    setNotification,
    doSearch,
}) => {
    let metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called,
    };

    const [h2Program, setH2Program] = useState(undefined);

    const [dialogStatus, setDialogStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingConversion, setLoadingConversion] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [conversionError, setConversionError] = useState(undefined);

    const { data: programData } = useDataQuery(queryProgramEvents, {
        variables: { program: programConfig.id },
    });

    const { refetch: getH2Program } = useDataQuery(queryProgramMetadata, {
        lazy: true,
        variables: {},
    });

    useEffect(() => {
        if (programData) {
            let metadata = JSON.parse(
                programConfig.attributeValues.find(
                    (av) => av.attribute.id === METADATA
                )?.value || "{}"
            );
            getH2Program({
                program: metadata.upgradedProgram,
            }).then((data) => {
                if (
                    data?.results?.programs &&
                    data?.results?.programs.length > 0
                ) {
                    setH2Program(data?.results?.programs[0]);
                }
            });
        }
    }, [programData]);

    useEffect(() => {
        if (h2Program) {
            let metadataH2 = JSON.parse(
                h2Program.attributeValues.find(
                    (av) => av.attribute.id === METADATA
                )?.value || "{}"
            );

            console.log({h2Program});

            let mapDataElements = h2Program.programStages.reduce((programDataElements,stage)=>{
                let stageDataElements = stage.programStageDataElements.reduce((acu,de)=>{
                    acu[de.dataElement.id] = {
                        metadata: JSON.parse(de.dataElement.attributeValues.find(att => att.attribute.id === METADATA)?.value || "{}"), 
                        critical: de.compulsory
                    }
                    return acu
                },{})
                return {...programDataElements,...stageDataElements}
            },{})

            console.log({mapDataElements})

            let trackedEntityInstances = []
            let competencyMap = {
                "C": 'competent',
                "CNI": 'improvement',
                "NC": 'notcompetent'
            }
            console.log({metadataH2});
            console.log({eventExample: programData.results?.events[0]})

            programData.results?.events?.forEach(event => {
                let hnqisTEI = {};
                let h2Events = [];

                // *Events Creation (One event for the assessment and up to three action plans)
                // TODO: The scores calculation goes first (Store values to CRITICAL_STEPS and NON_CRITICAL_STEPS DEs)




                

                // *TEI Configuration
                hnqisTEI.orgUnit = event.orgUnit;
                hnqisTEI.trackedEntityType = ASSESSMENT_TET;
                hnqisTEI.attributes = [
                    {
                        attribute: GLOBAL_SCORE_ATTRIBUTE,
                        value: event.dataValues.find(
                            (dv) => dv.dataElement === H1_OVERALL_SCORE
                        )?.value,
                    },
                    {
                        attribute: ASSESSMENT_DATE_ATTRIBUTE,
                        value: event.eventDate,
                    },
                    {
                        attribute: HEALTH_AREA_ATTRIBUTE,
                        value: metadataH2.healthArea,
                    },
                    { attribute: ORGANISATION_UNIT_ATTRIBUTE, value: "" }, //! Stores the Org Unit Code (not present in every OU)
                ];

                if (metadataH2.useCompetencyClass === "Yes") {
                    hnqisTEI.attributes.push({
                        attribute: COMPETENCY_ATTRIBUTE,
                        value: competencyMap[
                            event.dataValues.find(
                                (dv) => dv.dataElement === H1_COMPETENCY_CLASS
                            )?.value
                        ],
                    });
                }

                // *Enrollment Configuration
                hnqisTEI.enrollments = [
                    {
                        orgUnit: event.orgUnit,
                        program: h2Program.id,
                        enrollmentDate: event.eventDate,
                        incidentDate: event.eventDate,
                        events: h2Events,
                    },
                ];

                trackedEntityInstances.push(hnqisTEI);
            });
            console.log({trackedEntityInstances});

            setLoading(false);
        }
    }, [h2Program]);

    const hideForm = () => {
        setTransferH2Program(undefined);
    };

    const submission = async () => {};

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
                                Fetching and Preparing Data
                            </span>
                        </div>
                    )}
                    {!loading && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Card sx={{ maxWidth: "30%" }} raised={true}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        Current Program
                                    </Typography>
                                    <Typography variant="body2">
                                        {programConfig.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <DoubleArrowIcon className="progress-animation" />
                            <Card sx={{ maxWidth: "25%" }} raised={true}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        Transfer Data
                                    </Typography>
                                    <Typography variant="body2">
                                        {programData?.results?.events?.length +
                                            " Assessments"}
                                    </Typography>
                                </CardContent>
                            </Card>
                            <DoubleArrowIcon className="progress-animation" />
                            <Card sx={{ maxWidth: "30%" }} raised={true}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        New Program
                                    </Typography>
                                    <Typography variant="body2">
                                        {h2Program.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
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
                            startIcon={<MoveDownIcon />}
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
