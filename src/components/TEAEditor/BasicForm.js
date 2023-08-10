import { Droppable } from "react-beautiful-dnd";
import { DHIS2_PRIMARY_COLOR } from "../../configs/Constants";
import FormAttribute from "./FormAttribute";

const BasicForm = ({attributes,useSections,handlePropChange,removeFromForm}) => {
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
                            attributes.map((tea,idx) => 
                                <FormAttribute tea={tea} idx={idx} useSections={useSections} handlePropChange={handlePropChange} removeFromForm={removeFromForm} key={idx} /> 
                            )
                        }
                        </div>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </>
    )
}

export default BasicForm;