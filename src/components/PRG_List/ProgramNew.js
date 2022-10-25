import React, { useEffect, useRef, useState } from "react";
import { Transfer } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
//import styles from './Program.module.css'
import {
    HnqisProgramConfigs,
    Program,
    PS_ActionPlanStage,
    PS_AssessmentStage,
    PSS_CriticalSteps,
    PSS_Default,
    PSS_Scores,
} from "../../configs/ProgramTemplate";

import {
    BUILD_VERSION,
    COMPETENCY_ATTRIBUTE,
    COMPETENCY_CLASS,
    CRITICAL_STEPS,
    DATASTORE_H2_METADATA,
    H2_METADATA_VERSION,
    MAX_PREFIX_LENGTH,
    MAX_PROGRAM_NAME_LENGTH,
    MAX_SHORT_NAME_LENGTH,
    METADATA,
    MIN_NAME_LENGTH,
    NAMESPACE,
    NON_CRITICAL_STEPS,
} from "../../configs/Constants";

import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CustomMUIDialog from "./../UIElements/CustomMUIDialog";
import CustomMUIDialogTitle from "./../UIElements/CustomMUIDialogTitle";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import SendIcon from "@mui/icons-material/Send";
import FormHelperText from "@mui/material/FormHelperText";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormLabel } from "@mui/material";
import StyleManager from "../UIElements/StyleManager";
import { DeepCopy, parseErrorsJoin, truncateString } from "../../configs/Utils";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import H2Setting from "./H2Setting"

//const { Form, Field } = ReactFinalForm

