import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export default RowRadioButtonsGroup = ({label,items,handler}) => (
    <FormControl>
        <FormLabel id={'label-'+label.replace(' ','')}>{label}</FormLabel>
        <RadioGroup
            row
            aria-labelledby={'label-'+label.replace(' ','')}
            name={label.replace(' ','')}
            onChange={handler}
        >
            {items.map(item => <FormControlLabel value={item.value} control={<Radio />} label={item.label} /> )}
        </RadioGroup>
    </FormControl>
)