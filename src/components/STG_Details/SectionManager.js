import { useDataQuery } from '@dhis2/app-runtime'
import SendIcon from '@mui/icons-material/Send';
import { FormControlLabel, Switch } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import { HNQISMWI_PROGRAM_STAGE_SECTION_TYPES, MAX_SECTION_NAME_LENGTH, METADATA } from '../../configs/Constants.js';
import SelectOptions from '../UIElements/SelectOptions.js';
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'
import { DeepCopy, getSectionType, programIsHNQIS, programIsHNQISMWI } from '../../utils/Utils.js';
import { HNQISMWI_ActionPlanElements, HNQISMWI_SectionDataElements } from '../../configs/ProgramTemplate.js';

const queryId = {
    results: {
        resource: 'system/id.json',
        params: { limit: 1 }
    }
};

const SectionManager = ({ hnqisMode, hnqisType, dePrefix, newSectionIndex, notify, refreshSections, sectionIndex, sections, setAddedSection, setSaveStatus, setShowSectionForm }) => {
    
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
            const name = selectedSection.name.split(":")[1].trim();
            
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
        return sectionName.trim() !== '' && sectionName.length <= MAX_SECTION_NAME_LENGTH;
    }

    function submission() {
        setSentForm(true)
        const section = sections[sectionIndex] || {};
        if (formDataIsValid()) {
            if( programIsHNQISMWI(hnqisType) ) {
                section.name = getMWISectionName();
                section.displayName = section.name;
                if (sectionIndex !== undefined) {
                    sections[sectionIndex] = section;
                } else if (newSectionIndex !== undefined) {
                    section.dataElements = [];
                    section.id = sectionId;
                    sections.splice(newSectionIndex, 0, section);
                }
                
                if(critical) {
                    section.description = "*";
                }
                else {
                    delete section.description;
                }
                
                if( type === "Section" ) {
                    const sectionDE = createSectionDataElement();
                    section.dataElements = [];
                    section.dataElements.push(sectionDE);
                }
            }
            else {
                section.name = sectionName;
                section.displayName = sectionName;
            }
            
            if (hnqisMode) { setSaveStatus('Validate & Save') }
            refreshSections(sections);
            
            const numbersWarmingMsg = programIsHNQIS(hnqisType) ? "The numbers of section will be changed to proper number after saved." : ""
            notify(<span>Section {newSectionIndex !== undefined ? 'created' : 'edited'}! <strong>Remember to {hnqisMode ? " Validate and Save!" : " save your changes!"}</strong> <span>{numbersWarmingMsg}</span></span>);
            setAddedSection({ index: sectionIndex ?? newSectionIndex, mode: newSectionIndex !== undefined ? 'created' : 'edited', dataElements: [] });
            hideForm()
        }
    }
    
    const createSectionDataElement = () => {
        const de = DeepCopy(HNQISMWI_SectionDataElements).map(de => {
            
            const deId = idsQuery.data?.results.codes[0];
            de.id = deId;
            de.code = `${dePrefix} - Section ${newSectionIndex}`;
            de.name = `${dePrefix} - Section ${newSectionIndex}`;
            de.shortName = `${dePrefix} - Section ${newSectionIndex}`;
            de.formName = `Section ${newSectionIndex}`;
            
            const attributeValue = JSON.parse(de.attributeValues[0].value);
            attributeValue.varName = `Section ${newSectionIndex}`;
            de.attributeValues[0].value = JSON.stringify(attributeValue);
            
            return de;
        });
        
        return de[0];
    }
    
    // const createCriterionDataElements = () => {
    //     return DeepCopy(HNQISMWI_ActionPlanElements).map(de => {
    //         de.code = `${programPrefix} - x.x.x ${de.code}`;
    //         de.name = `${programPrefix} - ${sectionNumber}.${standardNumber}.${criterionNumber} ${de.name}`;
    //         de.shortName = `${programPrefix} - ${sectionNumber}.${standardNumber}.${criterionNumber} ${de.shortName}`;
    //         de.formName = `${sectionNumber}.${standardNumber}.${criterionNumber} ${de.formName}`;
    //         return de;
    //     })
    // }
    
    const getMWISectionName = () => {
        if( sections[sectionIndex] ) {
            const sectionPrefix = sections[sectionIndex].name.split(":")[0].trim();
            return `${sectionPrefix} : ${sectionName}`;
        }
        else {
            let sectionPrefix = type;
            if( type === "Section" ) {
                sectionPrefix = `${type} x`; // "x" here will be replaced to a proper number after saving
            }
            else if( type === "Standard" ) {
                sectionPrefix = `> ${type} x.x`;
            }
            else if( type === "Criterion" ) {
                sectionPrefix = `> > ${type} x.x.x`;
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
                </>}

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
    dePrefix: PropTypes.string,
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