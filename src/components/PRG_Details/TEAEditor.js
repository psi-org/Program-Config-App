// Hooks
import {useState,useEffect} from 'react';
import { useDataQuery } from "@dhis2/app-runtime";

// DIALOG
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'

import Button from '@mui/material/Button';
import { IconButton } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

// STEPPER
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepContent from '@mui/material/StepContent';

// TRANSFER
import { Transfer } from "@dhis2/ui";

// DRAG AND DROP
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Checkbox from '@mui/material/Checkbox';

// Icons and Colors
import SendIcon from '@mui/icons-material/Send';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DHIS2_PRIMARY_COLOR } from '../../configs/Constants';
import InputModal from './InputModal';
import AssignedAttributes from './TEAEditor/AssignedAttributes';
import ClearIcon from '@mui/icons-material/Clear';

// Queries
const queryProgram = {
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['id', 'displayName',
            'programSections[id,name,trackedEntityAttributes,sortOrder,renderType]',
            'programTrackedEntityAttributes[id,name,displayInList,sortOrder,mandatory,allowFutureDate,renderOptionAsRadio,searchable,valueType,trackedEntityAttribute[id,name],renderType],trackedEntityType[trackedEntityTypeAttributes[trackedEntityAttribute[id]]]'
            ]
        }
    },
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

