import { useDataQuery,useDataMutation } from "@dhis2/app-runtime";
import { Transfer } from "@dhis2/ui";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepContent from '@mui/material/StepContent';
import Stepper from '@mui/material/Stepper';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import React, {useState,useEffect} from 'react';
import AttributesEditor from '../TEAEditor/AttributesEditor.js';
import CustomMUIDialog from '../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from '../UIElements/CustomMUIDialogTitle.js'
import InputModal from './InputModal.js';

// Queries
const queryProgram = {
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['*','id', 'displayName','name',
            'programSections[id,name,trackedEntityAttributes,sortOrder,program,renderType]',
            'programTrackedEntityAttributes[id,name,displayInList,sortOrder,mandatory,allowFutureDate,renderOptionAsRadio,searchable,valueType,trackedEntityAttribute[id,name],renderType],trackedEntityType[id,trackedEntityTypeAttributes[trackedEntityAttribute[id]]]'
            ]
        }
    },
};

const queryIds = {
    results: {
        resource: 'system/id.json',
        params: ({ n }) => ({
            limit: n
        })
    }
};

const createMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const queryTEA = {
    results: {
        resource: 'trackedEntityAttributes',
        id: ({ programId }) => programId,
        params: {
            fields: ['id','name','valueType','optionSetValue','dimensionItemType'],
            paging: false
        }
    },
};

