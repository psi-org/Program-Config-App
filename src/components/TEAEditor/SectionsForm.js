import PropTypes from 'prop-types';
import React from 'react';
import { Droppable, Draggable } from "react-beautiful-dnd";
import { DHIS2_PRIMARY_COLOR } from "../../configs/Constants.js";
import AssignedAttributes from "./AssignedAttributes.js";
import FormSection from "./FormSection.js";


const SectionsForm = ({ attributesFormSections, teaOptions, useSections, onSectionNameChange, removeSection, handlePropChange, removeFromForm, assignedAttributes }) => {

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: assignedAttributes.length > 0 ? '3fr 1fr' : 'auto',
            width: '100%',
            columnGap: '10px',
            transition: 'grid-template-columns 0.3s ease-in-out'
        }}>
            {/* LEFT COLUMN */}
            <div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 2fr repeat(4, 1fr) 50px',
                    textAlign: 'center',
                    backgroundColor: DHIS2_PRIMARY_COLOR,
                    color: 'white',
                    padding: '10px 16px'
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
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{
                            border: 'dashed 1px',
                            margin: '5px 0px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            {/* SECTIONS */}
                            {
                                attributesFormSections.map((section, idx) => {
                                    return (
                                        <Draggable
                                            key={section.id || `${section.name + idx}`}
                                            draggableId={section.id || `${section.name + idx}`}
                                            index={idx}
                                        >
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >

                                                    <FormSection
                                                        name={section.name}
                                                        attributes={section.trackedEntityAttributes.map(
                                                            sectionTEA => teaOptions.available.find(
                                                                tea => tea.trackedEntityAttribute.id === sectionTEA.id
                                                            )
                                                        )}
                                                        idx={idx}
                                                        useSections={useSections}
                                                        onSectionNameChange={onSectionNameChange}
                                                        removeSection={removeSection}
                                                        handlePropChange={handlePropChange}
                                                        removeFromForm={removeFromForm}
                                                    />
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
            {
                assignedAttributes.length > 0 &&
                <AssignedAttributes attributes={assignedAttributes} />
            }
        </div>
    )
}

SectionsForm.propTypes = {
    assignedAttributes: PropTypes.array,
    attributesFormSections: PropTypes.array,
    handlePropChange: PropTypes.func,
    removeFromForm: PropTypes.func,
    removeSection: PropTypes.func,
    teaOptions: PropTypes.object,
    useSections: PropTypes.bool,
    onSectionNameChange: PropTypes.func,
}

export default SectionsForm;