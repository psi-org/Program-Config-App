import { DragDropContext } from "react-beautiful-dnd";
import BasicForm from './BasicForm';
import SectionsForm from './SectionsForm';


const AttributesEditor = ({
    useSections,
    teaOptions,
    setTeaOptions,
    attributesFormSections,
    setAttributesFormSections,
    assignedAttributes,
    setAssignedAttributes
}) => {
    
    const handlePropChange = ({prop,teaId,value}) => {
        teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId)[prop] = value
        setTeaOptions({...teaOptions})
    }

    const onSectionNameChange = (idx,name) =>{
        attributesFormSections[idx].name = name
        setAttributesFormSections([...attributesFormSections])
    }

    const removeFromForm = (teaId) => {
        attributesFormSections.forEach(section => {
            const teaIdx = section.trackedEntityAttributes.findIndex(tea => tea.id === teaId)
            
            if(teaIdx > -1){
                section.trackedEntityAttributes.splice(teaIdx,1)
                assignedAttributes.push(teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId))
            }
        })

        setAttributesFormSections([...attributesFormSections])
        setAssignedAttributes([...assignedAttributes])
    }

    const removeSection = (sectionIndex) => {
        attributesFormSections[sectionIndex].trackedEntityAttributes.forEach( teaId =>{
            assignedAttributes.push(teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId.id))
        })   
        setAssignedAttributes([...assignedAttributes])

        attributesFormSections.splice(sectionIndex,1)
        setAttributesFormSections([...attributesFormSections])
    }

    const onDragEnd = (result) => {

        // Dropped outside
        if(result.destination === null || result.source === null) return

        const { source, destination, type, draggableId } = result;


        if(type==='SECTION'){
            // Sections reordering
            if(source.index === destination.index) return       // * No changes

            const [i] = attributesFormSections.splice(source.index,1)
            attributesFormSections.splice(destination.index,0,i) 

        }else if(type==='TEA'){
            // Attributes reordering
            if(source.droppableId === destination.droppableId){ 
                // * Same section

                if(source.droppableId === 'BASIC'){
                    // Change order on selected attributes
                    const [i] = teaOptions.selected.splice(source.index,1)
                    teaOptions.selected.splice(destination.index,0,i)
                }else{
                    const section = attributesFormSections[source.droppableId]
                    const [i] = section.trackedEntityAttributes.splice(source.index,1)
                    section.trackedEntityAttributes.splice(destination.index,0,i)
                }

            }else{
                // * Different section

                // ? Get TEA to move
                if(source.droppableId === 'ASSIGNED'){
                    // ? From Assigned to a Section
                    const [i] = assignedAttributes.splice(source.index,1)
                    attributesFormSections[destination.droppableId].trackedEntityAttributes.splice(destination.index,0,{id:i.trackedEntityAttribute.id})
                }else{
                    // ? From Section A to Section B
                    const [i] = attributesFormSections[source.droppableId].trackedEntityAttributes.splice(source.index,1)
                    attributesFormSections[destination.droppableId].trackedEntityAttributes.splice(destination.index,0,i)
                }
            }

            setAttributesFormSections([...attributesFormSections])
            setAssignedAttributes([...assignedAttributes])
        }

    }

    return <DragDropContext onDragEnd={onDragEnd}>
        {
            !useSections && 
            <BasicForm 
                attributes={teaOptions.selected.map(teaId => teaOptions.available.find(tea => tea.trackedEntityAttribute.id === teaId))}
                useSections={useSections}
                handlePropChange={handlePropChange}
                removeFromForm={removeFromForm}
            />
        }    
        {
            useSections &&
            <SectionsForm 
                attributesFormSections={attributesFormSections}
                teaOptions={teaOptions}
                useSections={useSections}
                onSectionNameChange={onSectionNameChange}
                removeSection={removeSection}
                handlePropChange={handlePropChange}
                removeFromForm={removeFromForm}
                assignedAttributes={assignedAttributes}
            />
        }      
    </DragDropContext>
}

export default AttributesEditor;