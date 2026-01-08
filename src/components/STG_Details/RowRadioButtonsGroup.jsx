import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import PropTypes from 'prop-types';
import React from 'react';

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

RowRadioButtonsGroup.propTypes = {
    handler: PropTypes.func,
    items: PropTypes.array,
    label: PropTypes.string,
    value: PropTypes.string
}

export default RowRadioButtonsGroup