const AttributesModal = ({programId,onClose}) => {

    // * Snackbar
    const [snackParams,setSnackParams] = useState(false)
    const pushNotification = (content, severity = "success") => setSnackParams({ content, severity })


    // * Data Queries
    const { refetch:programRefetch } = useDataQuery(queryProgram, { variables: { programId }, lazy:true });
    const { refetch:teaRefetch } = useDataQuery(queryTEA, {lazy:true});
    const [updateMetadata,{loading:isUpdating}] = useDataMutation(createMutation,{lazy:true})
    const { refetch:getIds } = useDataQuery(queryIds, { lazy: true });

    // * Stepper
    const [activeStep, setActiveStep] = useState(0);

    // * Modal Disclaimer
    const [exitDisclaimer,setExitDisclaimer] = useState(false);
    const [inputModalOpened,setInputModalOpened] = useState(false);

    // * Attributes Form Behaviour
    const [useSections,setUseSections] = useState(false)

    // ** ATTRIBUTES
    const [teaOptions,setTeaOptions] = useState({available:[],selected:[]})
    const [attributesFormSections,setAttributesFormSections] = useState([])
    const [assignedAttributes,setAssignedAttributes] = useState([])
    const [entityAtts,setEntityAtts] = useState([])
    

    useEffect(() => {
        loadProgramData()
    }, [])

    // --------- Atts Behaviour ------------

    const loadProgramData = () =>{
        teaRefetch().then(teaResults =>{
            programRefetch({programId}).then(programResults => {

                // Mandatory attributes inherited from TrackedEntityType
                const entityAtts = programResults.results.trackedEntityType.trackedEntityTypeAttributes.map(
                    att => att.trackedEntityAttribute.id
                )
                setEntityAtts(entityAtts)

                // ? Existing TEAs in the program
                const existingTEAs = programResults.results.programTrackedEntityAttributes.map(tea => ({
                    trackedEntityAttribute: tea.trackedEntityAttribute,
                    valueType: tea.valueType,
                    allowFutureDate: tea.allowFutureDate,
                    displayInList: tea.displayInList,
                    mandatory: tea.mandatory,
                    searchable: tea.searchable,
                    renderType:tea.renderType
                }))

                // ? Available TEAs in the system
                const availableTEAs = teaResults.results.trackedEntityAttributes.filter(
                    tea => !existingTEAs.map(tea => tea.trackedEntityAttribute.id).includes(tea.id)
                ).map(
                    tea => ({
                        trackedEntityAttribute: { id: tea.id, name: tea.name },
                        valueType: tea.valueType,
                        allowFutureDate: false,
                        displayInList: false,
                        mandatory: false,
                        searchable: false 
                    })
                )

                const teaOptions = {
                    available:availableTEAs.concat(existingTEAs),
                    selected: existingTEAs.map(tea => tea.trackedEntityAttribute.id)
                }
                
                // Add mandatory attributes to the selected list
                entityAtts.forEach(attId => {
                    if(!teaOptions.selected.includes(attId)){
                        teaOptions.selected.push(attId)
                    }
                })

                setTeaOptions(teaOptions)

                // ? Assigned TEAs but not used in the form

                const assignedAtts = teaOptions.selected.filter(
                    teaId => !programResults.results.programSections.map(
                        section => section.trackedEntityAttributes.map(tea => tea.id)
                    ).flat().includes(teaId)
                ).map(
                    assignedTea => teaOptions.available.find(
                        tea => tea.trackedEntityAttribute.id === assignedTea
                    )
                )

                setAssignedAttributes(assignedAtts)

                // Program has defined sections
                setAttributesFormSections(programResults.results.programSections)
                if(programResults.results.programSections.length > 0){
                    setUseSections(true)
                }

            })
        })
    }

    const handleTransferChange = (e) => {

        if(e.selected.length === 1 && !teaOptions.selected.includes(e.selected[0])){
            // ADDED
            const teaId = e.selected[0]
            teaOptions.selected.push(teaId)

            assignedAttributes.push(teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId))
            
        }else{
            // REMOVED
            const removedId = teaOptions.selected.filter(teaId => !e.selected.includes(teaId))[0]

            if(entityAtts.includes(removedId)){
                alert('This attribute is mandatory and cannot be removed')
                return
            }

            teaOptions.selected = e.selected

            attributesFormSections.forEach(section => {
                const teaIdx = section.trackedEntityAttributes.findIndex(tea => tea.id === removedId)
                if(teaIdx > -1){
                    section.trackedEntityAttributes.splice(teaIdx,1)
                }
            })
        }   

        setAttributesFormSections([...attributesFormSections])
        setTeaOptions({...teaOptions})
    }

    const onAddNewSection = (name) => {
        getIds({n:1}).then(results => {
            const id = results.results.codes[0]
            attributesFormSections.push({
                id,
                name,
                program: { id: programId },
                trackedEntityAttributes:[]
            })
            setAttributesFormSections([...attributesFormSections])
        })
    }

    // --------- END OF : Atts Behaviour ------------

    const onSubmit = () => {
        programRefetch({programId}).then(programResults => {

            const data = {programs:[], programSections:[]}

            const program = programResults.results
            program.programTrackedEntityAttributes = teaOptions.selected.map(
                (teaId,idx) => {
                    const t = teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId)
                    t.sortOrder = idx
                    return t
                }
            )

            if(useSections){
                data.programSections = attributesFormSections.map((section,idx) => {
                    section.sortOrder = idx
                    return section
                })
            }

            program.programSections = data.programSections.map(section => ({id:section.id}) )

            data.programs.push(program)
            
            updateMetadata({data}).then(() => {
                pushNotification('Program updated successfully')
                loadProgramData()
            }).catch(error => {
                pushNotification('Error updating program' + '\n '+error ,'error')
            })

        })

    }
    
    // COMPONENT RENDER //
    return (
        <>
            <CustomMUIDialog open={true} maxWidth='lg' fullWidth={true} >
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={!!snackParams}
                    autoHideDuration={4000}
                    onClose={() => setSnackParams(false)}
                >
                    <Alert onClose={() => setSnackParams(false)} severity={snackParams.severity} sx={{ width: '100%' }}>
                        {snackParams.content}
                    </Alert>
                </Snackbar>
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setExitDisclaimer(true)}>
                    Program Tracked Entity Attributes
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em' }}>

                    <Stepper nonLinear activeStep={activeStep} orientation='vertical'>
                        <Step>
                            <StepButton color='inherit' onClick={()=>setActiveStep(0)}>Select Tracked Entity Attributes</StepButton>
                            <StepContent>
                                <Transfer
                                    filterable
                                    onChange={handleTransferChange}
                                    options={teaOptions.available.map(tea => ({ 
                                            label: tea.trackedEntityAttribute.name, 
                                            value: tea.trackedEntityAttribute.id 
                                        }) )
                                    }
                                    selected={teaOptions.selected}
                                    optionsWidth="48%"
                                    selectedWidth="48%"
                                    maxSelections={1}
                                />
                            </StepContent>
                        </Step>
                        <Step>
                            <StepButton color='inherit' onClick={()=>setActiveStep(1)}>Manage Tracked Entity Attributes Form</StepButton>
                            <StepContent>
                                <div style={{margin:'2rem 0'}}>
                                    <div style={{display:'flex', width:'100%', justifyContent:'space-between'}}>
                                        <FormControlLabel 
                                            control={
                                                <Switch
                                                    checked={useSections}
                                                    onChange={(e)=>setUseSections(e.target.checked)}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            }
                                            label="Use Form Sections"     
                                        />
                                        {useSections && 
                                            <Button 
                                                variant='contained' 
                                                startIcon={<AddCircleOutlineIcon/>}
                                                onClick={()=>setInputModalOpened(true)}
                                            >Add new section</Button> 
                                        }
                                    </div>
                                </div>
                                <AttributesEditor
                                    useSections={useSections}
                                    teaOptions={teaOptions}
                                    setTeaOptions={setTeaOptions}
                                    attributesFormSections={attributesFormSections}
                                    setAttributesFormSections={setAttributesFormSections}
                                    assignedAttributes={assignedAttributes}
                                    setAssignedAttributes={setAssignedAttributes}
                                />
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>
                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => setExitDisclaimer(true)} color="error" > Close </Button>
                    <LoadingButton
                        onClick={() => onSubmit()}
                        loading={isUpdating}
                        disabled={isUpdating}
                        variant='outlined'
                        loadingPosition="start"
                        startIcon={<SendIcon />} >
                        Submit
                    </LoadingButton>
                </DialogActions>
            </CustomMUIDialog>
            {
                exitDisclaimerModal({
                    opened:exitDisclaimer, 
                    onConfirm:()=>{onClose()}, 
                    onCancel:()=>setExitDisclaimer(false)
                })
            }
            {inputModalOpened &&
                <InputModal 
                    opened={inputModalOpened} 
                    title={'Form Section Name'}
                    label={'Name'}
                    value={''}
                    onClose={()=>setInputModalOpened(false)}
                    onConfirm={(value)=>{
                        onAddNewSection(value)
                        setInputModalOpened(false)
                    }}
                />
            }
        </>
    )
}

const exitDisclaimerModal = ({opened,onConfirm,onCancel}) => {
    return (
        <CustomMUIDialog open={opened} maxWidth='sm' fullWidth={true} >
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={onCancel}>
                You are about to exit this editor
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em' }}>
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    <span>Are you sure you want to exit this editor?</span>
                    <span><strong><em>Warning: All unsaved changes will be lost</em></strong></span>
                </div>
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button onClick={onConfirm} color="success" > Yes </Button>
                <Button onClick={onCancel} color="error" variant='contained'> No </Button>
            </DialogActions>
        </CustomMUIDialog>
    )
}

AttributesModal.propTypes = {
    programId: PropTypes.string,
    onClose: PropTypes.func
}

export default AttributesModal;