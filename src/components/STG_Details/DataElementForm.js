//MATERIAL UI
import { useDataQuery } from '@dhis2/app-runtime';
import {TextField,Select,MenuItem,FormControl,InputLabel, FormControlLabel, Switch, Autocomplete, Grid, FormLabel, Button} from '@mui/material';
import { useEffect,useState } from "react"
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

import SelectOptions from './SelectOptions';
import MarkDownEditor from './MarkDownEditor';
import InfoBox from './../UIElements/InfoBox';

import AlertDialogSlide from '../UIElements/AlertDialogSlide';

const optionSetQuery = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['id', 'name', 'options[name]', 'valueType'],
            filter: ['name:ilike:HNQIS - ']
        }
    }
};

const legendSetsQuery = {
    results: {
        resource: 'legendSets',
        params: {
            fields: ['id','name'],
            filter: ['name:ilike:HNQIS']
        }
    }
}

const DataElementForm = ({programStageDataElement,section,dialogActions,setDeToEdit,save}) => {

    const de = programStageDataElement.dataElement
    //console.log(de)

    // Data Query
    const { data: serverOptionSets} = useDataQuery(optionSetQuery);
    const { data: serverLegendSets} = useDataQuery(legendSetsQuery);

    // Constants
    const elemTypes = [{label:'Question',value:'question'},{label:'Label',value:'label'}]
    const valueTypes = [
        { label:'Number', value:'NUMBER', icon:<NumberIcon/>},
        { label:'Integer', value:'INTEGER', icon:<NumberIcon/>},
        { label:'Positive Integer', value:'INTEGER_POSITIVE', icon:<NumberIcon/>},
        { label:'Zero or Positive Integer', value:'INTEGER_ZERO_OR_POSITIVE', icon:<NumberIcon/>},
        { label:'Text', value:'TEXT', icon:<TextIcon/>},
        { label:'Long Text', value:'LONG_TEXT', icon:<TextIcon/>},
        { label:'Percentage', value:'PERCENTAGE', icon:<PercentIcon/>},
        { label:'Date', value:'DATE', icon:<DateIcon/>},
        { label:'Time', value:'TIME', icon:<TimeIcon/>},
    ]
    const metadata = JSON.parse(de.attributeValues.find(att => att.attribute.id === 'haUflNqP85K')?.value || '{}')
    
    

    // States
    const [structure,setStructure] = useState(metadata.elemType)
    const [valueType,setValueType] = useState(de.valueType)
    const [formName,setFormName] = useState((metadata.elemType === 'label' ? metadata.labelFormName : de.formName).replace(' [C]',''))
    const [compulsory,setCompulsory] = useState(metadata.isCompulsory==='Yes')  // metadata.isCompulsory : ['Yes','No']
    const [displayInReports,setDisplayInReports] = useState(programStageDataElement.displayInReports || false)
    const [optionSet,setOptionSet] = useState(de.optionSet ? {label:de.optionSet.name, id:de.optionSet.id } : null)
    const [legendSet,setLegendSet] = useState(de.legendSet ? {label:de.legendSet.name, id:de.legendSet.id } : null)
    const [description,setDescription] = useState(de.description || '')
    
    const [critical,setCritical] = useState(metadata.isCritical==='Yes') // metadata.isCritical : ['Yes','No']
    const [numerator,setNumerator] = useState(metadata.scoreNum || '')
    const [denominator,setDenominator] = useState(metadata.scoreDen || '')
    const [feedbackOrder,setFeedbackOrder] = useState(de.attributeValues.find(att => att.attribute.id === 'LP171jpctBm')?.value || '')
    const [feedbackText, setFeedbackText] = React.useState(de.attributeValues.find(att => att.attribute.id === 'yhKEe6BLEer')?.value || '');

    const [dialogStatus,setDialogStatus] = useState(false)

    // Handlers
    const elemTypeChange = (e) => {
        setStructure(e.target.value)
        if(e.target.value === 'label'){
            setValueType('LONG_TEXT')
            setOptionSet(null)
        }
    }

    const closeEditForm = () => setDialogStatus(true)

    const valueTypeChange = (data) => setValueType(data.target.value)   // VALIDATIONS NEEDED (OPTION SET, ...)

    const formNameChange = (data) => setFormName(data.target.value)

    const compulsoryChange = (data) => setCompulsory(data.target.checked)

    const displayInReportsChange = (data) => setDisplayInReports(data.target.checked)

    const optionSetChange = (event, value) => {
        if(value) setValueType(value.valueType)
        setOptionSet(value)
    }

    const legendSetChange = (event, value) => setLegendSet(value)

    const descriptionChange = (data) => setDescription(data.target.value)

    const criticalChange = (data) => setCritical(data.target.checked)

    const numeratorChange = data => setNumerator(data.target.value)

    const denominatorChange = data => setDenominator(data.target.value)

    const feedbackOrderChange = data => setFeedbackOrder(data.target.value)

    const callSave = () => {

        // Save new values in local variable de
        let data = JSON.parse(JSON.stringify(de))
        let attributeValues = []
        let metadata = JSON.parse(de.attributeValues.find(att => att.attribute.id === 'haUflNqP85K')?.value || '{}')

        // Value Type
        data.valueType = valueType
        // Option Set
        if(optionSet){
            data.optionSetValue = true
            data.optionSet = {id:optionSet.id, name:optionSet.label}
        }else{
            data.optionSetValue = false
            delete data.optionSet
        }
        // Legend set
        data.legendSet = legendSet ? {id:legendSet.id,name:legendSet.label} : undefined
        data.legendSets = legendSet ? [{id:legendSet.id,name:legendSet.label}] : undefined
        // Description
        data.description = description
        // Form Name
        data.formName =  structure==='question' ?  formName : "   "


        // METADATA
        // Elem type
        metadata.elemType = structure
        metadata.isCompulsory = compulsory?"Yes":"No"
        metadata.isCritical = critical?"Yes":"No"
        if(numerator) metadata.scoreNum=numerator
        if(denominator) metadata.scoreDen=denominator
        if(structure==='label') metadata.labelFormName = formName

        attributeValues.push({attribute:{id:'haUflNqP85K'},value:JSON.stringify(metadata)})

        // FEEDBACK ORDER
        if(feedbackOrder) attributeValues.push({attribute:{id:'LP171jpctBm'},value:feedbackOrder})
        // FEEDBACK TEXT
        if(feedbackText) attributeValues.push({attribute:{id:'yhKEe6BLEer'},value:feedbackText})

        // PROGRAM STAGE DATA ELEMENT
        let stageDataElement = JSON.parse(JSON.stringify(programStageDataElement))
        stageDataElement.displayInReports = displayInReports
        stageDataElement.dataElement = data
        stageDataElement.dataElement.attributeValues = attributeValues

        save(de.id,section,stageDataElement)
        
    }

    

    
    return (
    <div className="dataElement_cont">

        <div style={{display:'flex', justifyContent: 'space-between', marginBottom: '1em', width: '100%'}}>           
            <h2 style={{display:'flex', alignItems: 'center'}}><FilterNoneIcon style={{marginRight: '10px'}}/>Data Element Configuration</h2>
            <div onClick={() => closeEditForm()} style={{cursor: 'pointer'}}>
                <CloseIcon/>
            </div>
        </div>

        <h3 style={{marginBottom: '0.5em'}}>DHIS2 Settings</h3>

        <Grid container spacing={2} style={{alignItems:'center'}}>
            <Grid item xs={7} style={{alignItems:'end'}} >
                <Grid style={{display: 'flex'}} item>
                    <RowRadioButtonsGroup label={"Element Type"} items={elemTypes} handler={elemTypeChange} value={structure} />
                    <InfoBox
                        title='About Element Types' 
                        message={
                            <p>
                                <strong>Question:</strong> Defines a question Data Element that can be answered in some way (text field, numeric field, option set, etc.).<br/><br/>
                                <strong>Label:</strong> Defines a label Data Element, usually these are used to display instructions or help text. Choosing label will
                                automatically select "Long Text" as Value Type and disable several fields in the configuration form.
                            </p>
                        }
                        alignment='start'
                    />
                </Grid>
                <FormLabel component="legend">Behavior in Current Stage</FormLabel>
                <Grid item style={{display: 'flex'}}>
                    <FormControlLabel disabled={structure==='label'} control={<Switch checked={compulsory && structure!=='label'} onChange={compulsoryChange} />} label="Compulsory" />
                    <InfoBox
                        title='About Compulsory Data Elements' 
                        message={
                            <p>
                                The value of this data element must be filled into data entry form before you can complete the event.
                            </p>
                        }
                    />
                    <FormControlLabel disabled={structure==='label'} control={<Switch checked={displayInReports} onChange={displayInReportsChange} />} label="Display in Reports" />
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
            <Grid item xs={5} style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                <div style={{display: 'flex'}}>
                    <FormLabel component="legend" style={{marginRight: '0.5em'}}>Data Element Value Type</FormLabel>
                    <InfoBox
                        title='About Value Type and Option Sets' 
                        message={
                            <p>
                                The Value Type will define the type of data that the data element will record.
                                <br/>If an Option Set is selected,
                                the Value Type will be assigned automatically to match the Option Set.
                            </p>
                        }
                    />
                </div>
                <div style={{display: 'flex', width: '100%', marginTop: '0.5em', justifyContent: 'end'}}>
                    <SelectOptions label="Value Type" styles={{ width: '45%' }} items={valueTypes} value={valueType} disabled={structure==='label' || optionSet!=null} handler={valueTypeChange} />
                    
                    <p style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '10%'}}>or</p>
                    
                    <Autocomplete
                        autoComplete
                        id="optionSetsSelect"
                        disabled={structure==='label'}
                        options={serverOptionSets?.results.optionSets.map(os => ({label:os.name, id:os.id, valueType: os.valueType}) ) || []}
                        sx={{ width: '45%' }}
                        renderInput={(params) => <TextField {...params} label="Option Set" />}
                        value={optionSet}
                        onChange={optionSetChange}
                        getOptionLabel={(option)=>option.label}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </div>
            </Grid>
        </Grid>

        <FormLabel component="legend">Data Element Appearance</FormLabel>
        <div style={{display: 'flex'}}>
            <TextField id="formName" fullWidth margin="dense" label="Form Name" variant="standard" value={formName} onChange={formNameChange} />
            <InfoBox
                title="About the Form Name of a Data Element" 
                message={
                    <p>
                        This is the text that will be displayed in the form to represent this Data Element.<br/><br/>
                        The Name and Short Name properties of the Data Element will be generated automatically using the Form Name.
                    </p>
                }
                margin='0 0 0 0.5em'
            />
        </div>
        <div style={{display: 'flex'}}>
            <TextField id="description" fullWidth margin="dense" label="Description" variant="standard" value={description} onChange={descriptionChange} />
            <InfoBox
                title="About the Description of a Data Element" 
                message={
                    <p>
                        Help text that will display to the users during data entry.<br/><br/>
                        This text will appear as an <InfoIcon fontSize='small'/> icon in the data entry form.
                    </p>
                }
                margin='0 0 0 0.5em'
            />
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1em 0'}}>
            <div style={{display: 'flex', width: '35%'}}>
                <Autocomplete
                    autoComplete
                    id="legendSetSelect"
                    disabled={structure==='label'}
                    sx={{width: '100%'}}
                    options={serverLegendSets?.results.legendSets.map(ls => ({label:ls.name, id:ls.id}) ) || []}
                    renderInput={(params) => <TextField {...params} label="Legend Set" />}
                    value={legendSet}
                    onChange={legendSetChange}
                    getOptionLabel={(option)=>option.label}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                />
                <InfoBox
                    title="About the Legend Set of a Data Element" 
                    message={
                        <p>
                            Legend Sets are color categories based on number ranges.<br/>
                            The selected legend will be applied to the Data Element during data entry and information display of any kind.
                        </p>
                    }
                    margin='0 0 0 0.5em'
                />
            </div>
            <div>
                <Button variant="outlined" size="large" startIcon={<InsertEmoticonIcon/>} style={{marginRight: '1em'}} disabled >ADD ICON</Button>
                <Button variant="outlined" size="large" startIcon={<ColorLensIcon/>} disabled >SELECT COLOR</Button>
            </div>
        </div>

        <div>
            <h3 style={{marginBottom: '0.5em'}}>HNQIS Settings</h3>

            
            <div style={{display: 'flex', alignItems: 'center'}}>
                <FormControlLabel disabled={structure==='label'} control={<Switch checked={critical && structure!=='label'} onChange={criticalChange} />} label="Critical Question" />
                <InfoBox
                    title="About Critical Questions" 
                    message={
                        <p>
                            HNQIS scores are divided in critical and non-critical, this is mostly used for the "Competency Classification" but can also be used for other types of classification in analytics as well.<br/><br/>
                            A Critical Question will count for the critical score calculations.
                        </p>
                    }
                />
                <TextField disabled={structure==='label'} id="numerator" sx={{ minWidth: '2.5rem', width: '15%', marginRight: '1em'}} margin="dense" label="Numerator" variant='standard' value={structure!=='label'?numerator:''} onChange={numeratorChange} inputProps={{ type: 'number', min:'0' }} />
                <TextField disabled={structure==='label'} id="denominator" sx={{ minWidth: '2.5rem', width: '15%' }} margin="dense" label="Denominator" variant='standard' value={structure!=='label'?denominator:''} onChange={denominatorChange} inputProps={{ type: 'number', min:'0' }} />
                <InfoBox
                    title="About the Numerator and Denominator" 
                    message={
                        <p>
                            This values will be used in the formulas that calculate scores.<br/><br/>
                            Each Numerator and Denominator will contribute to the scores calculation formulas for each section.
                        </p>
                    }
                    margin='0 1.5em 0 0.5em'
                />
                <TextField id="feedbackOrder" sx={{ minWidth: '10rem', width: '20%' }} margin="dense" label="Feedback Order (Compositive Indicator)" variant="standard" value={feedbackOrder} onChange={feedbackOrderChange} />
                <InfoBox
                    title="About the Feedback Order" 
                    message={
                        <p>
                            Formerly known as Compositive Indicator.<br/><br/>
                            This number will generate the feedback hierarchy in the app, while also grouping the scores to calculate the composite scores.<br/><br/>
                            <strong>There cannot exist gaps in the Compositive indicators!</strong> The existence of gaps will be validated through the Config App before Setting up the program.<br/><br/>
                            <strong>Keep in mind the following:</strong><br/><br/>
                            - Accepted values are: 1, 1.1, 1.1.1, 1.1.2, 1.1.(...), 1.2, etc.
                            - Feedback Order gaps will result in logic errors.<br/>
                            Having [ 1, 1.1, 1.2, 1.4, 2, ... ] will result in an error as the indicator for 1.3 does not exist.<br/><br/>
                            - Questions are not required to be grouped together to belong to the same level of the compositive indicator, for example: <br/>
                            Having [ 1, 1.1, 1.2, 1.3, 2, 2.1, 2.2, 1.4 ] is a valid configuration as there are no gaps in the same level of the compositive indicator.
                        </p>
                    }
                    margin='0 0.5em'
                />
            </div>

            <div style={{display: 'flex', margin: '0.5em 0'}}>
                <FormLabel component="legend">Feedback Text</FormLabel>
                <InfoBox
                    title="About the Feedback Text" 
                    message={
                        <p>
                            Text that will be displayed in the Feedback module of the app.<br/><br/>
                            This field supports MarkDown to add <strong>bold</strong>, <em>italic</em>, and other rich text configurations.
                        </p>
                    }
                    margin='0 0.5em'
                />
            </div>
            <div data-color-mode="light" style={structure==='label'?{opacity:'0.5'}:undefined}>
                <MarkDownEditor value={feedbackText} setValue={setFeedbackText} disabled={structure==='label'}/>
            </div>
            <div style={{display:'flex', justifyContent:'end', marginTop:'1em'}}>
                <Button variant="outlined" startIcon={<CancelIcon />} size="large" style={{marginRight: '1em'}} color="error" onClick={()=>setDialogStatus(true)}>
                Cancel
                </Button>
                <Button variant="contained" startIcon={<SaveIcon />} size="large" color="success" onClick={()=>callSave()}>
                Save
                </Button>
            </div>
            
        </div>
        <AlertDialogSlide
            open={dialogStatus} 
            title={"Do you really want to close the editor?"}
            icon={<WarningAmberIcon fontSize="large" color="warning"/>}
            content={"Warning: All unsaved changes will be discarded"} 
            primaryText={"Yes, close it"} 
            secondaryText={"No, keep me here"} 
            actions={{
                primary: function(){ setDialogStatus(false); setDeToEdit('') },
                secondary: function(){setDialogStatus(false);}
            }} 
        />
    </div>
    )
}

export default DataElementForm