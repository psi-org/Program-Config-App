import React from 'react';
import { useState, useEffect } from "react";
import { Transfer } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
//import styles from './Program.module.css'
import { Program, PS_AssessmentStage, PS_ActionPlanStage, PSS_Default, PSS_CriticalSteps, PSS_Scores } from './../../configs/ProgramTemplate'

import { METADATA, COMPETENCY_ATTRIBUTE, COMPETENCY_CLASS, BUILD_VERSION, MAX_PREFIX_LENGTH, MAX_PROGRAM_NAME_LENGTH, MIN_NAME_LENGTH, MAX_SHORT_NAME_LENGTH } from './../../configs/Constants';

import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import SendIcon from '@mui/icons-material/Send';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SelectOptions from '../UIElements/SelectOptions';
import FormHelperText from '@mui/material/FormHelperText';
import LoadingButton from '@mui/lab/LoadingButton';
import { FormLabel } from '@mui/material';
import StyleManager from '../UIElements/StyleManager';
import { DeepCopy } from '../../configs/Utils';
import { VolunteerActivismOutlined } from '@mui/icons-material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Tooltip from '@mui/material/Tooltip';


//const { Form, Field } = ReactFinalForm

const query = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['options[code,name]'],
            filter: ['id:eq:y752HEwvCGi']
        }
    }
};

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 6 }
    }
};

const queryProgramType = {
    results: {
        resource: 'attributes',
        params: {
            fields: ['id'],
            filter: ['code:eq:PROGRAM_TYPE']
        }
    }
};

const queryTEType = {
    results: {
        resource: 'trackedEntityTypes',
        params: {
            fields: ['id', 'name'],
            paging: false
        }
    }
};

const queryTEAttributes = {
    results: {
        resource: 'trackedEntityAttributes',
        params: {
            fields: ['id', 'name', 'valueType'],
            paging: false
        }
    }
};

const queryCatCombos = {
    results: {
        resource: 'categoryCombos',
        params: {
            fields: ['id', 'name'],
            filter: ['dataDimensionType:eq:ATTRIBUTE'],
            paging: false
        }
    }
};

