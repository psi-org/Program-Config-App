import { useDataQuery } from '@dhis2/app-runtime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { TextField, FormControl, FormControlLabel, Switch, Autocomplete, Grid, FormLabel, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react"
import { FEEDBACK_TEXT, FEEDBACK_ORDER, MAX_DATA_ELEMENT_NAME_LENGTH, METADATA, MIN_NAME_LENGTH, ELEM_TYPES, VALUE_TYPES_H2, AGG_TYPES, MAX_SHORT_NAME_LENGTH, VALUE_TYPES_TRACKER } from '../../configs/Constants.js';
import AlertDialogSlide from '../UIElements/AlertDialogSlide.js';
import SelectOptions from '../UIElements/SelectOptions.js';
import StyleManager from '../UIElements/StyleManager.js';
import InfoBox from './../UIElements/InfoBox.js';
import ProgramRulesList from './../UIElements/ProgramRulesList.js'
import MarkDownEditor from './MarkDownEditor.js';
import RowRadioButtonsGroup from './RowRadioButtonsGroup.js';

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
};

const programRuleVariableQuery = {
    results: {
        resource: 'programRuleVariables',
        params: ({program,dataElement}) => ({
            fields: ['id', 'name'],
            filter: [`program.id:eq:${program}`,`dataElement.id:eq:${dataElement ?? ''}`],
        })    
    }
};

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 1 }
    }
};

