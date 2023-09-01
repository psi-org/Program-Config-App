import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";

import { CircularLoader, NoticeBox } from "@dhis2/ui";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CustomMUIDialogTitle from "./../UIElements/CustomMUIDialogTitle";
import CustomMUIDialog from "./../UIElements/CustomMUIDialog";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import PanToolIcon from "@mui/icons-material/PanTool";

import MoveDownIcon from "@mui/icons-material/MoveDown";

import { useState, useEffect, useRef } from "react";
import { DialogTitle } from "@mui/material";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import AlertDialogSlide from "../UIElements/AlertDialogSlide";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

import { parseErrors, parseErrorsJoin } from "../../utils/Utils";

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
    TRANSFERRED_EVENTS_NAMESPACE,
    DATE_FORMAT_OPTIONS,
} from "../../configs/Constants";

import { DeepCopy } from "../../utils/Utils";

const queryProgramMetadata = {
    results: {
        resource: "programs",
        params: ({ program }) => ({
            fields: [
                "id",
                "name",
                "attributeValues",
                "programStages[id,name,programStageDataElements[compulsory,dataElement[id,attributeValues]]]",
                "organisationUnits"
            ],
            filter: [`id:eq:${program}`],
        }),
    },
};

const queryProgramEvent = {
    results: {
        resource: "events",
        params: ({ program, eventId }) => ({
            event: eventId,
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
        }),
    },
};