const queryAvailablePrefix = {
    results: {
        resource: 'programs',
        params: ({ dePrefix, program }) => ({
            fields: ['id'],
            filter: [`attributeValues.value:like:"dePrefix":"${dePrefix}"`, `name:!eq:${program}`]
        })
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const hnqisProgramConfigs = {
    "trackedEntityType": { "id": "oNwpeWkfoWc" },
    "attributeValues": [
        {
            "attribute": { "id": "haUflNqP85K" },
            "value": "{\"buildVersion\":\"1.1\",\"useCompetencyClass\":\"Yes\",\"dePrefix\":\"programDEPrefix\"}"
        }
    ],
    "programTrackedEntityAttributes": [
        {
            "trackedEntityAttribute": { "id": "Xe5hUu6KkUT" },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 1
        },
        {
            "trackedEntityAttribute": { "id": "nHg1hGgtJwm" },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 2
        },
        {
            "trackedEntityAttribute": { "id": "UlUYUyZJ6o9" },
            "mandatory": false,
            "valueType": "DATE",
            "searchable": true,
            "displayInList": true,
            "sortOrder": 3
        },
        {
            "trackedEntityAttribute": { "id": "NQdpdST0Gcx" },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": true,
            "sortOrder": 4
        },
        {
            "trackedEntityAttribute": { "id": "ulU9KKgSLYe" },
            "mandatory": false,
            "valueType": "TEXT",
            "searchable": false,
            "displayInList": false,
            "sortOrder": 5
        }
    ],
    "userGroupAccesses": []
}

const ProgramNew = (props) => {

    const h2Ready = localStorage.getItem('h2Ready') === 'true'

    // Create Mutation
    let metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };

    const prgTypeQuery = useDataQuery(queryProgramType);
    const prgTypeId = prgTypeQuery.data?.results.attributes[0].id;

    const { data: haQuery, refetch: findHealthAreas } = useDataQuery(query, { lazy: true });



    const [haOptions, setHaOptions] = useState();






    const idsQuery = useDataQuery(queryId);
    const uidPool = idsQuery.data?.results.codes;

    const teTypeQuery = useDataQuery(queryTEType);
    const trackedEntityTypes = teTypeQuery.data?.results.trackedEntityTypes;

    const { data: trackedEntityAttributes, refetch: findTEAttributes } = useDataQuery(queryTEAttributes, { lazy: true });
    const { data: categoryCombos, refetch: findCategoryCombos } = useDataQuery(queryCatCombos, { lazy: true });
    const { data: existingPrefixes, refetch: checkForExistingPrefix } = useDataQuery(queryAvailablePrefix, { lazy: true, variables: { dePrefix: undefined, program:undefined } });

    const [programId, setProgramId] = useState(props.data?.id);
    const [assessmentId, setAssessmentId] = useState(undefined);
    const [actionPlanId, setActionPlanId] = useState(undefined);
    const [defaultSectionId, setDefaultSectionId] = useState(undefined);
    const [stepsSectionId, setStepsSectionId] = useState(undefined);
    const [scoresSectionId, setScoresSectionId] = useState(undefined);

    const [programIcon, setProgramIcon] = useState(props.data?.style?.icon || '')
    const [programColor, setProgramColor] = useState(props.data?.style?.color)
    const [pgrTypePCA, setPgrTypePCA] = useState(props.programType || '');
    const [programTET, setProgramTET] = useState(props.data ? { label: props.data.trackedEntityType.name, id: props.data.trackedEntityType.id } : '');
    const [useCompetency, setUseCompetency] = useState(props.pcaMetadata?.useCompetencyClass === 'Yes');
    const [healthArea, setHealthArea] = useState(props.pcaMetadata?.healthArea || '');
    const [dePrefix, setDePrefix] = useState(props.pcaMetadata?.dePrefix || '');
    const [programName, setProgramName] = useState(props.data?.name || '');
    const [programShortName, setProgramShortName] = useState(props.data?.shortName || '');
    const [sentForm, setSentForm] = useState(false);
    const [programTEAs, setProgramTEAs] = useState({ available: [], selected: [] })
    const [programCategoryCombos, setProgramCategoryCombos] = useState([{ name: 'Select an option', id: '' }])
    const [categoryCombo, setCategoryCombo] = useState(props.data ? { label: props.data.categoryCombo.name, id: props.data.categoryCombo.id } : '')

    //Validation Messages
    const [validationErrors, setValidationErrors] = useState(
        {
            pgrType: undefined,
            prefix: undefined,
            programName: undefined,
            shortName: undefined,
            programTET: undefined,
            healthArea: undefined
        });

    const handleChangePgrType = (event) => {
        validationErrors.pgrType = undefined
        validationErrors.programTET = undefined
        validationErrors.healthArea = undefined
        setValidationErrors({ ...validationErrors })
        let value = event.target.value
        setPgrTypePCA(value);
        if (value === 'hnqis') {
            let hnqisTET = trackedEntityTypes.find(tet => tet.id === "oNwpeWkfoWc")
            setProgramTET({ label: hnqisTET.name, id: hnqisTET.id })
            findHealthAreas().then(data => {
                if (data?.results?.optionSets[0].options) {
                    setHaOptions(data?.results?.optionSets[0].options)
                }
            })
        } else {
            setProgramTET('')
            if (value === 'tracker') {
                fetchTrackerMetadata()
            }
        }
    };

    const handleChangeDePrefix = (event) => {
        validationErrors.prefix = undefined
        setValidationErrors({ ...validationErrors })
        setDePrefix(event.target.value);
    };

    const handleChangeProgramName = (event) => {
        validationErrors.programName = undefined
        setValidationErrors({ ...validationErrors })
        setProgramName(event.target.value);
    };

    const handleChangeProgramShortName = (event) => {
        validationErrors.shortName = undefined
        setValidationErrors({ ...validationErrors })
        setProgramShortName(event.target.value);
    };

    const programTETChange = (event, value) => {
        if (value) {
            validationErrors.programTET = undefined
            setValidationErrors({ ...validationErrors })
        }
        setProgramTET(value || '')
    }

    const categoryComboChange = (event, value) => {
        setCategoryCombo(value || '');
    }

    const handleChangeComp = (event) => {
        setUseCompetency(event.target.checked);
    };

    const healthAreaChange = (event) => {
        validationErrors.healthArea = undefined
        setValidationErrors({ ...validationErrors })
        setHealthArea(event.target.value);
    }

    const handleChangeTEAs = (res) => {
        programTEAs.selected = res.selected
        setProgramTEAs(DeepCopy(programTEAs))
    }

    let healthAreaOptions = [];

    if (haOptions) {
        healthAreaOptions = healthAreaOptions.concat(haOptions.map(op => {
            return { label: op.name, value: op.code }
        }));
    }

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

        if (pgrTypePCA === '') {
            response = false
            validationErrors.pgrType = 'This field is required'
        } else {
            validationErrors.pgrType = undefined
        }

        if (dePrefix === '') {
            response = false
            validationErrors.prefix = 'This field is required'
        } else if (dePrefix.length > MAX_PREFIX_LENGTH) {
            response = false
            validationErrors.prefix = `This field cannot exceed ${MAX_PREFIX_LENGTH} characters`
        } else {
            validationErrors.prefix = undefined
        }

        if (programName === '') {
            response = false
            validationErrors.programName = 'This field is required'
        } else if (programName.length < MIN_NAME_LENGTH || programName.length > (MAX_PROGRAM_NAME_LENGTH - (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1)) {
            response = false
            validationErrors.programName = `This field must contain between ${MIN_NAME_LENGTH} and ${(MAX_PROGRAM_NAME_LENGTH - (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1)} characters`
        } else {
            validationErrors.programName = undefined
        }

        if (programShortName === '') {
            response = false
            validationErrors.shortName = 'This field is required'
        } else if (programShortName.length > (MAX_SHORT_NAME_LENGTH - (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1)) {
            response = false
            validationErrors.shortName = `This field cannot exceed ${(MAX_SHORT_NAME_LENGTH - (dePrefix ? dePrefix.length : MAX_PREFIX_LENGTH) - 1)} characters`
        } else {
            validationErrors.shortName = undefined
        }

        if (programTET === '') {
            response = false
            validationErrors.programTET = 'This field is required'
        } else {
            validationErrors.programTET = undefined
        }

        if (pgrTypePCA !== 'tracker' && (pgrTypePCA === 'hnqis' && healthArea === '')) {
            response = false
            validationErrors.healthArea = 'This field is required'
        } else {
            validationErrors.healthArea = undefined
        }

        setValidationErrors({ ...validationErrors })

        return response;
    }

    const fetchTrackerMetadata = () => {
        findTEAttributes().then(data => {
            if (data?.results?.trackedEntityAttributes) {
                programTEAs.available = data.results.trackedEntityAttributes
                programTEAs.selected = props.data?.programTrackedEntityAttributes?.map(tea => tea.trackedEntityAttribute.id) || []
                setProgramTEAs({ ...programTEAs })
            }
        })

        findCategoryCombos().then(ccdata => {
            if (ccdata?.results?.categoryCombos) setProgramCategoryCombos(ccdata.results.categoryCombos)
        })
    }

    useEffect(() => {
        if (props.programType === 'tracker') {
            fetchTrackerMetadata()
        }
    }, [])


    function submission() {
        setSentForm(true)
        props.setNotification(undefined)
        //let prgTypeId = 'yB5tFAAN7bI';
        let dataIsValid = formDataIsValid()
        if (!dataIsValid) {
            setSentForm(false)
            return
        }

        //Validating available prefix
        checkForExistingPrefix({dePrefix, program: (props.data?.name || ' ')}).then(data => {
            if(data.results?.programs.length>0){
                validationErrors.prefix = `The specified Data Element Prefix is already in use`
                setValidationErrors({ ...validationErrors })
                setSentForm(false)
                return
            }

            if (!metadataRequest.called && dataIsValid) {

                let prgrm = props.data?DeepCopy(props.data):DeepCopy(Program);
                let programStages = undefined;
                let programStageSections = undefined;
    
                prgrm.name = programName;
                prgrm.shortName = programShortName;
                prgrm.id = programId;
    
                prgrm.style = {}
                if (programIcon) prgrm.style.icon = programIcon
                if (programColor) prgrm.style.color = programColor
    
                if (pgrTypePCA === 'hnqis') {
                    //HNQIS2 Programs
                    let assessmentStage = undefined;
                    let actionPlanStage = undefined;

                    let criticalSteps = undefined;
                    let defaultSection = undefined;
                    let scores = undefined;
    
                    if (!props.data) {
                        Object.assign(prgrm, hnqisProgramConfigs)
                        prgrm.attributeValues.push({
                            "value": "HNQIS2",
                            "attribute": { "id": prgTypeId }
                        });
                        prgrm.programStages.push({ id: assessmentId });
                        prgrm.programStages.push({ id: actionPlanId });
    
                        assessmentStage = DeepCopy(PS_AssessmentStage);
                        assessmentStage.id = assessmentId;
                        assessmentStage.name = assessmentStage.name;
                        assessmentStage.programStageSections.push({ id: defaultSectionId });
                        assessmentStage.programStageSections.push({ id: stepsSectionId });
                        assessmentStage.programStageSections.push({ id: scoresSectionId });
                        assessmentStage.program.id = programId;
    
                        actionPlanStage = DeepCopy(PS_ActionPlanStage);
                        actionPlanStage.id = actionPlanId;
                        actionPlanStage.name = actionPlanStage.name;
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
                        removeCompetencyAttribute(prgrm.programTrackedEntityAttributes);
                        //Fix required here v
                        if (props.data) {
                            criticalSteps = prgrm.programStages.map(pStage => pStage.programStageSections
                            ).flat().find(section =>
                                section.dataElements.find(de => de.id === "VqBfZjZhKkU")
                            )
                        }
    
                        prgrm.programStages = prgrm.programStages.map(ps => ({id:ps.id}))
    
                        removeCompetencyClass(criticalSteps.dataElements);
                    }else if (useCompetency && props.data) {
                        criticalSteps = prgrm.programStages.map(pStage => pStage.programStageSections
                        ).flat().find(section =>
                            section.dataElements.find(de => de.id === "VqBfZjZhKkU")
                        )
                        criticalSteps.dataElements = [
                            {id: "VqBfZjZhKkU"},
                            {id: "pzWDtDUorBt"},
                            {id: "NAaHST5ZDTE"}
                        ]
                    }
    
                    createOrUpdateMetaData(prgrm.attributeValues);
    
                    if (!props.data) {
                        programStages = [assessmentStage, actionPlanStage]
                        programStageSections = [defaultSection, criticalSteps, scores]
                    } else {
                        programStageSections = criticalSteps?[criticalSteps]:undefined
                    }
    
                } else {
                    //Tracker Programs
                    prgrm.trackedEntityType = { "id": programTET.id }
                    prgrm.programTrackedEntityAttributes = []
                    prgrm.attributeValues = []
                    prgrm.categoryCombo = categoryCombo !== '' ? { id: categoryCombo.id } : undefined
                    programTEAs.selected.forEach((selectedTEA, index) => {
                        let newTEA = programTEAs.available.find(tea => tea.id === selectedTEA)
                        prgrm.programTrackedEntityAttributes.push({
                            trackedEntityAttribute: { id: newTEA.id },
                            mandatory: false,
                            valueType: newTEA.valueType,
                            searchable: false,
                            displayInList: true,
                            sortOrder: (index + 1)
                        })
                    })
    
                    createOrUpdateMetaData(prgrm.attributeValues);
                }
    
                // If editing only send program
                let metadata = props.data
                    ? {
                        programs: [prgrm],
                        programStageSections: programStageSections
                    } : {
                        programs: [prgrm],
                        programStages,
                        programStageSections
                    }
    
                metadataRequest.mutate({ data: metadata }).then(response => {
                    if (response.status != 'OK') {
                        props.setNotification({
                            message: response.typeReports[0].objectReports[0].errorReports.map(er => er.message).join(' | '),
                            severity: 'error'
                        });
                        props.setShowProgramForm(false);
                    } else {
                        props.setNotification({ message: `Program ${prgrm.name} ${!props.data ? 'created' : 'updated'} successfully`, severity: 'success' });
                        props.setShowProgramForm(false);
                        props.programsRefetch();
                        props.doSearch(prgrm.name);
                    }
                })
            }

        })
    }

    function createOrUpdateMetaData(attributeValues) {
        let metaDataArray = attributeValues.filter(av => av.attribute.id === METADATA);
        if (metaDataArray.length > 0) {

            let metaData_value = JSON.parse(metaDataArray[0].value);
            metaData_value.buildVersion = BUILD_VERSION;
            if (pgrTypePCA === 'hnqis') {
                metaData_value.useCompetencyClass = useCompetency ? 'Yes' : 'No';
                metaData_value.healthArea = healthArea;
            }
            metaData_value.dePrefix = dePrefix;
            metaDataArray[0].value = JSON.stringify(metaData_value);
        }
        else {
            let attr = { id: METADATA };
            let val = { buildVersion: BUILD_VERSION, dePrefix: dePrefix };
            if (pgrTypePCA === 'hnqis') {
                val.useCompetencyClass = useCompetency
                val.healthArea = healthArea
            }
            let attributeValue = { attribute: attr, value: JSON.stringify(val) }
            attributeValues.push(attributeValue);
        }
    }

    function removeCompetencyAttribute(programTrackedEntityAttributes) {
        const index = programTrackedEntityAttributes.findIndex(attr => {
            return attr.trackedEntityAttribute.id === COMPETENCY_ATTRIBUTE
        });
        programTrackedEntityAttributes.splice(index, 1);
    }

    function removeCompetencyClass(dataElements) {
        const index = dataElements.findIndex(de => {
            return de.id === COMPETENCY_CLASS;
        })
        dataElements.splice(index, 1);
    }

    return <>
        <CustomMUIDialog open={true} maxWidth='md' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                {props.data?('Edit Program '+props.data.name):'Create New Program'}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControl sx={{ minWidth: '30%' }} error={validationErrors.pgrType !== undefined}>
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
                            <MenuItem value={'tracker'}>Tracker Program</MenuItem>
                            <MenuItem disabled={!h2Ready} value={'hnqis'}>HNQIS 2.0 {!h2Ready && <span style={{display:'flex', alignItems: 'center', marginLeft:'8px'}}>[Unavailable] <RemoveCircleOutlineIcon/></span>}</MenuItem>
                        </Select>
                        <FormHelperText>{validationErrors.pgrType}</FormHelperText>
                    </FormControl>
                    <FormControl sx={{ minWidth: '65%' }}>
                        <TextField
                            error={validationErrors.prefix !== undefined}
                            helperText={validationErrors.prefix}
                            margin="normal"
                            id="prefix"
                            label="Program Data Element Prefix (*)"
                            type="text"
                            fullWidth
                            variant="standard"
                            autoComplete='off'
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
                    autoComplete='off'
                    value={programName}
                    onChange={handleChangeProgramName}
                />
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        error={validationErrors.shortName !== undefined}
                        helperText={validationErrors.shortName}
                        margin="normal"
                        id="shortName"
                        label="Program Short Name (*)"
                        type="text"
                        sx={{ width: '48%' }}
                        variant="standard"
                        autoComplete='off'
                        value={programShortName}
                        onChange={handleChangeProgramShortName}
                    />
                    <Autocomplete
                        id="tetSelect"
                        disabled={pgrTypePCA !== 'tracker'}
                        options={trackedEntityTypes?.map(tet => ({ label: tet.name, id: tet.id })) || [{ label: '', id: '' }]}
                        sx={{ width: '48%' }}
                        renderInput={(params) => <TextField
                            {...params}
                            error={validationErrors.programTET !== undefined}
                            label="Tracked Entity Type (*)"
                            margin='normal'
                            variant="standard"
                            helperText={validationErrors.programTET} />}
                        value={programTET}
                        onChange={programTETChange}
                        getOptionLabel={(option) => (option.label || '')}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        defaultValue={''}
                    />
                </div>
                <StyleManager
                    icon={programIcon}
                    setIcon={setProgramIcon}
                    color={programColor}
                    setColor={setProgramColor}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', width: '100%', minHeight: '5em', marginTop: '1em' }}
                />
                {pgrTypePCA === 'hnqis' &&
                    <FormControl margin="dense" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <FormControlLabel
                            control={
                                <Switch checked={useCompetency} onChange={handleChangeComp} name="competency" />
                            }
                            label="Use Competency Class"
                        />
                        <SelectOptions
                            useError={validationErrors.healthArea !== undefined}
                            helperText={validationErrors.healthArea}
                            label={'Program Health Area (*)'}
                            items={healthAreaOptions}
                            handler={healthAreaChange}
                            styles={{ width: '70%' }}
                            value={healthArea}
                            defaultOption='Select Health Area'
                        />
                    </FormControl>
                }
                {pgrTypePCA === 'tracker' &&
                    <>
                        <FormControl sx={{ minWidth: '100%' }} error={validationErrors.categoryCombo !== undefined}>
                            <Autocomplete
                                id="ccSelect"
                                disabled={pgrTypePCA !== 'tracker'}
                                options={programCategoryCombos?.map(pcc => ({ label: pcc.name, id: pcc.id }))}
                                sx={{ width: '100%' }}
                                renderInput={(params) => <TextField
                                    {...params}
                                    error={validationErrors.categoryCombo !== undefined}
                                    label="Category Combination"
                                    variant="standard"
                                    margin="dense"
                                    helperText={validationErrors.categoryCombo} />
                                }
                                value={categoryCombo}
                                onChange={categoryComboChange}
                                getOptionLabel={(option) => (option.label || '')}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                defaultValue={'default'}
                            />
                        </FormControl>
                        <div style={{ marginTop: '1.5em' }}>
                            <FormLabel style={{ display: 'inline-block', marginBottom: '8px' }}>Program Tracked Entity Attributes</FormLabel>
                            <Transfer
                                filterable
                                onChange={handleChangeTEAs}
                                options={programTEAs.available.map(tea => ({
                                    label: tea.name,
                                    value: tea.id
                                }))}
                                selected={programTEAs.selected}
                                optionsWidth='48%'
                                selectedWidth='48%'
                            />
                        </div>
                    </>
                }
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button onClick={() => hideForm()} color="error" > Close </Button>
                <LoadingButton
                    onClick={() => submission()}
                    loading={sentForm}
                    variant='outlined'
                    loadingPosition="start"
                    startIcon={<SendIcon />} >
                    Submit
                </LoadingButton>
            </DialogActions>
        </CustomMUIDialog>
    </>
}

export default ProgramNew;