const queryId = {
    results: {
        resource: "system/id.json",
        params: { limit: 6 },
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

const queryTEType = {
    results: {
        resource: "trackedEntityTypes",
        params: {
            fields: ["id", "name"],
            paging: false,
        },
    },
};

const queryTEAttributes = {
    results: {
        resource: "trackedEntityAttributes",
        params: {
            fields: ["id", "name", "valueType"],
            paging: false,
        },
    },
};

const queryCatCombos = {
    results: {
        resource: "categoryCombos",
        params: {
            fields: ["id", "name"],
            filter: ["dataDimensionType:eq:ATTRIBUTE"],
            paging: false,
        },
    },
};

const queryAvailablePrefix = {
    results: {
        resource: "programs",
        params: ({ dePrefix, program }) => ({
            fields: ["id"],
            filter: [
                `attributeValues.value:like:"dePrefix":"${dePrefix}"`,
                `name:!eq:${program}`,
            ],
        }),
    },
};

const metadataMutation = {
    resource: "metadata",
    type: "create",
    data: ({ data }) => data,
};

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`,
    },
};

const ProgramNew = (props) => {
    const h2Ready = localStorage.getItem("h2Ready") === "true";
    const { data: hnqis2Metadata } = useDataQuery(queryHNQIS2Metadata);

    // Create Mutation
    let metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, ' | '),
                severity: "error",
            });
            props.setShowProgramForm(false);
        }
    });
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called,
    };

    const prgTypeQuery = useDataQuery(queryProgramType);
    const prgTypeId = prgTypeQuery.data?.results.attributes[0].id;


    const idsQuery = useDataQuery(queryId);
    const uidPool = idsQuery.data?.results.codes;

    const teTypeQuery = useDataQuery(queryTEType);
    const trackedEntityTypes = teTypeQuery.data?.results.trackedEntityTypes;

    const { data: trackedEntityAttributes, refetch: findTEAttributes } =
        useDataQuery(queryTEAttributes, { lazy: true });
    const { data: categoryCombos, refetch: findCategoryCombos } = useDataQuery(
        queryCatCombos,
        { lazy: true }
    );
    const { data: existingPrefixes, refetch: checkForExistingPrefix } =
        useDataQuery(queryAvailablePrefix, {
            lazy: true,
            variables: { dePrefix: undefined, program: undefined },
        });

    const [programId, setProgramId] = useState(props.data?.id);
    const [assessmentId, setAssessmentId] = useState(undefined);
    const [actionPlanId, setActionPlanId] = useState(undefined);
    const [defaultSectionId, setDefaultSectionId] = useState(undefined);
    const [stepsSectionId, setStepsSectionId] = useState(undefined);
    const [scoresSectionId, setScoresSectionId] = useState(undefined);

    const [programIcon, setProgramIcon] = useState(
        props.data?.style?.icon || ""
    );
    const [programColor, setProgramColor] = useState(props.data?.style?.color);
    const [pgrTypePCA, setPgrTypePCA] = useState(props.programType || "");
    const [programTET, setProgramTET] = useState(
        props.data
            ? {
                label: props.data.trackedEntityType.name,
                id: props.data.trackedEntityType.id,
            }
            : ""
    );

    const [dePrefix, setDePrefix] = useState(props.pcaMetadata?.dePrefix || "");
    const [programName, setProgramName] = useState(props.data?.name || "");
    const [programShortName, setProgramShortName] = useState(
        props.data?.shortName || ""
    );
    const [sentForm, setSentForm] = useState(false);
    const [programTEAs, setProgramTEAs] = useState({
        available: [],
        selected: [],
    });
    const [programCategoryCombos, setProgramCategoryCombos] = useState([
        { name: "Select an option", id: "" },
    ]);
    const [categoryCombo, setCategoryCombo] = useState(
        props.data
            ? {
                label: props.data.categoryCombo.name,
                id: props.data.categoryCombo.id,
            }
            : ""
    );

    const h2SettingsRef = useRef();

    //Validation Messages
    const [validationErrors, setValidationErrors] = useState({
        pgrType: undefined,
        prefix: undefined,
        programName: undefined,
        shortName: undefined,
        programTET: undefined,
        healthArea: undefined,
        ouTableRow: undefined,
        ouMapPolygon: undefined,
        orgUnitRoot: undefined,
    });

    const [buttonDisabled, setButtonDisabled] = useState(props.data ? false : true);

    const handleChangePgrType = (event) => {
        validationErrors.pgrType = undefined;
        validationErrors.programTET = undefined;
        setValidationErrors({ ...validationErrors });
        let value = event.target.value;
        setPgrTypePCA(value);
        if (value === "hnqis") {
            setButtonDisabled(true);
            let hnqisTET = trackedEntityTypes.find(
                (tet) => tet.id === "oNwpeWkfoWc"
            );
            setProgramTET({ label: hnqisTET.name, id: hnqisTET.id });
        } else {
            setProgramTET("");
            if (value === "tracker") {
                setButtonDisabled(false);
                fetchTrackerMetadata();
            } else {
                setButtonDisabled(true);
            }
        }
    };

    const handleChangeDePrefix = (event) => {
        validationErrors.prefix = undefined;
        setValidationErrors({ ...validationErrors });
        setDePrefix(event.target.value);
    };

    const handleChangeProgramName = (event) => {
        validationErrors.programName = undefined;
        setValidationErrors({ ...validationErrors });
        setProgramName(event.target.value);
    };

    const handleChangeProgramShortName = (event) => {
        validationErrors.shortName = undefined;
        setValidationErrors({ ...validationErrors });
        setProgramShortName(event.target.value);
    };

    const programTETChange = (event, value) => {
        if (value) {
            validationErrors.programTET = undefined;
            setValidationErrors({ ...validationErrors });
        }
        setProgramTET(value || "");
    };

    const categoryComboChange = (event, value) => {
        setCategoryCombo(value || "");
    };

    const handleChangeTEAs = (res) => {
        programTEAs.selected = res.selected;
        setProgramTEAs(DeepCopy(programTEAs));
    };

    if (uidPool && uidPool.length === 6 && !props.data) {
        setProgramId(uidPool.shift());
        setAssessmentId(uidPool.shift());
        setActionPlanId(uidPool.shift());
        setDefaultSectionId(uidPool.shift());
        setStepsSectionId(uidPool.shift());
        setScoresSectionId(uidPool.shift());
    }

    function hideForm() {
        props.setShowProgramForm(false);
    }

    const formDataIsValid = () => {
        let response = true;

        if (pgrTypePCA === "") {
            response = false;
            validationErrors.pgrType = "This field is required";
        } else {
            validationErrors.pgrType = undefined;
        }

        if (dePrefix === "") {
            response = false;
            validationErrors.prefix = "This field is required";
        } else if (dePrefix.length > MAX_PREFIX_LENGTH) {
            response = false;
            validationErrors.prefix = `This field cannot exceed ${MAX_PREFIX_LENGTH} characters`;
        } else {
            validationErrors.prefix = undefined;
        }

        if (programName === "") {
            response = false;
            validationErrors.programName = "This field is required";
        } else if (
            programName.length < MIN_NAME_LENGTH ||
            programName.length > MAX_PROGRAM_NAME_LENGTH /*- (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1*/
        ) {
            response = false;
            validationErrors.programName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_PROGRAM_NAME_LENGTH /*-
        (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1*/} characters`;
        } else {
            validationErrors.programName = undefined;
        }

        if (programShortName === "") {
            response = false;
            validationErrors.shortName = "This field is required";
        } else if (
            programShortName.length >
            MAX_SHORT_NAME_LENGTH /*- (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1*/
        ) {
            response = false;
            validationErrors.shortName = `This field cannot exceed ${MAX_SHORT_NAME_LENGTH /*-
                (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) -
                1*/ } characters`;
        } else {
            validationErrors.shortName = undefined;
        }

        if (programTET === "") {
            response = false;
            validationErrors.programTET = "This field is required";
        } else {
            validationErrors.programTET = undefined;
        }

        if (pgrTypePCA === "tracker" && pgrTypePCA !== "hnqis") {
            validationErrors.healthArea =
                validationErrors.ouTableRow =
                validationErrors.ouMapPolygon =
                undefined;
        } else {
            let hnqisValidation = h2SettingsRef.current.handleFormValidation()
            response = response && hnqisValidation;
        }
        setValidationErrors({ ...validationErrors });

        return response;
    };

    const fetchTrackerMetadata = () => {
        findTEAttributes().then((data) => {
            if (data?.results?.trackedEntityAttributes) {
                programTEAs.available = data.results.trackedEntityAttributes;
                programTEAs.selected =
                    props.data?.programTrackedEntityAttributes?.map(
                        (tea) => tea.trackedEntityAttribute.id
                    ) || [];
                setProgramTEAs({ ...programTEAs });
            }
        });

        findCategoryCombos().then((ccdata) => {
            if (ccdata?.results?.categoryCombos)
                setProgramCategoryCombos(ccdata.results.categoryCombos);
        });
    };

    useEffect(() => {
        if (props.programType === "tracker") {
            fetchTrackerMetadata();
        }
    }, []);

    function submission() {
        setSentForm(true);
        props.setNotification(undefined);
        //let prgTypeId = 'yB5tFAAN7bI';
        let dataIsValid = formDataIsValid();
        if (!dataIsValid) {
            setSentForm(false);
            return;
        }

        let useCompetency = pgrTypePCA === "hnqis"?(props.pcaMetadata?.useCompetencyClass || h2SettingsRef.current.saveMetaData())==='Yes':undefined;
        console.log(useCompetency)

        //Validating available prefix
        checkForExistingPrefix({
            dePrefix,
            program: props.data?.name || " ",
        }).then((data) => {
            if (data.results?.programs.length > 0) {
                validationErrors.prefix = `The specified Data Element Prefix is already in use`;
                setValidationErrors({ ...validationErrors });
                setSentForm(false);
                return;
            }

            if (!metadataRequest.called && dataIsValid) {
                let prgrm = props.data
                    ? DeepCopy(props.data)
                    : DeepCopy(Program);
                let programStages = undefined;
                let programStageSections = undefined;

                prgrm.name = programName;
                prgrm.shortName = programShortName;
                prgrm.id = programId;

                let auxstyle = {};
                if (programIcon) auxstyle.icon = programIcon;
                if (programColor) auxstyle.color = programColor;

                if (Object.keys(auxstyle).length > 0) prgrm.style = auxstyle;

                if (pgrTypePCA === "hnqis") {
                    //HNQIS2 Programs
                    let assessmentStage = undefined;
                    let actionPlanStage = undefined;

                    let criticalSteps = undefined;
                    let defaultSection = undefined;
                    let scores = undefined;

                    if (!props.data) {
                        Object.assign(prgrm, HnqisProgramConfigs);
                        prgrm.attributeValues.push({
                            value: "HNQIS2",
                            attribute: { id: prgTypeId },
                        });
                        prgrm.programStages.push({ id: assessmentId });
                        prgrm.programStages.push({ id: actionPlanId });

                        assessmentStage = DeepCopy(PS_AssessmentStage);
                        assessmentStage.id = assessmentId;
                        assessmentStage.name = "Assessment [" + programId + "]"; //! Not adding the ID may result in an error
                        assessmentStage.programStageSections.push({
                            id: defaultSectionId,
                        });
                        assessmentStage.programStageSections.push({
                            id: stepsSectionId,
                        });
                        assessmentStage.programStageSections.push({
                            id: scoresSectionId,
                        });
                        assessmentStage.program.id = programId;

                        actionPlanStage = DeepCopy(PS_ActionPlanStage);
                        actionPlanStage.id = actionPlanId;
                        actionPlanStage.name =
                            "Action Plan [" + programId + "]"; //! Not adding the ID may result in an error
                        actionPlanStage.program.id = programId;

                        defaultSection = DeepCopy(PSS_Default);
                        defaultSection.id = defaultSectionId;
                        defaultSection.programStage.id = assessmentId;
                        //defaultSection.name = defaultSection.name

                        criticalSteps = DeepCopy(PSS_CriticalSteps);
                        criticalSteps.id = stepsSectionId;
                        criticalSteps.programStage.id = assessmentId;
                        //criticalSteps.name = criticalSteps.name

                        scores = DeepCopy(PSS_Scores);
                        scores.id = scoresSectionId;
                        scores.name = scores.name;
                        scores.programStage.id = assessmentId;
                    }

                    if (!useCompetency) {
                        removeCompetencyAttribute(
                            prgrm.programTrackedEntityAttributes
                        );
                        if (props.data) {
                            criticalSteps = prgrm.programStages
                                .map((pStage) => pStage.programStageSections)
                                .flat()
                                .find((section) =>
                                    section.dataElements.find(
                                        (de) => de.id === "VqBfZjZhKkU"
                                    )
                            );
                        }

                        prgrm.programStages = prgrm.programStages.map((ps) => ({
                            id: ps.id,
                        }));

                        removeCompetencyClass(criticalSteps.dataElements);
                    } else if (useCompetency && props.data) {
                        criticalSteps = prgrm.programStages
                            .map((pStage) => pStage.programStageSections)
                            .flat()
                            .find((section) =>
                                section.dataElements.find(
                                    (de) => de.id === CRITICAL_STEPS
                                )
                            );

                        if (!criticalSteps) {
                            criticalSteps = prgrm.programStages
                                .map((pStage) => pStage.programStageSections)
                                .flat()
                                .find((section) =>
                                    section.name === "Critical Steps Calculations"
                                );
                        }
                        criticalSteps.dataElements = [
                            { id: CRITICAL_STEPS },
                            { id: NON_CRITICAL_STEPS },
                            { id: COMPETENCY_CLASS },
                        ];
                        prgrm.programTrackedEntityAttributes =
                            prgrm.programTrackedEntityAttributes.filter(
                                (ptea) =>
                                    ptea.trackedEntityAttribute.id !==
                                    COMPETENCY_ATTRIBUTE
                            );

                        prgrm.programTrackedEntityAttributes.push({
                            trackedEntityAttribute: { id: "ulU9KKgSLYe" },
                            mandatory: false,
                            valueType: "TEXT",
                            searchable: false,
                            displayInList: false,
                            sortOrder: 5,
                        });
                    }

                    createOrUpdateMetaData(prgrm.attributeValues);

                    if (!props.data) {
                        programStages = [assessmentStage, actionPlanStage];
                        programStageSections = [
                            defaultSection,
                            criticalSteps,
                            scores,
                        ];
                    } else {
                        programStageSections = criticalSteps
                            ? [criticalSteps]
                            : undefined;
                    }
                } else {
                    //Tracker Programs
                    prgrm.trackedEntityType = { id: programTET.id };
                    prgrm.programTrackedEntityAttributes = [];
                    prgrm.attributeValues = [];
                    prgrm.categoryCombo =
                        categoryCombo !== ""
                            ? { id: categoryCombo.id }
                            : undefined;
                    programTEAs.selected.forEach((selectedTEA, index) => {
                        let newTEA = programTEAs.available.find(
                            (tea) => tea.id === selectedTEA
                        );
                        console.log(newTEA)
                        prgrm.programTrackedEntityAttributes.push({
                            trackedEntityAttribute: { id: newTEA.id },
                            mandatory: false,
                            valueType: newTEA.valueType,
                            searchable: false,
                            displayInList: true,
                            sortOrder: index + 1,
                        });
                    });

                    createOrUpdateMetaData(prgrm.attributeValues);
                }

                // If editing only send program
                let metadata = props.data
                    ? {
                        programs: [prgrm],
                        programStageSections: programStageSections,
                    }
                    : {
                        programs: [prgrm],
                        programStages,
                        programStageSections,
                    };

                metadataRequest.mutate({ data: metadata }).then((response) => {
                    if (response.status != "OK") {
                        props.setNotification({
                            message: parseErrorsJoin(response, ' | '),
                            severity: "error",
                        });
                        props.setShowProgramForm(false);
                    } else {
                        props.setNotification({
                            message: `Program ${prgrm.name} ${!props.data ? "created" : "updated"
                                } successfully`,
                            severity: "success",
                        });
                        props.setShowProgramForm(false);
                        props.programsRefetch();
                        props.doSearch(prgrm.name);
                    }
                });
            }
        });
    }

    function createOrUpdateMetaData(attributeValues) {
        let metaDataArray = attributeValues.filter(
            (av) => av.attribute.id === METADATA
        );
        if (metaDataArray.length > 0) {
            let metaData_value = JSON.parse(metaDataArray[0].value);
            if (pgrTypePCA === "hnqis") {
                let h1Program = metaData_value.h1Program;
                metaData_value = h2SettingsRef.current.saveMetaData()
                metaData_value.h1Program = h1Program;
            }
            metaData_value.dePrefix = dePrefix;
            metaData_value.saveVersion = BUILD_VERSION;
            metaDataArray[0].value = JSON.stringify(metaData_value);
        } else {
            let attr = { id: METADATA };
            let val = {};
            if (pgrTypePCA === "hnqis") {
                val = h2SettingsRef.current.saveMetadata();
            }
            val.saveVersion = BUILD_VERSION;
            val.dePrefix = dePrefix;
            let attributeValue = {
                attribute: attr,
                value: JSON.stringify(val),
            };
            attributeValues.push(attributeValue);
        }
    }

    function removeCompetencyAttribute(programTrackedEntityAttributes) {
        const index = programTrackedEntityAttributes.findIndex((attr) => {
            return attr.trackedEntityAttribute.id === COMPETENCY_ATTRIBUTE;
        });
        programTrackedEntityAttributes.splice(index, 1);
    }

    function removeCompetencyClass(dataElements) {
        const index = dataElements.findIndex((de) => {
            return de.id === COMPETENCY_CLASS;
        });
        dataElements.splice(index, 1);
    }

    return (
        <>
            <CustomMUIDialog open={true} maxWidth="md" fullWidth={true}>
                <CustomMUIDialogTitle
                    id="customized-dialog-title"
                    onClose={() => hideForm()}
                >
                    {props.data
                        ? ("Edit Program " + truncateString(props.data.name))
                        : "Create New Program"}
                </CustomMUIDialogTitle>
                <DialogContent dividers style={{ padding: "1em 2em" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <FormControl
                            sx={{ minWidth: "30%" }}
                            error={validationErrors.pgrType !== undefined}
                        >
                            <InputLabel id="label-prgType">
                                Program Type (*)
                            </InputLabel>
                            <Select
                                labelId="label-prgType"
                                id="prgTypePCA"
                                value={pgrTypePCA}
                                disabled={props.programType !== undefined}
                                onChange={handleChangePgrType}
                                label="Program Type (*)"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={"tracker"}>
                                    Tracker Program
                                </MenuItem>
                                <MenuItem
                                    disabled={
                                        !h2Ready ||
                                        hnqis2Metadata?.results?.version <
                                        H2_METADATA_VERSION
                                    }
                                    value={"hnqis"}
                                >
                                    HNQIS 2.0{" "}
                                    {hnqis2Metadata?.results?.version <
                                        H2_METADATA_VERSION && (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginLeft: "8px",
                                                }}
                                            >
                                                [Unavailable]{" "}
                                                <RemoveCircleOutlineIcon />
                                            </span>
                                        )}
                                </MenuItem>
                            </Select>
                            <FormHelperText>
                                {validationErrors.pgrType}
                            </FormHelperText>
                        </FormControl>
                        <FormControl sx={{ minWidth: "65%" }}>
                            <TextField
                                error={validationErrors.prefix !== undefined}
                                helperText={validationErrors.prefix}
                                margin="normal"
                                id="prefix"
                                label="Program Data Element Prefix (*)"
                                type="text"
                                fullWidth
                                variant="standard"
                                autoComplete="off"
                                inputProps={{ maxLength: MAX_PREFIX_LENGTH }}
                                value={dePrefix}
                                onChange={handleChangeDePrefix}
                            />
                        </FormControl>
                    </div>
                    <TextField
                        error={validationErrors.programName !== undefined}
                        helperText={validationErrors.programName}
                        margin="normal"
                        id="name"
                        label="Program Name (*)"
                        type="text"
                        fullWidth
                        variant="standard"
                        autoComplete="off"
                        inputProps={{
                            maxLength:
                                MAX_PROGRAM_NAME_LENGTH /*- dePrefix.length*/,
                        }}
                        value={programName}
                        onChange={handleChangeProgramName}
                    />
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <TextField
                            error={validationErrors.shortName !== undefined}
                            helperText={validationErrors.shortName}
                            margin="normal"
                            id="shortName"
                            label="Program Short Name (*)"
                            type="text"
                            sx={{ width: "48%" }}
                            variant="standard"
                            autoComplete="off"
                            inputProps={{
                                maxLength:
                                    MAX_SHORT_NAME_LENGTH /*- dePrefix.length*/,
                            }}
                            value={programShortName}
                            onChange={handleChangeProgramShortName}
                        />
                        <Autocomplete
                            id="tetSelect"
                            disabled={pgrTypePCA !== "tracker"}
                            options={
                                trackedEntityTypes?.map((tet) => ({
                                    label: tet.name,
                                    id: tet.id,
                                })) || [{ label: "", id: "" }]
                            }
                            sx={{ width: "48%" }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    error={
                                        validationErrors.programTET !==
                                        undefined
                                    }
                                    label="Tracked Entity Type (*)"
                                    margin="normal"
                                    variant="standard"
                                    helperText={validationErrors.programTET}
                                />
                            )}
                            value={programTET}
                            onChange={programTETChange}
                            getOptionLabel={(option) => option.label || ""}
                            isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                            }
                            defaultValue={""}
                        />
                    </div>
                    <StyleManager
                        icon={programIcon}
                        setIcon={setProgramIcon}
                        color={programColor}
                        setColor={setProgramColor}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "end",
                            width: "100%",
                            minHeight: "5em",
                            marginTop: "1em",
                        }}
                    />
                    {pgrTypePCA !== "" &&
                        <>
                            <hr style={{ marginTop: "0.5em" }} />
                            <h4
                                style={{
                                    marginBottom: "0.25em",
                                    marginTop: "0.5em",
                                }}
                            >
                                {pgrTypePCA.toUpperCase()} Settings
                            </h4>
                        </>
                    }
                    {pgrTypePCA === "hnqis" && (
                        <H2Setting
                            pcaMetadata={props.pcaMetadata}
                            ref={h2SettingsRef}
                            setButtonDisabled={setButtonDisabled}
                        />
                    )}
                    {pgrTypePCA === "tracker" && (
                        <>
                            <FormControl
                                sx={{ minWidth: "100%" }}
                                error={
                                    validationErrors.categoryCombo !== undefined
                                }
                            >
                                <Autocomplete
                                    id="ccSelect"
                                    disabled={pgrTypePCA !== "tracker"}
                                    options={programCategoryCombos?.map(
                                        (pcc) => ({
                                            label: pcc.name,
                                            id: pcc.id,
                                        })
                                    )}
                                    sx={{ width: "100%" }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={
                                                validationErrors.categoryCombo !==
                                                undefined
                                            }
                                            label="Category Combination"
                                            variant="standard"
                                            margin="dense"
                                            helperText={
                                                validationErrors.categoryCombo
                                            }
                                        />
                                    )}
                                    value={categoryCombo}
                                    onChange={categoryComboChange}
                                    getOptionLabel={(option) =>
                                        option.label || ""
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    defaultValue={"default"}
                                />
                            </FormControl>
                            <div style={{ marginTop: "1.5em" }}>
                                <FormLabel
                                    style={{
                                        display: "inline-block",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Program Tracked Entity Attributes
                                </FormLabel>
                                <Transfer
                                    filterable
                                    onChange={handleChangeTEAs}
                                    options={programTEAs.available.map(
                                        (tea) => ({
                                            label: tea.name,
                                            value: tea.id,
                                        })
                                    )}
                                    selected={programTEAs.selected}
                                    optionsWidth="48%"
                                    selectedWidth="48%"
                                />
                            </div>
                        </>
                    )}
                </DialogContent>
                <DialogActions style={{ padding: "1em" }}>
                    <Button onClick={() => hideForm()} color="error">
                        {" "}
                        Close{" "}
                    </Button>
                    <LoadingButton
                        onClick={() => submission()}
                        disabled={buttonDisabled || props.readOnly}
                        loading={sentForm}
                        variant="outlined"
                        loadingPosition="start"
                        startIcon={<SendIcon />}
                    >
                        Submit
                    </LoadingButton>
                </DialogActions>
            </CustomMUIDialog>
        </>
    );
};

export default ProgramNew;