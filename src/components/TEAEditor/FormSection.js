import {useState} from 'react'

// Accordion
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// React DnD
import { Droppable } from "react-beautiful-dnd";

// Icons and Colors
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { DHIS2_PRIMARY_COLOR } from '../../configs/Constants';

import FormAttribute from './FormAttribute';
import InputModal from '../PRG_Details/InputModal';

/**
 * 
 * @param {string}      name
 * @param {Array}       attributes
 * @param {int}         idx
 * @param {boolean}     useSections
 * @param {Function}    onSectionNameChange (idx,name)
 * @param {Function}    removeSection       (idx)
 * @param {function}    handlePropChange    ({prop, teaId, value})
 * @param {function}    removeFromForm      (teaId)
 * @returns 
 */
const FormSection = ({name,attributes,idx, useSections, onSectionNameChange, removeSection, handlePropChange, removeFromForm}) => {

    const [isModalOpen,setIsModalOpen] = useState(false)

    return (
        <>
            <Accordion defaultExpanded={!useSections}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{backgroundColor:DHIS2_PRIMARY_COLOR, color:'white'}}>
                    <div style={{
                        width:'100%', 
                        padding:'5px',
                        display:'grid',
                        gridTemplateColumns:'50px auto 50px 50px',
                        rowGap:'0.5rem',
                        alignItems:'center'
                    }}>
                        <div><DragIndicatorIcon/></div>
                        <div><span>{name ==='Default' ? `Tracked Entity Attributes` : name}</span></div>
                        <div style={{cursor:'pointer'}} onClick={()=>{setIsModalOpen(true)}}><EditIcon/></div>
                        <div style={{cursor:'pointer'}} onClick={()=>removeSection(idx)}>
                            <DeleteIcon/>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails style={{padding:'8px'}}>
                    <Droppable droppableId={`${idx}`} type="TEA">
                    {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            <div id={`section-${idx}`} style={{display:'flex', flexDirection:'column', gap:'0.5rem', minHeight:'1px'}}>
                            {
                                attributes.map((tea,idx) => 
                                    <FormAttribute tea={tea} idx={idx} useSections={useSections} handlePropChange={handlePropChange} removeFromForm={removeFromForm} key={idx} /> 
                                )
                            }
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                </AccordionDetails>
            </Accordion>
            {
                isModalOpen && 
                <InputModal 
                    opened={isModalOpen} 
                    title={'Form Section Name'}
                    label={'Name'}
                    value={name}
                    onClose={()=>setIsModalOpen(false)}
                    onConfirm={(value)=>{
                        onSectionNameChange(idx,value)
                        setIsModalOpen(false)
                    }}
                />
            }
        </>
    )
}

export default FormSection