// IMPORTS
import { Droppable, Draggable } from "react-beautiful-dnd";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { DHIS2_PRIMARY_COLOR } from "../../configs/Constants";

// END OF IMPORTS

const AssignedAttributes = ({attributes,isDropDisabled=true}) => {

    return (
        <div>
            <div style={{
                display:'flex',
                justifyContent:'center', 
                alignItems:'center',
                backgroundColor:DHIS2_PRIMARY_COLOR, 
                color:'white',
                padding:'10px 0px'
            }}>
                <strong><span>Available Attributes</span></strong>
            </div>
            <Droppable droppableId={`ASSIGNED`} type="TEA" isDropDisabled={isDropDisabled}>
                {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', padding:'5px'}}>
                        {
                            attributes.map((tea,idx) => (
                                <Draggable
                                    key={tea.trackedEntityAttribute.id} 
                                    draggableId={tea.trackedEntityAttribute.id} 
                                    index={idx} 
                                >
                                    {(provided, snapshot) => {
                                        return (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                                            <div style={{
                                                display:'grid', 
                                                gridTemplateColumns:'50px auto',
                                                alignItems:'center',
                                                backgroundColor:'whitesmoke',
                                                padding:'0.5rem',
                                                border:'1px solid lightgray',   
                                                borderRadius:'5px'
                                            }}>
                                                <div><DragHandleIcon/></div>
                                                <div>{tea.trackedEntityAttribute.name}</div>
                                            </div>
                                        </div>    
                                        ) 
                                    }}
                                </Draggable>
                            ))
                        }
                        
                        {provided.placeholder}
                        </div>
                    </div>
                )}
            </Droppable>
        </div>
    )
}

export default AssignedAttributes;