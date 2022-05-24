//MATERIAL UI
import { useDataQuery } from '@dhis2/app-runtime';
import { TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch, Autocomplete, Grid, FormLabel, Button } from '@mui/material';
import { useEffect, useState } from "react"
import { FEEDBACK_TEXT, FEEDBACK_ORDER, MAX_DATA_ELEMENT_NAME_LENGTH, METADATA, MIN_NAME_LENGTH } from '../../configs/Constants';
import RowRadioButtonsGroup from './RowRadioButtonsGroup';

import PercentIcon from '@mui/icons-material/Percent';
import TextIcon from '@mui/icons-material/TextFields';
import NumberIcon from '@mui/icons-material/Numbers';
import DateIcon from '@mui/icons-material/CalendarToday';
import TimeIcon from '@mui/icons-material/AccessTime';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

import SelectOptions from '../UIElements/SelectOptions';
import MarkDownEditor from './MarkDownEditor';
import InfoBox from './../UIElements/InfoBox';

import AlertDialogSlide from '../UIElements/AlertDialogSlide';

import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import FunctionsIcon from '@mui/icons-material/Functions';
import BlockIcon from '@mui/icons-material/Block';
import TimelineIcon from '@mui/icons-material/Timeline';
import SsidChartIcon from '@mui/icons-material/SsidChart';


const optionSetQuery = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['id', 'name', 'options[name]', 'valueType'],
            pageSize: 2000
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        params: {
            fields: ['id', 'name'],
            pageSize: 2000
        }
    }
}

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 1 }
    }
};

