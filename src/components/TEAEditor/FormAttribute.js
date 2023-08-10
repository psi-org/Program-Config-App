// React

import { Checkbox, IconButton } from '@mui/material';

// React DnD
import { Draggable } from 'react-beautiful-dnd';

// Icons


import ClearIcon from '@mui/icons-material/Clear';
import DragHandleIcon from '@mui/icons-material/DragHandle';

/**
 * 
 * @param {object}      tea                 {trackedEntityAttribute: { id, name } , displayInList, mandatory, allowFutureDate, searchable }
 * @param {int}         idx                 >= 0
 * @param {boolean}     useSections
 * @param {function}    handlePropChange    ({prop, teaId, value})
 * @param {function}    removeFromForm      (teaId)
 * @returns 
 */
const FormAttribute = ({tea, idx=0, useSections, handlePropChange, removeFromForm}) => {
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
                        backgroundColor:'whitesmoke',
                        border:'solid 1px lightgray',
                        borderRadius:'5px'
                    }}>
                        <div style={{textAlign:'center'}}>
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

export default FormAttribute