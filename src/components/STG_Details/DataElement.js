import { useEffect } from "react";
import $ from 'jquery';

import { Draggable } from "react-beautiful-dnd";

import DataElementForm from "./DataElementForm";
import AlertDialogSlide from "../UIElements/AlertDialogSlide";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Tooltip } from "@mui/material";
import { METADATA } from "../../configs/Constants";

// *** IMAGES ***
import de_svg from './../../images/i-drag_black.svg';
import { FlyoutMenu, MenuItem, Popper, Layer, colors, IconAdd16, IconDelete16, IconEdit16, Tag } from '@dhis2/ui';

import BadgeWarnings from "./BadgeWarnings";
import BadgeErrors from "./BadgeErrors";
import ValidationMessages from "./ValidationMessages";
import { useState } from "react";

import move_vert_svg from './../../images/i-more_vert_black.svg';

import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import DeleteIcon from '@mui/icons-material/Delete';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';
import LabelIcon from "@mui/icons-material/LabelImportant";
import QuizIcon from "@mui/icons-material/Quiz";
import DEIcon from '@mui/icons-material/Dns';

import Chip from '@mui/material/Chip';

const DraggableDataElement = ({ program, dataElement, stageDE, DEActions, updateDEValues, section, index, hnqisMode, deStatus, isSectionMode, readOnly, setSaveStatus }) => {

    const [ref, setRef] = useState(undefined);
    const [openMenu, setOpenMenu] = useState(false)
    const [deToRemove, setDeToRemove] = useState(false)

    const toggle = () => setOpenMenu(!openMenu)

    const removeDataElement = () => DEActions.remove(deToRemove.id, section)

    const [showValidationMessage, setShowValidationMessage] = useState(false);

    let classNames = '';

    let metadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value || '{}');
    let renderFormName = metadata?.labelFormName;

    classNames += " ml_item";
    classNames += (dataElement.importStatus) ? ' import_' + dataElement.importStatus : '';

    // Import Values //
    var deImportStatus = undefined;

    if (dataElement.importStatus) {
        switch (dataElement.importStatus) {
            case 'new':
                deImportStatus = <Tag positive>New</Tag>;
                break;
            // case 'delete':
            //     deImportStatus = <Tag negative>Removed</Tag>;
            //     break;
            case 'update':
            default:
                deImportStatus = <Tag neutral>Updated</Tag>;
                break;
        }
    }

    return (
        <>
            <Draggable
                key={dataElement.id || index}
                draggableId={dataElement.id || dataElement.formName.slice(-15)}
                index={index}
                isDragDisabled={dataElement.importStatus != undefined || DEActions.deToEdit !== '' || !isSectionMode || readOnly}
            >
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                        <div id={"de_" + dataElement.id} className={'data-element-header ' + (openMenu ? 'data-element-selected ' : '') + classNames}>
                            <div className="ml_item-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                {!hnqisMode ? <DEIcon /> : (metadata.elemType === 'label' ? <LabelIcon /> : <QuizIcon />)}
                            </div>
                            <div className="ml_item-title">
                                {deImportStatus}
                                {
                                    renderFormName ? renderFormName :
                                        (
                                            (dataElement.formName && dataElement.formName?.replaceAll(' ', '') !== '') ?
                                                dataElement.formName :
                                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                                    <em style={{ marginRight: '0.5em' }}>{dataElement.name}</em>
                                                    <Tooltip title="No Form Name provided" placement="right" color="warning">
                                                        <WarningAmberIcon fontSize="small" />
                                                    </Tooltip>
                                                </span>
                                        )
                                }
                            </div>
                            <div className="ml_item-warning_error" onClick={() => setShowValidationMessage(!showValidationMessage)}>
                                {dataElement.warnings && dataElement.warnings.length > 0 && <BadgeWarnings counts={dataElement.warnings.length} />}
                                {dataElement.errors && dataElement.errors.length > 0 && <BadgeErrors counts={dataElement.errors.length} />}
                            </div>
                            <div className="ml_item-cta">
                                {deStatus && <Chip label={deStatus.mode.toUpperCase()} color="success" className="blink-opacity-2" style={{ marginLeft: '1em' }} />}
                                {isSectionMode && !readOnly && <img src={move_vert_svg} alt="menu" id={'menu' + dataElement.id} onClick={() => { setRef(document.getElementById('menu' + dataElement.id)); toggle() }} style={{ cursor: 'pointer' }} />}
                                {openMenu &&
                                    <Layer onClick={toggle}>
                                        <Popper reference={ref} placement="bottom-end">
                                            <FlyoutMenu>
                                                <MenuItem disabled={!stageDE} label={stageDE ? "Edit This Data Element" : "(Reload to Enable Edit)"} dataTest={"EDIT"} icon={stageDE ? <EditIcon /> : <EditOffIcon />} onClick={() => { toggle(); DEActions.setEdit(dataElement.id) }} />
                                                <MenuItem disabled={false} label="Add Data Element(s) Above" icon={<UpIcon />} onClick={() => { toggle(); DEActions.add(index, section) }} />
                                                <MenuItem disabled={false} label="Add Data Element(s) Below" icon={<DownIcon />} onClick={() => { toggle(); DEActions.add(index + 1, section) }} />
                                                <MenuItem disabled={false} destructive label="Remove This Data Element" icon={<DeleteIcon />} onClick={() => { toggle(); setDeToRemove(dataElement); }} />
                                            </FlyoutMenu>
                                        </Popper>
                                    </Layer>
                                }
                                {/*<a target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)+"/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/"+dataElement.id}><img className="" alt="exp" src={open_external_svg} /></a>*/}
                            </div>
                        </div>
                        {DEActions.deToEdit === dataElement.id &&
                            <DataElementForm
                                program={program}
                                programStageDataElement={stageDE}
                                section={section}
                                setDeToEdit={DEActions.setEdit}
                                save={DEActions.update}
                                hnqisMode={hnqisMode}
                                setSaveStatus={setSaveStatus}
                            />
                        }
                        {showValidationMessage && <ValidationMessages dataElements={[dataElement]} showValidationMessage={setShowValidationMessage} />}
                    </div>
                )}
            </Draggable>
            {!!deToRemove && <AlertDialogSlide
                open={!!deToRemove}
                title={"Remove this Data Element from the Stage?"}
                icon={<WarningAmberIcon fontSize="large" color="warning" />}
                preContent={
                    <span>{deToRemove.name}</span>
                }
                content={"Warning: This action can't be undone"}
                primaryText={"Yes, remove it"}
                secondaryText={"No, keep it"}
                actions={{
                    primary: function () { setDeToRemove(false); removeDataElement() },
                    secondary: function () { setDeToRemove(false); }
                }}
            />}
        </>
    );
};



export default DraggableDataElement;