const DataElementForm = ({ programStageDataElement, section, setDeToEdit, save, saveFlag = false, setSaveFlag = undefined, hnqisMode }) => {

    const de = programStageDataElement.dataElement

    const idQuery = useDataQuery(queryId);
    const newDeId = idQuery.data?.results.codes[0];

    // Data Query
    const { data: serverOptionSets } = useDataQuery(optionSetQuery);
    const { data: serverLegendSets } = useDataQuery(legendSetsQuery);

    // Constants
    const elemTypes = [{ label: 'Question', value: 'question' }, { label: 'Label', value: 'label' }]
    const valueTypes = [
        { label: 'Number', value: 'NUMBER', icon: <NumberIcon /> },
        { label: 'Integer', value: 'INTEGER', icon: <NumberIcon /> },
        { label: 'Positive Integer', value: 'INTEGER_POSITIVE', icon: <NumberIcon /> },
        { label: 'Zero or Positive Integer', value: 'INTEGER_ZERO_OR_POSITIVE', icon: <NumberIcon /> },
        { label: 'Text', value: 'TEXT', icon: <TextIcon /> },
        { label: 'Long Text', value: 'LONG_TEXT', icon: <TextIcon /> },
        { label: 'Percentage', value: 'PERCENTAGE', icon: <PercentIcon /> },
        { label: 'Date', value: 'DATE', icon: <DateIcon /> },
        { label: 'Time', value: 'TIME', icon: <TimeIcon /> },
    ]
    const aggTypes = [
        { value: 'NONE', label: 'None', icon: <BlockIcon /> },
        { value: 'SUM', label: 'Sum', icon: <FunctionsIcon /> },
        { value: 'AVERAGE', label: 'Average', icon: <TimelineIcon /> },
        { value: 'AVERAGE_SUM_ORG_UNIT', label: 'Average/Sum in org unit hierarchy', icon: <TimelineIcon /> },
        { value: 'COUNT', label: 'Count', icon: <NumberIcon /> },
        { value: 'STDDEV', label: 'Standard deviation', icon: <SsidChartIcon /> },
        { value: 'VARIANCE', label: 'Variance', icon: <SsidChartIcon /> },
        { value: 'MIN', label: 'Min', icon: <RemoveIcon /> },
        { value: 'MAX', label: 'Max', icon: <AddIcon /> }
    ]
    const metadata = JSON.parse(de?.attributeValues.find(att => att.attribute.id === METADATA)?.value || '{}')

    // States
    const [structure, setStructure] = useState(metadata.elemType || 'question')
    const [valueType, setValueType] = useState(de?.valueType || '')
    const [aggType, setAggType] = useState(de?.aggregationType || 'NONE')
    const [formName, setFormName] = useState((metadata.elemType === 'label' ? metadata.labelFormName : de?.formName)?.replace(' [C]', '') || '')
    const [compulsory, setCompulsory] = useState(metadata.isCompulsory === 'Yes')  // metadata.isCompulsory : ['Yes','No']
    const [displayInReports, setDisplayInReports] = useState(programStageDataElement.displayInReports || false)
    const [optionSet, setOptionSet] = useState(de?.optionSet ? { label: de.optionSet.name, id: de.optionSet.id } : null)
    const [legendSet, setLegendSet] = useState(de?.legendSet ? { label: de.legendSet.name, id: de.legendSet.id } : null)
    const [description, setDescription] = useState(de?.description || '')

    const [critical, setCritical] = useState(metadata.isCritical === 'Yes') // metadata.isCritical : ['Yes','No']
    const [numerator, setNumerator] = useState(metadata.scoreNum || '')
    const [denominator, setDenominator] = useState(metadata.scoreDen || '')
    const [feedbackOrder, setFeedbackOrder] = useState(de?.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value || '')
    const [feedbackText, setFeedbackText] = useState(de?.attributeValues.find(att => att.attribute.id === FEEDBACK_TEXT)?.value || '');

    const [dialogStatus, setDialogStatus] = useState(false)

    // Handlers
    const elemTypeChange = (e) => {
        setStructure(e.target.value)
        if (e.target.value === 'label') {
            setValueType('LONG_TEXT')
            setOptionSet(null)
        }
    }

    const closeEditForm = () => setDialogStatus(true)

    //Validations
    const [validationErrors, setValidationErrors] = useState(
        {
            valueType: undefined,
            aggType: undefined,
            formName: undefined,
            numerator: undefined,
            denominator: undefined,
            feedbackOrder: undefined
        });

    const valueTypeChange = (data) => {
        validationErrors.valueType = undefined
        setValidationErrors({ ...validationErrors })
        setValueType(data.target.value)
    }

    useEffect(()=>{
        validationErrors.aggType=undefined
        setValidationErrors({ ...validationErrors })
        switch (valueType) {
            case 'NUMBER':
                setAggType('SUM')
                break;
            case 'INTEGER':
                setAggType('SUM')
                break;
            case 'INTEGER_POSITIVE':
                setAggType('SUM')
                break;
            case 'INTEGER_ZERO_OR_POSITIVE':
                setAggType('SUM')
                break;
            case 'TEXT':
                setAggType('NONE')
                break;
            case 'LONG_TEXT':
                setAggType('NONE')
                break;
            case 'PERCENTAGE':
                setAggType('AVERAGE')
                break;
            case 'DATE':
                setAggType('NONE')
                break;
            case 'TIME':
                setAggType('NONE')
                break;
            default:
                setAggType('')
                break;
        }
    },[valueType])

    const aggTypeChange = (data) => {
        validationErrors.aggType = undefined
        setValidationErrors({ ...validationErrors })
        setAggType(data.target.value)
    }

    const formNameChange = (data) => {
        validationErrors.formName = undefined
        setValidationErrors({ ...validationErrors })
        setFormName(data.target.value)
    }

    const compulsoryChange = (data) => setCompulsory(data.target.checked)

    const displayInReportsChange = (data) => setDisplayInReports(data.target.checked)

    const optionSetChange = (event, value) => {
        if (value) {
            validationErrors.valueType = undefined
            setValidationErrors({ ...validationErrors })
            setValueType(value.valueType)
        }
        setOptionSet(value)
    }

    const legendSetChange = (event, value) => setLegendSet(value)

    const descriptionChange = (data) => setDescription(data.target.value)

    const criticalChange = (data) => setCritical(data.target.checked)

    const numeratorChange = data => {
        validationErrors.numerator = undefined
        validationErrors.denominator = undefined
        validationErrors.feedbackOrder = undefined
        setValidationErrors({ ...validationErrors })
        setNumerator(data.target.value)
    }

    const denominatorChange = data => {
        validationErrors.numerator = undefined
        validationErrors.denominator = undefined
        validationErrors.feedbackOrder = undefined
        setValidationErrors({ ...validationErrors })
        setDenominator(data.target.value)
    }

    const feedbackOrderChange = data => {
        validationErrors.feedbackOrder = undefined
        setValidationErrors({ ...validationErrors })
        setFeedbackOrder(data.target.value)
    }

    const formDataIsValid = () => {

        let response = true;

        if (valueType === '') {
            response = false
            validationErrors.valueType = 'A Value Type or Option Set must be specified'
        } else {
            validationErrors.valueType = undefined
        }

        if (aggType === '') {
            response = false
            validationErrors.aggType = 'This field is required'
        } else {
            validationErrors.aggType = undefined
        }

        if (formName === '') {
            response = false
            validationErrors.formName = 'This field is required'
        } else if (formName.length < MIN_NAME_LENGTH || formName.length > MAX_DATA_ELEMENT_NAME_LENGTH) {
            response = false
            validationErrors.formName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters`
        } else {
            validationErrors.formName = undefined
        }

        if (numerator !== '' && denominator === '') {
            response = false
            validationErrors.denominator = 'This field is also required'
        } else if (denominator === '0') {
            response = false
            validationErrors.denominator = 'The denominator cannot be zero (0)'
        } else {
            validationErrors.denominator = undefined
        }

        if (numerator === '' && denominator !== '') {
            response = false
            validationErrors.numerator = 'This field is also required'
        } else {
            validationErrors.numerator = undefined
        }

        if ((numerator !== '' || denominator !== '') && feedbackOrder === '') {
            response = false
            validationErrors.feedbackOrder = 'This field is also required'
        } else {
            validationErrors.feedbackOrder = undefined
        }

        setValidationErrors({ ...validationErrors })

        return response;
    }

    const callSave = () => {

        // Save new values in local variable de
        let data = JSON.parse(JSON.stringify(de))
        let attributeValues = []
        let metadata = JSON.parse(de?.attributeValues.find(att => att.attribute.id === METADATA)?.value || '{}')

        // Value Type
        data.valueType = valueType
        // Option Set
        if (optionSet) {
            data.optionSetValue = true
            data.optionSet = { id: optionSet.id, name: optionSet.label }
        } else {
            data.optionSetValue = false
            delete data.optionSet
        }
        // Legend set
        data.legendSet = legendSet ? { id: legendSet.id, name: legendSet.label } : undefined
        data.legendSets = legendSet ? [{ id: legendSet.id, name: legendSet.label }] : undefined
        // Description
        data.description = description
        // Form Name
        data.formName = structure === 'question' ? formName : "   "


        // METADATA
        // Elem type
        metadata.elemType = structure
        metadata.isCompulsory = compulsory ? "Yes" : "No"
        metadata.isCritical = critical ? "Yes" : "No"
        if (numerator) metadata.scoreNum = numerator
        if (denominator) metadata.scoreDen = denominator
        if (structure === 'label') metadata.labelFormName = formName

        attributeValues.push({ attribute: { id: METADATA }, value: JSON.stringify(metadata) })

        // FEEDBACK ORDER
        if (feedbackOrder) attributeValues.push({ attribute: { id: FEEDBACK_ORDER }, value: feedbackOrder })
        // FEEDBACK TEXT
        if (feedbackText) attributeValues.push({ attribute: { id: FEEDBACK_TEXT }, value: feedbackText })

        // PROGRAM STAGE DATA ELEMENT
        let stageDataElement = JSON.parse(JSON.stringify(programStageDataElement))
        stageDataElement.displayInReports = displayInReports
        stageDataElement.dataElement = data
        stageDataElement.dataElement.attributeValues = attributeValues

        save(de.id, section, stageDataElement)

    }

    //Handling create New Data Element
    useEffect(() => {
        if (saveFlag && setSaveFlag) {
            if (formDataIsValid()) {
                let optionSetValue = undefined
                let legendSetsValue = []
                let attributes = []

                if (optionSet) {
                    optionSetValue = {
                        name: optionSet.label,
                        id: optionSet.id
                    }
                }

                if (legendSet) {
                    legendSetsValue.push({
                        id: legendSet.id,
                        name: legendSet.label
                    })
                }


                let pcaMetadata = {}
                if(hnqisMode){
                    pcaMetadata = {
                        isCompulsory: compulsory?'Yes':'No',
                        isCritical: critical?'Yes':'No',
                        elemType: structure,
                        varName: '_S0Q0'
                    }

                    if (structure==='label'){
                        pcaMetadata.labelFormName = formName
                    }

                    if (numerator!=='' && denominator!==''){
                        pcaMetadata.scoreNum = numerator
                        pcaMetadata.scoreDen = denominator
                    }
                }else{
                    pcaMetadata = {
                        isCompulsory: compulsory?'Yes':'No',
                        varName: '_S0Q0'
                    }
                }

                attributes.push({
                    value: JSON.stringify(pcaMetadata),
                    attribute: {
                        id: METADATA
                    }
                })

                if (feedbackOrder!==''){
                    attributes.push({
                        value: feedbackOrder,
                        attribute: {
                            id: FEEDBACK_ORDER
                        }
                    })
                }

                if (feedbackText!==''){
                    attributes.push({
                        value: feedbackText,
                        attribute: {
                            id: FEEDBACK_TEXT
                        }
                    })
                }

                let newCreatedDe = {
                    displayInReports: displayInReports,
                    compulsory: compulsory,
                    dataElement: {
                        name: newDeId + "_" + formName,
                        id: newDeId,
                        shortName: (newDeId + "_" + formName).slice(0, 50),
                        aggregationType: aggType,
                        domainType: "TRACKER",
                        displayName: newDeId + "_" + formName,
                        formName: (structure==='label')?'   ':formName,
                        description,
                        valueType: valueType,
                        optionSet: optionSetValue,
                        optionSetValue: optionSetValue!==undefined,
                        attributeValues: attributes,
                        legendSets: legendSetsValue,
                        legendSet : legendSetsValue[0]
                    }
                }
                save(newCreatedDe)
            }
            setSaveFlag(false)
        }
    }, [saveFlag])
    //End New DE

    const aggTypeContent = [
        <div style={{ display: 'flex', width: '100%', marginTop: '0.5em' }}>
            <SelectOptions
                label="Aggregation Type (*)"
                styles={{ width: '100%' }}
                useError={validationErrors.aggType !== undefined}
                helperText={validationErrors.aggType}
                items={aggTypes}
                value={aggType}
                disabled={hnqisMode}
                handler={aggTypeChange}
                defaultOption='Leave Empty'
            />
            <InfoBox
                title='About Aggregation Types'
                message={
                    <p>
                        The Aggregation Type will define the way the information is grouped in analytics.
                        <br />If the current program is a HNQIS2 program, this value will be inferred depending
                        on the Value Type selected and cannot be changed.
                    </p>
                }
                margin='0 0 0 0.5em'
            />
        </div>
    ]
    return (
        <div className={de ? "dataElement_cont" : ''}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1em', width: '100%' }}>
                {!de && <h2 style={{ display: 'flex', alignItems: 'center' }}>
                    <FilterNoneIcon style={{ marginRight: '10px' }} />Data Element Configuration
                </h2>}
                {de &&
                    <div onClick={() => closeEditForm()} style={{ cursor: 'pointer' }}>
                        <CloseIcon />
                    </div>
                }
            </div>

            <h3 style={{ marginBottom: '0.5em' }}>DHIS2 Settings</h3>

            <Grid container spacing={2} style={{ alignItems: 'center' }}>
                <Grid item xs={7} style={{ alignItems: 'end' }} >
                    {hnqisMode &&
                        <Grid style={{ display: 'flex' }} item>
                            <RowRadioButtonsGroup
                                label={"HNQIS Element Type"}
                                items={elemTypes}
                                handler={elemTypeChange}
                                value={structure}
                            />
                            <InfoBox
                                title='About Element Types'
                                message={
                                    <p>
                                        <strong>Question:</strong> Defines a question Data Element that can be answered in some way (text field, numeric field, option set, etc.).<br /><br />
                                        <strong>Label:</strong> Defines a label Data Element, usually these are used to display instructions or help text. Choosing label will
                                        automatically select "Long Text" as Value Type and disable several fields in the configuration form.
                                    </p>
                                }
                                alignment='start'
                            />
                        </Grid>
                    }
                    <FormLabel component="legend">Behavior in Current Stage</FormLabel>
                    <Grid item style={{ display: 'flex' }}>
                        <FormControlLabel
                            disabled={structure === 'label'}
                            control={
                                <Switch
                                    checked={compulsory && structure !== 'label'}
                                    onChange={compulsoryChange}
                                />}
                            label="Compulsory"
                        />
                        <InfoBox
                            title='About Compulsory Data Elements'
                            message={
                                <p>
                                    The value of this data element must be filled into data entry form before you can complete the event.
                                </p>
                            }
                        />
                        <FormControlLabel disabled={structure === 'label'} control={<Switch checked={displayInReports} onChange={displayInReportsChange} />} label="Display in Reports" />
                        <InfoBox
                            title='About Data Elements That Display In Reports'
                            message={
                                <p>
                                    Displays the value of this data element into the single event without registration data entry function.
                                </p>
                            }
                        />
                    </Grid>
                </Grid>
                <Grid item xs={5} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex' }}>
                        <FormLabel component="legend" style={{ marginRight: '0.5em' }}>Data Element Value Type</FormLabel>
                        <InfoBox
                            title='About Value Type and Option Sets'
                            message={
                                <p>
                                    The Value Type will define the type of data that the data element will record.
                                    <br />If an Option Set is selected,
                                    the Value Type will be assigned automatically to match the Option Set.
                                </p>
                            }
                        />
                    </div>
                    <div style={{ display: 'flex', width: '100%', marginTop: '0.5em', justifyContent: 'end', alignItems: 'center' }}>
                        <SelectOptions
                            label="Value Type (*)"
                            styles={{ width: '45%' }}
                            useError={validationErrors.valueType !== undefined}
                            helperText={validationErrors.valueType}
                            items={valueTypes}
                            value={valueType}
                            disabled={structure === 'label' || optionSet != null}
                            handler={valueTypeChange} />

                        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '10%' }}>or</p>

                        <Autocomplete
                            id="optionSetsSelect"
                            disabled={structure === 'label'}
                            options={
                                serverOptionSets?.results.optionSets.filter(os => !hnqisMode || os.name.includes("HNQIS")).map(os =>
                                    ({ label: os.name, id: os.id, valueType: os.valueType })
                                ) || []
                            }
                            sx={{ width: '45%' }}
                            renderInput={(params) => <TextField {...params} label="Option Set" />}
                            value={optionSet}
                            onChange={optionSetChange}
                            getOptionLabel={(option) => (option.label || '')}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </div>
                    {hnqisMode && aggTypeContent}
                </Grid>
            </Grid>
            {!hnqisMode && aggTypeContent}
            <FormLabel style={{ marginTop: '1em' }} component="legend">Data Element Appearance</FormLabel>
            <div style={{ display: 'flex' }}>
                <FormControl sx={{ width: '100%' }}>
                    <TextField
                        error={validationErrors.formName !== undefined}
                        helperText={validationErrors.formName}
                        id="formName"
                        autoComplete='off'
                        fullWidth
                        margin="dense"
                        label="Form Name (*)"
                        variant="standard"
                        value={formName}
                        onChange={formNameChange}
                    />
                </FormControl>
                <InfoBox
                    title="About the Form Name of a Data Element"
                    message={
                        <p>
                            This is the text that will be displayed in the form to represent this Data Element.<br /><br />
                            The Name and Short Name properties of the Data Element will be generated automatically using the Form Name.
                        </p>
                    }
                    margin='0 0 0 0.5em'
                />
            </div>
            <div style={{ display: 'flex' }}>
                <TextField
                    id="description"
                    autoComplete='off'
                    fullWidth
                    margin="dense"
                    label="Description"
                    variant="standard"
                    value={description}
                    onChange={descriptionChange}
                />
                <InfoBox
                    title="About the Description of a Data Element"
                    message={
                        <p>
                            Help text that will display to the users during data entry.<br /><br />
                            This text will appear as an <InfoIcon fontSize='small' /> icon in the data entry form.
                        </p>
                    }
                    margin='0 0 0 0.5em'
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1em 0' }}>
                <div style={{ display: 'flex', width: '35%' }}>
                    <Autocomplete
                        id="legendSetSelect"
                        disabled={structure === 'label'}
                        sx={{ width: '100%' }}
                        options={serverLegendSets?.results.legendSets.filter(ls => !hnqisMode || ls.name.includes("HNQIS")).map(ls => ({ label: ls.name, id: ls.id }))/* .concat({label: 'None', id: ''}) */ || [/* {label: 'None', id: ''} */]}
                        renderInput={(params) => <TextField {...params} label="Legend Set" />}
                        value={legendSet}
                        onChange={legendSetChange}
                        getOptionLabel={(option) => (option.label || '')}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                    <InfoBox
                        title="About the Legend Set of a Data Element"
                        message={
                            <p>
                                Legend Sets are color categories based on number ranges.<br />
                                The selected legend will be applied to the Data Element during data entry and information display of any kind.
                            </p>
                        }
                        margin='0 0 0 0.5em'
                    />
                </div>
                <div>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<InsertEmoticonIcon />}
                        style={{ marginRight: '1em' }}
                        disabled>
                        ADD ICON
                    </Button>
                    <Button variant="outlined" size="large" startIcon={<ColorLensIcon />} disabled >SELECT COLOR</Button>
                </div>
            </div>
            
            <div>
                {hnqisMode && <>
                    <h3 style={{ marginBottom: '0.5em' }}>HNQIS Settings</h3>


                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            disabled={structure === 'label'}
                            control={
                                <Switch
                                    checked={critical && structure !== 'label'}
                                    onChange={criticalChange}
                                />
                            }
                            label="Critical Question"
                        />
                        <InfoBox
                            title="About Critical Questions"
                            message={
                                <p>
                                    HNQIS scores are divided in critical and non-critical, this is mostly used for the "Competency Classification" but can also be used for other types of classification in analytics as well.<br /><br />
                                    A Critical Question will count for the critical score calculations.
                                </p>
                            }
                        />
                        <FormControl sx={{ minWidth: '2.5rem', width: '15%', marginRight: '1em' }}>
                            <TextField
                                error={validationErrors.numerator !== undefined}
                                helperText={validationErrors.numerator}
                                disabled={structure === 'label'}
                                autoComplete='off'
                                id="numerator"
                                sx={{ width: '100%' }}
                                margin="dense"
                                label="Numerator"
                                variant='standard'
                                value={structure !== 'label' ? numerator : ''}
                                onChange={numeratorChange}
                                inputProps={{ type: 'number', min: '0' }}
                            />
                        </FormControl>
                        <FormControl sx={{ minWidth: '2.5rem', width: '15%' }}>
                            <TextField
                                error={validationErrors.denominator !== undefined}
                                helperText={validationErrors.denominator}
                                disabled={structure === 'label'}
                                autoComplete='off'
                                id="denominator"
                                sx={{ width: '100%' }}
                                margin="dense"
                                label="Denominator"
                                variant='standard'
                                value={structure !== 'label' ? denominator : ''}
                                onChange={denominatorChange}
                                inputProps={{ type: 'number', min: '0' }}
                            />
                        </FormControl>
                        <InfoBox
                            title="About the Numerator and Denominator"
                            message={
                                <p>
                                    This values will be used in the formulas that calculate scores.<br /><br />
                                    Each Numerator and Denominator will contribute to the scores calculation formulas for each section.
                                </p>
                            }
                            margin='0 1.5em 0 0.5em'
                        />
                        <FormControl sx={{ minWidth: '10rem', width: '20%' }}>
                            <TextField
                                error={validationErrors.feedbackOrder !== undefined}
                                helperText={validationErrors.feedbackOrder}
                                autoComplete='off'
                                id="feedbackOrder"
                                sx={{ width: '100%' }}
                                margin="dense"
                                label="Feedback Order (Compositive Indicator)"
                                variant="standard"
                                value={feedbackOrder}
                                onChange={feedbackOrderChange}
                            />
                        </FormControl>
                        <InfoBox
                            title="About the Feedback Order"
                            message={
                                <p>
                                    Formerly known as Compositive Indicator.<br /><br />
                                    This number will generate the feedback hierarchy in the app, while also grouping the scores to calculate the composite scores.<br /><br />
                                    <strong>There cannot exist gaps in the Compositive indicators!</strong> The existence of gaps will be validated through the Config App before Setting up the program.<br /><br />
                                    <strong>Keep in mind the following:</strong><br /><br />
                                    - Accepted values are: 1, 1.1, 1.1.1, 1.1.2, 1.1.(...), 1.2, etc.
                                    - Feedback Order gaps will result in logic errors.<br />
                                    Having [ 1, 1.1, 1.2, 1.4, 2, ... ] will result in an error as the indicator for 1.3 does not exist.<br /><br />
                                    - Questions are not required to be grouped together to belong to the same level of the compositive indicator, for example: <br />
                                    Having [ 1, 1.1, 1.2, 1.3, 2, 2.1, 2.2, 1.4 ] is a valid configuration as there are no gaps in the same level of the compositive indicator.
                                </p>
                            }
                            margin='0 0.5em'
                        />
                    </div>

                    <div style={{ display: 'flex', margin: '0.5em 0' }}>
                        <FormLabel component="legend">Feedback Text</FormLabel>
                        <InfoBox
                            title="About the Feedback Text"
                            message={
                                <p>
                                    Text that will be displayed in the Feedback module of the app.<br /><br />
                                    This field supports MarkDown to add <strong>bold</strong>, <em>italic</em>, and other rich text configurations.
                                </p>
                            }
                            margin='0 0.5em'
                        />
                    </div>
                    <div data-color-mode="light" style={structure === 'label' ? { opacity: '0.5' } : undefined}>
                        <MarkDownEditor value={feedbackText} setValue={setFeedbackText} disabled={structure === 'label'} />
                    </div>
                </>}
                {de &&
                    <div style={{ display: 'flex', justifyContent: 'end', marginTop: '1em' }}>
                        <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            size="large"
                            style={{ marginRight: '1em' }}
                            color="error"
                            onClick={() => setDialogStatus(true)}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            size="large"
                            color="success"
                            onClick={() => { if (formDataIsValid()) callSave() }}>
                            Save
                        </Button>
                    </div>
                }

            </div>
            <AlertDialogSlide
                open={dialogStatus}
                title={"Do you really want to close the editor?"}
                icon={<WarningAmberIcon fontSize="large" color="warning" />}
                content={"Warning: All unsaved changes will be discarded"}
                primaryText={"Yes, close it"}
                secondaryText={"No, keep me here"}
                actions={{
                    primary: function () { setDialogStatus(false); setDeToEdit('') },
                    secondary: function () { setDialogStatus(false); }
                }}
            />
        </div>
    )
}

export default DataElementForm