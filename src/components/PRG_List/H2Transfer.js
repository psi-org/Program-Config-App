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
import { DialogTitle } from "@mui/material";

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
    H1_COMPETENCY_CLASS,
    H1_ACTION1,
    H1_RESPONSIBLE1,
    H1_DUE_DATE1,
    H1_COMPLETION_DATE1,
    H1_ACTION2,
    H1_RESPONSIBLE2,
    H1_DUE_DATE2,
    H1_COMPLETION_DATE2,
    H1_ACTION3,
    H1_RESPONSIBLE3,
    H1_DUE_DATE3,
    H1_COMPLETION_DATE3,
    H1_ACTION_PLAN_OLD,
    H1_ACTION1_OLD,
    H1_ACTION2_OLD,
} from "../../configs/Constants";

import { DeepCopy } from "../../configs/Utils";

const queryProgramMetadata = {
    results: {
        resource: "programs",
        params: ({ program }) => ({
            fields: [
                "id",
                "name",
                "attributeValues",
                "programStages[id,name,programStageDataElements[compulsory,dataElement[id,attributeValues]]]",
            ],
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
                "event",
                "program",
                "orgUnit",
                "eventDate",
                "status",
                "completedDate",
                "storedBy",
                "dataValues[dataElement, value]",
                "notes",
            ],
            filter: [],
            skipPaging: true,
        }),
    },
};

const queryEventData = {
    results: {
        resource: "events",
        params: ({ program, eventId }) => ({
            event: eventId,
            program,
            fields: [
                "*"
            ],
        }),
    },
};

const metadataMutation = {
    resource: "trackedEntityInstances",
    type: "create",
    data: ({ data }) => data,
};

const eventMutation = {
    resource: "events",
    type: "create",
    data: ({ data }) => data,
};

