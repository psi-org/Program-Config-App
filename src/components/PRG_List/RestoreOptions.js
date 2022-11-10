import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { useState, useRef, useEffect } from "react";
import { DialogActions, DialogContent, DialogContentText, Divider, Grid, Typography, FormGroup, FormLabel, FormControl, FormControlLabel, RadioGroup, Radio, Checkbox, Button, RadioButton, Box, CircularProgress, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { DeepCopy, parseErrorsJoin } from '../../configs/Utils';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data,
    params: {
        importMode: 'COMMIT'
    }
};

const metadataValidation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data,
    params: {
        importMode: 'VALIDATE'
    }
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#2c6693",
        color: theme.palette.common.white,
        fontWeight: "bold"
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const RestoreOptions = props => {
    const programMetadata = {
        results: {
            resource: `programs/${props.backup.metadata.programs[0].id}/metadata.json`
        }
    }

    let metadataPayload = {};
    
    const [checkedState, setCheckedState] = useState(
        new Array(10).fill(false)
    );
    const [ouOption, setOUOption] = useState('keepOUnits');
    const [sharingOption, setSharingOption] = useState('keepSharing');
    const [content, setContent] = useState('form');
    const [isLoading, setIsLoading] = useState(false);
    const [validationResult, setValidationResult] = useState(false);
    const [importStatus, setImportStatus] = useState({});
    const { loading: loadingMetadata, error: errorMetadata, data: progMetaData } = useDataQuery(programMetadata);
    const metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            hideFormHandler();
        }
    });
    const validateDM = useDataMutation(metadataValidation, {
        onError: (err) => {
            props.setNotification({
                message: parseErrorsJoin(err.details, '\\n'),
                severity: "error",
            });
            hideFormHandler();
        }
    });
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        data: metadataDM[1].data
    }
    const validateRequest = {
        mutate: validateDM[0],
        loading: validateDM[1].loading,
        data: validateDM[1].data
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

    const onCheckBoxHandler = (position) => {
        let changeState = [0, 6, 8].includes(position) && childrenChecked(position) ? false : true;
        if (changeState) {
            const updatedCheckedState = checkedState.map((item, index) =>
                index === position ? !item : item
            );

            if (updatedCheckedState[position]) {
                if (!updatedCheckedState[0])
                    updatedCheckedState[0] = true;

                if ([7, 8, 9].includes(position))
                    updatedCheckedState[6] = true;

                if (position === 9)
                    updatedCheckedState[8] = true;
            }

            setCheckedState(updatedCheckedState);
        }
    }

    const childrenChecked = (position) => {
        let children = checkedState.slice(position + 1, 10);
        return children.includes(true);
    }

    const restoreHandler = (dryRun) => {
        setValidationResult(false);
        setIsLoading(true);
        if (checkedState[0]) { //Program Checked
            metadataPayload.programs = DeepCopy(props.backup.metadata.programs);
            if (ouOption === "keepOUnits") {
                metadataPayload.programs[0].organisationUnits = DeepCopy(progMetaData.results?.program?.organisationUnits);
            }
            metadataPayload.attributes = DeepCopy(props.backup.metadata.attributes);
            if (checkedState[2]) { //ProgramRule CHecked
                metadataPayload.programRules = DeepCopy(props.backup.metadata.programRules);
                metadataPayload.programRuleActions = DeepCopy(props.backup.metadata.programRuleActions);
                metadataPayload.programRuleVariables = DeepCopy(props.backup.metadata.programRuleVariables);
            }
            if (checkedState[5]) //Program Tracked Entity Attributes
                metadataPayload.programTrackedEntityAttributes = DeepCopy(props.backup.metadata.programTrackedEntityAttributes);
            if (checkedState[3]) //TETypes Checked
                metadataPayload.trackedEntityTypes = DeepCopy(props.backup.metadata.trackedEntityTypes);
            if (checkedState[4]) //Tracked Entity Attributes
                metadataPayload.trackedEntityAttributes = DeepCopy(props.backup.metadata.trackedEntityAttributes);
            if (checkedState[1]) { //Option Sets
                metadataPayload.options = DeepCopy(props.backup.metadata.options);
                metadataPayload.optionSets = DeepCopy(props.backup.metadata.optionSets);
            }
            if (sharingOption === "keepSharing") {
                metadataPayload.programs[0].sharing = DeepCopy(progMetaData.results?.program?.sharing);
                if(metadataPayload.attributes?.length > 0) {
                    metadataPayload.attributes.forEach((attribute) => {
                        let match = progMetaData.results?.attributes.filter(param => param.id === attribute.id)
                        attribute.sharing = DeepCopy(match[0].sharing)
                    });
                }
                if (checkedState[3]) { //TE Types 
                    metadataPayload.trackedEntityTypes.forEach((tei) => {
                        let match = progMetaData.results?.trackedEntityTypes.filter(param => param.id === tei.id)
                        tei.sharing = DeepCopy(match[0].sharing)
                    })
                }
                if (checkedState[4]) { //TE Attributes
                    metadataPayload.trackedEntityAttributes.forEach((tea) => {
                        let match = progMetaData.results?.trackedEntityAttributes.filter(param => param.id === tea.id)
                        tea.sharing = DeepCopy(match[0].sharing)
                    });
                }
                if (checkedState[1]) { //Option Set
                    metadataPayload.optionSets.forEach((optionSet) => {
                        let match = progMetaData.results?.optionSets.filter(param => param.id === optionSet.id)
                        optionSet.sharing = DeepCopy(match[0].sharing)
                    });
                }
            }
            if (checkedState[6]) { //Program Stage
                metadataPayload.programStages = DeepCopy(props.backup.metadata.programStages);
                if (sharingOption === "keepSharing") {
                    metadataPayload?.programStages.forEach((ps) => {
                        let match = progMetaData.results?.programStages.filter(param => param.id === ps.id)
                        ps.sharing = DeepCopy(match[0].sharing)
                    });
                }
                if (checkedState[7]) //Program Stage Section
                    metadataPayload.programStageSections = DeepCopy(props.backup.metadata.programStageSections);
                if (checkedState[8]) { //Program Stage Data ELement
                    metadataPayload.programStageDataElements = DeepCopy(props.backup.metadata.programStageDataElements);
                    if (checkedState[9]) { //Data ELement
                        metadataPayload.dataElements = DeepCopy(props.backup.metadata.dataElements);
                        if (sharingOption === "keepSharing") {
                            metadataPayload?.dataElements.forEach((de) => {
                                let match = progMetaData.results?.dataElements.filter(param => param.id === de.id)
                                de.sharing = DeepCopy(match[0].sharing)
                            })
                        }
                    }
                }
            }
        }
        let request = (dryRun) ? validateRequest : metadataRequest;
        request.mutate({ data: metadataPayload })
            .then(response => {
                setIsLoading(false);
                if (response.status !== 'OK') {
                    props.setNotification({
                        message: `Something went wrong while Restoring Program. Please try again later.`,
                        severity: 'error'
                    })
                    hideFormHandler();
                }
                else {
                    if (dryRun) {
                        setValidationResult(true);
                        setImportStatus(response.stats);
                    } else {
                        props.setNotification({
                            message: `Program Restored successfully.`,
                            severity: 'success'
                        })
                        hideFormHandler();
                    }
                }
            });
    }

    const programStageDEChildren = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            <FormControlLabel label="Data Elements" control={<Checkbox checked={checkedState[9]} onChange={() => onCheckBoxHandler(9)} />} />
        </Box>
    )

    const programStageChildren = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            <FormControlLabel label="Program Stage Sections" control={<Checkbox checked={checkedState[7]} onChange={() => onCheckBoxHandler(7)} />} />
            <FormControlLabel label="Program Stage Data Elements" control={<Checkbox checked={checkedState[8]} onChange={() => onCheckBoxHandler(8)} />} />
            {programStageDEChildren}
        </Box>
    )

    const programChildren = (
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            <FormControlLabel label="Options (Options + Optionsets)" control={<Checkbox checked={checkedState[1]} onChange={() => onCheckBoxHandler(1)} />} />
            <FormControlLabel label="Program Rules ( Program Rules + Action + Variable)" control={<Checkbox checked={checkedState[2]} onChange={() => onCheckBoxHandler(2)} />} />
            <FormControlLabel label="Tracked Entity Types" control={<Checkbox checked={checkedState[3]} onChange={() => onCheckBoxHandler(3)} />} />
            <FormControlLabel label="Tracked Entity Attributes" control={<Checkbox checked={checkedState[4]} onChange={() => onCheckBoxHandler(4)} />} />
            <FormControlLabel label="Program Tracked Entity Attributes" control={<Checkbox checked={checkedState[5]} onChange={() => onCheckBoxHandler(5)} />} />
            <FormControlLabel label="Program Stages" control={<Checkbox checked={checkedState[6]} onChange={() => onCheckBoxHandler(6)} />} />
            {programStageChildren}
        </Box>
    )

    const setSelectAll = (value) => {
        setCheckedState(new Array(10).fill(value));
    }

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
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        {validationResult &&
                            <>
                                <FormLabel focused={false} style={{fontWeight: 'bold'}}>Import Summary</FormLabel>
                                <TableContainer sx={{ width: '100%', margin: '1em 0' }} justify={"center"} component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell align="center">Created</StyledTableCell>
                                                <StyledTableCell align="center">Updated</StyledTableCell>
                                                <StyledTableCell align="center">Deleted</StyledTableCell>
                                                <StyledTableCell align="center">Ignored</StyledTableCell>
                                                <StyledTableCell align="center">Total</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center">{importStatus.created}</TableCell>
                                                <TableCell align="center">{importStatus.updated}</TableCell>
                                                <TableCell align="center">{importStatus.deleted}</TableCell>
                                                <TableCell align="center">{importStatus.ignored}</TableCell>
                                                <TableCell align="center">{importStatus.total}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        }
                        <FormControl style={{ width: '100%' }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <FormLabel id="elements-row-radio-buttons-group-label" focused={false}  style={{fontWeight: 'bold'}}>Restore Elements: </FormLabel>
                                <div style={{ display: 'flex', gap: '0.75em' }}>
                                    <Button onClick={() => setSelectAll(true)} color='primary' variant="outlined">Select All</Button>
                                    <Button onClick={() => setSelectAll(false)} color='primary' variant="outlined">Select None</Button>
                                </div>
                            </div>
                            <FormControlLabel control={<Checkbox checked={checkedState[0]} onChange={() => onCheckBoxHandler(0)} />} label="Program" />
                            {programChildren}
                        </FormControl>
                        <br />
                        <FormControl>
                            <FormLabel id="orgUnit-row-radio-buttons-group-label" focused={false}  style={{fontWeight: 'bold'}}>Organisation Units: </FormLabel>
                            <RadioGroup row aria-labelledby="orgUnit-row-radio-buttons-group-label" name="restore_OrganisationUnit" defaultValue="keepOUnits">
                                <FormControlLabel value="keepOUnits" control={<Radio />} label="Keep current settings" onChange={onOUOptionChangeHandler} />
                                <FormControlLabel value="overwriteOUnits" control={<Radio />} label="Overwrite with backed up configuration" onChange={onOUOptionChangeHandler} />
                            </RadioGroup>
                        </FormControl>
                        <br />
                        <FormControl>
                            <FormLabel id="sharing-row-radio-buttons-group-label" focused={false}  style={{fontWeight: 'bold'}}>Sharing Settings: </FormLabel>
                            <RadioGroup row aria-labelledby="sharing-row-radio-buttons-group-label" name="restore_Sharing" defaultValue="keepSharing">
                                <FormControlLabel value="keepSharing" control={<Radio />} label="Keep current settings" onChange={onSharingChangeHandler} />
                                <FormControlLabel value="overwriteSharing" control={<Radio />} label="Overwrite with backed up configuration " onChange={onSharingChangeHandler} />
                            </RadioGroup>
                        </FormControl>
                        <br />
                        {/*<FormControl>
                            <FormControlLabel control={<Switch checked={dryRun} />} label="Dry Run" onChange={dryRunHandler}/>
                        </FormControl>*/}

                    </DialogContent>
                    <DialogActions style={{ padding: '1em', display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                        <div style={{ display: 'flex', gap: '0.75em' }}>
                            <Button onClick={hideFormHandler} color={"error"} variant="outlined">Cancel</Button>
                            <LoadingButton onClick={() => restoreHandler(true)} disabled={isLoading} loading={isLoading} color={"primary"} variant="contained"> Dry Run</LoadingButton>
                            <LoadingButton onClick={() => restoreHandler(false)} disabled={isLoading} loading={isLoading} color={"primary"} variant="outlined"> Restore</LoadingButton>
                        </div>
                        <label style={{ fontSize: '0.8em', paddingTop: '0.8em' }}><em>A dry run tests the import settings without importing any data</em></label>
                    </DialogActions>
                </>
            }
        </>
    )
}

export default RestoreOptions;