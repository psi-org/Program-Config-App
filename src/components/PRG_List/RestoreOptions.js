import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { useState, useRef, useEffect } from "react";
import { DialogActions, DialogContent, DialogContentText, Divider, Grid, Typography, FormGroup, FormLabel, FormControl, FormControlLabel, RadioGroup, Radio, Checkbox, Button, RadioButton, Box, CircularProgress } from '@mui/material';
import { DeepCopy } from '../../configs/Utils';

const programQuery = {
    results: {
        resource: 'programs',
        id: ({ id }) => id,
        params: {
            fields: ['id','organisationUnits']
        }
    }
}

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const RestoreOptions = props => {
    let metadataPayload = {};
    const programRef = useRef();
    const TETypeRefs = useRef();
    const ounitsRef = useRef();
    const programRulesRef = useRef();
    const programRuleActionRef = useRef();
    const programRuleVariableRef = useRef();
    const optionSetRef = useRef();
    const optionRef = useRef();
    const TEAttributesRef = useRef();
    const programTEAttrbutesRef = useRef();
    const programStageRef = useRef();
    const programStageSectionsRef = useRef();
    const programStageDataElementsRef = useRef();
    const dataElementsRef = useRef();
    const attributesRef = useRef();

    const [ouOption, setOUOption] = useState('keepOUnits');
    const [sharingOption, setSharingOption] = useState('keepSharing');
    const [content, setContent] = useState('form');
    const [downloading, setDownloading] = useState(false);
    const [programChecked, setProgramChecked] = useState(false);
    const [programStageChecked, setProgramStageChecked] = useState(false);
    const [psDataELementsChecked, setPsDataElementsChecked] = useState(false);

    const { loading: programLoading, data: program, error: programErrors } = useDataQuery(programQuery, { variables: { id: props.backup.metadata.programs[0].id }});
    const metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data
    }

    const onOUOptionChangeHandler = (e) => {
        setOUOption(e.target.value);
    }

    const onSharingChangeHandler = (e) => {
        setSharingOption(e.target.value);
    }

    const hideFormHandler = () => {
        props.setRestoreProgramId(undefined);
    }

    const onCheckboxCheckedHandler = (e) => {
        setProgramStageDataElement();
        setProgramStage();
        setProgram();
    }

    const setProgramStageDataElement = () => {
        if (!programStageDataElementsRef.current.checked)
            setPsDataElementsChecked(dataElementsRef.current?.checked);
    }

    const setProgramStage = () => {
        if (!programStageRef.current.checked)
            setProgramStageChecked(programStageSectionsRef.current.checked || programStageDataElementsRef.current.checked || dataElementsRef.current?.checked);
    }

    const setProgram = () => {
        if (!programRef.current.checked)
            setProgramChecked(TETypeRefs.current.checked || optionRef.current.checked || optionSetRef.current.checked || programRulesRef.current.checked || programRuleActionRef.current.checked || programRuleVariableRef.current.checked || programTEAttrbutesRef.current.checked || TEAttributesRef.current.checked || programStageRef.current.checked || programStageSectionsRef.current.checked || programStageDataElementsRef.current.checked || dataElementsRef.current?.checked)
    }

    const toggleProgram = () => {
        if (!(TETypeRefs.current.checked || optionRef.current.checked || optionSetRef.current.checked || programRulesRef.current.checked || programRuleActionRef.current.checked || programRuleVariableRef.current.checked || programTEAttrbutesRef.current.checked || TEAttributesRef.current.checked || programStageRef.current.checked || programStageSectionsRef.current.checked || programStageDataElementsRef.current.checked || dataElementsRef.current?.checked)) {
            if (programRef.current.checked)
                setProgramChecked(true)
            else
                setProgramChecked(false);
        }
    }

    const toggleProgramStage = () => {
        if (!(programStageSectionsRef.current.checked || programStageDataElementsRef.current.checked || dataElementsRef.current?.checked)) {
            if (programStageRef.current.checked)
                setProgramStageChecked(true)
            else
                setProgramStageChecked(false)
            onCheckboxCheckedHandler();
        }
    }

    const toggleProgramStageDataElement = () => {
        if (!dataElementsRef.current.checked) {
            if (programStageDataElementsRef.current.checked)
                setPsDataElementsChecked(true)
            else
                setPsDataElementsChecked(false);
            onCheckboxCheckedHandler();
        }
    }

    const downloadBackupHandler = () => {
        const blob = new Blob([JSON.stringify(props.backup.metadata)], {type: 'text/json'});
        const link = document.createElement('a');
        link.download = (props.backup.name)+'.json';
        link.href = window.URL.createObjectURL(blob);

        const eventClick = new MouseEvent('click', { view: window, bubbles: true, cancelable: true});
        link.dispatchEvent(eventClick);
        link.remove();
    }

    const restoreHandler = () => {
        setContent('loading');
        if (programRef.current.checked) {
            metadataPayload.programs = DeepCopy(props.backup.metadata.programs);
            if (ouOption === "keepOUnits") {
                metadataPayload.programs[0].organisationUnits = DeepCopy(program.results?.organisationUnits);
            }
            metadataPayload.attributes = DeepCopy(props.backup.metadata.attributes);
            if (programRulesRef.current.checked)
                metadataPayload.programRules = DeepCopy(props.backup.metadata.programRules);
            if (programRuleActionRef.current.checked)
                metadataPayload.programRuleActions = DeepCopy(props.backup.metadata.programRuleActions);
            if (programRuleVariableRef.current.checked)
                metadataPayload.programRuleVariables = DeepCopy(props.backup.metadata.programRuleVariables);
            if (programTEAttrbutesRef.current.checked)
                metadataPayload.programTrackedEntityAttributes = DeepCopy(props.backup.metadata.programTrackedEntityAttributes);
            if (TETypeRefs.current.checked)
                metadataPayload.trackedEntityTypes = DeepCopy(props.backup.metadata.trackedEntityTypes);
            if (TEAttributesRef.current.checked)
                metadataPayload.trackedEntityAttributes = DeepCopy(props.backup.metadata.trackedEntityAttributes);
            if (optionRef.current.checked)
                metadataPayload.options = DeepCopy(props.backup.metadata.options);
            if (optionSetRef.current.checked)
                metadataPayload.optionSets = DeepCopy(props.backup.metadata.optionSets);
            if (sharingOption === "keepSharing") {
                delete metadataPayload.programs[0].sharing;
                metadataPayload.attributes.forEach((attribute) => {
                   delete attribute.sharing;
                });
                if (TETypeRefs.current.checked) {
                    metadataPayload.trackedEntityTypes.forEach((tei) => {
                        delete tei.sharing;
                    })
                }
                if (TEAttributesRef.current.checked) {
                    metadataPayload.trackedEntityAttributes.forEach((tea) => {
                        delete tea.sharing;
                    });
                }
                if (optionSetRef.current.checked) {
                    metadataPayload.optionSets.forEach((optionSet) => {
                        delete optionSet.sharing;
                    });
                }
            }
            if (programStageRef.current.checked)
            {
                metadataPayload.programStages = DeepCopy(props.backup.metadata.programStages);
                if (sharingOption === "keepSharing") {
                    metadataPayload.programStages.forEach((ps) => {
                        delete ps.sharing;
                    });
                }
                if (programStageSectionsRef.current.checked)
                    metadataPayload.programStageSections = DeepCopy(props.backup.metadata.programStageSections);
                if (programStageDataElementsRef.current.checked)
                {
                    metadataPayload.programStageDataElements = DeepCopy(props.backup.metadata.programStageDataElements);
                    if (dataElementsRef.current.checked) {
                        metadataPayload.dataElements = DeepCopy(props.backup.metadata.dataElements);
                        if (sharingOption === "keepSharing") {
                            metadataPayload.dataElements.forEach((de) => {
                                delete de.sharing;
                            })
                        }
                    }
                }
            }
        }


        console.log("MEtaData Payload: ", metadataPayload);
        metadataRequest.mutate({ data: metadataPayload })
            .then(response => {
                if(response.status !== 'OK')
                {
                    console.log("Resposne: ", response);
                    props.setNotification({
                        message: `Something went wrong while Restoring Program. Please try again later`,
                        severity: 'error'
                    })
                    hideFormHandler();
                }
                else {
                    console.log("Success");
                    props.setNotification({
                        message: `Program Restored successfully!`,
                        severity: 'success'
                    })
                    hideFormHandler();
                }
            });
    }

    const programStageDEChildren = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml:3}}>
            <FormControlLabel label ="Data Elements" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={dataElementsRef}/>
        </Box>
    )

    const programStageChildren = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml:3}}>
            <FormControlLabel label ="Program Stage Sections" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={programStageSectionsRef}/>
            <FormControlLabel label ="Program Stage Data Elements" control={<Checkbox checked={psDataELementsChecked} onChange={toggleProgramStageDataElement}/>} inputRef={programStageDataElementsRef}/>
            {programStageDEChildren}
        </Box>
    )

    const programChildren = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml:3}}>
            <FormControlLabel label ="Tracked Entity Types" control={<Checkbox onChange={onCheckboxCheckedHandler} />} inputRef={TETypeRefs}/>
            <FormControlLabel label ="Option" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={optionRef}/>
            <FormControlLabel label ="Optionsets" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={optionSetRef}/>
            <FormControlLabel label ="Program Rules" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={programRulesRef}/>
            <FormControlLabel label ="program Rule Action" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={programRuleActionRef}/>
            <FormControlLabel label ="Program Rule Variable" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={programRuleVariableRef}/>
            <FormControlLabel label ="Program Tracked Entity Attributes" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={programTEAttrbutesRef}/>
            <FormControlLabel label ="Tracked Entity Attributes" control={<Checkbox onChange={onCheckboxCheckedHandler}/>} inputRef={TEAttributesRef}/>

            <FormControlLabel label ="Program Stages" control={<Checkbox checked={programStageChecked} onChange={toggleProgramStage}/>} inputRef={programStageRef}/>
            {programStageChildren}
        </Box>
    )

    return (
        <>
            {content === 'loading' && 
                <>
                    <DialogContent dividers justify={"center"}>
                        <Box sx={{ display: 'flex' }}><CircularProgress /></Box>
                        <Typography>Saving!</Typography>
                    </DialogContent>
                </>
            }
            {content === 'form' &&
            <>
                <DialogContent dividers style={{padding: '1em 2em'}}>
                        <FormControl>
                            <FormLabel id="elements-row-radio-buttons-group-label">Restore Elements: </FormLabel>
                            <FormControlLabel control={<Checkbox checked={programChecked} onClick={toggleProgram}/>} label="Program" inputRef={programRef}/>
                            { programChildren }
                        </FormControl>
                        <br/>
                        <FormControl>
                            <FormLabel id="orgUnit-row-radio-buttons-group-label">Organisation Unit: </FormLabel>
                            <RadioGroup row aria-labelledby="orgUnit-row-radio-buttons-group-label" name="restore_OrganisationUnit" defaultValue="keepOUnits">
                                <FormControlLabel value="keepOUnits" control={<Radio />} label="Keep current selection" onChange={onOUOptionChangeHandler} />
                                <FormControlLabel value="overwriteOUnits" control={<Radio />} label="Overwrite with Backed up Information" onChange={onOUOptionChangeHandler} />
                            </RadioGroup>
                        </FormControl>
                        <br/>
                        <FormControl>
                            <FormLabel id="sharing-row-radio-buttons-group-label">Sharing Settings: </FormLabel>
                            <RadioGroup row aria-labelledby="sharing-row-radio-buttons-group-label" name="restore_Sharing" defaultValue="keepSharing">
                                <FormControlLabel value="keepSharing" control={<Radio />} label="Keep current Settings" onChange={onSharingChangeHandler}/>
                                <FormControlLabel value="overwriteSharing" control={<Radio />} label="Overwrite with Backed up information " onChange={onSharingChangeHandler}/>
                            </RadioGroup>
                        </FormControl>
                </DialogContent>
                <DialogActions style={{ padding: '1em'}}>
                    <Button onClick={hideFormHandler} color={"error"}>Close</Button>
                    <Button onClick={downloadBackupHandler} color={"primary"}>Download</Button>
                    <Button onClick={restoreHandler} color={"primary"}>Restore</Button>
                </DialogActions>
            </>
            }
        </>
    )
}

export default RestoreOptions;