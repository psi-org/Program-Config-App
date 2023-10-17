import { useDataQuery } from '@dhis2/app-runtime'
import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { MAX_SECTION_NAME_LENGTH } from '../../configs/Constants.js';
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 1 }
    }
};

const SectionManager = ({ hnqisMode, newSectionIndex, notify, refreshSections, sectionIndex, sections, setAddedSection, setSaveStatus, setShowSectionForm }) => {

    const [sectionName, setSectionName] = useState(sections[sectionIndex]?.name || '');
    const [sentForm, setSentForm] = useState(false);

    const idsQuery = useDataQuery(queryId);
    const sectionId = idsQuery.data?.results.codes[0];

    const handleChangeSectionName = (event) => {
        setSectionName(event.target.value);
    };

    function hideForm() {
        setShowSectionForm(false);
    }

    const formDataIsValid = () => {
        return sectionName.trim() !== '' && sectionName.length <= MAX_SECTION_NAME_LENGTH;
    }

    function submission() {
        setSentForm(true)
        const section = sections[sectionIndex] || {};
        if (formDataIsValid()) {
            section.name = sectionName;
            section.displayName = sectionName;
            if (sectionIndex !== undefined) {
                sections[sectionIndex] = section;
            } else if (newSectionIndex !== undefined) {
                section.dataElements = [];
                section.id = sectionId;
                sections.splice(newSectionIndex, 0, section);
            }
            if (hnqisMode) { setSaveStatus('Validate & Save') }
            refreshSections(sections);
            notify(<span>Section {newSectionIndex !== undefined ? 'created' : 'edited'}! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong></span>);
            setAddedSection({ index: sectionIndex ?? newSectionIndex, mode: newSectionIndex !== undefined ? 'created' : 'edited', dataElements: [] });
            hideForm()
        }
    }

    return (
        <CustomMUIDialog open={true} maxWidth='md' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                {sections[sectionIndex]?.name ? 'Modify Existing Section' : 'Create New Section'}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em' }}>

                <TextField
                    error={sentForm && !formDataIsValid()}
                    helperText={sentForm ? (sectionName.trim() === '' ? 'This field is required' : (sectionName.length > MAX_SECTION_NAME_LENGTH ? `The Section Name cannot exceed ${MAX_SECTION_NAME_LENGTH} characters long` : '')) : ''}
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
                {sectionId !== undefined && <Button onClick={() => submission()} variant='outlined' startIcon={<SendIcon />}> Submit </Button>}
            </DialogActions>
        </CustomMUIDialog>
    )
}

SectionManager.propTypes = {
    hnqisMode: PropTypes.bool,
    newSectionIndex: PropTypes.number,
    notify: PropTypes.func,
    refreshSections: PropTypes.func,
    sectionIndex: PropTypes.number,
    sections: PropTypes.array,
    setAddedSection: PropTypes.func,
    setSaveStatus: PropTypes.func,
    setShowSectionForm: PropTypes.func
}

export default SectionManager;