import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const RowRadioButtonsGroup = ({label,items,handler,value=''}) => (
    <FormControl>
        <FormLabel id={'label-'+label.replace(' ','')}>{label}</FormLabel>
        <RadioGroup
            row
            aria-labelledby={'label-'+label.replace(' ','')}
            name={label.replace(' ','')}
            onChange={handler}
            value={value}
        >
            {items.map((item,key) => <FormControlLabel key={key} value={item.value} control={<Radio />} label={item.label} /> )}
        </RadioGroup>
    </FormControl>
)

export default RowRadioButtonsGroup