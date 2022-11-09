import React from 'react';
import { useState } from "react";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import SendIcon from '@mui/icons-material/Send';
import { MAX_SECTION_NAME_LENGTH } from '../../configs/Constants';

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 1 }
    }
};

const SectionManager = (props) => {

    const [section, setSection] = useState(props.sections[props.sectionIndex] || {})
    const [sectionName, setSectionName] = useState(section.name || '')
    const [sentForm, setSentForm] = useState(false);

    const idsQuery = useDataQuery(queryId);
    const sectionId = idsQuery.data?.results.codes[0];

    const handleChangeSectionName = (event) => {
        setSectionName(event.target.value);
    };

    function hideForm() {
        props.setShowSectionForm(false);
    }

    const formDataIsValid = () =>{
        return sectionName.trim() !== '' && sectionName.length<=MAX_SECTION_NAME_LENGTH;
    }

    function submission() {
        setSentForm(true)
        if (formDataIsValid()) {
            section.name = sectionName
            section.displayName = sectionName
            if(props.sectionIndex!==undefined){
                props.sections[props.sectionIndex] = section
            }else if(props.newSectionIndex!==undefined){
                section.dataElements = []
                section.id = sectionId
                props.sections.splice(props.newSectionIndex, 0, section);
            }
            if(props.hnqisMode) props.setSaveStatus('Validate & Save');
            props.refreshSections(props.sections)
            props.notify(<span>Section {props.newSectionIndex!==undefined?'created':'edited'}! <strong>Remember to {props.hnqisMode? " Validate and Save!":" save your changes!"}</strong></span>)
            props.setAddedSection({index:props.sectionIndex ?? props.newSectionIndex ,mode:props.newSectionIndex!==undefined?'created':'edited',dataElements:[]})
            hideForm()
        }
    }

    return (
        <CustomMUIDialog open={true} maxWidth='md' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                {section.name?'Modify Existing Section':'Create New Section'}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em' }}>
                
                <TextField
                    error={sentForm && !formDataIsValid()}
                    helperText={sentForm?(sectionName.trim()==='' ? 'This field is required' : (sectionName.length>MAX_SECTION_NAME_LENGTH ? `The Section Name cannot exceed ${MAX_SECTION_NAME_LENGTH} characters long` : '') ): ''}
                    margin="normal"
                    id="name"
                    label="Section Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete='off'
                    value={sectionName}
                    onChange={handleChangeSectionName}
                />
                
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button onClick={() => hideForm()} color="error" > Close </Button>
                {sectionId!==undefined && <Button onClick={() => submission()} variant='outlined' startIcon={<SendIcon />}> Submit </Button>}
            </DialogActions>
        </CustomMUIDialog>
    )
}

export default SectionManager;