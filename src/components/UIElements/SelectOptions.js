import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import FormHelperText from '@mui/material/FormHelperText';


const SelectOptions = ({label,items,value,disabled=false,useError=true, handler,styles={}, defaultOption='None', helperText=''}) => (
    
    <FormControl variant="standard" style={styles} margin="normal" error={useError && !value} disabled={disabled}>
        <InputLabel id={"select_"+label}>{label}</InputLabel>
        <Select labelId={"select_"+label} id={"id_"+label} value={value} onChange={handler} label={label}>
            {defaultOption && <MenuItem value=""> <em>{defaultOption}</em> </MenuItem> }
            {items.map(
                (item,key)=> <MenuItem key={key} value={item.value} ><div style={{ display: 'flex', alignItems: 'center', justifyItems:'' }}>{item.icon} {item.label}</div></MenuItem> 
            )}
        </Select>
        <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
)

export default SelectOptions