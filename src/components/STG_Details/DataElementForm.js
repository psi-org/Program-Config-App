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

import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import ColorLensIcon from '@mui/icons-material/ColorLens';

import SelectOptions from './SelectOptions';
import MarkDownEditor from './MarkDownEditor';


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

const DataElementForm = ({de}) => {

    console.log(de)

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
    const [formName,setFormName] = useState(metadata.elemType === 'label' ? metadata.labelFormName : de.formName)
    const [compulsory,setCompulsory] = useState(metadata.isCompulsory==='Yes')  // metadata.isCompulsory : ['Yes','No']
    const [optionSet,setOptionSet] = useState(de.optionSet ? {label:de.optionSet.name, id:de.optionSet.id } : null)
    const [legendSet,setLegendSet] = useState(de.legendSet ? {label:de.legendSet.name, id:de.legendSet.id } : null)
    const [description,setDescription] = useState(de.description || '')
    
    const [critical,setCritical] = useState(metadata.isCritical==='Yes') // metadata.isCritical : ['Yes','No']
    const [numerator,setNumerator] = useState(metadata.scoreNum || '')
    const [denominator,setDenominator] = useState(metadata.scoreDen || '')
    const [feedbackOrder,setFeedbackOrder] = useState(metadata.feedbackOrder || '')
    const [feedbackText, setFeedbackText] = React.useState(metadata.feedbackText || '');

    // Handlers
    const elemTypeChange = (e) => {
        setStructure(e.target.value)
        if(e.target.value === 'label'){
            setValueType('LONG_TEXT')
            setOptionSet(null)
        }
    }

    const valueTypeChange = (data) => setValueType(data.target.value)   // VALIDATIONS NEEDED (OPTION SET, ...)

    const formNameChange = (data) => setFormName(data.target.value)

    const compulsoryChange = (data) => setCompulsory(data.target.checked)

    const optionSetChange = (event, value) => setOptionSet(value)

    const legendSetChange = (event, value) => setLegendSet(value)

    const descriptionChange = (data) => setDescription(data.target.value)

    const criticalChange = (data) => setCritical(data.target.checked)

    const numeratorChange = data => setNumerator(data.target.value)

    const denominatorChange = data => setDenominator(data.target.value)

    const feedbackOrderChange = data => setFeedbackOrder(data.target.value)

    console.log(metadata)

    
    return (
    <div className="section_cont" style={{display:'flex', flexDirection:'column', padding: '1.5em 1em'}}>

        <div style={{display:'flex', flexDirection:'row', alignItems: 'center', marginBottom: '1em'}}>
            <FilterNoneIcon/>
            <h2 style={{marginLeft: '10px'}}>Data Element Configuration</h2>
        </div>

        <h3 style={{marginBottom: '0.5em'}}>DHIS2 Settings</h3>

        <Grid container spacing={2} style={{alignItems:'center'}}>
            <Grid item xs={5} style={{alignItems:'end'}} direction='column'>
                <Grid item>
                    <RowRadioButtonsGroup label={"Element Type"} items={elemTypes} handler={elemTypeChange} value={structure} />
                </Grid>
                <FormLabel component="legend">Behavior in Current Stage</FormLabel>
                <Grid item>
                    <FormControlLabel disabled={structure==='label'} control={<Switch checked={compulsory && structure!=='label'} onChange={compulsoryChange} />} label="Compulsory" />
                    <FormControlLabel disabled={structure==='label'} control={<Switch /* checked={compulsory && structure!=='label'} onChange={compulsoryChange} */ />} label="Display in Reports" />
                </Grid>
            </Grid>
            <Grid item xs={5} style={{display: 'flex', flexDirection: 'column'}}>
                <FormLabel component="legend">Data Element Value Type</FormLabel>
                <div style={{display: 'flex', width: '100%', marginTop: '0.5em'}}>
                    <SelectOptions label="Value Type" styles={{ width: '40%' }} items={valueTypes} value={optionSet?.valueType || valueType} disabled={structure==='label' || optionSet!=null} handler={valueTypeChange} />
                    <p style={{display: 'flex', alignItems: 'center', margin: 'auto 20px'}}>or</p>
                    <Autocomplete
                        autoComplete
                        id="optionSetsSelect"
                        disabled={structure==='label'}
                        options={serverOptionSets?.results.optionSets.map(os => ({label:os.name, id:os.id, valueType: os.valueType}) ) || []}
                        sx={{ width: '40%' }}
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
        <TextField id="formName" fullWidth margin="dense" label="Form Name" variant="standard" value={formName} onChange={formNameChange} />
        <TextField id="description" fullWidth margin="dense" label="Description" variant="standard" value={description} onChange={descriptionChange} />

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1em 0'}}>
            <Autocomplete
                autoComplete
                id="legendSetSelect"
                disabled={structure==='label'}
                sx={{width: '35%'}}
                options={serverLegendSets?.results.legendSets.map(ls => ({label:ls.name, id:ls.id}) ) || []}
                renderInput={(params) => <TextField {...params} label="Legend Set" />}
                value={legendSet}
                onChange={legendSetChange}
                getOptionLabel={(option)=>option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <div>
                <Button variant="outlined" size="large" startIcon={<InsertEmoticonIcon/>} style={{marginRight: '1em'}} >ADD ICON</Button>
                <Button variant="outlined" size="large" startIcon={<ColorLensIcon/>} >SELECT COLOR</Button>
            </div>
        </div>

        <div>
            <h3 style={{marginBottom: '0.5em'}}>HNQIS Settings</h3>

            
            <div style={{display: 'flex', alignItems: 'center'}}>
                <FormControlLabel disabled={structure==='label'} control={<Switch checked={critical && structure!=='label'} onChange={criticalChange} />} label="Critical Question" />
                <TextField disabled={structure==='label'} id="numerator" sx={{ minWidth: '2.5rem', width: '20%', marginRight: '1em'}} margin="dense" label="Numerator" variant='standard' value={structure!=='label'?numerator:''} onChange={numeratorChange} inputProps={{ type: 'number', min:'0' }} />
                <TextField disabled={structure==='label'} id="denominator" sx={{ minWidth: '2.5rem', width: '20%', marginRight: '1em' }} margin="dense" label="Denominator" variant='standard' value={structure!=='label'?denominator:''} onChange={denominatorChange} inputProps={{ type: 'number', min:'0' }} />
                <TextField id="feedbackOrder" sx={{ minWidth: '10rem', width: '20%' }} margin="dense" label="Feedback Order (Compositive Indicator)" variant="standard" value={feedbackOrder} onChange={feedbackOrderChange} />
            </div>

            <FormLabel component="legend">Feedback Text</FormLabel>
            <MarkDownEditor value={feedbackText} setValue={setFeedbackText} disabled={structure==='label'}/>
            
        </div>

    </div>
    )
}

export default DataElementForm