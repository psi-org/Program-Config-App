// Hooks
import {useState} from 'react';

// DIALOG
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const InputModal = ({opened,title,label,value,onConfirm,onClose}) => {

    const [inputValue,setInputValue] = useState(value);

    return (
        <CustomMUIDialog open={opened} maxWidth='sm' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={onClose}>
                {title}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', width:'100%' }}>
                <TextField label={label} variant="standard" style={{width:'100%'}} value={inputValue} onChange={(e)=>setInputValue(e.target.value)}  />
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button onClick={onClose} color="error" variant='outlined'> Cancel </Button>
                <Button onClick={()=>onConfirm(inputValue)} color="success" variant='contained' disabled={inputValue===''}> Save </Button>
            </DialogActions>
        </CustomMUIDialog>
    )
}

export default InputModal;