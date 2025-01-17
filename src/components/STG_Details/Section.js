import { FlyoutMenu, MenuItem, Popper, Layer, Tag } from '@dhis2/ui';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RuleIcon from '@mui/icons-material/Rule';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import SegmentIcon from '@mui/icons-material/Segment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Tooltip } from "@mui/material";
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from "react-beautiful-dnd";
import { newTagStyle, tagStyle, updatedTagStyle } from '../../configs/Constants.js';
import { getSectionType, isCriterionDEGenerated } from '../../utils/Utils.js';
import AlertDialogSlide from "../UIElements/AlertDialogSlide.js";
import BadgeErrors from "../UIElements/BadgeErrors.js";
import BadgeWarnings from "../UIElements/BadgeWarnings.js";
import ValidationMessages from "../UIElements/ValidationMessages.js";
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import DraggableDataElement from "./DataElement.js";

const getSectionIcon = (hnqisType, sectionName) => { 
    if (hnqisType === 'HNQISMWI') {
        const sectionType = getSectionType({name: sectionName})
        if ( sectionType == "Standard" ) {
            return <RuleFolderIcon />;
        } else if ( sectionType === "Criterion" ) {
            return <RuleIcon />;
        } else {
            return <SegmentIcon />;
        }
    } else {
        return <SegmentIcon />;
    }
}

