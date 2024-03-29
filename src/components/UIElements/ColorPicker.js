import ColorLensIcon from '@mui/icons-material/ColorLens';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import {Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import React, { useState } from "react"
import { ChromePicker } from 'react-color';


const ColorPicker = (props) => {

    const [displayColorPicker,setDisplayColorPicker] = useState(false)

    return (
    <div style={{position:'relative', display:'flex', alignItems:'center', marginLeft:'1em'}}>
        <Button variant="outlined" size="large" startIcon={<ColorLensIcon />} onClick={()=>setDisplayColorPicker(!displayColorPicker)}>
            <span>SELECT COLOR</span>
        </Button>
        {props.parentColor && 
            <IconButton onClick={()=>props.setParentColor(undefined)} color="error">
                <FormatColorResetIcon />
            </IconButton>
        }   
        { displayColorPicker && 
            <div style={{position: 'absolute',zIndex: '2', right:'50%', bottom:'100%'}}>
                <div style={{position: 'fixed',top: '0px',right: '0px',bottom: '0px',left: '0px'} } onClick={()=>setDisplayColorPicker(false)}/>
                <ChromePicker color={props.parentColor} onChangeComplete={(color)=>props.setParentColor(color.hex)} style={{width:'5rem'}} />
            </div> 
        }
    </div>
    )
}

ColorPicker.propTypes = {
    parentColor: PropTypes.string,
    setParentColor: PropTypes.func
}

export default ColorPicker