const queryEventList = {
    results: {
        resource: "events",
        params: ({ program }) => ({
            program,
            fields: ["event", "orgUnit"],
            skipPaging: true,
            filter: [],
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
    const queryDataStore = {
        results: {
            resource: `dataStore/${TRANSFERRED_EVENTS_NAMESPACE}/${programConfig.id}`,
        },
    };

    const dsCreateMutation = {
        resource: `dataStore/${TRANSFERRED_EVENTS_NAMESPACE}/${programConfig.id}`,
        type: "create",
        data: ({ data }) => data,
    };

    const dsUpdateMutation = {
        resource: `dataStore/${TRANSFERRED_EVENTS_NAMESPACE}/${programConfig.id}`,
        type: "update",
        data: ({ data }) => data,
    };

    const { loading: dsLoading, data: dsData } = useDataQuery(queryDataStore);
    const dsCreateDM = useDataMutation(dsCreateMutation, {
        onError: (err) => {
            setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            setTransferH2Program(undefined);
        }
    });
    const dsUpdateDM = useDataMutation(dsUpdateMutation, {
        onError: (err) => {
            setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            setTransferH2Program(undefined);
        }
    });

    const dsCreateRequest = {
        mutate: dsCreateDM[0],
        loading: dsCreateDM[1].loading,
        data: dsCreateDM[1].data,
    };

    const dsUpdateRequest = {
        mutate: dsUpdateDM[0],
        loading: dsUpdateDM[1].loading,
        data: dsUpdateDM[1].data,
    };

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
    const [requestsData, setRequestsData] = useState(undefined);
    const [failedData, setFailedData] = useState(undefined);

    const [progressValue, setProgressValue] = useState(0);
    const cancelTransfer = useRef(false);

    const { data: programData } = useDataQuery(queryEventList, {
        variables: { program: programConfig.id },
    });

    const { refetch: getEvent } = useDataQuery(queryProgramEvent, {
        variables: { program: undefined, eventId: undefined },
        lazy: true,
    });

    const { refetch: getH2Program } = useDataQuery(queryProgramMetadata, {
        lazy: true,
        variables: {},
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

    const buildHnqisTEI = (
        event,
        metadataH2,
        mapDataElements,
        competencyMap,
        actionPlanControlDEs,
        assessmentStageId,
        actionPlanStageId,
        assessmentStageDataElements
    ) => {
        let hnqisTEI = {};
        let h2Events = [];

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

        let actionPlanDataValues = event.dataValues.reduce((acu, de) => {
            let mapVal = actionPlanControlDEs.find(
                (cde) => cde === de.dataElement
            );
            if (mapVal) acu[mapVal] = de.value;
            return acu;
        }, {});

        let assessmentDataValues = event.dataValues.reduce((acu, de) => {
            if (!actionPlanControlDEs.includes(de.dataElement))
                acu[de.dataElement] = de.value;
            return acu;
        }, {});

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
        let globalScore = event.dataValues.find(
            (dv) => dv.dataElement === H1_OVERALL_SCORE
        )?.value;

        hnqisTEI.attributes = [
            {
                attribute: GLOBAL_SCORE_ATTRIBUTE,
                value: Number(globalScore)>0.01?globalScore:'0', //! Forced Error
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
                        nonCriticalNum += num * parseFloat(deValue || "0");
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
                criticalDen > 0 ? (criticalNum / criticalDen) * 100 + "" : "",
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

        return new Promise((resolve) => {
            resolve(hnqisTEI);
        });
    };

    useEffect(() => {
        if (programData && !dsLoading) {
            let metadata = JSON.parse(
                programConfig.attributeValues.find(
                    (av) => av.attribute.id === METADATA
                )?.value || "{}"
            );
            getH2Program({
                program: metadata.upgradedProgram,
            }).then(async (data) => {
                if (
                    data?.results?.programs &&
                    data?.results?.programs.length > 0
                ) {
                    if (!dsData?.results) {
                        const newDataStore = await dsCreateRequest.mutate({
                            data: {},
                        });
                    }
                    setH2Program(data?.results?.programs[0]);
                }
            });
        }
    }, [programData, dsLoading]);

    useEffect(() => {
        if (h2Program) {
            let convertEvents = DeepCopy(programData.results)?.events?.filter(
                (event) =>
                    /*!event.notes?.find(
                        // TODO: REMEMBER TO UNCOMMENT THE ! SIGN
                        (note) => note.value === "<H2Transferred>"
                    )*/
                    !dsData?.results[event.event]
            );
        
            const result = convertEvents.reduce((res, event) => {
                res[h2Program.organisationUnits.map(ou=>ou.id).includes(event.orgUnit) ? 'valid' : 'invalid'].push(event);
                return res;
            }, { valid: [], invalid: [] })

            setRequestsData(result.valid);
            setFailedData(result.invalid);
            setLoading(false);
        }
    }, [h2Program]);

    const hideForm = () => {
        setTransferH2Program(undefined);
    };

    const submission = async () => {
        cancelTransfer.current = false;

        let metadataH2 = JSON.parse(
            h2Program.attributeValues.find((av) => av.attribute.id === METADATA)
                ?.value || "{}"
        );

        let assessmentStageId = "";
        let actionPlanStageId = "";
        let assessmentStageDataElements = [];

        let mapDataElements = await h2Program.programStages.reduce(
            (programDataElements, stage) => {
                if (stage.name.toLowerCase().includes("assessment")) {
                    assessmentStageId = stage.id;
                    assessmentStageDataElements =
                        stage.programStageDataElements;
                } else {
                    actionPlanStageId = stage.id;
                }
                let stageDataElements = stage.programStageDataElements.reduce(
                    (acu, de) => {
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
                    },
                    {}
                );
                return { ...programDataElements, ...stageDataElements };
            },
            {}
        );

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

        let obj = dsData?.results || {};
        setProgressValue(0);
        setConversionError(undefined);
        setStatusModal(true);
        setLoadingConversion(true);
        if (requestsData) {
            let failedEvents = [];
            for (const [index, eventReq] of requestsData.entries()) {
                if (cancelTransfer.current) break;

                const eventFetch = await getEvent({
                    program: programConfig.id,
                    eventId: eventReq.event,
                });

                let event = eventFetch.results?.events[0];

                if (event) {
                    let hnqisTEI = await buildHnqisTEI(
                        event,
                        metadataH2,
                        mapDataElements,
                        competencyMap,
                        actionPlanControlDEs,
                        assessmentStageId,
                        actionPlanStageId,
                        assessmentStageDataElements
                    );

                    const storedData = await metadataRequest.mutate({
                        data: { trackedEntityInstances: [hnqisTEI] },
                    });

                    if (storedData.httpStatus === "OK") {
                        let trackedEntityInstance =
                            storedData.response.importSummaries[0];
                        let enrollment =
                            trackedEntityInstance?.enrollments
                                ?.importSummaries[0];

                        obj[eventReq.event] = {
                            transferDate: new Date().toLocaleString(
                                "en-US",
                                DATE_FORMAT_OPTIONS
                            ),
                            trackedEntityInstance:
                                trackedEntityInstance?.reference,
                            enrollment: enrollment?.reference,
                            originEvent: eventReq.event,
                        };
                        const transferredEvent = await dsUpdateRequest.mutate({
                            data: obj,
                        });
                        setProgressValue(index + 1);
                    } else {
                        failedEvents.push({
                            id: eventReq.event,
                            msg: "Failed to convert Assessment to HNQIS 2.0.",
                        });
                        setProgressValue(index + 1);
                    }
                } else {
                    failedEvents.push({
                        id: eventReq.event,
                        msg: "Event not found in server.",
                    });
                    setProgressValue(index + 1);
                }
            }

            if (failedEvents.length > 0) {
                setConversionError(failedEvents.join("<br/>"));
            } else {
                doSearch(programConfig.name);
                if (!cancelTransfer.current) {
                    setNotification({
                        message:
                            "HNQIS 1.X Program Data transferred to HNQIS 2.0",
                        severity: "success",
                    });
                } else {
                    setNotification({
                        message: "Data transfer interrupted by user",
                        severity: "warning",
                    });
                }
                setTransferH2Program(undefined);
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
                    {failedData?.length > 0 &&
                        <div style={{ marginTop: '2em' }}>
                            <NoticeBox error={true} title="The target Program lacks some Organisation Units from the transfer data">
                                <p>A total of <strong>{failedData.length} Assessment{failedData?.length > 1 ? 's were' : ' was'} ignored</strong> because the Program <strong>{h2Program.name}</strong> has not been assigned to the following Organisation Units: {failedData.map(ev => ev.orgUnit).filter((item, i, ar) => ar.indexOf(item) === i).join(', ')}.</p>
                            </NoticeBox>
                        </div>
                    }
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
                            disabled={!programData?.results || requestsData?.length == 0}
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
                                justifyContent: "center",
                                flexDirection: "column",
                            }}
                        >
                            <Typography
                                variant="caption"
                                component="div"
                                color="inherit"
                            >
                                {`Transferring Assessment ${progressValue} of ${requestsData.length}`}
                            </Typography>
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Box sx={{ display: "flex" }}>
                                    <CircularProgress size={20} />
                                </Box>
                                <Box sx={{ width: "85%" }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            (progressValue /
                                                requestsData.length) *
                                            100
                                        }
                                    />
                                </Box>
                                <Typography
                                    variant="caption"
                                    component="div"
                                    color="text.secondary"
                                >
                                    {`${Math.round(
                                        (progressValue / requestsData.length) *
                                            100
                                    )}%`}
                                </Typography>
                            </div>
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
                    {loadingConversion && (
                        <Button
                            onClick={() => (cancelTransfer.current = true)}
                            color="error"
                            variant="contained"
                            startIcon={<PanToolIcon />}
                            disabled={cancelTransfer.current}
                        >
                            Stop
                        </Button>
                    )}
                </DialogActions>
            </CustomMUIDialog>
        </>
    );
};

export default H2Transfer;