const DataElementForm = ({ program, programStageDataElement, section, setDeToEdit, save, saveFlag = false, setSaveFlag = undefined, hnqisMode, setSaveStatus }) => {

    const de = programStageDataElement.dataElement;

    const idQuery = useDataQuery(queryId);
    const newDeId = idQuery.data?.results.codes[0];

    // Data Query
    const { data: initOptionSets, refetch: refreshOptionSets } = useDataQuery(optionSetQuery);
    const [serverOptionSets, setServerOptionSets] = useState(undefined)
    const { data: initLegendSets, refetch: refreshLegendSets } = useDataQuery(legendSetsQuery);
    const [serverLegendSets, setServerLegendSets] = useState(undefined)
    const { data: programRuleVariables } = useDataQuery(programRuleVariableQuery, {variables: { program, dataElement: de?.id ?? "X" } });
    const programRuleVariable = programRuleVariables?.results?.programRuleVariables?.at(0) 
    

    useEffect(() => {
        if (initOptionSets) { setServerOptionSets(initOptionSets) }
    }, [initOptionSets])

    useEffect(() => {
        if (initLegendSets) { setServerLegendSets(initLegendSets) }
    }, [initLegendSets])
    

    const metadata = JSON.parse(de?.attributeValues.find(att => att.attribute.id === METADATA)?.value || '{}')

    // States
    const [structure, setStructure] = useState(metadata.elemType || 'question')
    const [valueType, setValueType] = useState(de?.valueType || '')
    const [aggType, setAggType] = useState(de?.aggregationType || 'NONE')
    const [formName, setFormName] = useState((metadata.elemType === 'label' ? metadata.labelFormName : de?.formName)?.replace(' [C]', '') || '')
    const [elementName, setElementName] = useState(de?.name || '')
    const [shortName, setShortName] = useState(de?.shortName || '')
    const [elementCode, setElementCode] = useState(de?.code || '')
    const [compulsory, setCompulsory] = useState((metadata.isCompulsory? metadata.isCompulsory === 'Yes' : programStageDataElement.compulsory) ?? false)  // metadata.isCompulsory : ['Yes','No']
    const [displayInReports, setDisplayInReports] = useState(programStageDataElement.displayInReports ?? false)
    const [optionSet, setOptionSet] = useState(de?.optionSet ? { label: de.optionSet.name, id: de.optionSet.id } : null)
    const [legendSet, setLegendSet] = useState(de?.legendSet ? { label: de.legendSet.name, id: de.legendSet.id } : null)
    const [description, setDescription] = useState(de?.description || '')

    const [deIcon,setDeIcon] = useState(de?.style?.icon ?? "")
    const [deColor,setDeColor] = useState(de?.style?.color)

    const [critical, setCritical] = useState(metadata.isCritical === 'Yes') // metadata.isCritical : ['Yes','No']
    const [numerator, setNumerator] = useState(metadata.scoreNum || '')
    const [denominator, setDenominator] = useState(metadata.scoreDen || '')
    const [feedbackOrder, setFeedbackOrder] = useState(de?.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value || '')
    const [feedbackText, setFeedbackText] = useState(de?.attributeValues.find(att => att.attribute.id === FEEDBACK_TEXT)?.value || '');

    const [dialogStatus, setDialogStatus] = useState(false)
    const [autoNaming, setAutoNaming] = useState(metadata.autoNaming === 'No'?false:true)

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
            elementName: undefined,
            shortName: undefined,
            elementCode: undefined,
            numerator: undefined,
            denominator: undefined,
            feedbackOrder: undefined
        });

    const valueTypeChange = (data) => {
        validationErrors.valueType = undefined
        validationErrors.aggType = undefined
        setValidationErrors({ ...validationErrors })
        setValueType(data.target.value)
    }

    useEffect(() => {
        switch (valueType) {
            case 'NUMBER':
            case 'INTEGER':
            case 'INTEGER_POSITIVE':
            case 'INTEGER_ZERO_OR_POSITIVE':
                setAggType('SUM')
                break;
            case 'TEXT':
            case 'LONG_TEXT':
            case 'DATE':
            case 'TIME':
                setAggType('NONE')
                break;
            case 'PERCENTAGE':
                setAggType('AVERAGE')
                break;
            default:
                setAggType('')
                break;
        }
    }, [valueType])
    

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

    const autoNamingChange = (data) => setAutoNaming(data.target.checked)

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

    const elementNameChange = (data) => {
        validationErrors.elementName = undefined
        setValidationErrors({ ...validationErrors })
        setElementName(data.target.value)
    }
    const shortNameChange = (data) => {
        validationErrors.shortName = undefined
        setValidationErrors({ ...validationErrors })
        setShortName(data.target.value)
    }

    const elementCodeChange = (data) => {
        validationErrors.elementCode = undefined
        setValidationErrors({ ...validationErrors })
        setElementCode(data.target.value)
    }

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

        if (valueType.trim() === '') {
            response = false
            validationErrors.valueType = 'A Value Type or Option Set must be specified'
        } else {
            validationErrors.valueType = undefined
        }

        if (aggType.trim() === '') {
            response = false
            validationErrors.aggType = 'This field is required'
        } else {
            validationErrors.aggType = undefined
        }

        if (formName.trim() === '') {
            response = false
            validationErrors.formName = 'This field is required'
        } else if (formName.length < MIN_NAME_LENGTH || formName.length > MAX_DATA_ELEMENT_NAME_LENGTH) {
            response = false
            validationErrors.formName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters`
        } else {
            validationErrors.formName = undefined
        }

        if (!autoNaming) {
            if (elementName.trim() === '') {
                response = false
                validationErrors.elementName = 'This field is required'
            } else if (elementName.length < MIN_NAME_LENGTH || elementName.length > MAX_DATA_ELEMENT_NAME_LENGTH) {
                response = false
                validationErrors.elementName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters`
            } else {
                validationErrors.elementName = undefined
            }

            if (shortName.trim() === '') {
                response = false
                validationErrors.shortName = 'This field is required'
            } else if (shortName.length < MIN_NAME_LENGTH || shortName.length > MAX_SHORT_NAME_LENGTH) {
                response = false
                validationErrors.shortName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_SHORT_NAME_LENGTH} characters`
            } else {
                validationErrors.shortName = undefined
            }

            if (elementCode && elementCode.length > MAX_SHORT_NAME_LENGTH) {
                response = false
                validationErrors.elementCode = `This field must contain less than  ${MAX_SHORT_NAME_LENGTH} characters`
            } else {
                validationErrors.elementCode = undefined
            }
        } else {
            validationErrors.elementName = undefined
            validationErrors.shortName = undefined
            validationErrors.elementCode = undefined
        }

        if (String(numerator).trim() !== '' && String(denominator).trim() === '') {
            response = false
            validationErrors.denominator = 'This field is also required'
        } else if (denominator === '0') {
            response = false
            validationErrors.denominator = 'The denominator cannot be zero (0)'
        } else {
            validationErrors.denominator = undefined
        }

        if (String(numerator).trim() === '' && String(denominator).trim() !== '') {
            response = false
            validationErrors.numerator = 'This field is also required'
        } else {
            validationErrors.numerator = undefined
        }

        if ((String(numerator).trim() !== '' || String(denominator).trim() !== '') && feedbackOrder.trim() === '') {
            response = false
            validationErrors.feedbackOrder = 'This field is also required'
        } else {
            validationErrors.feedbackOrder = undefined
        }

        setValidationErrors({ ...validationErrors })

        return response;
    }

    const reloadOptionSets = () =>{
        refreshOptionSets().then(data => {
            setServerOptionSets(data)
        })
    }

    const reloadLegendSets = () =>{
        refreshLegendSets().then(data => {
            setServerLegendSets(data)
        })
    }

    const buildStyle = () => {
        const auxstyle = {};
        if (deIcon) { auxstyle.icon = deIcon }
        if (deColor) { auxstyle.color = deColor }

        return (Object.keys(auxstyle).length > 0)?auxstyle:undefined
    }

    const callSave = () => {

        // Save new values in local variable de
        const data = JSON.parse(JSON.stringify(de))
        
        const attributeValues = []
        const metadata = JSON.parse(de?.attributeValues?.find(att => att.attribute.id === METADATA)?.value || '{}')

        data.style = buildStyle()

        data.displayInReports = displayInReports

        // Value Type
        data.valueType = valueType
        data.aggregationType = aggType
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
        
        if (!autoNaming) {
            data.name = elementName;
            data.displayName = elementName;
            data.shortName = shortName;
            data.code = elementCode;
        }


        // METADATA
        // Elem type
        metadata.isCompulsory = compulsory ? "Yes" : "No";
        if (hnqisMode) {
            metadata.elemType = structure;
            metadata.isCritical = critical ? "Yes" : "No";
            if (numerator) { metadata.scoreNum = numerator }
            if (denominator) { metadata.scoreDen = denominator }
            if (structure === 'label') { metadata.labelFormName = formName }
        }
        metadata.autoNaming = autoNaming ? 'Yes' : 'No';

        attributeValues.push({ attribute: { id: METADATA }, value: JSON.stringify(metadata) })

        // FEEDBACK ORDER
        if (feedbackOrder) { attributeValues.push({ attribute: { id: FEEDBACK_ORDER }, value: feedbackOrder }) }
        // FEEDBACK TEXT
        if (feedbackText) { attributeValues.push({ attribute: { id: FEEDBACK_TEXT }, value: feedbackText }) }

        // PROGRAM STAGE DATA ELEMENT
        const stageDataElement = JSON.parse(JSON.stringify(programStageDataElement));
        stageDataElement.displayInReports = displayInReports;
        stageDataElement.dataElement = data;
        stageDataElement.dataElement.attributeValues = attributeValues;

        save(de.id, section, stageDataElement);
        if (hnqisMode) { setSaveStatus('Validate & Save') }

    }

    //Handling create New Data Element
    useEffect(() => {
        if (saveFlag && setSaveFlag) {
            if (formDataIsValid()) {
                let optionSetValue = undefined;
                const legendSetsValue = [];
                const attributes = [];

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
                pcaMetadata.autoNaming = autoNaming ? 'Yes' : 'No';

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

                const dataElement = {
                    name: newDeId + "_" + formName,
                    id: newDeId,
                    shortName: (newDeId + "_" + formName).slice(0, 50),
                    aggregationType: aggType,
                    domainType: "TRACKER",
                    displayName: newDeId + "_" + formName,
                    formName: (structure === 'label') ? '   ' : formName,
                    description,
                    valueType: valueType,
                    optionSet: optionSetValue,
                    optionSetValue: optionSetValue !== undefined,
                    attributeValues: attributes,
                    legendSets: legendSetsValue,
                    legendSet: legendSetsValue[0],
                    style: buildStyle()
                }

                if (!autoNaming) {
                    dataElement.name = elementName;
                    dataElement.displayName = elementName;
                    dataElement.shortName = shortName;
                    dataElement.code = elementCode;
                }

                const newCreatedDe = {
                    type:'created',
                    displayInReports: displayInReports,
                    compulsory: compulsory,
                    dataElement
                }

                save(newCreatedDe);
            }
            setSaveFlag(false)
            if (hnqisMode) { setSaveStatus('Validate & Save') }
        }
    }, [saveFlag])
    //End New DE

    const aggTypeContent = [
        <div style={{ display: 'flex', width: '100%', marginTop: '0.5em' }} key='select'>
            <SelectOptions
                label="Aggregation Type (*)"
                styles={{ width: '100%' }}
                useError={validationErrors.aggType !== undefined}
                helperText={validationErrors.aggType}
                items={AGG_TYPES}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em', width: '100%' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {!de && <h2 style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
                        <FilterNoneIcon style={{ marginRight: '10px' }} />Data Element Configuration
                    </h2>}
                    <h3>DHIS2 Settings</h3>
                </div>

                {de &&
                    <div onClick={() => closeEditForm()} style={{ cursor: 'pointer' }}>
                        <CloseIcon />
                    </div>
                }
            </div>

            <Grid container spacing={2} style={{ alignItems: 'center' }}>
                <Grid item xs={6} style={{ alignItems: 'end' }} >
                    {hnqisMode &&
                        <Grid style={{ display: 'flex' }} item>
                            <RowRadioButtonsGroup
                                label={"HNQIS Element Type"}
                                items={ELEM_TYPES}
                                handler={elemTypeChange}
                                value={structure}
                            />
                            <InfoBox
                                title='About Element Types'
                                message={
                                    <p>
                                        <strong>Question:</strong> Defines a question Data Element that can be answered in some way (text field, numeric field, option set, etc.).<br /><br />
                                        <strong>Label:</strong> Defines a label Data Element, usually these are used to display instructions or help text. Choosing label will
                                        automatically select &lsquo;Long Text&lsquo; as Value Type and disable several fields in the configuration form.
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
                <Grid item xs={6} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex' }}>
                        <FormLabel component="legend" style={{ marginRight: '0.5em' }}>Data Element Value Type</FormLabel>
                        <InfoBox
                            title='About Value Type and Option Sets'
                            message={
                                <p>
                                    The Value Type will define the type of data that the data element will record.
                                    <br />If an Option Set is selected,
                                    the Value Type will be assigned automatically to match the Option Set.
                                    <br /><br />
                                    If the current program is a HNQIS2 program, only Option Sets that include &lsquo;HNQIS&lsquo; in the name will be displayed.
                                </p>
                            }
                        />
                    </div>
                    <div style={{ display: 'flex', width: '100%', marginTop: '0.5em', justifyContent: 'end', alignItems: 'center' }}>
                        <SelectOptions
                            label="Value Type (*)"
                            styles={{ width: '40%' }}
                            useError={validationErrors.valueType !== undefined}
                            helperText={validationErrors.valueType}
                            items={hnqisMode?VALUE_TYPES_H2:VALUE_TYPES_TRACKER}
                            value={valueType}
                            disabled={structure === 'label' || optionSet != null}
                            handler={valueTypeChange} />

                        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '10%' }}>or</p>

                        <Autocomplete
                            id="optionSetsSelect"
                            disabled={structure === 'label'}
                            options={
                                serverOptionSets?.results.optionSets.filter(os => !hnqisMode || os.name?.toLowerCase().includes("hnqis")).map(os =>
                                    ({ label: os.name, id: os.id, valueType: os.valueType })
                                ) || []
                            }
                            sx={{ width: '45%', marginRight: '0.5em' }}
                            renderInput={(params) => <TextField {...params} label="Option Set" />}
                            value={optionSet}
                            onChange={optionSetChange}
                            getOptionLabel={(option) => (option.label || '')}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                        <Tooltip title="Create New Option Set" placement="top">
                            <IconButton onClick={()=>{}} target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL) + "/dhis-web-maintenance/index.html#/edit/otherSection/optionSet/add"}>
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reload Option Sets" placement="top">
                            <IconButton onClick={()=> reloadOptionSets()} >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
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
                        margin="normal"
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
                            In HNQIS Mode, The Name, Short Name and Code properties of the Data Element will be generated automatically using the Form Name.<br /><br />
                            The automatic naming can be disabled in base Tracker/Event Programs.
                        </p>
                    }
                    margin='0 1em 0 0.5em'
                />
                <FormControlLabel
                    disabled={hnqisMode}
                    control={
                        <Switch
                            checked={autoNaming || hnqisMode}
                            onChange={autoNamingChange}
                        />}
                    label="Automatic Name, Short Name and Code"
                />
            </div>
            {!autoNaming && <>
                <TextField
                    error={validationErrors.elementName !== undefined}
                    helperText={validationErrors.elementName}
                    id="name"
                    autoComplete='off'
                    fullWidth
                    margin="normal"
                    label="Data Element Name (*)"
                    variant="standard"
                    value={elementName}
                    onChange={elementNameChange}
                />
                <div style={{display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                    <TextField
                        error={validationErrors.shortName !== undefined}
                        helperText={validationErrors.shortName}
                        id="shortName"
                        autoComplete='off'
                        sx={{width: '65%'}}
                        margin="normal"
                        label="Data Element Short Name (*)"
                        variant="standard"
                        value={shortName}
                        onChange={shortNameChange}
                    />
                    <TextField
                        error={validationErrors.elementCode !== undefined}
                        helperText={validationErrors.elementCode}
                        id="code"
                        autoComplete='off'
                        sx={{ width: '30%' }}
                        margin="normal"
                        label="Data Element Code"
                        variant="standard"
                        value={elementCode}
                        onChange={elementCodeChange}
                    />
                </div>
            </>}
            <div style={{ display: 'flex' }}>
                <TextField
                    id="description"
                    autoComplete='off'
                    fullWidth
                    margin="normal"
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2em 0 1em' }}>
                <div style={{ display: 'flex', width: '30%' }}>
                    <Autocomplete
                        id="legendSetSelect"
                        disabled={structure === 'label'}
                        sx={{ minWidth: '100%', marginRight: '0.5em' }}
                        options={serverLegendSets?.results.legendSets.filter(ls => !hnqisMode || ls.name?.toLowerCase().includes("hnqis")).map(ls => ({ label: ls.name, id: ls.id }))/* .concat({label: 'None', id: ''}) */ || [/* {label: 'None', id: ''} */]}
                        renderInput={(params) => <TextField {...params} label="Legend Set" />}
                        value={legendSet}
                        onChange={legendSetChange}
                        getOptionLabel={(option) => (option.label || '')}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                    <Tooltip title="Create New Legend Set" placement="top">
                            <IconButton style={{margin: 'auto'}} onClick={()=>{}} target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL) + "/dhis-web-maintenance/index.html#/edit/otherSection/legendSet/add"}>
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reload Legend Sets" placement="top">
                            <IconButton style={{margin: 'auto'}} onClick={()=> reloadLegendSets()} >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    <InfoBox
                        title="About the Legend Set of a Data Element"
                        message={
                            <p>
                                Legend Sets are color categories based on number ranges.<br />
                                The selected legend will be applied to the Data Element during data entry and information display of any kind.
                                <br /><br />
                                If the current program is a HNQIS2 program, only Legend Sets that include &lsquo;HNQIS&lsquo; in the name will be displayed.
                            </p>
                        }
                        margin='0 0 0 0.5em'
                    />
                </div>
                <StyleManager
                    icon={deIcon}
                    setIcon={setDeIcon}
                    color={deColor}
                    setColor={setDeColor}
                    style={{display:'flex', alignItems:'center'}}
                />
            </div>
            
            <div>
                {hnqisMode && <>
                    <h3 style={{ marginBottom: '0.5em', marginTop: '2em' }}>HNQIS Settings</h3>


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
                                    HNQIS scores are divided in critical and non-critical, this is mostly used for the &lsquo;Competency Classification&lsquo; but can also be used for other types of classification in analytics as well.<br /><br />
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
                                    - Accepted values are: 1, 1.1, 1.1.1, 1.1.2, 1.1.(...), 1.2, etc.<br />
                                    - Feedback Order gaps will result in logic errors. Having [ 1, 1.1, 1.2, 1.4, 2, ... ] will result in an error as the indicator for 1.3 does not exist.<br /><br />
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
                {/* PROGRAM RULE ACTIONS */}
                {de && programRuleVariables?.results?.programRuleVariables && programRuleVariable && <ProgramRulesList program={program} dataElement={de?.id || newDeId} variable={programRuleVariable.name} variables={programRuleVariables?.results?.programRuleVariables} /> }
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
                            onClick={() => {
                                if (formDataIsValid()) { callSave() }
                            }}>
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

DataElementForm.propTypes = {
    hnqisMode: PropTypes.bool,
    program: PropTypes.string,
    programStageDataElement: PropTypes.object,
    save: PropTypes.func,
    saveFlag: PropTypes.bool,
    section: PropTypes.string,
    setDeToEdit: PropTypes.func,
    setSaveFlag: PropTypes.func,
    setSaveStatus: PropTypes.func
}

export default DataElementForm