const TEAEditor = ({programId,onClose}) => {

    const { refetch:programRefetch } = useDataQuery(queryProgram, { variables: { programId }, lazy:true });
    const { refetch:teaRefetch } = useDataQuery(queryTEA, {lazy:true});

    const [activeStep, setActiveStep] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [exitDisclaimer,setExitDisclaimer] = useState(false);
    const [inputModalOpened,setInputModalOpened] = useState(false);
    const [inputModalActions,setInputModalActions] = useState({
        sectionName:'',
        onSave:()=>{}
    });

    const [teaOptions,setTeaOptions] = useState({available:[],selected:[]})
    const [assignedAttributes,setAssignedAttributes] = useState([])

    const [entityAtts,setEntityAtts] = useState([])

    // Attributes Form
    const [useSections,setUseSections] = useState(false)
    const [formSections,setFormSections] = useState([])

    useEffect(() => {
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

                let teaOptions = {
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
                    assignedTea => availableTEAs.find(
                        tea => tea.trackedEntityAttribute.id === assignedTea
                    )
                )

                setAssignedAttributes(assignedAtts)

                // Program has defined sections
                setFormSections(programResults.results.programSections)
                if(programResults.results.programSections.length > 0){
                    setUseSections(true)
                }

            })
        })
    }, [])

    // --------- Atts Behaviour ------------

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

            formSections.forEach(section => {
                const teaIdx = section.trackedEntityAttributes.findIndex(tea => tea.id === removedId)
                if(teaIdx > -1){
                    section.trackedEntityAttributes.splice(teaIdx,1)
                }
            })
        }   

        setFormSections([...formSections])
        setTeaOptions({...teaOptions})
    }

    const handlePropChange = ({prop,teaId,value}) => {
        teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId)[prop] = value
        setTeaOptions({...teaOptions})
    }

    const handleSectionEdit = (sectionIndex) => {
        // Edit Section Name
        if(sectionIndex >= 0) return ({
            sectionName: formSections[sectionIndex].name,
            onSave: (name) => {
                formSections[sectionIndex].name = name
                setFormSections([...formSections])
                setInputModalOpened(false)
            }
        })

        // Add New Section
        return ({
            sectionName: '',
            onSave: (name) => {
                formSections.push({
                    name,
                    trackedEntityAttributes:[],
                    isNewSection:true
                })
                setFormSections([...formSections])
                setInputModalOpened(false)
            }
        })
    }

    const removeFromForm = (teaId) => {
        formSections.forEach(section => {
            const teaIdx = section.trackedEntityAttributes.findIndex(tea => tea.id === teaId)
            
            if(teaIdx > -1){
                section.trackedEntityAttributes.splice(teaIdx,1)
                assignedAttributes.push(teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId))
            }
        })

        setFormSections([...formSections])
        setAssignedAttributes([...assignedAttributes])
    }

    // --------- END OF : Atts Behaviour ------------

    // --------- Drag and Drop ------------

    const onBeforeCapture = (result) => { 
    }

    const onDragEnd = (result) => {

        // Dropped outside
        if(result.destination === null || result.source === null) return

        const { source, destination, type, draggableId } = result;


        if(type==='SECTION'){
            // Sections reordering
            if(source.index === destination.index) return       // * No changes

            const [i] = formSections.splice(source.index,1)
            formSections.splice(destination.index,0,i) 

        }else if(type==='TEA'){
            // Attributes reordering
            if(source.droppableId === destination.droppableId){ 
                // * Same section

                if(source.droppableId === 'BASIC'){
                    // Change order on selected attributes
                    const [i] = teaOptions.selected.splice(source.index,1)
                    teaOptions.selected.splice(destination.index,0,i)
                }else{
                    const section = formSections[source.droppableId]
                    const [i] = section.trackedEntityAttributes.splice(source.index,1)
                    section.trackedEntityAttributes.splice(destination.index,0,i)
                }

            }else{
                // * Different section

                // ? Get TEA to move
                if(source.droppableId === 'ASSIGNED'){
                    // ? From Assigned to a Section
                    const [i] = assignedAttributes.splice(source.index,1)
                    formSections[destination.droppableId].trackedEntityAttributes.splice(destination.index,0,{id:i.trackedEntityAttribute.id})
                }else{
                    // ? From Section A to Section B
                    const [i] = formSections[source.droppableId].trackedEntityAttributes.splice(source.index,1)
                    formSections[destination.droppableId].trackedEntityAttributes.splice(destination.index,0,i)
                }
            }

            setFormSections([...formSections])
            setAssignedAttributes([...assignedAttributes])
        }

    }

    const attributesEditor = () => {
        return <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture} >
            {
                !useSections && 
                basicForm({
                    attributes: teaOptions.selected.map(teaId => teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId))
                })
            }    
            {
                useSections &&
                <>
                <div style={{
                    display:'grid', 
                    gridTemplateColumns: assignedAttributes.length > 0 ?  '3fr 1fr' : 'auto', 
                    width:'100%',
                    columnGap:'10px',
                    transition:'grid-template-columns 0.3s ease-in-out'
                }}>
                    {/* LEFT COLUMN */}
                    <div>
                        <div style={{ 
                            display:'grid', 
                            gridTemplateColumns:'50px 2fr repeat(4, 1fr) 50px', 
                            textAlign:'center',
                            backgroundColor:DHIS2_PRIMARY_COLOR,
                            color:'white',
                            padding:'10px 16px'
                        }}>
                            <div></div>
                            <div><b><span>Name</span></b></div>
                            <div><b><span>Display in list</span></b></div>
                            <div><b><span>Mandatory</span></b></div>
                            <div><b><span>Date in future</span></b></div>
                            <div><b><span>Searchable</span></b></div>
                            <div></div>
                        </div>
                        <Droppable droppableId='EDITOR' type='SECTION'>
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} style={{
                                    border:'dashed 1px', 
                                    margin:'5px 0px',
                                    display:'flex',
                                    flexDirection:'column',
                                    gap:'10px'
                                }}>
                                    {/* SECTIONS */}
                                    {
                                        formSections.map((section,idx) => {
                                            return (
                                            <Draggable 
                                                key={section.id || `${section.name + idx}`} 
                                                draggableId={section.id || `${section.name + idx}`} 
                                                index={idx}
                                            >
                                                {(provided, snapshot) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                                                        {
                                                            formSection({
                                                                name:section.name,
                                                                attributes:section.trackedEntityAttributes.map(
                                                                    sectionTEA => teaOptions.available.find(
                                                                        tea => tea.trackedEntityAttribute.id === sectionTEA.id
                                                                    )
                                                                ),
                                                                idx
                                                            })
                                                        }
                                                    </div>
                                                )}
                                            </Draggable>
                                            )
                                        })
                                    }
                                    
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                    {/* RIGHT COLUMN */}
                    {assignedAttributes.length > 0 && <AssignedAttributes attributes={assignedAttributes} /> }
                </div>
                </>
            }      
        </DragDropContext>
    }

    const formSection = ({name,attributes,idx}) => {
        return (
            <Accordion defaultExpanded={!useSections}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{backgroundColor:DHIS2_PRIMARY_COLOR, color:'white'}}>
                    <div style={{
                        width:'100%', 
                        padding:'5px',
                        display:'grid',
                        gridTemplateColumns:'50px auto 50px',
                        rowGap:'0.5rem',
                        alignItems:'center'
                    }}>
                        <div><DragIndicatorIcon/></div>
                        <div><span>{name ==='Default' ? `Tracked Entity Attributes` : name}</span></div>
                        <div style={{cursor:'pointer'}} onClick={()=>{
                            let modalActions = handleSectionEdit(idx)
                            setInputModalActions({...modalActions})
                            setInputModalOpened(true)
                        }}><EditIcon/></div>
                    </div>
                </AccordionSummary>
                <AccordionDetails style={{padding:'8px'}}>
                    <Droppable droppableId={`${idx}`} type="TEA">
                    {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <div id={`section-${idx}`} style={{display:'flex', flexDirection:'column', gap:'0.5rem', minHeight:'1px'}}>
                            {
                                attributes.map((tea,idx) => formAttribute(tea,idx))
                            }
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                </AccordionDetails>
            </Accordion>
            
        )
    }

    const basicForm = ({attributes}) => {
        return (
            <>
                <div style={{ 
                    display:'grid', 
                    gridTemplateColumns:'50px 2fr repeat(4, 1fr) 50px', 
                    textAlign:'center',
                    backgroundColor:DHIS2_PRIMARY_COLOR,
                    color:'white',
                    padding:'10px 16px'
                }}>
                    <div></div>
                    <div><b><span>Name</span></b></div>
                    <div><b><span>Display in list</span></b></div>
                    <div><b><span>Mandatory</span></b></div>
                    <div><b><span>Date in future</span></b></div>
                    <div><b><span>Searchable</span></b></div>
                    <div></div>
                </div>
                <Droppable droppableId={`BASIC`} type="TEA">
                    {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <div id={`basic-form`} style={{display:'flex', flexDirection:'column', gap:'0.5rem', minHeight:'1px', padding:'8px 0px'}}>
                            {
                                attributes.map((tea,idx) => formAttribute(tea,idx))
                            }
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </>
        )
    }

    const formAttribute = (tea,idx) => {
        return (
            <Draggable 
                key={tea.trackedEntityAttribute.id} 
                draggableId={tea.trackedEntityAttribute.id} 
                index={idx} 
            >
            {(provided, snapshot) => {
                return (
                <div 
                    ref={provided.innerRef} 
                    {...provided.draggableProps} 
                    {...provided.dragHandleProps}
                >
                    {
                        <div style={{
                            display:'grid', 
                            gridTemplateColumns:'50px 2fr repeat(4, 1fr) 50px',
                            alignItems:'center',
                            backgroundColor:'whitesmoke'
                        }}>
                            <div>
                                <DragHandleIcon/>
                            </div>
                            <div>
                                {tea.trackedEntityAttribute.name}
                            </div>
                            <div style={{textAlign:'center'}}>
                                <Checkbox checked={tea.displayInList} onChange={(e)=>handlePropChange({prop:'displayInList', teaId:tea.trackedEntityAttribute.id, value:e.target.checked})} />
                            </div>
                            <div style={{textAlign:'center'}}>
                                <Checkbox type='checkbox' checked={tea.mandatory} onChange={(e)=>handlePropChange({prop:'mandatory', teaId:tea.trackedEntityAttribute.id, value:e.target.checked})} />
                            </div>
                            {tea.valueType === 'DATE' &&
                            <div style={{textAlign:'center'}}>
                                <Checkbox type='checkbox' checked={tea.allowFutureDate} onChange={(e)=>handlePropChange({prop:'allowFutureDate', teaId:tea.trackedEntityAttribute.id, value:e.target.checked})}/>    
                            </div>
                            }
                            { tea.valueType !== 'DATE' && <div></div> }
                            <div style={{textAlign:'center'}}>
                                <Checkbox type='checkbox' checked={tea.searchable} onChange={(e)=>handlePropChange({prop:'searchable', teaId:tea.trackedEntityAttribute.id, value:e.target.checked})} />
                            </div>
                            <div>
                                {useSections && 
                                <IconButton onClick={()=>removeFromForm(tea.trackedEntityAttribute.id)}>
                                    <ClearIcon/>
                                </IconButton>
                                }
                            </div>
                        </div>
                    }
                </div>
                )
            }}
            </Draggable>
        )
    }

    // --------- END OF : Drag and Drop ------------
    
    // COMPONENT RENDER //
    return (
        <>
            <CustomMUIDialog open={true} maxWidth='lg' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setExitDisclaimer(true)}>
                    Program Tracked Entity Attributes
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em' }}>

                    <Stepper nonLinear activeStep={activeStep} orientation='vertical'>
                        <Step>
                            <StepButton color='inherit' onClick={()=>setActiveStep(0)}>Choose Tracked Entity Attributes</StepButton>
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
                                                onClick={()=>{
                                                    let modalActions = handleSectionEdit(-1)
                                                    setInputModalActions({...modalActions})
                                                    setInputModalOpened(true)
                                                }}
                                            >Add new section</Button> 
                                        }
                                    </div>
                                </div>
                                {attributesEditor()}
                            </StepContent>
                        </Step>
                    </Stepper>
                </DialogContent>
                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => setExitDisclaimer(true)} color="error" > Close </Button>
                    <LoadingButton
                        onClick={() => {}}
                        loading={isLoading}
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
                    value={inputModalActions.sectionName}
                    onClose={()=>setInputModalOpened(false)}
                    onConfirm={inputModalActions.onSave}
                />
            }

        </>
    )
}

export default TEAEditor

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