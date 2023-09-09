import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'

const InputModal = ({ opened, title, label, value, onConfirm, onClose }) => {

    const [inputValue, setInputValue] = useState(value);

    return (
        <CustomMUIDialog open={opened} maxWidth='sm' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={onClose}>
                {title}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', width: '100%' }}>
                <TextField label={label} variant="standard" style={{ width: '100%' }} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button onClick={onClose} color="error" variant='outlined'> Cancel </Button>
                <Button onClick={() => onConfirm(inputValue)} color="success" variant='contained' disabled={inputValue === ''}> Save </Button>
            </DialogActions>
        </CustomMUIDialog>
    )
}

InputModal.propTypes = {
    label: PropTypes.string,
    opened: PropTypes.bool,
    title: PropTypes.string,
    value: PropTypes.string,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func
}

export default InputModal;