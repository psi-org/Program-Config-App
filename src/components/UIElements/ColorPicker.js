import { useState } from "react"
import {Button } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import IconButton from '@mui/material/IconButton';
import { ChromePicker } from 'react-color';


const ColorPicker = props => {

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
                <ChromePicker color={props.parentColor} onChangeComplete={(color,event)=>props.setParentColor(color.hex)} style={{width:'5rem'}} />
            </div> 
        }
    </div>
    )
}

export default ColorPicker