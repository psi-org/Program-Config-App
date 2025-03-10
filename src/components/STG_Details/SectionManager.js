import { useDataQuery } from '@dhis2/app-runtime'
import SendIcon from '@mui/icons-material/Send';
import { FormControlLabel, Switch } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import { HNQISMWI_PROGRAM_STAGE_SECTION_TYPES, MAX_SECTION_NAME_LENGTH, MIN_NAME_LENGTH } from '../../configs/Constants.js';
import { HNQISMWI_ActionPlanElements, HNQISMWI_SectionDataElements } from '../../configs/ProgramTemplate.js';
import { DeepCopy, getSectionType, programIsHNQISMWI } from '../../utils/Utils.js';
import SelectOptions from '../UIElements/SelectOptions.js';
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'

const DEID_NO = HNQISMWI_SectionDataElements.length + HNQISMWI_ActionPlanElements.length + 2;
const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: DEID_NO }
    }
};

const SectionManager = ({ hnqisMode, hnqisType, newSectionIndex, notify, refreshSections, sectionIndex, sections, setAddedSection, setSaveStatus, setShowSectionForm }) => {
    
    const [type, setType] = useState("Section");
    const [critical, setCritical] = useState(false);
    const [sectionName, setSectionName] = useState(sections[sectionIndex]?.name || '');
    const [sentForm, setSentForm] = useState(false);

    const idsQuery = useDataQuery(queryId);
    const sectionId = idsQuery.data?.results.codes[0];
    
    
    useEffect(() => {
        if( programIsHNQISMWI(hnqisType) && sections[sectionIndex] ) {
            const selectedSection = sections[sectionIndex];
            const initType = getSectionType(selectedSection);

            const nameParts = selectedSection.name.split(":");
            const name = nameParts.length > 1? nameParts[1].trim() : nameParts[0].trim();
            
            setType (initType );
            setCritical ( selectedSection.description === "*" );
            setSectionName( name );
        }
    }, [])
    
    const handleChangeSectionName = (event) => {
        setSectionName(event.target.value);
    };

    function hideForm() {
        setShowSectionForm(false);
    }

    const formDataIsValid = () => {
        if( programIsHNQISMWI(hnqisType) && type === "") {
            return false;
        }
        
        return sectionName.trim() !== '' && sectionName.length <= MAX_SECTION_NAME_LENGTH && sectionName.length >= MIN_NAME_LENGTH;
    }

    function submission() {
        setSentForm(true)
        const section = sections[sectionIndex] || {};
        let numbersWarmingMsg = ""
        
        if (formDataIsValid()) {
            if( programIsHNQISMWI(hnqisType) ) {
                setHNQISMWISection(section);
                numbersWarmingMsg = "The numbers of section will be set/reset to proper number after saved."
            }
            else {
                section.name = sectionName;
                section.displayName = sectionName;
            }
            
            if (hnqisMode) { setSaveStatus('Validate & Save') }
            refreshSections(sections);
            
            notify(<span>Section {newSectionIndex !== undefined ? 'created' : 'edited'}! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong> <br/><strong>{numbersWarmingMsg}</strong></span>);
            setAddedSection({ index: sectionIndex ?? newSectionIndex, mode: newSectionIndex !== undefined ? 'created' : 'edited', dataElements: [] })
            hideForm()
        }
    }
    
    // Set id( if needed), name, description, dataElements( if needed ) for section (Section, Standard, Criterion)
    const setHNQISMWISection = (section) => {
        section.name = getMWISectionName();
        section.displayName = section.name;
        
        if (sectionIndex !== undefined) { // Edit section
            if (type === "Section" && section.dataElements.length === 0) {
                const sectionDE = createHNQISMWISectionDataElement()
                section.dataElements = [sectionDE];
            }
            sections[sectionIndex] = section
        } else if (newSectionIndex !== undefined) { // New section
            section.dataElements = []
            section.id = sectionId
            sections.splice(newSectionIndex, 0, section)
            
            
            if( type === "Section" ) {
                const sectionDE = createHNQISMWISectionDataElement()
                section.dataElements = [sectionDE];
            }
            else if( type === "Criterion" ) {    
                const sectionDEs = createHNQISMWICriterionDataElements();
                section.dataElements = sectionDEs;
            }
        }
        
        if(critical) {
            section.description = "*";
        }
        else {
            delete section.description;
        }
    }

    // Create Data Element for section "Section"
    const createHNQISMWISectionDataElement = () => {
        const de = DeepCopy(HNQISMWI_SectionDataElements).map((de, idx) => {
            
            const deIdIdx = idx + 1; // +1 because the first one is "sectionId"
            const deId = idsQuery.data?.results.codes[deIdIdx];
            
            de.id = deId;
            de.code = `${deId}`;
            de.name = `${deId} - Section #`;
            de.shortName = `${deId} - Section #`;
            de.formName = `Section #`;
            
            const attributeValue = JSON.parse(de.attributeValues[0].value);
            attributeValue.varName = `Section #`;
            de.attributeValues[0].value = JSON.stringify(attributeValue);
            
            return de;
        });
        
        return de[0];
    }
    
    /** Create Data Elements needed for section "Criterion"
     * 1. Check if there are DEs we needed existed in "Criterion"
     * 2. If not, create them
     * */ 
    const createHNQISMWICriterionDataElements = () => {
        return DeepCopy(HNQISMWI_ActionPlanElements).map((de, idx) => {
            
            const deIdIdx = idx + HNQISMWI_SectionDataElements.length + 1; // +1 because the first one is "sectionId"
            const deId = idsQuery.data?.results.codes[deIdIdx];

            de.id = deId
            de.code = `${deId}`
            de.name = `${deId} - #.#.# ${de.name}`
            de.displayName = de.name
            de.shortName = `${deId} - #.#.# ${de.shortName}`
            de.formName = `#.#.# ${de.formName}`
            
            return de
        })
    }
    
    const getMWISectionName = () => {
        const sectionNameSplit = sections[sectionIndex]?.name?.split(":");
        if ( sectionNameSplit && sectionNameSplit > 1 ) {
            const sectionPrefix = sectionNameSplit[0].trim();
            return `${sectionPrefix} : ${sectionName}`;
        } else {
            let sectionPrefix = type;
            if( type === "Section" ) {
                sectionPrefix = `${type} #`; // "#" here will be replaced to a proper number after saving
            }
            else if( type === "Standard" ) {
                sectionPrefix = `> ${type} #.#`;
            }
            else if( type === "Criterion" ) {
                sectionPrefix = `> > ${type} #.#.#`;
            }
            
            return `${sectionPrefix} : ${sectionName}`;
        }
    }

    return (
        <CustomMUIDialog open={true} maxWidth='md' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
                {sections[sectionIndex]?.name ? 'Modify Existing Section' : 'Create New Section'}
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', display: "flex", justifyContent: "space-between", flexWrap: "wrap"}}>
                {programIsHNQISMWI(hnqisType) && <>
                    <SelectOptions
                        label="Type (*)"
                        styles={{ width: '50%' }}
                        items={HNQISMWI_PROGRAM_STAGE_SECTION_TYPES}
                        value={type}
                        handler={(e) => {setType(e.target.value); setCritical(false);}} />
                        
                    {type === "Criterion" && <FormControlLabel
                        control={
                            <Switch
                                styles={{ width: '30%'}}
                                checked={critical}
                                onChange={(e) => {setCritical(e.target.checked);}}
                            />
                        }
                        label="Critical Criterion"
                    />}
                    
                    {type === "" && <span style={{color:"#d32f2f", fontWeight: "400", fontSize: "0.75rem", width: "100%"}}><br/>This field is required</span>}
                </>}
                
                <TextField
                    error={sentForm && !formDataIsValid()}
                    helperText={sentForm ? (sectionName.trim() === '' ? 'This field is required' : ((sectionName.length > MAX_SECTION_NAME_LENGTH || sectionName.length < MIN_NAME_LENGTH)? `The length is out of the accepted range (Between ${MIN_NAME_LENGTH} and ${MAX_SECTION_NAME_LENGTH} characters).` : '')) : ''}
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
    hnqisType: PropTypes.string,
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