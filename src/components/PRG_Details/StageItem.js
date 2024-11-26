import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import { Tooltip } from "@mui/material";
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { bindActionCreators } from "redux";
import { tagStyle } from "../../configs/Constants.js";
import actionCreators from "../../state/action-creators/index.js";
import BadgeErrors from "../UIElements/BadgeErrors.js";
import ValidationMessages from "../UIElements/ValidationMessages.js";
import move_vert_svg from './../../images/i-more_vert_black.svg';
import StageNew from "./StageNew.js";

const StageItem = ({ stage, programSharing, importResults,  setNotification, stagesRefetch, setNewStage, editStatus, hnqisMode, eventMode }) => {

    const dispatch = useDispatch();
    const history = useHistory();
    const { setProgramStage } = bindActionCreators(actionCreators, dispatch);
    const [showStageForm, setShowStageForm] = useState(false)

    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(false)
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const toggle = () => setOpen(!open)

    var ImportSummaryCounts = undefined;
    if (importResults?.importedSections) {
        ImportSummaryCounts = <>
            <div style={tagStyle}>
                {"New Objects: " + importResults.importedSections.reduce((acu, cur) => acu + (cur.newValues || 0)+ (cur.importStatus === 'new' ? 1 : 0), 0)}
            </div>
            <div style={tagStyle}>
                {"Updated Objects: " + importResults.importedSections.reduce((acu, cur) =>  acu + (cur.updatedValues || 0)+(cur.importStatus==='update' ? 1 : 0), 0)}
            </div>
        </>;
    }

    const editStage = () => {
        setShowStageForm(true)
    }
    return (
        <div className="ml_item" style={{ color: "#333333", backgroundColor: "#c5e3fc", border: "0.5px solid #D5DDE5", borderRadius: "4px" }}>
            <div className="ml_list-icon" style={{ display: 'flex', alignItems: 'center', cursor:'pointer' }} onClick={()=>{
                setProgramStage(stage.id)
                history.push('/programStage/'+stage.id)
            }}> 
                <HorizontalSplitIcon />
            </div>
            <div className="ml_item-title" style={{  overflow: 'hidden', cursor:'pointer' }} onClick={()=>{
                setProgramStage(stage.id)
                history.push('/programStage/'+stage.id)
            }}>
                <Tooltip title={stage.displayName} placement="bottom-start" arrow>
                    <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                        width: '100%',
                        verticalAlign: 'middle'
                    }}>{stage.displayName}</span>
                </Tooltip>
                {editStatus!=='' && <Chip label={editStatus.toUpperCase()} color="success" className="blink-opacity-2" style={{ marginLeft: '1em' }} />}
            </div>
            <div className="ml_item-desc">
                <div>{stage.programStageSections.length} {!eventMode && 'Program Stage'} Sections</div>
                {ImportSummaryCounts}
            </div>
            <div className="ml_item-warning_error " onClick={() => setShowValidationMessage(!showValidationMessage)}>
                {importResults?.errorsCount && importResults?.errorsCount > 0 && <BadgeErrors counts={importResults?.errorsCount} />}
            </div>
            <div className="ml_item-cta">
                {!hnqisMode && !eventMode &&
                    <img src={move_vert_svg} id={'menu' + stage.id} alt="menu" onClick={() => { setRef(document.getElementById('menu' + stage.id)); toggle() }} style={{ cursor: 'pointer' }} />
                }
                {open && !hnqisMode &&
                    <Layer onClick={toggle}>
                        <Popper reference={ref} placement="bottom-end">
                            <FlyoutMenu>
                                <MenuItem label="Edit Program Stage" icon={<EditIcon />} onClick={() => { toggle(); editStage(); }} />
                                <MenuItem disabled={true} destructive label="Delete Program Stage" icon={<DeleteIcon />} onClick={() => { toggle(); /* Add function */ }} />
                            </FlyoutMenu>
                        </Popper>
                    </Layer>
                }
                {
                    showStageForm &&
                    <StageNew
                        programId={stage.program.id}
                        setShowStageForm={setShowStageForm}
                        setNotification={setNotification}
                        stagesRefetch={stagesRefetch}
                        programName={stage.program.name}
                        data={stage}
                        setNewStage={setNewStage}
                        programSharing={programSharing}
                    />
                }
                {showValidationMessage && <ValidationMessages objects={importResults.importedSections.map(section => [section].concat(section.dataElements)).flat()} showValidationMessage={setShowValidationMessage} />}
            </div>
        </div>
    );
}

StageItem.propTypes = {
    editStatus: PropTypes.string,
    eventMode: PropTypes.bool,
    hnqisMode: PropTypes.bool,
    importResults: PropTypes.object,
    programSharing: PropTypes.object,
    setNewStage: PropTypes.func,
    setNotification: PropTypes.func,
    stage: PropTypes.object,
    stagesRefetch: PropTypes.func
}

export default StageItem;