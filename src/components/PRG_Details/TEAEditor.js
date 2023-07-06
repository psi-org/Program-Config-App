// Hooks
import {useState,useEffect} from 'react';
import { useDataQuery } from "@dhis2/app-runtime";

// DIALOG
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

// TRANSFER
import { Transfer } from "@dhis2/ui";

// DRAG AND DROP
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Checkbox from '@mui/material/Checkbox';

// Icons
import SendIcon from '@mui/icons-material/Send';
import { set } from 'react-hook-form';

// Queries
const queryProgram = {
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['id', 'displayName',
            'programSections[id,name,trackedEntityAttributes,sortOrder,renderType]',
            'programTrackedEntityAttributes[id,name,displayInList,sortOrder,mandatory,allowFutureDate,renderOptionAsRadio,searchable,valueType,trackedEntityAttribute[id,name],renderType]'
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

    const [isLoading, setIsLoading] = useState(false);

    const [teaOptions,setTeaOptions] = useState({available:[],selected:[]})

    // Attributes Form
    const [useSections,setUseSections] = useState(false)
    const [formSections,setFormSections] = useState([])

    useEffect(() => {
        teaRefetch().then(teaResults =>{
            programRefetch({programId}).then(programResults => {

                const existingTEAs = programResults.results.programTrackedEntityAttributes.map(tea => ({
                    trackedEntityAttribute: tea.trackedEntityAttribute,
                    valueType: tea.valueType,
                    allowFutureDate: tea.allowFutureDate,
                    displayInList: tea.displayInList,
                    mandatory: tea.mandatory,
                    searchable: tea.searchable,
                    renderType:tea.renderType
                }))

                const availableTEAs = teaResults.results.trackedEntityAttributes.filter(tea => !existingTEAs.map(tea => tea.trackedEntityAttribute.id).includes(tea.id))
                .map(tea => ({
                    trackedEntityAttribute: { id: tea.id, name: tea.name },
                    valueType: tea.valueType,
                    allowFutureDate: false,
                    displayInList: false,
                    mandatory: false,
                    searchable: false
                    
                }))
                
                setTeaOptions({available:availableTEAs.concat(existingTEAs),selected:existingTEAs.map(tea => tea.trackedEntityAttribute.id)})
                setFormSections(programResults.results.programSections)
                if(programResults.results.programSections.length > 0){
                    setUseSections(true)
                }

            })
        })
    }, [])

    // --------- Atts Behaviour ------------

    const handleTransferChange = (e) => {

        if(e.selected.length === 1){
            // ADDED
            const teaId = e.selected[0]
            teaOptions.selected.push(teaId)

            if(formSections.length > 0){
                formSections[formSections.length-1].trackedEntityAttributes.push({id:teaId})
            }else{
                formSections.push({
                    name:'Default Section',
                    sortOrder:0,
                    trackedEntityAttributes:[{id:teaId}],
                    isNewSection:true
                })
            }
            
        }else{
            // REMOVED
            const removedId = teaOptions.selected.filter(teaId => !e.selected.includes(teaId))[0]
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

    // --------- END OF : Atts Behaviour ------------

    // --------- Drag and Drop ------------

    const onDragEnd = (result) => {
        console.log({result})
    }

    const attributesEditor = () => {
        return <DragDropContext onDragEnd={onDragEnd}>
            {
                !useSections && 
                formSection({
                    name: 'Default',
                    attributes: teaOptions.selected.map(teaId => teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId))
                })
            }    
            {
                useSections &&
                <Droppable droppableId='EDITOR' type='EDITOR'>
                    {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{border:'dashed 1px', padding:'5px'}}>
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
            }      
        </DragDropContext>
    }

    const formSection = ({name,attributes,idx}) => {
        return (
            <Droppable droppableId={`${idx}`} type="SECTION">
                {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        <div style={{backgroundColor:'navy', width:'100%', color:'white', padding:'5px'}}>
                            <h3>{name ==='Default' ? `Tracked Entity Attributes` : name}</h3>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', padding:'10px'}}>
                        {
                            attributes.map((tea,idx) => formAttribute(tea,idx))
                        }
                        </div>
                        {provided.placeholder}
                    </div>
                )}
                
            </Droppable>
        )
    }

    const formAttribute = (tea,idx) => {
        return <Draggable key={tea.trackedEntityAttribute.id} draggableId={tea.trackedEntityAttribute.id} index={idx}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                    <div style={{
                        display:'grid', 
                        gridTemplateColumns:'repeat(5, 1fr)'
                    }}>
                        <div>{tea.trackedEntityAttribute.name}</div>
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
                    </div>
                </div>
            )}
        </Draggable>
    }

    // --------- END OF : Drag and Drop ------------
    
    // COMPONENT RENDER //
    return (
        <>
            <CustomMUIDialog open={true} maxWidth='lg' fullWidth={true} >
                <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => onClose()}>
                    Program Tracked Entity Attributes [{programId}]
                </CustomMUIDialogTitle >
                <DialogContent dividers style={{ padding: '1em 2em' }}>

                    <Transfer
                        filterable
                        enableOrderChange={!useSections}
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
                    <div style={{height:'1rem'}}></div>
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
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', textAlign:'center' }}>
                        <div><b><h3>Name</h3></b></div>
                        <div><b><h3>Display in list</h3></b></div>
                        <div><b><h3>Mandatory</h3></b></div>
                        <div><b><h3>Date in future</h3></b></div>
                        <div><b><h3>Searchable</h3></b></div>
                    </div>
                    { attributesEditor() }
                    

                </DialogContent>
                <DialogActions style={{ padding: '1em' }}>
                    <Button onClick={() => onClose()} color="error" > Close </Button>
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
        </>
    )
}

export default TEAEditor