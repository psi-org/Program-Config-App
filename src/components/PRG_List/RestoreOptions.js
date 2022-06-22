import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { useState, useRef, useEffect } from "react";
import { DialogActions, DialogContent, DialogContentText, Divider, Grid, Typography, FormGroup, FormLabel, FormControl, FormControlLabel, RadioGroup, Radio, Checkbox, Button, RadioButton } from '@mui/material';
import { DeepCopy } from '../../configs/Utils';

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const RestoreOptions = props => {
    let metadataPayload = {};
    const programRef = useRef();
    const programStageRef = useRef();
    const programStageSectionsRef = useRef();
    const dataElementsRef = useRef();

    const [ouOption, setOUOption] = useState('keepOUnits');
    const [sharingOption, setSharingOption] = useState('keepSharing');

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

    const restoreHandler = () => {
        console.log("Backing up: ", props);
        if (programRef.current.checked) {
            metadataPayload.programs = DeepCopy(props.backup.metadata.programs);
            if (ouOption === "keepOUnits")
                delete metadataPayload.programs[0].organisationUnits;
            metadataPayload.attributes = DeepCopy(props.backup.metadata.attributes);
            metadataPayload.programRules = DeepCopy(props.backup.metadata.programRules);
            metadataPayload.programRuleActions = DeepCopy(props.backup.metadata.programRuleActions);
            metadataPayload.programRuleVariables = DeepCopy(props.backup.metadata.programRuleVariables);
            metadataPayload.programTrackedEntityAttributes = DeepCopy(props.backup.metadata.programTrackedEntityAttributes);
            metadataPayload.trackedEntityTypes = DeepCopy(props.backup.metadata.trackedEntityTypes);
            metadataPayload.trackedEntityAttributes = DeepCopy(props.backup.metadata.trackedEntityAttributes);
            if (sharingOption === "keepSharing") {
                delete metadataPayload.programs[0].sharing;
                metadataPayload.attributes.forEach((attribute) => {
                   delete attribute.sharing;
                });
                metadataPayload.trackedEntityTypes.forEach((tei) => {
                    delete tei.sharing;
                })
                metadataPayload.trackedEntityAttributes.forEach((tea) => {
                   delete tea.sharing;
                });
            }
        }
        if (programStageRef.current.checked) {
            metadataPayload.programStages = DeepCopy(props.backup.metadata.programStages);
            if (sharingOption === "keepSharing") {
                metadataPayload.programStages.forEach((ps) => {
                   delete ps.sharing;
                });
            }
        }
        if (programStageSectionsRef.current.checked)
            metadataPayload.programStageSections = DeepCopy(props.backup.metadata.programStageSections);
        if (dataElementsRef.current.checked) {
            metadataPayload.programStageDataElements = DeepCopy(props.backup.metadata.programStageDataElements);
            metadataPayload.dataElements = DeepCopy(props.backup.metadata.dataElements);
            if (sharingOption === "keepSharing") {
                metadataPayload.dataElements.forEach((de) => {
                    delete de.sharing;
                })
            }
        }
        metadataRequest.mutate({ data: metadataPayload })
            .then(response => {
                console.log("Response: ", response);
            });
    }

    return (
        <>
            <DialogContent dividers style={{padding: '1em 2em'}}>
                    <Typography gutterBottom variant="h6" component="div">
                        {props.backup.name} _Version: {props.backup.version}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Backup Date: {props.backup.backup_date}
                    </Typography>
                    <Divider variant="middle" style={{ marginTop: "10px", marginBottom: "10px"}} />
                    <FormControl>
                        <FormLabel id="elements-row-radio-buttons-group-label">Restore Elements: </FormLabel>
                        <FormControlLabel control={<Checkbox defaultChecked/>} label="Program" inputRef={programRef}/>
                        <FormControlLabel control={<Checkbox />} label="Program Stages" inputRef={programStageRef}/>
                        <FormControlLabel control={<Checkbox />} label="Program Stage Sections" inputRef={programStageSectionsRef}/>
                        <FormControlLabel control={<Checkbox />} label="Data Elements" inputRef={dataElementsRef}/>
                    </FormControl>
                    <br/>
                    <FormControl>
                        <FormLabel id="orgUnit-row-radio-buttons-group-label">Organisation Unit: </FormLabel>
                        <RadioGroup row aria-labelledby="orgUnit-row-radio-buttons-group-label" name="restore_OrganisationUnit">
                            <FormControlLabel value="keepOUnits" control={<Radio />} label="Keep current selection" onChange={onOUOptionChangeHandler} />
                            <FormControlLabel value="overwriteOUnits" control={<Radio />} label="Overwrite with Backed up Information" onChange={onOUOptionChangeHandler} />
                        </RadioGroup>
                    </FormControl>
                    <br/>
                    <FormControl>
                        <FormLabel id="sharing-row-radio-buttons-group-label">Sharing Settings: </FormLabel>
                        <RadioGroup row aria-labelledby="sharing-row-radio-buttons-group-label" name="restore_Sharing">
                            <FormControlLabel value="keepSharing" control={<Radio />} label="Keep current Settings" onChange={onSharingChangeHandler}/>
                            <FormControlLabel value="overwriteSharing" control={<Radio />} label="Overwrite with Backed up information " onChange={onSharingChangeHandler}/>
                        </RadioGroup>
                    </FormControl>
            </DialogContent>
            <DialogActions style={{ padding: '1em'}}>
                <Button onClick={props.hideFormHandler} color={"error"}>Close</Button>
                <Button onClick={restoreHandler} color={"primary"}>Restore</Button>
            </DialogActions>
        </>
    )
}

export default RestoreOptions;