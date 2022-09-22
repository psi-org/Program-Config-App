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

import { parseErrorsUL } from "../../configs/Utils";

import {
    QUESTION_TYPE_ATTRIBUTE,
    DE_TYPE_ATTRIBUTE,
    HEADER_ATTRIBUTE,
    QUESTION_PARENT_ATTRIBUTE,
    QUESTION_PARENT_OPTIONS_ATTRIBUTE,
    COMPOSITIVE_SCORE_ATTRIBUTE,
    SCORE_NUM_ATTRIBUTE,
    SCORE_DEN_ATTRIBUTE,
    QUESTION_ORDER_ATTRIBUTE,
    METADATA,
    FEEDBACK_ORDER,
    BUILD_VERSION,
    COMPETENCY_ATTRIBUTE,
    COMPETENCY_CLASS,
    FEEDBACK_TEXT,
} from "../../configs/Constants";
import {
    Program,
    HnqisProgramConfigs,
    PS_AssessmentStage,
    PS_ActionPlanStage,
    PSS_Default,
    PSS_CriticalSteps,
    PSS_Scores,
} from "./../../configs/ProgramTemplate";
import { DeepCopy } from "../../configs/Utils";

const queryProgramMetadata = {
    results: {
        resource: "programs",
        params: ({ program }) => ({
            //Special care in Organisation Units and Sharing Settings
            fields: [
                "id",
                "name",
                "shortName",
                "style",
                "ignoreOverdueEvents",
                "skipOffline",
                "onlyEnrollOnce",
                "sharing",
                "maxTeiCountToReturn",
                "selectIncidentDatesInFuture",
                "selectEnrollmentDatesInFuture",
                "registration",
                "favorite",
                "useFirstStageDuringRegistration",
                "completeEventsExpiryDays",
                "withoutRegistration",
                "featureType",
                "minAttributesRequiredToSearch",
                "displayFrontPageList",
                "programType",
                "accessLevel",
                "expiryDays",
                "categoryCombo",
                "programIndicators",
                "translations",
                "attributeValues",
                "userRoles",
                "favorites",
                "programRuleVariables",
                "programTrackedEntityAttributes",
                "notificationTemplates",
                "organisationUnits",
                "programSections",
                "programStages[id,programStageDataElements[dataElement[*,attributeValues[value,attribute[id,name]]],compulsory,displayInReports,sortOrder],programStageSections[name,dataElements[id]]]",
            ],
            filter: [`id:eq:${program}`],
        }),
    },
};

const queryHealthAreas = {
    results: {
        resource: "optionSets",
        params: {
            fields: ["options[code,name]"],
            filter: ["id:eq:y752HEwvCGi"],
        },
    },
};

const queryProgramType = {
    results: {
        resource: "attributes",
        params: {
            fields: ["id"],
            filter: ["code:eq:PROGRAM_TYPE"],
        },
    },
};

const queryId = {
    results: {
        resource: "system/id.json",
        params: ({ n }) => ({ limit: n }),
    },
};

const queryOptions = {
    results: {
        resource: "options",
        params: ({ optionsList }) => ({
            fields: ["id", "code"],
            paging: false,
            filter: [`id:in:[${optionsList.join(",")}]`],
        }),
    },
};

const metadataMutation = {
    resource: "metadata?mergeMode=REPLACE",
    type: "create",
    data: ({ data }) => data,
};

