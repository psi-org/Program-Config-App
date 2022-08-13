import { useDataQuery } from "@dhis2/app-runtime";

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
import { FormControl, FormControlLabel, Switch } from "@mui/material";
import SelectOptions from "../UIElements/SelectOptions";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import AlertDialogSlide from "../UIElements/AlertDialogSlide";

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
} from "../../configs/Constants";
import { DeepCopy } from "../../configs/Utils";

const queryProgramMetadata = {
    results: {
        resource: "programs",
        params: ({ program }) => ({
            //Special care in Organisation Units and Sharing Settings
            fields: [
                "id","name","shortName","ignoreOverdueEvents","skipOffline","onlyEnrollOnce","sharing","maxTeiCountToReturn","selectIncidentDatesInFuture","selectEnrollmentDatesInFuture","registration","favorite","useFirstStageDuringRegistration","completeEventsExpiryDays","withoutRegistration","featureType","minAttributesRequiredToSearch","displayFrontPageList","programType","accessLevel","expiryDays","categoryCombo","programIndicators","translations","attributeValues","userRoles","favorites","programRuleVariables","programTrackedEntityAttributes","notificationTemplates","organisationUnits","programSections","programStages[programStageDataElements[dataElement[*,attributeValues[value,attribute[id,name]]],compulsory,displayInReports,sortOrder],programStageSections[name,dataElements[id]]]",
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

const H2Convert = ({ program, setConversionH2ProgramId, setNotification }) => {
    const [dialogStatus, setDialogStatus] = useState(false);
    const [errorHA, setErrorHA] = useState();
    const [loading, setLoading] = useState(true);

    const { data: programData } = useDataQuery(queryProgramMetadata, {
        variables: { program },
    });
    const { data: haQuery } = useDataQuery(queryHealthAreas);

    const [useCompetency, setUseCompetency] = useState(false);
    const [healthArea, setHealthArea] = useState("");
    const [healthAreaOptions, setHealthAreaOptions] = useState(undefined);

    const [sectionsData, setSectionsData] = useState(undefined);
    const [scoresData, setScoresData] = useState(undefined);

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
            let program = programData?.results?.programs[0];

            let h1Tabs = program.programStages[0].programStageSections;
            let h1StageDataElements =
                program.programStages[0].programStageDataElements;

            let newDataElementsList = [];
            h1Tabs.forEach(
                (tab) =>
                (newDataElementsList = newDataElementsList.concat(
                    tab.dataElements.map((de) => {
                        let programStageDataElement = h1StageDataElements.find(
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
                        return {
                            tabName: tab.name,
                            programStageDataElement,
                            metadata,
                        };
                    })
                ))
            );

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
                        )
                    }))
                    .filter(
                        (score) =>
                            score.dataElement.attributeValues.find(
                                (att) => att.attribute.id === QUESTION_TYPE_ATTRIBUTE
                            )?.value === "2" &&
                            score.dataElement.attributeValues.find(
                                (att) => att.attribute.id === COMPOSITIVE_SCORE_ATTRIBUTE
                            )?.value !== "0"
                    )
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

    const convertProgram = () => {
        console.log({sectionsData,scoresData});
        const sections = DeepCopy(sectionsData)

        let compositiveScoreOrder = ''
        let questionFeedbackOrder = 1

        const newSections = sections.map(
            (section,sectionIndex) => {
                
                section.dataElements = section.dataElements.sort( 
                    (a,b) => parseInt(a.metadata[QUESTION_ORDER_ATTRIBUTE]) - parseInt(b.metadata[QUESTION_ORDER_ATTRIBUTE])
                ).map(
                    (de,deIndex) => {
                        let dataElement = de.programStageDataElement.dataElement

                        // FEEDBACK ORDER
                        if(de.metadata[COMPOSITIVE_SCORE_ATTRIBUTE]){

                            if(de.metadata[COMPOSITIVE_SCORE_ATTRIBUTE]!==compositiveScoreOrder){
                                compositiveScoreOrder = de.metadata[COMPOSITIVE_SCORE_ATTRIBUTE]
                                questionFeedbackOrder = 1
                            }

                            let feedbackOrder = `${compositiveScoreOrder}.${questionFeedbackOrder++}` 
                            let foIndex = dataElement.attributeValues.findIndex(att => att.attribute.id === FEEDBACK_ORDER)
                            if(foIndex > -1){
                                // Update FeedbackOrder
                            }else{
                                dataElement.attributeValues.push({
                                    attribute : {id:FEEDBACK_ORDER},
                                    value:feedbackOrder
                                })
                            }
                        }
                        
                        
                        const pcaMetadata = {
                            elemType : 'question',
                            isCompulsory: de.programStageDataElement.compulsory ? 'Yes':'No',
                            isCritical: de.programStageDataElement.compulsory ? 'Yes':'No',
                            varName: `_S${sectionIndex+1}Q${deIndex+1}`,
                            scoreNum:de.metadata[SCORE_NUM_ATTRIBUTE],
                            scoreDen:de.metadata[SCORE_DEN_ATTRIBUTE]
                        }

                        // Element Type is Label
                        if(de.metadata[QUESTION_TYPE_ATTRIBUTE] === '7'){
                            pcaMetadata.elemType = 'label'
                            pcaMetadata.labelFormName = dataElement.formName
                            dataElement.formName = '   '
                        }

                        let pcaMetadataIndex = dataElement.attributeValues.findIndex(att => att.attribute.id === METADATA)
                        if(pcaMetadataIndex > -1){
                            // Update PCA Metadata
                        }else{
                            dataElement.attributeValues.push({
                                attribute : {id:METADATA},
                                value:JSON.stringify(pcaMetadata)
                            })
                        }

                        return dataElement
                    }
                )
                return section
            }
        )
        console.log({newSections})
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
                            <span style={{ fontSize: "1.1em", marginTop: "0.5em" }}>
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
                            <p style={{ fontSize: "1.2em", marginBottom: "0.5em" }}>
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
                                    <Accordion style={{ margin: "0.5em 0" }} key={i}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ color: "#FFF" }} />}
                                            style={{ backgroundColor: "#2c6693", color: "#FFF" }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: 'center',
                                                    width: "100%"
                                                }}
                                            >
                                                <span>{section.name}</span>
                                                <span style={{ fontSize: "0.85em" }}>
                                                    <em>{`${section.dataElements.length} Data Element${section.dataElements.length != 1 ? "s" : ""
                                                        }`}</em>
                                                </span>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{backgroundColor:'#f1f1f1'}}>
                                            {section.dataElements.map((de, key) => (
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        margin: "0.5em 0",
                                                        padding: "0.5em",
                                                        alignItems: "center",
                                                    }}
                                                    key={key}
                                                >
                                                    {de.programStageDataElement.dataElement.attributeValues.find(
                                                        (att) =>
                                                            att.attribute.id === QUESTION_TYPE_ATTRIBUTE
                                                    )?.value === "7" ? (
                                                        <LabelIcon sx={{ marginRight: "0.5em" }} />
                                                    ) : (
                                                        <QuizIcon sx={{ marginRight: "0.5em" }} />
                                                    )}
                                                    <div>{de.programStageDataElement.dataElement.formName} {de.programStageDataElement.compulsory && <span style={{color:'red'}}> *</span>}</div>
                                                    {/* {de.programStageDataElement.dataElement.attributeValues.find((att) => att.attribute.id === COMPOSITIVE_SCORE_ATTRIBUTE)?.value}  */}
                                                </div>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                                {scoresData && (
                                    <Accordion style={{ margin: "0.5em 0" }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ color: "#FFF" }} />}
                                            sx={{ backgroundColor: "#03a9f4", color: "#FFF" }}
                                        >
                                            Scores
                                        </AccordionSummary>
                                        <AccordionDetails sx={{backgroundColor:'#f1f1f1'}}>
                                            {scoresData.map((score, key) => {
                                                let compositiveScore = score.dataElement.attributeValues.find(
                                                    (att) =>
                                                        att.attribute.id === COMPOSITIVE_SCORE_ATTRIBUTE
                                                ).value;
                                                let levels = compositiveScore.split(".").length;

                                                return (
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            display: "flex",
                                                            margin: `0.5em 0 0.5em ${(levels - 1) * 2}em`,
                                                            padding: "0.5em",
                                                            alignItems: "center",
                                                        }}
                                                        key={key}
                                                    >
                                                        <PercentIcon
                                                            sx={{ marginRight: "0.5em" }}
                                                            fontSize="small"
                                                        />
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "1fr 14fr",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontWeight: "500",
                                                                    paddingRight: "1em",
                                                                    textAlign: "center",
                                                                }}
                                                            >{`${compositiveScore}`}</span>
                                                            <span>{score.dataElement.formName}</span>
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
                        {" "}
                        Cancel{" "}
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
                            {" "}
                            Convert to HNQIS 2.0{" "}
                        </Button>
                    )}
                </DialogActions>
            </CustomMUIDialog>
            <AlertDialogSlide
                open={dialogStatus}
                title={"Are you sure you want to convert this program to HNQIS 2.0?"}
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
        </>
    );
};

export default H2Convert;
