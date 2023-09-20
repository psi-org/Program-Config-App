import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { Transfer } from "@dhis2/ui";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SendIcon from "@mui/icons-material/Send";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormLabel, Slide, Step, StepLabel, Stepper, Tooltip } from "@mui/material";
import Alert from '@mui/material/Alert';
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import TextField from "@mui/material/TextField";
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from "react";
import {
    ASSESSMENT_TET,
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
} from "../../configs/Constants.js";
import {
    EventStage,
    HnqisProgramConfigs,
    Program,
    PS_ActionPlanStage,
    PS_AssessmentStage,
    PSS_CriticalSteps,
    PSS_Default,
    PSS_Scores,
} from "../../configs/ProgramTemplate.js";
import { DeepCopy, parseErrorsJoin, truncateString } from "../../utils/Utils.js";
import InputModal from "../PRG_Details/InputModal.js";
import AttributesEditor from "../TEAEditor/AttributesEditor.js";
import StyleManager from "../UIElements/StyleManager.js";
import CustomMUIDialog from "./../UIElements/CustomMUIDialog.js";
import CustomMUIDialogTitle from "./../UIElements/CustomMUIDialogTitle.js";
import H2Setting from "./H2Setting.js"

const queryId = {
    results: {
        resource: "system/id.json",
        params: { limit: 15 },
    },
};