const H2Convert = ({
    program,
    setConversionH2ProgramId,
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

    const [dialogStatus, setDialogStatus] = useState(false);
    const [errorHA, setErrorHA] = useState();
    const [loading, setLoading] = useState(true);
    const [loadingConversion, setLoadingConversion] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [conversionError, setConversionError] = useState(undefined);

    const { data: programData } = useDataQuery(queryProgramMetadata, {
        variables: { program },
    });
    const { data: haQuery } = useDataQuery(queryHealthAreas);

    const [useCompetency, setUseCompetency] = useState(false);
    const [healthArea, setHealthArea] = useState("");
    const [healthAreaOptions, setHealthAreaOptions] = useState(undefined);

    const [sectionsData, setSectionsData] = useState(undefined);
    const [scoresData, setScoresData] = useState(undefined);
    const [currentChecklistOptions, setCurrentChecklistOptions] =
        useState(undefined);

    const { data: idQueryRes, refetch: getIDs } = useDataQuery(queryId, {
        lazy: true,
        variables: { n: undefined },
    });
    const { data: idProgramType, refetch: getProgramTypeAttribute } =
        useDataQuery(queryProgramType, { lazy: true });
    const { data: checklistOptions, refetch: getChecklistOptions } =
        useDataQuery(queryOptions, {
            lazy: true,
            variables: { optionsList: undefined },
        });

    useEffect(() => {
        if (programData && haQuery) {
            setHealthAreaOptions(
                haQuery?.results?.optionSets[0].options.map((op) => {
                    return { label: op.name, value: op.code };
                })
            );
        }
    }, [programData, haQuery]);

    useEffect(() => {
        if (healthAreaOptions) setLoading(false);
    }, [healthAreaOptions]);

    useEffect(() => {
        if (programData) {
            let optionsList = [];
            let program = programData?.results?.programs[0];

            let h1Tabs = program.programStages[0].programStageSections;
            let h1StageDataElements =
                program.programStages[0].programStageDataElements;

            let newDataElementsList = [];
            h1Tabs.forEach(
                (tab) =>
                    (newDataElementsList = newDataElementsList.concat(
                        tab.dataElements.map((de) => {
                            let programStageDataElement =
                                h1StageDataElements.find(
                                    (psde) => psde.dataElement.id === de.id
                                );
                            let metadata =
                                programStageDataElement.dataElement.attributeValues.reduce(
                                    (meta, att) => {
                                        meta[att.attribute.id] = att.value;
                                        return meta;
                                    },
                                    {}
                                );
                            if (
                                metadata[QUESTION_PARENT_OPTIONS_ATTRIBUTE] &&
                                !optionsList.includes(
                                    metadata[QUESTION_PARENT_OPTIONS_ATTRIBUTE]
                                )
                            )
                                optionsList.push(
                                    metadata[
                                        QUESTION_PARENT_OPTIONS_ATTRIBUTE
                                    ].split(",")[0]
                                );

                            return {
                                tabName: tab.name,
                                programStageDataElement,
                                metadata,
                            };
                        })
                    ))
            );

            setCurrentChecklistOptions(optionsList);

            // Build NEW sections
            setSectionsData(
                newDataElementsList.reduce((acu, cur) => {
                    let header =
                        cur.programStageDataElement.dataElement.attributeValues.find(
                            (att) => att.attribute.id === HEADER_ATTRIBUTE
                        )?.value;
                    let sectionName = `${cur.tabName} - ${header}`;
                    let sectionIdx = acu.findIndex(
                        (section) => section.name === sectionName
                    );
                    if (sectionIdx === -1)
                        acu.push({ name: sectionName, dataElements: [cur] });
                    else acu[sectionIdx].dataElements.push(cur);
                    return acu;
                }, [])
            );

            // Build NEW Scores
            setScoresData(
                program.programStages
                    .at(0)
                    .programStageDataElements.map((psde) => ({
                        dataElement: psde.dataElement,
                        metadata: psde.dataElement.attributeValues.reduce(
                            (meta, att) => {
                                meta[att.attribute.id] = att.value;
                                return meta;
                            },
                            {}
                        ),
                    }))
                    .filter(
                        (score) =>
                            score.dataElement.attributeValues.find(
                                (att) =>
                                    att.attribute.id === QUESTION_TYPE_ATTRIBUTE
                            )?.value === "2" &&
                            score.dataElement.attributeValues.find(
                                (att) =>
                                    att.attribute.id ===
                                    COMPOSITIVE_SCORE_ATTRIBUTE
                            )?.value !== "0"
                    )
                    .sort((a, b) => {
                        let aStruct = a.dataElement.attributeValues
                            .find(
                                (att) =>
                                    att.attribute.id ===
                                    COMPOSITIVE_SCORE_ATTRIBUTE
                            )
                            .value.split(".");
                        let bStruct = b.dataElement.attributeValues
                            .find(
                                (att) =>
                                    att.attribute.id ===
                                    COMPOSITIVE_SCORE_ATTRIBUTE
                            )
                            .value.split(".");

                        while (true) {
                            let x = aStruct.shift(),
                                y = bStruct.shift();

                            if (!x && !y) break;
                            if (!x && y) return -1;
                            if (x && !y) return 1;

                            if (parseInt(x) > parseInt(y)) return 1;
                            if (parseInt(x) < parseInt(y)) return -1;
                        }

                        return 0;
                    })
            );
        }
    }, [programData]);

    const handleChangeComp = (event) => {
        setUseCompetency(event.target.checked);
    };

    const healthAreaChange = (event) => {
        setErrorHA(undefined);
        setHealthArea(event.target.value);
    };

    const hideForm = () => {
        setConversionH2ProgramId(undefined);
    };

    const submission = () => {
        if (healthArea === "") {
            setErrorHA("This field is required");
        } else {
            setDialogStatus(true);
        }
    };

    const convertProgram = async () => {
        setLoadingConversion(true);
        setStatusModal(true);
        const sections = DeepCopy(sectionsData);
        const scores = DeepCopy(scoresData);

        let compositiveScoreOrder = "";
        let questionFeedbackOrder = 1;
        let labelsQtty = 0;
        let psdeSortOrder = 1;
        let originalLabelIDs = [];

        const optionsResult = await getChecklistOptions({
            optionsList: currentChecklistOptions,
        });
        let optionsMap = optionsResult?.results?.options;

        const program_dataElements = [];
        const program_programStageDataElements = [];

        let newSections = sections.map((section, sectionIndex) => {
            section.dataElements = section.dataElements
                .sort(
                    (a, b) =>
                        parseInt(a.metadata[QUESTION_ORDER_ATTRIBUTE]) -
                        parseInt(b.metadata[QUESTION_ORDER_ATTRIBUTE])
                )
                .filter(
                    (de) =>
                        de.programStageDataElement.dataElement.formName
                            .toLowerCase()
                            .replaceAll(" ", "") !== "endoftab"
                )
                .map((de, deIndex) => {
                    // SAVE PROGRAM STAGE DATA ELEMENT
                    let psde = DeepCopy(de.programStageDataElement);
                    psde.sortOrder = psdeSortOrder;
                    psde.dataElement = {
                        id: de.programStageDataElement.dataElement.id,
                    };
                    program_programStageDataElements.push(psde);
                    psdeSortOrder += 1;

                    let dataElement = de.programStageDataElement.dataElement;

                    if (
                        [
                            "NUMBER",
                            "INTEGER",
                            "INTEGER_POSITIVE",
                            "INTEGER_ZERO_OR_POSITIVE",
                        ].includes(dataElement.valueType)
                    ) {
                        dataElement.aggregationType = "SUM";
                    }

                    if (de.metadata[COMPOSITIVE_SCORE_ATTRIBUTE]) {
                        // FEEDBACK ORDER
                        if (
                            de.metadata[COMPOSITIVE_SCORE_ATTRIBUTE] !==
                            compositiveScoreOrder
                        ) {
                            compositiveScoreOrder =
                                de.metadata[COMPOSITIVE_SCORE_ATTRIBUTE];
                            questionFeedbackOrder = 1;
                        }

                        let feedbackOrder = `${compositiveScoreOrder}.${questionFeedbackOrder++}`;
                        let foIndex = dataElement.attributeValues.findIndex(
                            (att) => att.attribute.id === FEEDBACK_ORDER
                        );
                        let feedbackOrderAttribute = {
                            attribute: { id: FEEDBACK_ORDER },
                            value: feedbackOrder,
                        };

                        if (foIndex > -1) {
                            // Update FeedbackOrder
                            dataElement.attributeValues[foIndex] =
                                feedbackOrderAttribute;
                        } else {
                            dataElement.attributeValues.push(
                                feedbackOrderAttribute
                            );
                        }
                    }

                    if (dataElement.description) {
                        let ftIndex = dataElement.attributeValues.findIndex(
                            (att) => att.attribute.id === FEEDBACK_TEXT
                        );
                        let feedbackTextAttribute = {
                            attribute: { id: FEEDBACK_TEXT },
                            value: dataElement.description,
                        };

                        if (ftIndex > -1) {
                            // Update FeedbackText
                            dataElement.attributeValues[ftIndex] =
                                feedbackTextAttribute;
                        } else {
                            dataElement.attributeValues.push(
                                feedbackTextAttribute
                            );
                        }

                        dataElement.description = undefined;
                        dataElement.displayDescription = undefined;
                    }

                    let parentValue = optionsMap.find(
                        (option) =>
                            option.id ===
                            de.metadata[
                                QUESTION_PARENT_OPTIONS_ATTRIBUTE
                            ]?.split(",")[0]
                    )?.code;
                    const pcaMetadata = {
                        elemType: "question",
                        isCompulsory: de.programStageDataElement.compulsory
                            ? "Yes"
                            : "No",
                        isCritical: de.programStageDataElement.compulsory
                            ? "Yes"
                            : "No",
                        varName: `_S${sectionIndex + 1}Q${deIndex + 1}`,
                        parentQuestion: de.metadata[QUESTION_PARENT_ATTRIBUTE],
                        parentValue: parseFloat(parentValue) || parentValue,
                        scoreNum:
                            parseFloat(de.metadata[SCORE_NUM_ATTRIBUTE]) ||
                            undefined,
                        scoreDen:
                            parseFloat(de.metadata[SCORE_DEN_ATTRIBUTE]) ||
                            undefined,
                    };

                    // Element Type is Label
                    if (de.metadata[QUESTION_TYPE_ATTRIBUTE] === "7") {
                        pcaMetadata.elemType = "label";
                        pcaMetadata.labelFormName = dataElement.formName + "";
                        dataElement.name =
                            dataElement.name.slice(0, 225) + " [H2]";
                        dataElement.shortName =
                            dataElement.shortName.slice(0, 45) + " [H2]";
                        dataElement.code =
                            dataElement.code.slice(0, 45) + " [H2]";
                        dataElement.formName = "   ";
                        originalLabelIDs.push(dataElement.id);
                        dataElement.valueType = "LONG_TEXT"
                        dataElement.aggregationType = "NONE";
                        labelsQtty += 1;
                    }

                    let pcaMetadataIndex =
                        dataElement.attributeValues.findIndex(
                            (att) => att.attribute.id === METADATA
                        );

                    if (pcaMetadataIndex > -1) {
                        // Update PCA Metadata
                        dataElement.attributeValues[pcaMetadataIndex] = {
                            attribute: { id: METADATA },
                            value: JSON.stringify(pcaMetadata),
                        };
                    } else {
                        dataElement.attributeValues.push({
                            attribute: { id: METADATA },
                            value: JSON.stringify(pcaMetadata),
                        });
                    }

                    program_dataElements.push(dataElement);
                    return { id: dataElement.id };
                });

            section.sortOrder = (sectionIndex + 1) * 10;
            section.programStage = { id: "STAGE ID" };

            return section;
        });

        let newScores = scores
            .map((score, scoreIndex) => {
                let de = DeepCopy(score.dataElement);
                de.aggregationType = "AVERAGE";

                // FEEDBACK ORDER
                let foIndex = de.attributeValues.findIndex(
                    (att) => att.attribute.id === FEEDBACK_ORDER
                );

                if (foIndex > -1) {
                    // Update FeedbackOrder
                    de.attributeValues[foIndex] = {
                        attribute: { id: FEEDBACK_ORDER },
                        value: score.metadata[COMPOSITIVE_SCORE_ATTRIBUTE],
                    };
                } else {
                    de.attributeValues.push({
                        attribute: { id: FEEDBACK_ORDER },
                        value: score.metadata[COMPOSITIVE_SCORE_ATTRIBUTE],
                    });
                }

                // PCA METADATA

                let pcaMetadata = {
                    isCompulsory: "No",
                    isCritical: "No",
                    elemType: "score",
                };
                let pcaMetadataIndex = de.attributeValues.findIndex(
                    (att) => att.attribute.id === METADATA
                );

                if (pcaMetadataIndex > -1) {
                    // Update PCA Metadata
                    de.attributeValues[pcaMetadataIndex] = {
                        attribute: { id: METADATA },
                        value: JSON.stringify(pcaMetadata),
                    };
                } else {
                    de.attributeValues.push({
                        attribute: { id: METADATA },
                        value: JSON.stringify(pcaMetadata),
                    });
                }

                program_programStageDataElements.push({
                    displayInReports: false,
                    compulsory: false,
                    sortOrder: psdeSortOrder,
                    dataElement: { id: de.id },
                    programStage: { id: "X" },
                });

                psdeSortOrder += 1;

                program_dataElements.push(de);

                return { id: score.dataElement.id };
            });

        const newIds = await getIDs({ n: 5 + labelsQtty + newSections.length });
        let uidPool = newIds?.results?.codes;

        const programTypeData = await getProgramTypeAttribute();
        let prgTypeId = programTypeData?.results?.attributes[0]?.id;

        if (uidPool && prgTypeId) {
            //Program Setup
            let programOld = programData?.results?.programs[0];

            let programId = uidPool.shift();
            let assessmentId = uidPool.shift();
            let actionPlanId = uidPool.shift();
            let stepsSectionId = uidPool.shift();
            let scoresSectionId = uidPool.shift();

            let prgrm = DeepCopy(Program);
            Object.assign(prgrm, HnqisProgramConfigs);

            let assessmentStage = undefined;
            let actionPlanStage = undefined;

            let criticalSteps = undefined;
            let scores = undefined;

            let programStages = undefined;
            let programStageSections = undefined;
            prgrm.attributeValues = [];

            prgrm.attributeValues.push({
                value: "HNQIS2",
                attribute: { id: prgTypeId },
            });

            let pcaMetadataVal = {};
            pcaMetadataVal.buildVersion = BUILD_VERSION;
            pcaMetadataVal.h1Program = programOld.id;
            pcaMetadataVal.useCompetencyClass = useCompetency ? "Yes" : "No";
            pcaMetadataVal.healthArea = healthArea;
            pcaMetadataVal.dePrefix = programOld.shortName.slice(0, 22) + " H2";
            prgrm.attributeValues.push({
                value: JSON.stringify(pcaMetadataVal),
                attribute: { id: METADATA },
            });

            prgrm.id = programId;
            prgrm.name = "[HNQIS2] " + programOld.name.slice(0, 221);
            prgrm.shortName = "[HNQIS2] " + programOld.shortName.slice(0, 41);
            prgrm.style = programOld.style;
            prgrm.programStages.push({ id: assessmentId });
            prgrm.programStages.push({ id: actionPlanId });
            prgrm.organisationUnits = programOld.organisationUnits;
            prgrm.sharing = programOld.sharing;

            assessmentStage = DeepCopy(PS_AssessmentStage);
            assessmentStage.id = assessmentId;
            assessmentStage.name = "Assessment [" + programId + "]"; //! Not adding the ID may result in an error

            //Assign Sections
            newSections = newSections.map((section) => {
                section.programStage.id = assessmentId;
                section.id = uidPool.shift();
                assessmentStage.programStageSections.push({ id: section.id });
                return section;
            });

            assessmentStage.programStageSections.push({ id: stepsSectionId });
            assessmentStage.programStageSections.push({ id: scoresSectionId });
            assessmentStage.program.id = programId;

            actionPlanStage = DeepCopy(PS_ActionPlanStage);
            actionPlanStage.name = "Action Plan [" + programId + "]"; //! Not adding the ID may result in an error
            actionPlanStage.id = actionPlanId;
            actionPlanStage.program.id = programId;

            criticalSteps = DeepCopy(PSS_CriticalSteps);
            criticalSteps.id = stepsSectionId;
            criticalSteps.programStage.id = assessmentId;
            criticalSteps.sortOrder = (newSections.length + 1) * 10;

            scores = DeepCopy(PSS_Scores);
            scores.id = scoresSectionId;
            scores.programStage.id = assessmentId;
            scores.sortOrder = criticalSteps.sortOrder + 10;
            scores.dataElements = newScores;

            if (!useCompetency) {
                const indexA = prgrm.programTrackedEntityAttributes.findIndex(
                    (attr) => {
                        return (
                            attr.trackedEntityAttribute.id ===
                            COMPETENCY_ATTRIBUTE
                        );
                    }
                );
                prgrm.programTrackedEntityAttributes.splice(indexA, 1);

                prgrm.programStages = prgrm.programStages.map((ps) => ({
                    id: ps.id,
                }));

                const indexB = criticalSteps.dataElements.findIndex((de) => {
                    return de.id === COMPETENCY_CLASS;
                });
                criticalSteps.dataElements.splice(indexB, 1);
            }

            assessmentStage.programStageDataElements =
                program_programStageDataElements.map((psde) => {
                    psde.programStage = { id: assessmentId };
                    return psde;
                });

            programStages = [assessmentStage, actionPlanStage];
            programStageSections = newSections.concat(criticalSteps, scores);

            let h1PCAMetadata = {
                attribute: { id: METADATA },
                value: JSON.stringify({
                    h2Reworked: "Yes",
                    upgradedProgram: prgrm.id,
                }),
            };

            let metadataIdx = programOld.attributeValues.findIndex(
                (att) => att.attribute.id === METADATA
            );
            if (metadataIdx > -1) {
                programOld.attributeValues[metadataIdx] = h1PCAMetadata;
            } else {
                programOld.attributeValues.push(h1PCAMetadata);
            }

            programOld.programStages.forEach((ps) => {
                delete ps.programStageDataElements;
                delete ps.programStageSections;
            });

            // Creating New Data Elements for labels (Patching IDs)
            let labelIDMapping = {};
            originalLabelIDs.forEach(
                (id) => (labelIDMapping[id] = uidPool.shift())
            );

            programStages.forEach((ps) => {
                ps.programStageDataElements.forEach(
                    (psde) =>
                        (psde.dataElement.id =
                            labelIDMapping[psde.dataElement.id] ||
                            psde.dataElement.id)
                );
            });

            programStageSections.forEach((pss) => {
                pss.dataElements.forEach(
                    (de) => (de.id = labelIDMapping[de.id] || de.id)
                );
            });

            program_dataElements.forEach((de) => {
                de.id = labelIDMapping[de.id] || de.id;
            });

            // Building results object
            let resultMeta = {
                programs: [prgrm, programOld],
                programStages,
                programStageSections,
                dataElements: program_dataElements,
            };

            /*console.log(resultMeta)

            doSearch(programOld.name)
            setNotification({
                message: 'The HNQIS 1.X Program has been converted to HNQIS 2.0 successfully, access it to apply changes and finish setting it up.',
                severity: 'success'
            });
            setConversionH2ProgramId(undefined)
            setLoadingConversion(false)*/

            metadataRequest.mutate({ data: resultMeta }).then((response) => {
                if (response.status === "OK") {
                    doSearch(programOld.name);
                    setNotification({
                        message:
                            "The HNQIS 1.X Program has been converted to HNQIS 2.0 successfully, access it to apply changes and finish setting it up.",
                        severity: "success",
                    });
                    setConversionH2ProgramId(undefined);
                } else {
                    setConversionError(parseErrorsUL(response));
                }

                setLoadingConversion(false);
            });
        } else {
            setConversionError("Error while fetching Metadata from the server");
        }
    };

    return (
        <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                <CustomMUIDialogTitle
                    id="customized-dialog-title"
                    onClose={() => hideForm()}
                >
                    Convert HNQIS 1.X Program to HNQIS 2.0
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
                                Preparing Metadata
                            </span>
                        </div>
                    )}
                    {!loading && (
                        <>
                            <p>
                                <strong>Selected Program: </strong>
                                {programData?.results?.programs[0].name}
                            </p>
                            <FormControl
                                margin="dense"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexDirection: "row",
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={useCompetency}
                                            onChange={handleChangeComp}
                                            name="competency"
                                        />
                                    }
                                    label="Use Competency Class"
                                />
                                <SelectOptions
                                    useError={errorHA !== undefined}
                                    helperText={errorHA}
                                    label={"Program Health Area (*)"}
                                    items={healthAreaOptions}
                                    handler={healthAreaChange}
                                    styles={{ width: "60%" }}
                                    value={healthArea}
                                    defaultOption="Select Health Area"
                                />
                            </FormControl>
                        </>
                    )}
                    {sectionsData && (
                        <>
                            <p
                                style={{
                                    fontSize: "1.2em",
                                    marginBottom: "0.5em",
                                }}
                            >
                                Assessment Preview
                            </p>
                            <div
                                style={{
                                    width: "100%",
                                    padding: "0 1em 0 0",
                                    overflow: "auto",
                                }}
                            >
                                {sectionsData.map((section, i) => (
                                    <Accordion
                                        style={{ margin: "0.5em 0" }}
                                        key={i}
                                    >
                                        <AccordionSummary
                                            expandIcon={
                                                <ExpandMoreIcon
                                                    sx={{ color: "#FFF" }}
                                                />
                                            }
                                            style={{
                                                backgroundColor: "#2c6693",
                                                color: "#FFF",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    width: "100%",
                                                }}
                                            >
                                                <span>{section.name}</span>
                                                <span
                                                    style={{
                                                        fontSize: "0.85em",
                                                    }}
                                                >
                                                    <em>{`${
                                                        section.dataElements
                                                            .length
                                                    } Data Element${
                                                        section.dataElements
                                                            .length != 1
                                                            ? "s"
                                                            : ""
                                                    }`}</em>
                                                </span>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails
                                            sx={{ backgroundColor: "#f1f1f1" }}
                                        >
                                            {section.dataElements.map(
                                                (de, key) => (
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            display: "flex",
                                                            margin: "0.5em 0",
                                                            padding: "0.5em",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                        key={key}
                                                    >
                                                        {de.programStageDataElement.dataElement.attributeValues.find(
                                                            (att) =>
                                                                att.attribute
                                                                    .id ===
                                                                QUESTION_TYPE_ATTRIBUTE
                                                        )?.value === "7" ? (
                                                            <LabelIcon
                                                                sx={{
                                                                    marginRight:
                                                                        "0.5em",
                                                                }}
                                                            />
                                                        ) : (
                                                            <QuizIcon
                                                                sx={{
                                                                    marginRight:
                                                                        "0.5em",
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            {
                                                                de
                                                                    .programStageDataElement
                                                                    .dataElement
                                                                    .formName
                                                            }{" "}
                                                            {de
                                                                .programStageDataElement
                                                                .compulsory && (
                                                                <span
                                                                    style={{
                                                                        color: "red",
                                                                    }}
                                                                >
                                                                    {" "}
                                                                    *
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* {de.programStageDataElement.dataElement.attributeValues.find((att) => att.attribute.id === COMPOSITIVE_SCORE_ATTRIBUTE)?.value}  */}
                                                    </div>
                                                )
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                                {scoresData && (
                                    <Accordion style={{ margin: "0.5em 0" }}>
                                        <AccordionSummary
                                            expandIcon={
                                                <ExpandMoreIcon
                                                    sx={{ color: "#FFF" }}
                                                />
                                            }
                                            sx={{
                                                backgroundColor: "#03a9f4",
                                                color: "#FFF",
                                            }}
                                        >
                                            Scores
                                        </AccordionSummary>
                                        <AccordionDetails
                                            sx={{ backgroundColor: "#f1f1f1" }}
                                        >
                                            {scoresData.map((score, key) => {
                                                let compositiveScore =
                                                    score.dataElement.attributeValues.find(
                                                        (att) =>
                                                            att.attribute.id ===
                                                            COMPOSITIVE_SCORE_ATTRIBUTE
                                                    ).value;
                                                let levels =
                                                    compositiveScore.split(
                                                        "."
                                                    ).length;

                                                return (
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            display: "flex",
                                                            margin: `0.5em 0 0.5em ${
                                                                (levels - 1) * 2
                                                            }em`,
                                                            padding: "0.5em",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                        key={key}
                                                    >
                                                        <PercentIcon
                                                            sx={{
                                                                marginRight:
                                                                    "0.5em",
                                                            }}
                                                            fontSize="small"
                                                        />
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns:
                                                                    "1fr 14fr",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontWeight:
                                                                        "500",
                                                                    paddingRight:
                                                                        "1em",
                                                                    textAlign:
                                                                        "center",
                                                                }}
                                                            >{`${compositiveScore}`}</span>
                                                            <span>
                                                                {
                                                                    score
                                                                        .dataElement
                                                                        .formName
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </div>
                        </>
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
                            Convert to HNQIS 2.0
                        </Button>
                    )}
                </DialogActions>
            </CustomMUIDialog>
            <AlertDialogSlide
                open={dialogStatus}
                title={
                    "Are you sure you want to convert this program to HNQIS 2.0?"
                }
                content={
                    "A new program will be created re-using as many Data Elements as possible and assigning the same Organisation Units and Sharing Settings as the original. The program will not be available for conversion again after the process ends."
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
                    Conversion Status
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
                        <div>
                            <p>
                                The process could not be completed, see details
                                below:
                            </p>
                            <div style={{ color: "#AA0000", padding: "0 1.2em" }}>
                                {conversionError}
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    {!loadingConversion && (
                        <Button
                            onClick={() => {setConversionError(undefined);setStatusModal(false);}}
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

export default H2Convert;