const queryIds = {
    results: {
        resource: "system/id.json",
        params: ({ n }) => ({
            limit: n,
        }),
    },
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

    let eventDM = useDataMutation(eventMutation, {
        lazy: true,
    });

    const eventRequest = {
        mutate: eventDM[0],
        loading: eventDM[1].loading,
        error: eventDM[1].error,
        data: eventDM[1].data,
        called: eventDM[1].called,
    };

    const [h2Program, setH2Program] = useState(undefined);

    const [dialogStatus, setDialogStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingConversion, setLoadingConversion] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [conversionError, setConversionError] = useState(undefined);
    const [requestsData, setRequestsData] = useState(undefined);
    const [progressValue, setProgressValue] = useState(0);

    const { data: programData } = useDataQuery(queryProgramEvents, {
        variables: { program: programConfig.id },
    });

    const { refetch: getEvent } = useDataQuery(queryEventData, {
        variables: { program: undefined, eventId: undefined },
        lazy: true
    });

    const { refetch: getH2Program } = useDataQuery(queryProgramMetadata, {
        lazy: true,
        variables: {},
    });

    const idsQuery = useDataQuery(queryIds, {
        lazy: true,
        variables: { n: undefined },
    });

    const buildActionPlan = (
        eventTemplate,
        apStage,
        action,
        responsible,
        dueDate,
        completionDate
    ) => {
        if (!action) return undefined;

        eventTemplate.eventDate = completionDate || eventTemplate.eventDate;
        eventTemplate.programStage = apStage;

        eventTemplate.dataValues.push({
            dataElement: ACTION_PLAN_ACTION,
            value: action,
        });

        eventTemplate.dataValues.push({
            dataElement: ACTION_PLAN_RESPONSIBLE,
            value: responsible || "-",
        });

        eventTemplate.dataValues.push({
            dataElement: ACTION_PLAN_DUE_DATE,
            value: dueDate || "-",
        });

        return eventTemplate;
    };

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

            let assessmentStageId = "";
            let actionPlanStageId = "";
            let assessmentStageDataElements = [];

            let mapDataElements = h2Program.programStages.reduce(
                (programDataElements, stage) => {
                    if (stage.name.toLowerCase().includes("assessment")) {
                        assessmentStageId = stage.id;
                        assessmentStageDataElements =
                            stage.programStageDataElements;
                    } else {
                        actionPlanStageId = stage.id;
                    }
                    let stageDataElements =
                        stage.programStageDataElements.reduce((acu, de) => {
                            let metadata = JSON.parse(
                                de.dataElement.attributeValues.find(
                                    (att) => att.attribute.id === METADATA
                                )?.value || "{}"
                            );
                            acu[de.dataElement.id] = {
                                metadata,
                                critical: metadata.isCritical === "Yes",
                            };
                            return acu;
                        }, {});
                    return { ...programDataElements, ...stageDataElements };
                },
                {}
            );

            let trackedEntityInstances = [];
            let competencyMap = {
                C: "competent",
                CNI: "improvement",
                NC: "notcompetent",
            };

            let actionPlanControlDEs = [
                H1_ACTION1,
                H1_RESPONSIBLE1,
                H1_DUE_DATE1,
                H1_COMPLETION_DATE1,
                H1_ACTION2,
                H1_RESPONSIBLE2,
                H1_DUE_DATE2,
                H1_COMPLETION_DATE2,
                H1_ACTION3,
                H1_RESPONSIBLE3,
                H1_DUE_DATE3,
                H1_COMPLETION_DATE3,
                H1_ACTION_PLAN_OLD,
                H1_ACTION1_OLD,
                H1_ACTION2_OLD,
            ];

            let convertEvents = DeepCopy(programData.results)?.events?.filter(
                (event) =>
                    !event.notes?.find(
                        // TODO: REMEMBER TO UNCOMMENT THE ! SIGN
                        (note) => note.value === "<H2Transferred>"
                    )
            );

            convertEvents.forEach((event) => {
                let hnqisTEI = {};
                let h2Events = [];

                /*const uidData = await idsQuery.refetch({ n:5 })
                let uiPool = uidData?.results?.codes*/

                let pasedEventDate = event.eventDate.split("T")[0];

                // *Events Creation (One event for the assessment and up to three action plans)
                let eventTemplate = {
                    dataValues: [], //* Format -> {dataElement: 'id', value: 'value'}
                    eventDate: pasedEventDate,
                    orgUnit: event.orgUnit,
                    program: h2Program.id,
                    programStage: "",
                    storedBy: event.storedBy,
                    completedDate: event.completedDate,
                    status: event.status,
                };

                let actionPlanDataValues = event.dataValues.reduce(
                    (acu, de) => {
                        let mapVal = actionPlanControlDEs.find(
                            (cde) => cde === de.dataElement
                        );
                        if (mapVal) acu[mapVal] = de.value;
                        return acu;
                    },
                    {}
                );

                let assessmentDataValues = event.dataValues.reduce(
                    (acu, de) => {
                        if (!actionPlanControlDEs.includes(de.dataElement))
                            acu[de.dataElement] = de.value;
                        return acu;
                    },
                    {}
                );

                // *Action Plan Events
                let actionPlan1 = buildActionPlan(
                    DeepCopy(eventTemplate),
                    actionPlanStageId,
                    actionPlanDataValues[H1_ACTION1] ||
                        actionPlanDataValues[H1_ACTION_PLAN_OLD],
                    actionPlanDataValues[H1_RESPONSIBLE1],
                    actionPlanDataValues[H1_DUE_DATE1],
                    actionPlanDataValues[H1_COMPLETION_DATE1]
                );
                if (actionPlan1) h2Events.push(actionPlan1);

                let actionPlan2 = buildActionPlan(
                    DeepCopy(eventTemplate),
                    actionPlanStageId,
                    actionPlanDataValues[H1_ACTION2] ||
                        actionPlanDataValues[H1_ACTION1_OLD],
                    actionPlanDataValues[H1_RESPONSIBLE2],
                    actionPlanDataValues[H1_DUE_DATE2],
                    actionPlanDataValues[H1_COMPLETION_DATE2]
                );
                if (actionPlan2) h2Events.push(actionPlan2);

                let actionPlan3 = buildActionPlan(
                    DeepCopy(eventTemplate),
                    actionPlanStageId,
                    actionPlanDataValues[H1_ACTION3] ||
                        actionPlanDataValues[H1_ACTION2_OLD],
                    actionPlanDataValues[H1_RESPONSIBLE3],
                    actionPlanDataValues[H1_DUE_DATE3],
                    actionPlanDataValues[H1_COMPLETION_DATE3]
                );
                if (actionPlan3) h2Events.push(actionPlan3);

                // *TEI Configuration
                //hnqisTEI.trackedEntityInstance = event.event
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
                        value: pasedEventDate,
                    },
                    {
                        attribute: HEALTH_AREA_ATTRIBUTE,
                        value: metadataH2.healthArea,
                    },
                    { attribute: ORGANISATION_UNIT_ATTRIBUTE, value: "" }, //! Stores the Org Unit Code (not present in every OU)
                ];

                // *Assessment Event
                let assessmentEvent = DeepCopy(eventTemplate);
                assessmentEvent.programStage = assessmentStageId;
                let criticalNum = 0;
                let criticalDen = 0;
                let nonCriticalNum = 0;
                let nonCriticalDen = 0;

                assessmentStageDataElements.forEach((psde) => {
                    let deID = psde.dataElement.id;
                    let deValue = assessmentDataValues[deID];

                    if (
                        deValue &&
                        ![
                            COMPETENCY_CLASS,
                            CRITICAL_STEPS,
                            NON_CRITICAL_STEPS,
                        ].includes(deID)
                    ) {
                        let mappedDe = mapDataElements[deID];
                        let num = mappedDe.metadata.scoreNum;
                        let den = mappedDe.metadata.scoreDen;

                        if (num && den) {
                            if (mappedDe.critical) {
                                criticalNum += num * parseFloat(deValue || "0");
                                criticalDen += den;
                            } else {
                                nonCriticalNum +=
                                    num * parseFloat(deValue || "0");
                                nonCriticalDen += den;
                            }
                        }
                        assessmentEvent.dataValues.push({
                            dataElement: deID,
                            value: deValue,
                        });
                    }
                });

                assessmentEvent.dataValues.push({
                    dataElement: CRITICAL_STEPS,
                    value:
                        criticalDen > 0
                            ? (criticalNum / criticalDen) * 100 + ""
                            : "",
                });

                assessmentEvent.dataValues.push({
                    dataElement: NON_CRITICAL_STEPS,
                    value:
                        nonCriticalDen > 0
                            ? (nonCriticalNum / nonCriticalDen) * 100 + ""
                            : "",
                });

                // *Competency Assignment
                if (metadataH2.useCompetencyClass === "Yes") {
                    let eventCompetency =
                        competencyMap[
                            event.dataValues.find(
                                (dv) => dv.dataElement === H1_COMPETENCY_CLASS
                            )?.value
                        ];

                    hnqisTEI.attributes.push({
                        attribute: COMPETENCY_ATTRIBUTE,
                        value: eventCompetency,
                    });

                    assessmentEvent.dataValues.push({
                        dataElement: COMPETENCY_CLASS,
                        value: eventCompetency,
                    });
                }

                h2Events.push(assessmentEvent);

                // *Enrollment Configuration
                hnqisTEI.enrollments = [
                    {
                        orgUnit: event.orgUnit,
                        program: h2Program.id,
                        enrollmentDate: pasedEventDate,
                        incidentDate: pasedEventDate,
                        events: h2Events,
                    },
                ];

                trackedEntityInstances.push({
                    tei: {trackedEntityInstances: [hnqisTEI]},
                    event: event.event,
                    program: event.program
                });
            });

            console.log({ events: programData.results?.events });
            console.log({ trackedEntityInstances });
            setRequestsData(trackedEntityInstances);

            setLoading(false);
        }
    }, [h2Program]);

    const hideForm = () => {
        setTransferH2Program(undefined);
    };

    const submission = async () => {
        setProgressValue(0);
        setConversionError(undefined);
        setStatusModal(true);
        setLoadingConversion(true);
        if (requestsData) {
            let failedEvents = [];
            let numberRequests = requestsData.length;
            for (const [index, requestData] of requestsData.entries()) {
                const eventReq = await getEvent({
                    program: requestData.program,
                    eventId: requestData.event,
                });

                let event = eventReq.results?.events[0];

                if (event) {
                    event.notes = [
                        {
                            value: "<H2Transferred>",
                        },
                    ];

                    const storedData = await metadataRequest.mutate({
                        data: requestData.tei,
                    });

                    if (storedData.httpStatus === "OK") {
                        const storedNote = await eventRequest.mutate({
                            data: { events: [event] },
                        });
                        setProgressValue(((index + 1) / numberRequests) * 100);
                    } else {
                        failedEvents.push({
                            id: requestData.event,
                            msg: "Failed to convert Assessment to HNQIS 2.0.",
                        });
                        setProgressValue(((index + 1) / numberRequests) * 100);
                    }
                } else {
                    failedEvents.push({
                        id: requestData.event,
                        msg: "Event not found in server.",
                    });
                    setProgressValue(((index + 1) / numberRequests) * 100);
                }
            }
            
            if(failedEvents.length>0){
                setConversionError(failedEvents.join("<br/>"))
            }else{
                doSearch(programConfig.name);
                setNotification({
                    message:
                        "HNQIS 1.X Data converted to HNQIS 2.0",
                    severity: "success",
                });
                setTransferH2Program(undefined)
            }
        }
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
                                        {requestsData?.length + " Assessments"}
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
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ width: "90%" }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progressValue}
                                />
                            </Box>
                            <Typography
                                variant="caption"
                                component="div"
                                color="text.secondary"
                            >
                                {`${Math.round(progressValue)}%`}
                            </Typography>
                        </div>
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