const DraggableSection = ({ program, dePrefix, stageSection, stageDataElements, DEActions, index, SectionActions, hnqisType, editStatus, isSectionMode, readOnly, setSaveStatus }) => {

    //FLoating Menu
    const [ref, setRef] = useState(undefined);
    const [openMenu, setOpenMenu] = useState(false);
    const [sectionToRemove, setSectionToRemove] = useState(undefined);
    const [expanded, setExpanded] = useState(false);
    const [showValidationMessage, setShowValidationMessage] = useState(false);

    const initMovableItems = stageSection.dataElements.filter((de => !isCriterionDEGenerated(de)))
    
    const [movableItems, setMovableItems] = useState(initMovableItems)
    const fixedItems = stageSection.dataElements.filter((de => isCriterionDEGenerated(de)))
    
     useEffect(() => {
        const list = stageSection.dataElements.filter((de => !isCriterionDEGenerated(de)))
        setMovableItems( list )
  }, [DEActions])
  
    const toggle = () => setOpenMenu(!openMenu)

    // Import Values
    var sectionImportStatus = undefined;
    var sectionImportSummary = undefined;
    if (stageSection.importStatus) {
        switch (stageSection.importStatus) {
            case 'new':
                sectionImportStatus = <div style={{ minWidth: '4.5em', maxWidth: '4.5em' }}><Tag positive>New</Tag></div>;
                break;
            case 'update':
            default:
                sectionImportStatus = <div style={{ minWidth: '4.5em', maxWidth: '4.5em' }}><Tag neutral>Updated</Tag></div>;
                break;
        }
        sectionImportSummary = <>
            <div style={newTagStyle}>
                {"New: " + stageSection.newValues}
            </div>
            <div style={updatedTagStyle}>
                {"Updated: " + stageSection.updatedValues}
            </div>
        </>;
    }

    var classNames = (stageSection.importStatus) ? ' import_' + stageSection.importStatus : '';
    
    return (
        <Draggable key={stageSection.id || 'section' + index} draggableId={String(stageSection.id || index)} index={index} isDragDisabled={stageSection.importStatus != undefined || DEActions.deToEdit !== '' || !isSectionMode || readOnly}>
            {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                    <div
                        className={"ml_item section-header" + (openMenu ? ' section-selected' : '') + classNames}
                        style={{
                            borderRadius: expanded ? '4px 4px 0 0' : '4px',
                            marginBottom: expanded ? '0' : '0.5em'
                        }}
                    >
                        <div className="ml_item-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            {getSectionIcon(hnqisType, stageSection.displayName)}
                        </div>
                        <div className="ml_item-title" style={{
                            overflow: 'hidden'
                        }}>
                            <div>{sectionImportStatus}</div>
                            <Tooltip title={stageSection.displayName} placement="bottom-start" arrow>
                                <span style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%',
                                    width: '100%'
                                }}>{stageSection.displayName}</span>
                            </Tooltip>
                            <div>{editStatus && <Chip label={editStatus.mode.toUpperCase()} color="success" className="blink-opacity-2" style={{ marginLeft: '1em' }} />}</div>
                        </div>
                        <div className="ml_item-desc">
                            <div style={tagStyle}>{stageSection.dataElements.length} Data Elements</div>
                            {sectionImportSummary}
                        </div>
                        <div className="ml_item-warning_error " onClick={() => setShowValidationMessage(!showValidationMessage)}>
                            {stageSection.warnings && stageSection.warnings > 0 && <BadgeWarnings counts={stageSection.warnings} />}
                            {stageSection.errorsCount && stageSection.errorsCount > 0 && <BadgeErrors counts={stageSection.errorsCount} />}
                        </div>
                        <div className="ml_item-cta">
                            {isSectionMode && !readOnly && <img src={move_vert_svg} alt="menu" id={'menu' + stageSection.id} onClick={() => { setRef(document.getElementById('menu' + stageSection.id)); toggle() }} style={{ cursor: 'pointer' }} />}
                            {openMenu &&
                                <Layer onClick={toggle}>
                                    <Popper reference={ref} placement="bottom-end">
                                        <FlyoutMenu>
                                            <MenuItem label="Edit This Section" icon={<EditIcon />} onClick={() => { toggle(); SectionActions.handleSectionEdit(index, undefined) }} />
                                            <MenuItem label="Create New Section Above" icon={<UpIcon />} onClick={() => { toggle(); SectionActions.handleSectionEdit(undefined, index) }} />
                                            <MenuItem label="Create New Section Below" icon={<DownIcon />} onClick={() => { toggle(); SectionActions.handleSectionEdit(undefined, index + 1) }} />
                                            <MenuItem label="Add Data Element(s)" icon={<AddCircleOutlineIcon />} onClick={() => { toggle(); DEActions.add(stageSection.dataElements.length, stageSection.id) }} />
                                            <MenuItem destructive label="Delete This Section" icon={<DeleteIcon />} onClick={() => { toggle(); setSectionToRemove(stageSection) }} />
                                        </FlyoutMenu>
                                    </Popper>
                                </Layer>
                            }
                            <img
                                className="bsct_cta"
                                alt="exp"
                                src={expanded ? contracted_bottom_svg : expanded_bottom_svg}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setExpanded(!expanded)}
                            />
                        </div>
                    </div>
                    <Droppable droppableId={stageSection.id || 'dropSec' + index} type="DATA_ELEMENT">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}
                                className={"section_cont "}
                                style={{
                                    padding: '16px 16px 8px',
                                    marginBottom: '0.5em',
                                    display: expanded ? 'block' : 'none'
                                }}
                            >
                                {
                                    // Movable Items
                                    // stageSection.dataElements.map((de, i) => {
                                    movableItems.map((de, i) => {
                                        return <DraggableDataElement
                                            program={program}
                                            dePrefix={dePrefix}
                                            dataElement={de}
                                            stageDE={stageDataElements.find(stageDE => stageDE.dataElement.id === de.id)}
                                            DEActions={DEActions}
                                            section={stageSection.id}
                                            sectionType={getSectionType(stageSection)}
                                            index={i}
                                            key={de.id || i}
                                            hnqisType={hnqisType}
                                            deStatus={editStatus?.dataElements?.find(dataElement => dataElement.id === de.id)}
                                            isSectionMode={isSectionMode}
                                            readOnly={readOnly}
                                            setSaveStatus={setSaveStatus}
                                        />;
                                    })
                                }
                        
                                {/* Fixed Items */}
                                {fixedItems.map((de, i) => (
                                    <DraggableDataElement
                                        program={program}
                                        dePrefix={dePrefix}
                                        dataElement={de}
                                        stageDE={stageDataElements.find(stageDE => stageDE.dataElement.id === de.id)}
                                        DEActions={DEActions}
                                        section={stageSection.id}
                                        sectionType={getSectionType(stageSection)}
                                        index={i}
                                        key={de.id || i}
                                        hnqisType={hnqisType}
                                        deStatus={editStatus?.dataElements?.find(dataElement => dataElement.id === de.id)}
                                        isSectionMode={isSectionMode}
                                        readOnly={readOnly}
                                        setSaveStatus={setSaveStatus}
                                    />
                                ))}
                                
                                {provided.placeholder}
                            </div>
                        )}
                        
                        
                    </Droppable>
                    
                    {showValidationMessage && <ValidationMessages objects={[stageSection].concat(stageSection.dataElements)} showValidationMessage={setShowValidationMessage} />}
                    {!!sectionToRemove && <AlertDialogSlide
                        open={!!sectionToRemove}
                        title={"Remove this Section from the Stage?"}
                        icon={<WarningAmberIcon fontSize="large" color="warning" />}
                        preContent={
                            <div>
                                <p style={{ marginBottom: '1.5em' }}><strong>CAUTION:</strong> All Data Elements associated to this Section will also be removed from the Stage. Make sure you move the Data Elements you want to keep into another Section before deleting the current one.</p>
                                <span><strong>Section to remove: </strong>{sectionToRemove.name}</span>
                            </div>
                        }
                        content={"Warning: This action can't be undone"}
                        primaryText={"Yes, remove it"}
                        secondaryText={"No, keep it"}
                        actions={{
                            primary: function () { setSectionToRemove(undefined); SectionActions.remove(sectionToRemove) },
                            secondary: function () { setSectionToRemove(undefined); }
                        }}
                    />}
                </div>
            )}
        </Draggable>
    );
};

DraggableSection.propTypes = {
    DEActions: PropTypes.object,
    SectionActions: PropTypes.object,
    dePrefix: PropTypes.string,
    editStatus: PropTypes.oneOfType([PropTypes.object,PropTypes.bool]),
    hnqisType: PropTypes.string,
    index: PropTypes.number,
    isSectionMode: PropTypes.bool,
    program: PropTypes.string,
    readOnly: PropTypes.bool,
    setSaveStatus: PropTypes.func,
    stageDataElements: PropTypes.array,
    stageSection: PropTypes.object
}

export default DraggableSection;
