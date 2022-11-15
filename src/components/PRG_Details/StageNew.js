import React from 'react';
import { useState } from "react";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { PERIOD_TYPES, FEATURE_TYPES, METADATA, MAX_STAGE_NAME_LENGTH, BUILD_VERSION, MIN_DESCRIPTION_LENGTH, REPORT_DATE_TO_USE } from '../../configs/Constants';
//import styles from './Program.module.css'
import { PS_Generic } from './../../configs/ProgramTemplate';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import SendIcon from '@mui/icons-material/Send';
import FormControlLabel from '@mui/material/FormControlLabel';
import SelectOptions from '../UIElements/SelectOptions';
import LoadingButton from '@mui/lab/LoadingButton';
import { parseErrorsJoin } from '../../configs/Utils';

//const { Form, Field } = ReactFinalForm

const queryId = {
    results: {
        resource: 'system/id.json',
        params: () => ({ limit: 1 })
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const StageNew = (props) => {
    // Create Mutation
    let metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            console.error(err.details);
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: 'error'
            });
            props.setShowStageForm(false);
        }
    });
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };

    const idsQuery = useDataQuery(queryId);
    const stageUid = props.data?.id || idsQuery.data?.results.codes[0];

    const [programId, setProgramId] = useState(props.programId);
    const [sentForm, setSentForm] = useState(false);

    const [stageName, setStageName] = useState(props.data?.name || '');
    const [scheduledDaysStart, setScheduledDaysStart] = useState(props.data?.minDaysFromStart ?? '');

    const [description, setDescription] = useState(props.data?.description || '');
    const [repeatable, setRepeatable] = useState(props.data?.repeatable ?? false);
    const [periodType, setPeriodType] = useState(props.data?.periodType || '');
    const [displayGenerateEventBox, setDisplayGenerateEventBox] = useState(props.data?.displayGenerateEventBox ?? true);
    const [autoGenerate, setAutogenerate] = useState(props.data?.autoGenerateEvent ?? true);
    const [openFormAfterEnroll, setOpenFormAfterEnroll] = useState(props.data?.openAfterEnrollment ?? false);
    const [reportDateToUse, setReportDateToUse] = useState(props.data?.reportDateToUse || '');
    const [askCompleteProgram, setAskCompleteProgram] = useState(props.data?.remindCompleted ?? false);
    const [askCreateEvent, setAskCreateEvent] = useState(props.data?.allowGenerateNextVisit ?? false);
    const [featureType, setFeatureType] = useState(props.data?.featureType || '');

    //Validation Messages
    const [validationErrors, setValidationErrors] = useState(
        {
            stageName: undefined,
            scheduledDaysStart: undefined,
            description: undefined
        });

    const handleChangeStageName = (event) => {
        validationErrors.stageName = undefined
        setValidationErrors({ ...validationErrors })
        setStageName(event.target.value);
    };

    const handleChangeScheduledDaysStart = (event) => {
        validationErrors.scheduledDaysStart = undefined
        setValidationErrors({ ...validationErrors })
        setScheduledDaysStart(parseInt(event.target.value) || 0);
    };

    const handleChangeDescription = (event) => {
        setDescription(event.target.value);
    };

    const handleChangeRepeatable = (event) => {
        setRepeatable(event.target.checked);
    };

    const handleChangeDisplayGenerateEventBox = (event) => {
        setDisplayGenerateEventBox(event.target.checked);
    };

    const handleChangeAutoGenerate = (event) => {
        setAutogenerate(event.target.checked);
    };

    const handleChangeOpenAfterEnroll = (event) => {
        setOpenFormAfterEnroll(event.target.checked);
    };

    const periodTypeChange = (event) => {
        setPeriodType(event.target.value);
    }

    const reportDateChange = (event) => {
        setReportDateToUse(event.target.value);
    }

    const handleChangeAskCompleteProgram = (event) => {
        setAskCompleteProgram(event.target.checked);
    };

    const handleChangeAskCreateEvent = (event) => {
        setAskCreateEvent(event.target.checked);
    };

    const featureTypeChange = (event) => {
        setFeatureType(event.target.value);
    }

    function hideForm() {
        props.setShowStageForm(false);
    }

    const formDataIsValid = () => {

        let response = true;

        if (stageName.trim() === '') {
            response = false
            validationErrors.stageName = 'This field is required'
        }else if (stageName.length > MAX_STAGE_NAME_LENGTH) {
            response = false
            validationErrors.stageName = `This field cannot exceed ${MAX_STAGE_NAME_LENGTH} characters`
        } else {
            validationErrors.stageName = undefined
        }

        if (scheduledDaysStart.trim() === '') {
            response = false
            validationErrors.scheduledDaysStart = 'This field is required'
        } else if (scheduledDaysStart < 0) {
            response = false
            validationErrors.scheduledDaysStart = 'This field must be equal or greater than 0'
        } else {
            validationErrors.scheduledDaysStart = undefined
        }

        if (description!=='' && description.length < MIN_DESCRIPTION_LENGTH) {
            response = false
            validationErrors.description = `This field must contain at least ${MIN_DESCRIPTION_LENGTH} characters`
        } else {
            validationErrors.description = undefined
        }

        setValidationErrors({ ...validationErrors })

        return response;
    }

    function submission() {
        setSentForm(true)
        props.setNotification(undefined)
        //let prgTypeId = 'yB5tFAAN7bI';
        let dataIsValid = formDataIsValid()
        if (!dataIsValid) {
            setSentForm(false)
            return
        }
        if (!metadataRequest.called && dataIsValid) {

            let stage = JSON.parse(JSON.stringify(PS_Generic))
            stage.id = props.data?.id ?? stageUid
            stage.name = stageName
            if (description) stage.description = description
            stage.program.id = programId
            stage.minDaysFromStart = scheduledDaysStart
            stage.repeatable = repeatable
            stage.periodType = periodType
            stage.displayGenerateEventBox = displayGenerateEventBox
            stage.autoGenerateEvent = autoGenerate
            if (openFormAfterEnroll) stage.openAfterEnrollment = openFormAfterEnroll
            if (openFormAfterEnroll) stage.reportDateToUse = reportDateToUse
            stage.remindCompleted = askCompleteProgram
            stage.allowGenerateNextVisit = askCreateEvent
            if (featureType) stage.featureType = featureType

            /* KEEP EXISTING VALUES FOR: */
            if(props.data?.attributeValues) stage.attributeValues = props.data.attributeValues
            if(props.data?.programStageSections) stage.programStageSections = props.data.programStageSections
            if(props.data?.programStageDataElements) stage.programStageDataElements = props.data.programStageDataElements
            if(props.data?.publicAccess) stage.publicAccess = props.data.publicAccess
            if(props.data?.notificationTemplates) stage.notificationTemplates = props.data.notificationTemplates

            createOrUpdateMetaData(stage.attributeValues)

            let metadata = {
                programStages: [stage]
            }

            metadataRequest.mutate({ data: metadata }).then(response => {
                if (response.status != 'OK') {
                    props.setNotification({
                        message: parseErrorsJoin(response, '\\n'),
                        severity: 'error'
                    });
                    props.setShowStageForm(false);
                } else {
                    props.setNotification({ message: `Program Stage '${stage.name}' ${props.data?.id?'updated':'created'} successfully`, severity: 'success' });
                    props.setShowStageForm(false);
                    props.stagesRefetch();
                    props.setNewStage({stage:stage.id, mode:props.data?.id?'updated':'created'})
                }
            })
        }
    }

    function createOrUpdateMetaData(attributeValues) {
        let metaDataArray = attributeValues.filter(av => av.attribute.id === METADATA);
        if (metaDataArray.length > 0) {
            let metaData_value = JSON.parse(metaDataArray[0].value);
            metaData_value.saveVersion = BUILD_VERSION;
            metaDataArray[0].value = JSON.stringify(metaData_value);
        }
        else {
            let attr = { id: METADATA };
            let val = { saveVersion: BUILD_VERSION };
            let attributeValue = { attribute: attr, value: JSON.stringify(val) }
            attributeValues.push(attributeValue);
        }
    }


    return <>
        <CustomMUIDialog open={true} maxWidth='md' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                {props.data?('Edit Program Stage '+props.data.name):('Create New Program Stage in Program '+props.programName)}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        error={validationErrors.stageName !== undefined}
                        helperText={validationErrors.stageName}
                        margin="normal"
                        id="stageName"
                        label="Program Stage Name (*)"
                        type="text"
                        sx={{ width: '65%' }}
                        fullWidth
                        variant="standard"
                        autoComplete='off'
                        inputProps={{ maxLength: MAX_STAGE_NAME_LENGTH }}
                        value={stageName}
                        onChange={handleChangeStageName}
                    />
                    <TextField
                        error={validationErrors.scheduledDaysStart !== undefined}
                        helperText={validationErrors.scheduledDaysStart}
                        margin="normal"
                        id="scheduledDaysStart"
                        label="Scheduled Days From Start (*)"
                        type="number"
                        inputProps={{ min: 0 }}
                        sx={{ width: '30%' }}
                        fullWidth
                        variant="standard"
                        autoComplete='off'
                        value={scheduledDaysStart}
                        onChange={handleChangeScheduledDaysStart}
                    />
                </div>
                <TextField
                    error={validationErrors.description !== undefined}
                    helperText={validationErrors.description}
                    margin="normal"
                    id="description"
                    label="Description"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete='off'
                    value={description}
                    onChange={handleChangeDescription}
                />
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
                    <div style={{ minWidth: '48%', display: 'flex', flexDirection: 'column' }}>
                        <FormControlLabel 
                            control={<Checkbox checked={repeatable} onChange={handleChangeRepeatable}/>}
                            label="Repeatable Stage"
                            style={{ marginTop: '16px', marginBottom: '8px'}}
                        />
                        <SelectOptions
                            useError={false}
                            label={'Period Type'}
                            items={PERIOD_TYPES}
                            handler={periodTypeChange}
                            value={periodType}
                            defaultOption='<No Value>'
                            styles={{ minWidth: '100%' }}
                        />
                    </div>
                    <div style={{ minWidth: '48%', display: 'flex', flexDirection: 'column' }}>
                        <FormControlLabel 
                            control={<Checkbox checked={displayGenerateEventBox} onChange={handleChangeDisplayGenerateEventBox}/>}
                            label="Display generate event box when completed"
                            style={{ marginTop: '16px', marginBottom: '8px'}}
                        />
                        <SelectOptions
                            useError={false}
                            label={'Feature Type'}
                            items={FEATURE_TYPES}
                            handler={featureTypeChange}
                            styles={{ minWidth: '100%' }}
                            value={featureType}
                            defaultOption='<No Value>'
                        />
                    </div>
                    
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
                    <FormControlLabel 
                        control={<Checkbox checked={autoGenerate} onChange={handleChangeAutoGenerate}/>}
                        label="Auto-generate event"
                    />
                    {autoGenerate &&
                        <>
                            <FormControlLabel 
                                control={<Checkbox checked={openFormAfterEnroll} onChange={handleChangeOpenAfterEnroll}/>}
                                label="Open data entry form after enrollment"
                            />
                            <SelectOptions
                                disabled={!openFormAfterEnroll}
                                useError={false}
                                label={'Report date to use'}
                                items={REPORT_DATE_TO_USE}
                                handler={reportDateChange}
                                styles={{ width: '25%' }}
                                value={reportDateToUse}
                                defaultOption='<No Value>'
                            />
                        </>
                    }
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
                    <FormControlLabel 
                        control={<Checkbox checked={askCompleteProgram} onChange={handleChangeAskCompleteProgram}/>}
                        label="Ask user to complete program when stage is complete"
                    />
                    <FormControlLabel 
                        control={<Checkbox checked={askCreateEvent} onChange={handleChangeAskCreateEvent}/>}
                        label="Ask user to create new event when stage is complete"
                    />
                </div>
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

export default StageNew;