import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import UploadFileIcon from '@mui/icons-material/UploadFile'

const TrackerImporter = ({onClose,process}) => {

    const [file, setFile] = useState(null);

    return <>
    
    <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => {}}>
            Select Configuration File
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Button variant="contained" component="label" style={{width: '30%', maxWidth: '30%', minWidth: '30%'}}>
                    Select File
                    <input
                        type="file"
                        accept=".xlsx"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                </Button>
                <span style={{width: '65%', maxWidth: '65%', minWidth: '65%', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden'}}>{file?.name || 'No file selected...'}</span>

            </div>
        </DialogContent>
        <DialogActions style={{ padding: '1em' }}>
            <Button color={'primary'} variant={'text'} onClick={() => onClose()}>Close</Button>
            <Button variant='outlined' disabled={!file}  startIcon={<UploadFileIcon />} onClick={() => process(file)}> Import </Button>
        </DialogActions>
    </CustomMUIDialog>
    
    </>
};

export default TrackerImporter;

