//MATERIAL UI
import {TextField,Select,MenuItem,FormControl,InputLabel} from '@mui/material';
import { useEffect,useState } from "react"
import RowRadioButtonsGroup from './RowRadioButtonsGroup'
const DataElementForm = ({de}) => {

    console.log(de)
    const elemTypes = [{label:'question',value:'question'},{label:'label',value:'label'}]
    const handleElemType = (e) => console.log(e)


    const metadata = JSON.parse(de.attributeValues.find(att => att.attribute.id === 'haUflNqP85K')?.value || '{}')
    console.log(metadata)

    const [valueType,setValueType] = useState(de.valueType)
    const valueTypeChange = (data) => setValueType(data.target.value)   // VALIDATIONS NEEDED (OPTION SET, ...)

    return (
    <div className="section_cont" style={{display:'block'}}>
        
        {/* <TextField id="name" fullWidth margin="dense" label="Name" variant="standard" defaultValue={de.name} />
        <TextField id="shortName" fullWidth margin="dense" label="Short Name" variant="standard" defaultValue={de.shortName} />
        <TextField id="code" fullWidth margin="dense" label="Code" variant="standard" defaultValue={de.code} /> */}

        <TextField id="formName" fullWidth margin="dense" label="Form Name" variant="standard" defaultValue={ metadata.elemType === 'label' ? metadata.labelFormName : de.formName } />

        <RowRadioButtonsGroup label={"Structure"} items={elemTypes} handler={handleElemType} />

        <FormControl variant="standard" sx={{ minWidth: 250 }} margin="dense" error={!valueType}>
            <InputLabel id="valueTypeLabel">Value Type</InputLabel>
            <Select
                labelId="valueTypeLabel"
                id="valueType"
                value={valueType}
                onChange={valueTypeChange}
                label="Value Type"
            >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                <MenuItem value={'NUMBER'} >NUMBER</MenuItem>
                <MenuItem value={'INTEGER'} >INTEGER</MenuItem>
                <MenuItem value={'INTEGER_POSITIVE'} >INTEGER_POSITIVE</MenuItem>
                <MenuItem value={'INTEGER_ZERO_OR_POSITIVE'} >INTEGER_ZERO_OR_POSITIVE</MenuItem>
                <MenuItem value={'TEXT'} >TEXT</MenuItem>
                <MenuItem value={'LONG_TEXT'} >LONG_TEXT</MenuItem>
                <MenuItem value={'PERCENTAGE'} >PERCENTAGE</MenuItem>
                <MenuItem value={'DATE'} >DATE</MenuItem>
                <MenuItem value={'TIME'} >TIME</MenuItem>
            </Select>
        </FormControl>

        {/* <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} /> */}
    </div>
    )
}

export default DataElementForm