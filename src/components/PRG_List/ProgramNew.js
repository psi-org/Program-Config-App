import React from 'react';
import { useState } from "react";
//import { Modal, ModalTitle, ModalContent, ReactFinalForm, InputFieldFF, SwitchFieldFF, SingleSelectFieldFF, hasValue, InputField, ButtonStrip } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
//import styles from './Program.module.css'
import { Program, PS_AssessmentStage, PS_ActionPlanStage, PSS_Default, PSS_CriticalSteps, PSS_Scores } from './../../configs/ProgramTemplate'

import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import SendIcon from '@mui/icons-material/Send';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import SelectOptions from './../STG_Details/SelectOptions'
import FormHelperText from '@mui/material/FormHelperText';

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
        params: ({ n }) => ({ limit: 6 })
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

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const METADATA = "haUflNqP85K",
    COMPETENCY_ATTRIBUTE = "ulU9KKgSLYe",
    COMPETENCY_CLASS = "NAaHST5ZDTE",
    BUILD_VERSION = "1.3.0";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const BootstrapDialogTitle = (props) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};

BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};

const ProgramNew = (props) => {
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

    const haQuery = useDataQuery(query);
    const haOptions = haQuery.data?.results.optionSets[0].options;

    const idsQuery = useDataQuery(queryId);
    const uidPool = idsQuery.data?.results.codes;

    const [programId, setProgramId] = useState(undefined);
    const [assessmentId, setAssessmentId] = useState(undefined);
    const [actionPlanId, setActionPlanId] = useState(undefined);
    const [defaultSectionId, setDefaultSectionId] = useState(undefined);
    const [stepsSectionId, setStepsSectionId] = useState(undefined);
    const [scoresSectionId, setScoresSectionId] = useState(undefined);

    const [pgrTypePCA, setPgrTypePCA] = useState('');
    const [useCompetency, setUseCompetency] = useState(false);
    const [healthArea, setHealthArea] = useState('');
    const [dePrefix, setDePrefix] = useState('');
    const [programName, setProgramName] = useState('');
    const [programShortName, setProgramShortName] = useState('');
    const [sentForm, setSentForm] = useState(false);

    const handleChangePgrType = (event) => {
        setPgrTypePCA(event.target.value);
    };

    const handleChangeDePrefix = (event) => {
        setDePrefix(event.target.value);
    };

    const handleChangeProgramName = (event) => {
        setProgramName(event.target.value);
    };

    const handleChangeProgramShortName = (event) => {
        setProgramShortName(event.target.value);
    };

    const handleChangeComp = (event) => {
        setUseCompetency(event.target.checked);
    };

    const healthAreaChange = (event) => setHealthArea(event.target.value)

    let healthAreaOptions = [];
    if (haOptions) {
        healthAreaOptions = healthAreaOptions.concat(haOptions.map(op => {
            return { label: op.name, value: op.code }
        }));
    }
    if (uidPool && uidPool.length===6) {
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

    const formDataIsValid = () =>{
        return programName!=='' && programShortName!=='' && pgrTypePCA!==''
                && dePrefix!='' && ((pgrTypePCA==='hnqis' && healthArea!=='') || (pgrTypePCA==='tracker'));
    }

    function submission() {
        setSentForm(true)
        props.setNotification(undefined)
        //let prgTypeId = 'yB5tFAAN7bI';
        if (!metadataRequest.called && formDataIsValid()) {
            let prgrm = Program;

            prgrm.name = programName;
            prgrm.shortName = programShortName;
            prgrm.id = programId;

            prgrm.attributeValues.push({
                "value": "HNQIS2",
                "attribute": { "id": prgTypeId }
            });

            createOrUpdateMetaData(prgrm.attributeValues);
            prgrm.programStages.push({ id: assessmentId });
            prgrm.programStages.push({ id: actionPlanId });

            let assessmentStage = PS_AssessmentStage;
            assessmentStage.id = assessmentId;
            assessmentStage.name = dePrefix + '_' + assessmentStage.name;
            assessmentStage.programStageSections.push({ id: defaultSectionId });
            assessmentStage.programStageSections.push({ id: stepsSectionId });
            assessmentStage.programStageSections.push({ id: scoresSectionId });
            assessmentStage.program.id = programId;

            let actionPlanStage = PS_ActionPlanStage;
            actionPlanStage.id = actionPlanId;
            actionPlanStage.name = dePrefix + '_' + actionPlanStage.name;
            actionPlanStage.program.id = programId;

            let defaultSection = PSS_Default;
            defaultSection.id = defaultSectionId;
            defaultSection.programStage.id = assessmentId;
            //defaultSection.name = defaultSection.name

            let criticalSteps = PSS_CriticalSteps;
            criticalSteps.id = stepsSectionId;
            criticalSteps.programStage.id = assessmentId;
            //criticalSteps.name = criticalSteps.name

            let scores = PSS_Scores;
            scores.id = scoresSectionId;
            scores.name = scores.name;
            scores.programStage.id = assessmentId;

            if (!useCompetency) {
                removeCompetencyAttribute(prgrm.programTrackedEntityAttributes);
                removeCompetencyClass(criticalSteps.dataElements);
            }

            let metadata = {
                programs: [prgrm],
                //programStages: [assessmentStage, actionPlanStage],
                programStageSections: [defaultSection, criticalSteps, scores]
            }

            metadataRequest.mutate({ data: metadata }).then(response => {
                if (response.status != 'OK') {
                    props.setNotification({
                        message: response.typeReports[0].objectReports[0].errorReports.map(er => er.message).join(' | '),
                        severity: 'error'
                    })
                    props.setShowProgramForm(false);
                }else{
                    props.setNotification({message: `Program ${prgrm.name} created successfully`, severity: 'success'})
                    props.setShowProgramForm(false);
                    props.programsRefetch();
                }
            })
        }
    }

    function createOrUpdateMetaData(attributeValues) {
        let metaDataArray = attributeValues.filter(av => av.attribute.id === METADATA);
        if (metaDataArray.length > 0) {

            let metaData_value = JSON.parse(metaDataArray[0].value);
            metaData_value.buildVersion = BUILD_VERSION;
            metaData_value.useCompetencyClass = useCompetency ? 'Yes' : 'No';
            metaData_value.dePrefix = dePrefix;
            metaData_value.healthArea = healthArea;
            metaDataArray[0].value = JSON.stringify(metaData_value);
        }
        else {
            let attr = { id: METADATA };
            let val = { buildVersion: BUILD_VERSION, useCompetencyClass: useCompetency, dePrefix: dePrefix, healthArea: healthArea };
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
        <BootstrapDialog open={true} maxWidth='md' fullWidth={true} >
            <BootstrapDialogTitle style={{ padding: '1em 2em' }} id="customized-dialog-title" onClose={() => hideForm()}>
                Create New Program
            </BootstrapDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControl sx={{ minWidth: '30%' }} error={sentForm && pgrTypePCA==''}>
                        <InputLabel id="label-prgType">Program Type</InputLabel>
                        <Select
                            labelId="label-prgType"
                            id="prgTypePCA"
                            value={pgrTypePCA}
                            onChange={handleChangePgrType}
                            label="Config App Mode"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={'tracker'} disabled>Tracker Program</MenuItem>
                            <MenuItem value={'hnqis'}>HNQIS</MenuItem>
                        </Select>
                        <FormHelperText>{sentForm && pgrTypePCA=='' ? 'This field is required' : ''}</FormHelperText>
                    </FormControl>
                    <FormControl sx={{ minWidth: '65%' }}>
                        <TextField
                            error={sentForm && dePrefix==''}
                            helperText={sentForm && dePrefix=='' ? 'This field is required' : ''}
                            margin="normal"
                            id="prefix"
                            label="Program Data Element Prefix"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={dePrefix}
                            onChange={handleChangeDePrefix}
                        />
                    </FormControl>
                </div>
                <TextField
                    error={sentForm && programName==''}
                    helperText={sentForm && programName=='' ? 'This field is required' : ''}
                    margin="normal"
                    id="name"
                    label="Program Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={programName}
                    onChange={handleChangeProgramName}
                />
                <TextField
                    error={sentForm && programShortName==''}
                    helperText={sentForm && programShortName=='' ? 'This field is required' : ''}
                    margin="normal"
                    id="shortName"
                    label="Program Short Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={programShortName}
                    onChange={handleChangeProgramShortName}
                />
                {pgrTypePCA === 'hnqis' &&
                    <FormControl margin="normal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                        <FormControlLabel
                            control={
                                <Switch checked={useCompetency} onChange={handleChangeComp} name="competency" />
                            }
                            label="Use Competency Class"
                        />
                        <SelectOptions
                            useError={sentForm && healthArea==''}
                            helperText={sentForm && healthArea=='' ? 'This field is required' : ''}
                            label={'Program Health Area'}
                            items={healthAreaOptions}
                            handler={healthAreaChange}
                            styles={{ width: '70%' }}
                            value={healthArea}
                            defaultOption='Select Health Area'
                        />
                    </FormControl>
                }
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button onClick={() => hideForm()} color="error" > Close </Button>
                <Button onClick={() => submission()} variant='outlined' startIcon={<SendIcon />}> Submit </Button>
            </DialogActions>
        </BootstrapDialog>
    </>
}

export default ProgramNew;