const queryIds = {
    results: {
        resource: 'system/id.json',
        params: ({ n }) => ({
            limit: n
        })
    }
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
            fields: ["id", "name", "trackedEntityTypeAttributes[trackedEntityAttribute[id]]"],
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
    const metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
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

    const { refetch: findTEAttributes } =
        useDataQuery(queryTEAttributes, { lazy: true });
    const { refetch: findCategoryCombos } = useDataQuery(
        queryCatCombos,
        { lazy: true }
    );
    const { refetch: checkForExistingPrefix } =
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
                label: props.data.trackedEntityType?.name,
                id: props.data.trackedEntityType?.id,
            }
            : ""
    );

    const [dePrefix, setDePrefix] = useState(props.pcaMetadata?.dePrefix || "");
    const [programName, setProgramName] = useState(props.data?.name || "");
    const [programShortName, setProgramShortName] = useState(
        props.data?.shortName || ""
    );
    const [programCode, setProgramCode] = useState(
        props.data?.code || ""
    );
    const [sentForm, setSentForm] = useState(false);
    const [programTEAs, setProgramTEAs] = useState({
        available: [],
        selected: [],
    });
    const [programCategoryCombos, setProgramCategoryCombos] = useState([
        { name: "default", id: "" }
    ]);
    const [categoryCombo, setCategoryCombo] = useState(
        props.data
            ? {
                label: props.data.categoryCombo.name,
                id: props.data.categoryCombo.id,
            }
            : ""
    );
    const [validationStrategy, setValidationStrategy] = useState(props.data?.programStages[0]?.validationStrategy || "ON_UPDATE_AND_INSERT");

    const h2SettingsRef = useRef();

    //Validation Messages
    const [validationErrors, setValidationErrors] = useState({
        pgrType: undefined,
        prefix: undefined,
        programName: undefined,
        shortName: undefined,
        code: undefined,
        programTET: undefined,
        healthArea: undefined,
        ouTableRow: undefined,
        ouMapPolygon: undefined,
        orgUnitRoot: undefined,
    });

    const [buttonDisabled, setButtonDisabled] = useState(!props.data);

    const handleChangePgrType = (event) => {
        validationErrors.pgrType = undefined;
        validationErrors.programTET = undefined;
        setValidationErrors({ ...validationErrors });
        const value = event.target.value;
        setPgrTypePCA(value);
        if (value === "hnqis") {
            setButtonDisabled(true);
            const hnqisTET = trackedEntityTypes.find(
                (tet) => tet.id === ASSESSMENT_TET
            );
            setProgramTET({ label: hnqisTET.name, id: hnqisTET.id });
        } else {
            setProgramTET("");
            if (value === "event") {
                setButtonDisabled(false);
            } else if (value === "tracker") {
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

    const handleChangeProgramCode = (event) => {
        validationErrors.code = undefined;
        setValidationErrors({ ...validationErrors });
        setProgramCode(event.target.value);
    };

    const programTETChange = (event, value) => {

        if (value) {
            // Remove from selected
            if (programTET !== "") {
                trackedEntityTypes.find(tet => tet.id === programTET.id).trackedEntityTypeAttributes.forEach(tea => {
                    const idx = programTEAs.selected.findIndex(teaId => teaId === tea.trackedEntityAttribute.id)
                    if (idx > -1) { programTEAs.selected.splice(idx, 1) }
                })
            }

            // Add new selected
            trackedEntityTypes.find(tet => tet.id === value.id).trackedEntityTypeAttributes.forEach(tea => {
                if (!programTEAs.selected.includes(tea.trackedEntityAttribute.id)) {
                    programTEAs.selected.push(tea.trackedEntityAttribute.id)
                }
            })
            setProgramTEAs({ ...programTEAs });

            validationErrors.programTET = undefined;
            setValidationErrors({ ...validationErrors });
        }
        setProgramTET(value || "");

        updateAssignedAttributes();
    };

    const categoryComboChange = (event, value) => {
        setCategoryCombo(value);
    };

    const validationStrategyChange = (event) => {
        setValidationStrategy(event.target.value);
    };

    // * STEPPER * //

    const [activeStep, setActiveStep] = useState(0);
    let previousStep = 0;
    const [basicValidated, setBasicValidated] = useState(true);
    const [hnqisValidated, setHnqisValidated] = useState(true);

    const containerRef = useRef(null);
    const changeStep = (step) => {
        previousStep = activeStep;
        setActiveStep(step);
    }

    // * END OF STEPPER * //

    // * Snackbar
    const [snackParams, setSnackParams] = useState(false)
    const pushNotification = (content, severity = "success") => setSnackParams({ content, severity })

    // * TEA Editor * //
    const [useSections, setUseSections] = useState(props.data?.programSections?.length > 0);
    const [attributesFormSections, setAttributesFormSections] = useState(props.data?.programSections || []);
    const [assignedAttributes, setAssignedAttributes] = useState([]);

    const [inputModalOpened, setInputModalOpened] = useState(false);

    const { refetch: getIds } = useDataQuery(queryIds, { lazy: true });
    const onAddNewSection = (name) => {
        getIds({ n: 1 }).then(results => {
            const id = results.results.codes[0]
            attributesFormSections.push({
                id,
                name,
                trackedEntityAttributes: []
            })
            setAttributesFormSections([...attributesFormSections])
        })
    }
    // * END OF TEA Editor * //

    const updateAssignedAttributes = () => {

        // Remove old TET attributes
        attributesFormSections.forEach(section => {
            section.trackedEntityAttributes = section.trackedEntityAttributes.filter(
                tea => programTEAs.selected.includes(tea.id)
            )
        })
        setAttributesFormSections([...attributesFormSections])


        // Validate selected attributes that are not in program sections
        const newAssignedAttributes = [];
        programTEAs.selected.forEach(teaId => {
            if (!attributesFormSections.map(section => section.trackedEntityAttributes.map(tea => tea.id)).flat().includes(teaId)) {
                newAssignedAttributes.push(programTEAs.available.find(tea => tea.trackedEntityAttribute.id === teaId))
            }
        })
        setAssignedAttributes([...newAssignedAttributes])
    }

    const handleChangeTEAs = (res) => {
        if (programTET !== "") {
            const TETAttributes = trackedEntityTypes.find(tet => tet.id === programTET.id).trackedEntityTypeAttributes

            if (TETAttributes.every(tea => res.selected.includes(tea.trackedEntityAttribute.id))) {
                programTEAs.selected = res.selected;
                setProgramTEAs(DeepCopy(programTEAs));
            } else {
                programTEAs.selected = programTEAs.selected.filter(
                    teaId => TETAttributes.map(tea => tea.trackedEntityAttribute.id).includes(teaId) || res.selected.includes(teaId)
                )
                setProgramTEAs(DeepCopy(programTEAs));
                pushNotification("You must include all Tracked Entity Type attributes", "error");
            }
        } else {
            programTEAs.selected = res.selected;
            setProgramTEAs(DeepCopy(programTEAs));
        }

        // ! REMOVE form attributes not assigned to program
        attributesFormSections.forEach(section => {
            section.trackedEntityAttributes = section.trackedEntityAttributes.filter(
                tea => programTEAs.selected.includes(tea.id)
            )
        })
        setAttributesFormSections([...attributesFormSections])

        updateAssignedAttributes();
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

        // * Basic Settings Validation * //
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
            programName.length < MIN_NAME_LENGTH || programName.length > MAX_PROGRAM_NAME_LENGTH
        ) {
            response = false;
            validationErrors.programName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_PROGRAM_NAME_LENGTH} characters`;
        } else {
            validationErrors.programName = undefined;
        }

        if (programShortName === "") {
            response = false;
            validationErrors.shortName = "This field is required";
        } else if (
            programShortName.length >
            MAX_SHORT_NAME_LENGTH
        ) {
            response = false;
            validationErrors.shortName = `This field cannot exceed ${MAX_SHORT_NAME_LENGTH} characters`;
        } else {
            validationErrors.shortName = undefined;
        }

        if (programCode.length > MAX_SHORT_NAME_LENGTH) {
            response = false;
            validationErrors.code = `This field cannot exceed ${MAX_SHORT_NAME_LENGTH} characters`;
        } else {
            validationErrors.code = undefined;
        }

        if (programTET === "" && pgrTypePCA !== 'event') {
            response = false;
            validationErrors.programTET = "This field is required";
        } else {
            validationErrors.programTET = undefined;
        }

        setBasicValidated(response);

        // * HNQIS2 Settings Validation * //
        if ((pgrTypePCA === "tracker" || pgrTypePCA === "event") && pgrTypePCA !== "hnqis") {
            validationErrors.healthArea =
                validationErrors.ouTableRow =
                validationErrors.ouMapPolygon =
                undefined;
        } else {
            const hnqisValidation = h2SettingsRef.current.handleFormValidation()
            setHnqisValidated(hnqisValidation);
            response = response && hnqisValidation;
        }
        setValidationErrors({ ...validationErrors });

        return response;
    };

    const fetchTrackerMetadata = () => {
        console.info("Fetching Tracker Metadata");
        findTEAttributes().then((data) => {
            if (data?.results?.trackedEntityAttributes) {
                programTEAs.available = data.results.trackedEntityAttributes;
                programTEAs.selected =
                    props.data?.programTrackedEntityAttributes?.map(
                        (tea) => tea.trackedEntityAttribute.id
                    ) || [];
                //setProgramTEAs({ ...programTEAs });

                // ? Existing TEAs in the program

                const existingTEAs = props.data ?
                    props.data.programTrackedEntityAttributes.map(tea => ({
                        trackedEntityAttribute: tea.trackedEntityAttribute,
                        valueType: tea.valueType,
                        allowFutureDate: tea.allowFutureDate,
                        displayInList: tea.displayInList,
                        mandatory: tea.mandatory,
                        searchable: tea.searchable,
                        renderType: tea.renderType
                    })) : []

                const availableTEAs = data.results.trackedEntityAttributes.filter(
                    tea => !existingTEAs.map(tea => tea.trackedEntityAttribute.id).includes(tea.id)
                ).map(
                    tea => ({
                        trackedEntityAttribute: { id: tea.id, name: tea.name },
                        valueType: tea.valueType,
                        allowFutureDate: false,
                        displayInList: false,
                        mandatory: false,
                        searchable: false
                    })
                )

                const teaOptions = {
                    available: availableTEAs.concat(existingTEAs),
                    selected: existingTEAs.map(tea => tea.trackedEntityAttribute.id)
                }

                // ! Enforce Tracked Entity Type Attributes for existing programs
                if (props?.data?.trackedEntityType?.trackedEntityTypeAttributes) {
                    teaOptions.selected = teaOptions.selected.concat(
                        props.data.trackedEntityType.trackedEntityTypeAttributes.map(
                            att => att.trackedEntityAttribute.id
                        ).filter(
                            id => !teaOptions.selected.includes(id)
                        )
                    )
                }

                setProgramTEAs({ ...teaOptions })


                // ? Assigned TEAs but not used in the form
                const assignedAtts = props.data && props.data.programSections ?
                    teaOptions.selected.filter(
                        teaId => !props.data.programSections.map(
                            section => section.trackedEntityAttributes.map(tea => tea.id)
                        ).flat().includes(teaId)
                    ).map(
                        assignedTea => teaOptions.available.find(
                            tea => tea.trackedEntityAttribute.id === assignedTea
                        )
                    )
                    : [];

                setAssignedAttributes(assignedAtts);

                // ! REMOVE form attributes not assigned to program
                attributesFormSections.forEach(section => {
                    section.trackedEntityAttributes = section.trackedEntityAttributes.filter(
                        tea => teaOptions.selected.includes(tea.id)
                    )
                })
                setAttributesFormSections([...attributesFormSections])
            }
        });
    };

    useEffect(() => {
        if (pgrTypePCA === "tracker" || pgrTypePCA === "event") {
            if (pgrTypePCA === "tracker") { fetchTrackerMetadata() }
            findCategoryCombos().then((ccdata) => {
                if (ccdata?.results?.categoryCombos) {
                    setProgramCategoryCombos([{ name: "default", id: "" }].concat(ccdata.results.categoryCombos));
                }
            });
        }
    }, [pgrTypePCA]);

    //TODO: Add support for Event Programs creation or edition
    function submission() {
        setSentForm(true);
        props.setNotification(undefined);
        const dataIsValid = formDataIsValid();
        if (!dataIsValid) {
            setSentForm(false);
            return;
        }

        const useCompetency = pgrTypePCA === "hnqis" ? h2SettingsRef.current.saveMetaData()?.useCompetencyClass === 'Yes' : undefined;

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
                const prgrm = props.data
                    ? DeepCopy(props.data)
                    : DeepCopy(Program);
                let programStages = undefined;
                let programStageSections = undefined;
                let programSections = [];

                prgrm.name = programName;
                prgrm.shortName = programShortName;
                prgrm.code = programCode;
                prgrm.id = programId || uidPool.shift();

                const auxstyle = {};
                if (programIcon) { auxstyle.icon = programIcon }
                if (programColor) { auxstyle.color = programColor }

                if (Object.keys(auxstyle).length > 0) {
                    prgrm.style = auxstyle;
                } else {
                    prgrm.style = undefined;
                }

                if (pgrTypePCA === "hnqis") {
                    //HNQIS2 Programs
                    let assessmentStage = undefined;
                    let actionPlanStage = undefined;

                    let criticalSteps = undefined;
                    let defaultSection = undefined;
                    let scores = undefined;
                    let excludedStageDEs = [];

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
                        assessmentStage.name = "Assessment [" + prgrm.id + "]"; //! Not adding the ID may result in an error
                        assessmentStage.programStageSections.push({
                            id: defaultSectionId,
                        });
                        assessmentStage.programStageSections.push({
                            id: stepsSectionId,
                        });
                        assessmentStage.programStageSections.push({
                            id: scoresSectionId,
                        });
                        assessmentStage.program.id = prgrm.id;

                        actionPlanStage = DeepCopy(PS_ActionPlanStage);
                        actionPlanStage.id = actionPlanId;
                        actionPlanStage.name =
                            "Action Plan [" + prgrm.id + "]"; //! Not adding the ID may result in an error
                        actionPlanStage.program.id = prgrm.id;

                        defaultSection = DeepCopy(PSS_Default);
                        defaultSection.id = defaultSectionId;
                        defaultSection.programStage.id = assessmentId;

                        criticalSteps = DeepCopy(PSS_CriticalSteps);
                        criticalSteps.id = stepsSectionId;
                        criticalSteps.programStage.id = assessmentId;

                        scores = DeepCopy(PSS_Scores);
                        scores.id = scoresSectionId;
                        scores.programStage.id = assessmentId;
                    } else {
                        assessmentStage = prgrm.programStages.find(section => section.name.toLowerCase().includes('assessment'));
                        const exclusionsDEs = [CRITICAL_STEPS, NON_CRITICAL_STEPS, COMPETENCY_CLASS];
                        excludedStageDEs = assessmentStage.programStageDataElements.filter(elem => !exclusionsDEs.includes(elem.dataElement.id));
                    }

                    prgrm.programTrackedEntityAttributes = DeepCopy(HnqisProgramConfigs.programTrackedEntityAttributes);

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
                                        (de) => de.id === CRITICAL_STEPS
                                    ) || section.name === "Critical Steps Calculations"
                                );
                        }

                        prgrm.programStages = prgrm.programStages.map((ps) => ({
                            id: ps.id,
                        }));

                        criticalSteps.dataElements = [
                            { id: CRITICAL_STEPS },
                            { id: NON_CRITICAL_STEPS },
                            { id: COMPETENCY_CLASS },
                        ];

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

                    if (assessmentStage?.programStageDataElements.length == 0 || props.data) {
                        assessmentStage.programStageDataElements = excludedStageDEs.concat(criticalSteps.dataElements.map((de, index) => ({
                            sortOrder: index + excludedStageDEs.length,
                            compulsory: false,
                            displayInReports: false,
                            programStage: { id: assessmentStage.id },
                            dataElement: de
                        })));
                    }

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
                        programStages = [assessmentStage];
                    }
                } else {
                    //Tracker Programs
                    if (pgrTypePCA === "tracker") {
                        prgrm.trackedEntityType = { id: programTET.id };
                        prgrm.programTrackedEntityAttributes = [];
                        // PROGRAM TRACKED ENTITY ATTRIBUTES & PROGRAM SECTIONS

                        prgrm.programTrackedEntityAttributes = programTEAs.selected.map(
                            (teaId, idx) => {
                                const t = programTEAs.available.find(tea => tea.trackedEntityAttribute.id === teaId);
                                t.sortOrder = idx;
                                return t;
                            }
                        )

                        if (useSections) {
                            programSections = attributesFormSections.map((section, idx) => {
                                section.sortOrder = idx;
                                section.program = { id: prgrm.id };
                                return section;
                            })
                        }

                        prgrm.programSections = programSections.map(section => ({ id: section.id }));
                    }
                    if (pgrTypePCA === "event") {
                        prgrm.withoutRegistration = true;
                        prgrm.programType = 'WITHOUT_REGISTRATION';


                        const editStage = props.data ? props.data.programStages[0] : DeepCopy(EventStage);
                        if (!props.data) {
                            editStage.id = uidPool.shift();
                        }
                        editStage.name = prgrm.name;
                        editStage.validationStrategy = validationStrategy;
                        editStage.program = { id: prgrm.id };
                        prgrm.programStages = [{ id: editStage.id }];
                        programStages = [editStage];
                    }

                    prgrm.attributeValues = prgrm.attributeValues || [];
                    prgrm.categoryCombo =
                        categoryCombo && categoryCombo.id !== ""
                            ? { id: categoryCombo.id }
                            : undefined;

                    createOrUpdateMetaData(prgrm.attributeValues);
                }

                // If editing only send program
                const metadata = props.data
                    ? {
                        programs: [prgrm],
                        programStageSections: programStageSections,
                        programStages,
                        programSections
                    }
                    : {
                        programs: [prgrm],
                        programStages,
                        programStageSections,
                        programSections
                    };

                metadataRequest.mutate({ data: metadata }).then((response) => {
                    if (response.status != "OK") {
                        props.setNotification({
                            message: parseErrorsJoin(response, '\\n'),
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
        const metaDataArray = attributeValues?.filter(
            (av) => av.attribute.id === METADATA
        );
        if (metaDataArray.length > 0) {
            let metaData_value = JSON.parse(metaDataArray[0].value);
            if (pgrTypePCA === "hnqis") {
                const h1Program = metaData_value.h1Program;
                metaData_value = h2SettingsRef.current.saveMetaData()
                metaData_value.h1Program = h1Program;
            }
            metaData_value.dePrefix = dePrefix;
            metaData_value.saveVersion = BUILD_VERSION;
            metaDataArray[0].value = JSON.stringify(metaData_value);
        } else {
            const attr = { id: METADATA };
            let val = {};
            if (pgrTypePCA === "hnqis") {
                val = h2SettingsRef.current.saveMetadata();
            }
            val.saveVersion = BUILD_VERSION;
            val.dePrefix = dePrefix;
            const attributeValue = {
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
            <CustomMUIDialog open={true} maxWidth="lg" fullWidth={true}>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={!!snackParams}
                    autoHideDuration={4000}
                    onClose={() => setSnackParams(false)}
                >
                    <Alert onClose={() => setSnackParams(false)} severity={snackParams.severity} sx={{ width: '100%' }}>
                        {snackParams.content}
                    </Alert>
                </Snackbar>
                <CustomMUIDialogTitle
                    id="customized-dialog-title"
                    onClose={() => hideForm()}
                >
                    {props.data
                        ? ("Edit Program " + truncateString(props.data.name))
                        : "Create New Program"}
                </CustomMUIDialogTitle>
                <DialogContent dividers style={{ padding: "1em 2em", height: '65vh', maxHeight: '65vh', overflowX: 'hidden' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Stepper alternativeLabel nonLinear activeStep={activeStep}>
                            <Step style={{ cursor: 'pointer' }} container={containerRef.current}>
                                <StepLabel error={!basicValidated} onClick={() => changeStep(0)}>Basic Settings</StepLabel>
                            </Step>
                            {pgrTypePCA === 'hnqis' &&
                                <Step style={{ cursor: 'pointer' }} container={containerRef.current}>
                                    <StepLabel error={!hnqisValidated} onClick={() => changeStep(1)} >HNQIS2 Settings</StepLabel>
                                </Step>
                            }
                            {(pgrTypePCA === 'tracker' || pgrTypePCA === 'event') &&
                                <Step style={{ cursor: 'pointer' }} container={containerRef.current}>
                                    <StepLabel onClick={() => changeStep(1)}>{pgrTypePCA === 'tracker' ? 'Tracker' : 'Event'} Program Settings</StepLabel>
                                </Step>
                            }
                            {pgrTypePCA === 'tracker' &&
                                <Step style={{ cursor: 'pointer' }} container={containerRef.current}>
                                    <StepLabel onClick={() => changeStep(2)}>Tracked Entity Attributes Form</StepLabel>
                                </Step>
                            }

                        </Stepper>
                    </div>
                    <div className="stepperContent">
                        {/* BASIC SETTINGS */}
                        <Slide in={activeStep === 0} direction={activeStep > previousStep ? 'left' : 'right'}>
                            <div style={{ display: activeStep === 0 ? 'inherit' : 'none' }}>
                                <div style={{ display: "flex", flexDirection: 'column', justifyContent: "space-between" }}>
                                    <FormControl sx={{ maxWidth: "30%" }} error={validationErrors.pgrType !== undefined} style={{ marginTop: '1rem' }}>
                                        <InputLabel id="label-prgType">Program Type (*)</InputLabel>
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
                                            <MenuItem value={"event"}>
                                                Event Program
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
                                                {hnqis2Metadata?.results?.version < H2_METADATA_VERSION && (
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
                                    <TextField
                                        error={validationErrors.shortName !== undefined}
                                        helperText={validationErrors.shortName}
                                        margin="normal"
                                        id="shortName"
                                        label="Program Short Name (*)"
                                        type="text"
                                        sx={{ width: "100%" }}
                                        variant="standard"
                                        autoComplete="off"
                                        inputProps={{
                                            maxLength:
                                                MAX_SHORT_NAME_LENGTH /*- dePrefix.length*/,
                                        }}
                                        value={programShortName}
                                        onChange={handleChangeProgramShortName}
                                    />

                                    <TextField
                                        error={validationErrors.code !== undefined}
                                        helperText={validationErrors.code}
                                        margin="normal"
                                        id="code"
                                        label="Program Code"
                                        type="text"
                                        sx={{ width: "100%" }}
                                        variant="standard"
                                        autoComplete="off"
                                        inputProps={{
                                            maxLength:
                                                MAX_SHORT_NAME_LENGTH /*- dePrefix.length*/,
                                        }}
                                        value={programCode}
                                        onChange={handleChangeProgramCode}
                                    />

                                    {pgrTypePCA && pgrTypePCA !== '' && pgrTypePCA !== 'event' &&
                                        <Autocomplete
                                            id="tetSelect"
                                            disabled={pgrTypePCA !== "tracker"}
                                            options={
                                                trackedEntityTypes?.map((tet) => ({
                                                    label: tet.name,
                                                    id: tet.id,
                                                })) || [{ label: "", id: "" }]
                                            }
                                            sx={{ width: "100%" }}
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
                                    }
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

                                </div>
                            </div>
                        </Slide>

                        {/* HNQIS2 SETTINGS */}
                        <Slide in={pgrTypePCA === 'hnqis' && activeStep === 1} direction={activeStep > previousStep ? 'left' : 'right'}>
                            <div style={{ display: pgrTypePCA === 'hnqis' && activeStep === 1 ? 'inherit' : 'none' }}>
                                <H2Setting
                                    pcaMetadata={props.pcaMetadata}
                                    ref={h2SettingsRef}
                                    setButtonDisabled={setButtonDisabled}
                                />
                            </div>
                        </Slide>
                        {/* TRACKER PROGRAM SETTINGS */}
                        <Slide in={(pgrTypePCA === 'tracker' || pgrTypePCA === 'event') && activeStep === 1} direction={activeStep > previousStep ? 'left' : 'right'}>
                            <div style={{ display: ((pgrTypePCA === 'tracker' || pgrTypePCA === 'event') && activeStep === 1) ? 'inherit' : 'none' }}>
                                <FormControl
                                    sx={{ minWidth: "100%" }}
                                    error={
                                        validationErrors.categoryCombo !== undefined
                                    }
                                >
                                    <Autocomplete
                                        id="ccSelect"
                                        disabled={(pgrTypePCA !== 'tracker' && pgrTypePCA !== 'event')}
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
                                {pgrTypePCA === 'event' &&
                                    <FormControl variant="standard" sx={{ width: '100%', marginTop: '1em' }}>
                                        <InputLabel id="label-validationStrat">Validation Strategy (*)</InputLabel>
                                        <Select
                                            labelId="label-validationStrat"
                                            id="validationStrat"
                                            value={validationStrategy}
                                            disabled={pgrTypePCA !== 'event'}
                                            onChange={validationStrategyChange}
                                            label="Validation Strategy (*)"
                                            variant="standard"
                                        >
                                            <MenuItem value={"ON_COMPLETE"}>
                                                On Complete
                                            </MenuItem>
                                            <MenuItem value={"ON_UPDATE_AND_INSERT"}>
                                                On update and insert
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                }
                                {pgrTypePCA === 'tracker' &&
                                    <div style={{ marginTop: "1.5em", display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                                    label: tea.trackedEntityAttribute.name,
                                                    value: tea.trackedEntityAttribute.id,
                                                })
                                            )}
                                            selected={programTEAs.selected}
                                            optionsWidth="48%"
                                            selectedWidth="48%"
                                        />

                                    </div>
                                }
                            </div>
                        </Slide>
                        {/* TRACKED ENTITY ATTRIBUTES FORM */}
                        {programTEAs.available.length > 0 &&
                            <Slide in={pgrTypePCA === 'tracker' && activeStep === 2} direction={activeStep > previousStep ? 'left' : 'right'}>
                                <div style={{ display: (pgrTypePCA === 'tracker' && activeStep === 2) ? 'inherit' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: '1rem 0', alignItems: 'center' }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={useSections}
                                                    onChange={(e) => setUseSections(e.target.checked)}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            }
                                            label="Use Form Sections"
                                        />
                                        <div>
                                            {useSections && <Button
                                                variant='contained'

                                                startIcon={<AddCircleOutlineIcon />}
                                                onClick={() => { setInputModalOpened(true) }}
                                            >Add new section</Button>}
                                        </div>
                                    </div>
                                    <AttributesEditor
                                        useSections={useSections}
                                        teaOptions={programTEAs}
                                        setTeaOptions={setProgramTEAs}
                                        attributesFormSections={attributesFormSections}
                                        setAttributesFormSections={setAttributesFormSections}
                                        assignedAttributes={assignedAttributes}
                                        setAssignedAttributes={setAssignedAttributes}
                                    />
                                </div>
                            </Slide>
                        }
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: "1em" }}>
                    <Button onClick={() => hideForm()} color="error">
                        {" "}
                        Close{" "}
                    </Button>
                    {props.readOnly &&
                        <Tooltip title="You don't have access to edit this Program" placement="top" arrow>
                            <span>
                                <Button
                                    variant="outlined"
                                    disabled={true}
                                    startIcon={<SendIcon />}
                                >
                                    Submit
                                </Button>
                            </span>
                        </Tooltip>}
                    {!props.readOnly &&
                        <LoadingButton
                            onClick={() => submission()}
                            disabled={buttonDisabled}
                            loading={sentForm}
                            variant="outlined"
                            loadingPosition="start"
                            startIcon={<SendIcon />}
                        >
                            Submit
                        </LoadingButton>
                    }
                </DialogActions>
            </CustomMUIDialog>
            {
                inputModalOpened &&
                <InputModal
                    opened={inputModalOpened}
                    title={'Form Section Name'}
                    label={'Name'}
                    value={''}
                    onClose={() => setInputModalOpened(false)}
                    onConfirm={(value) => {
                        onAddNewSection(value)
                        setInputModalOpened(false)
                    }}
                />
            }
        </>
    );
};

ProgramNew.propTypes = {
    data: PropTypes.object,
    doSearch: PropTypes.func,
    pcaMetadata: PropTypes.object,
    programType: PropTypes.string,
    programsRefetch: PropTypes.func,
    readOnly: PropTypes.bool,
    setNotification: PropTypes.func,
    setShowProgramForm: PropTypes.func
}

export default ProgramNew;