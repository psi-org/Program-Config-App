import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"


const SelectOptions = ({label,items,value,disabled=false,useError=true, handler}) => (
    
    <FormControl variant="standard" sx={{ minWidth: 250 }} margin="dense" error={useError && !value} disabled={disabled}>
        <InputLabel id={"select_"+label}>{label}</InputLabel>
        <Select labelId={"select_"+label} id={"id_"+label} value={value} onChange={handler} label={label} >
            <MenuItem value=""> <em>None</em> </MenuItem>
            {items.map(
                (item,key)=> <MenuItem key={key} value={item.value} ><div style={{ display: 'flex', alignItems: 'center', justifyItems:'' }}>{item.icon} {item.label}</div></MenuItem> 
            )}
        </Select>
    </FormControl>
)

export default SelectOptions