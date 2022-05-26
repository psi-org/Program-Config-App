// *** DnD *** 
import { Droppable, Draggable } from "react-beautiful-dnd";

// *** Components ***
import DraggableDataElement from "./DataElement";

// *** Routing ***
import { Link } from "react-router-dom";

// *** Modules ***
import $ from 'jquery';
import {useEffect, useState} from 'react';

// *** IMAGES ***

import sec_svg from './../../images/i-drag_black.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

import {FlyoutMenu, MenuItem, Popper, Layer, Tag } from '@dhis2/ui';
import BadgeWarnings from "./BadgeWarnings";
import BadgeErrors from "./BadgeErrors";
import ValidationMessages from "./ValidationMessages";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AlertDialogSlide from "../UIElements/AlertDialogSlide";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const DraggableSection = ({program, stageSection, stageDataElements, DEActions, index, SectionActions, hnqisMode/* , handleSectionEdit */ }) => {

    //FLoating Menu
    const [ref, setRef] = useState(undefined);
    const [openMenu, setOpenMenu] = useState(false)
    const [sectionToRemove,setSectionToRemove] = useState(undefined)

    const toggle = () => setOpenMenu(!openMenu)

    const [showValidationMessage, setShowValidationMessage] = useState(false);
    useEffect(() => {
        $('img.bsct_cta').off().on("click", function (e) {
            if ($(this).attr('src').indexOf('i-expanded-bottom_black') > -1) {
                $(this).attr('src', contracted_bottom_svg);
                $(this).parent().parent().css({
                    'margin': '8px 8px 0px 8px',
                    'border-radius': '4px 4px 0 0'
                });
                $(this).parent().parent().next().css({
                    'display': 'block'
                });
            } else {
                $(this).attr('src', expanded_bottom_svg);
                $(this).parent().parent().css({
                    'margin': '0x',
                    'border-radius': '4px'
                });
                $(this).parent().parent().next().css({
                    'display': 'none'
                });
            }
        });
    }, []);

    // Import Values //
    var sectionImportStatus = undefined;
    var sectionImportSummary = undefined;
    if (stageSection.importStatus) {
        switch (stageSection.importStatus) {
            case 'new':
                sectionImportStatus = <Tag positive>New</Tag>;
                break;
            // case 'delete':
            //     sectionImportStatus = <Tag negative>Removed</Tag>;
            //     break;
            case 'update':
            default:
                sectionImportStatus = <Tag neutral>Updated</Tag>;
                break;
        }
        sectionImportSummary = <><Tag positive>{"New: "+stageSection.newDataElements}</Tag> <Tag neutral>{"Updated: "+stageSection.updatedDataElements}</Tag></>
    }

    var classNames = (stageSection.importStatus) ? ' import_' + stageSection.importStatus : '';

    return (
        <Draggable key={stageSection.id || 'section' + index} draggableId={String(stageSection.id || index)} index={index} isDragDisabled={stageSection.importStatus != undefined || DEActions.deToEdit!==''}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                    <div className={"ml_item section-header" + (openMenu?' section-selected':'') + classNames}>
                        <div className="ml_item-icon">
                            <img className="ml_list-img" alt="sec" src={sec_svg} />
                        </div>
                        <div className="ml_item-title">
                            {sectionImportStatus} {stageSection.displayName} 
                        </div>
                        <div className="ml_item-desc"><div>{stageSection.dataElements.length} data elements</div> {sectionImportSummary}</div>
                        <div className="ml_item-warning_error " onClick={()=>setShowValidationMessage(!showValidationMessage)}>
                            {stageSection.warnings && stageSection.warnings > 0 && <BadgeWarnings counts={stageSection.warnings}/> }
                            {stageSection.errors && stageSection.errors > 0 && <BadgeErrors counts={stageSection.errors}/> }
                        </div>
                        <div className="ml_item-cta">
                            <img src={move_vert_svg} alt="menu" id={'menu'+stageSection.id} onClick={()=>{setRef(document.getElementById('menu'+stageSection.id)); toggle()}} style={{cursor:'pointer'}}/>
                            {openMenu &&
                                <Layer onClick={toggle}>
                                    <Popper reference={ref} placement="bottom-end">
                                        <FlyoutMenu>
                                            <MenuItem label="Edit This Section" icon={<EditIcon />} onClick={()=>{toggle(); SectionActions.handleSectionEdit(index, undefined) }}/>
                                            <MenuItem label="Create New Section Above" icon={<UpIcon />} onClick={()=>{toggle(); SectionActions.handleSectionEdit(undefined, index)} }/>
                                            <MenuItem label="Create New Section Below" icon={<DownIcon />} onClick={()=>{toggle(); SectionActions.handleSectionEdit(undefined, index+1)} }/>
                                            <MenuItem label="Add Data Element(s)" icon={<AddCircleOutlineIcon />} onClick={()=>{toggle(); DEActions.add(stageSection.dataElements.length,stageSection.id)} }/>
                                            <MenuItem destructive label="Delete This Section" icon={<DeleteIcon />} onClick={()=>{toggle(); setSectionToRemove(stageSection) } }/>
                                        </FlyoutMenu>
                                    </Popper>
                                </Layer>
                            }
                            <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                        </div>
                    </div>
                    <Droppable droppableId={stageSection.id || 'dropSec' + index} type="DATA_ELEMENT">
                        {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className={"section_cont "} >
                                {
                                    stageSection.dataElements.map((de, i) => {
                                        return <DraggableDataElement
                                            program={program}
                                            dataElement={de}
                                            stageDE={stageDataElements.find(stageDE => stageDE.dataElement.id === de.id)}
                                            DEActions={DEActions}
                                            section={stageSection.id}
                                            index={i}
                                            key={de.id || i}
                                            hnqisMode={hnqisMode}/>;
                                    })
                                }
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    {showValidationMessage && <ValidationMessages dataElements={stageSection.dataElements} showValidationMessage={setShowValidationMessage} /> }
                    {!!sectionToRemove && <AlertDialogSlide
                        open={!!sectionToRemove} 
                        title={"Remove this Section from the Stage?"}
                        icon={<WarningAmberIcon fontSize="large" color="warning"/>}
                        preContent={
                            <div>
                                <p style={{marginBottom:'1.5em'}}><strong>CAUTION:</strong> All Data Elements associated to this Section will also be removed from the Stage. Make sure you move the Data Elements you want to keep into another Section before deleting the current one.</p>
                                <span><strong>Section to remove: </strong>{sectionToRemove.name}</span>
                            </div>
                        }
                        content={"Warning: This action can't be undone"} 
                        primaryText={"Yes, remove it"} 
                        secondaryText={"No, keep it"} 
                        actions={{
                            primary: function(){ setSectionToRemove(undefined); SectionActions.remove(sectionToRemove) },
                            secondary: function(){setSectionToRemove(undefined);  }
                        }} 
                    />}
                </div>
            )}
        </Draggable>
    );
};

export default DraggableSection;