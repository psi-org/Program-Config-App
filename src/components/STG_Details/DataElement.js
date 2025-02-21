import { FlyoutMenu, MenuItem, Popper, Layer, Tag } from '@dhis2/ui';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import DEIcon from '@mui/icons-material/Dns';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import LabelIcon from "@mui/icons-material/LabelImportant";
import LaunchIcon from '@mui/icons-material/Launch';
import QuizIcon from "@mui/icons-material/Quiz";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IconButton, Tooltip } from "@mui/material";
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { METADATA } from "../../configs/Constants.js";
import { isCriterionDEGenerated, isGeneratedType, isLabelType, programIsHNQISMWI } from '../../utils/Utils.js';
import AlertDialogSlide from "../UIElements/AlertDialogSlide.js";
import BadgeErrors from "../UIElements/BadgeErrors.js";
import BadgeWarnings from "../UIElements/BadgeWarnings.js";
import ValidationMessages from "../UIElements/ValidationMessages.js";
import move_vert_svg from './../../images/i-more_vert_black.svg';
import DataElementForm from "./DataElementForm.js";
import DataElementItem from './DataElementItem.js';

const getDEIcon = (elemType, hnqisType) => {
    if (!hnqisType) {
        return <DEIcon />;
    }

    //*Goes first as 'holder' is both generated and label
    if (isGeneratedType(elemType)) {
        return <AutoAwesomeIcon />;
    }

    if (isLabelType(elemType)) {
        return <LabelIcon />;
    }

    return <QuizIcon />;
}

const DraggableDataElement = ({ program, dePrefix, dataElement, stageDE, DEActions, section, sectionType, index, hnqisType, deStatus, isSectionMode, readOnly, setSaveStatus }) => {

    const [ref, setRef] = useState(undefined);
    const [openMenu, setOpenMenu] = useState(false)
    const [deToRemove, setDeToRemove] = useState(false)

    const toggle = () => setOpenMenu(!openMenu)

    const removeDataElement = () => DEActions.remove(deToRemove.id, section)

    const [showValidationMessage, setShowValidationMessage] = useState(false);

    let classNames = '';

    const metadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value || '{}');
    const renderFormName = isLabelType(metadata?.elemType)?metadata?.labelFormName:undefined;

    classNames += " ml_item";
    classNames += (dataElement.importStatus) ? ' import_' + dataElement.importStatus : '';

    // Import Values //
    var deImportStatus = undefined;

    if (dataElement.importStatus) {
        switch (dataElement.importStatus) {
            case 'new':
                deImportStatus = <Tag positive>New</Tag>;
                break;
            case 'update':
            default:
                deImportStatus = <Tag neutral>Updated</Tag>;
                break;
        }
    }
    
    const isDisabled = () => {
        if( (programIsHNQISMWI(hnqisType) && isCriterionDEGenerated(dataElement) )  ) {
            return true
        }
        
        return dataElement.importStatus != undefined || DEActions.deToEdit !== '' || !isSectionMode || readOnly
    }

    return (
        <>
            <Draggable
                key={dataElement.id || index}
                draggableId={dataElement.id || dataElement.formName?.slice(-15) || index}
                index={index}
                isDragDisabled={isDisabled()}
            >
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                        <DataElementItem 
                            program={program}
                            dePrefix={dePrefix}
                            dataElement={dataElement}
                            stageDE={stageDE}
                            DEActions={DEActions}
                            section={section}
                            sectionType={sectionType}
                            index={index}
                            hnqisType={hnqisType}
                            deStatus={deStatus}
                            isSectionMode={isSectionMode}
                            readOnly={readOnly}
                            setSaveStatus={setSaveStatus}
                        />
                    </div>
                )}
            </Draggable>
            {/* {!!deToRemove && <AlertDialogSlide
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
            />} */}
        </>
    );
};

DraggableDataElement.propTypes = {
    DEActions: PropTypes.object,
    dataElement: PropTypes.object,
    dePrefix: PropTypes.string,
    deStatus: PropTypes.object,
    hnqisType: PropTypes.string,
    index: PropTypes.number,
    isSectionMode: PropTypes.bool,
    program: PropTypes.string,
    readOnly: PropTypes.bool,
    section: PropTypes.string,
    setSaveStatus: PropTypes.func,
    stageDE: PropTypes.object,
}

export default DraggableDataElement;
