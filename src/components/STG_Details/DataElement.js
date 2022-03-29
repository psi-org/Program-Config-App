import {useEffect} from "react";
import $ from 'jquery';

import { Draggable } from "react-beautiful-dnd";

import DataElementForm from "./DataElementForm";
import AlertDialogSlide from "../UIElements/AlertDialogSlide";

// *** IMAGES ***
import de_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import open_external_svg from './../../images/open_external.svg';
import {FlyoutMenu, MenuItem, Popper, Layer, colors,IconAdd16,IconDelete16,IconEdit16, Tag } from '@dhis2/ui';

import BadgeWarnings from "./BadgeWarnings";
import BadgeErrors from "./BadgeErrors";
import ValidationMessages from "./ValidationMessages";
import {useState} from "react";

import move_vert_svg from './../../images/i-more_vert_black.svg';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownIcon from '@mui/icons-material/ArrowDownward';
import UpIcon from '@mui/icons-material/ArrowUpward';

const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
    FEEDBACK_TEXT = "yhKEe6BLEer",
    CRITICAL_QUESTION = "NPwvdTt0Naj",
    METADATA = "haUflNqP85K",
    SCORE_DEN = "l7WdLDhE3xW",
    SCORE_NUM = "Zyr7rlDOJy8";

const DraggableDataElement = ({dataElement, stageDE, deToEdit,setDeToEdit, index}) => {


    const [ref, setRef] = useState(undefined);
    const [openMenu, setOpenMenu] = useState(false)

    const toggle = () => setOpenMenu(!openMenu)

    const [showValidationMessage, setShowValidationMessage] = useState(false);

    let classNames = '';
    
    let metadata = dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value;
    if(metadata) metadata=JSON.parse(metadata);
    let renderFormName = metadata?.labelFormName;

    classNames+= (metadata?.labelFormName) ? " ml_item" : " ml_item";
    classNames+= (dataElement.importStatus) ? ' import_'+dataElement.importStatus:'';

    // Import Values //
    var deImportStatus = undefined;

    if(dataElement.importStatus){
        switch (dataElement.importStatus){
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
    <Draggable key={dataElement.id || index} draggableId={dataElement.id || dataElement.formName.slice(-15)} index={index} isDragDisabled={dataElement.importStatus!=undefined || deToEdit!==''}>
        {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                <div id={"de_"+dataElement.id} className={classNames} style={{color:"#333333" , backgroundColor: "#e0f2f1", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
                    <div className="ml_item-icon">
                        <img className="ml_list-img" alt="de" src={de_svg} />
                    </div>
                    <div className="ml_item-title"> 
                        {deImportStatus} { renderFormName || dataElement.formName}
                    </div>
                    <div className="ml_item-warning_error" onClick={()=>setShowValidationMessage(!showValidationMessage)}>
                        {dataElement.warnings && dataElement.warnings.length > 0 && <BadgeWarnings counts={dataElement.warnings.length}/> }
                        {dataElement.errors && dataElement.errors.length > 0 && <BadgeErrors counts={dataElement.errors.length}/> }
                    </div>
                    <div className="ml_item-cta">
                    <img src={move_vert_svg} alt="menu" id={'menu'+dataElement.id} onClick={()=>{setRef(document.getElementById('menu'+dataElement.id)); toggle()}} style={{cursor:'pointer'}}/>
                        {openMenu &&
                            <Layer onClick={toggle}>
                                <Popper reference={ref} placement="bottom-end">
                                    <FlyoutMenu>
                                        <MenuItem disabled={false} label="Edit This Data Element" dataTest={"EDIT"} icon={<EditIcon />} onClick={()=>{ toggle(); setDeToEdit(dataElement.id) /* Add function */} }/>
                                        <MenuItem disabled={true} label="Add Data Element Above" icon={<UpIcon />} onClick={()=>{toggle(); /* Add function */} }/>
                                        <MenuItem disabled={true} label="Add Data Element Below" icon={<DownIcon />} onClick={()=>{toggle(); } }/>
                                        <MenuItem disabled={true} destructive label="Remove This Data Element" icon={<DeleteIcon />} onClick={()=>{toggle(); } }/>
                                    </FlyoutMenu>
                                </Popper>
                            </Layer>
                        }
                        {/*<a target="_blank" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)+"/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/"+dataElement.id}><img className="" alt="exp" src={open_external_svg} /></a>*/}
                    </div>
                </div>
                { deToEdit=== dataElement.id &&  
                    <DataElementForm 
                        programStageDataElement={stageDE}
                        setDeToEdit={setDeToEdit}
                    /> 
                }
                { showValidationMessage && <ValidationMessages dataElements={[dataElement]} showValidationMessage={setShowValidationMessage} /> }
            </div>
        )}
    </Draggable>
    );
};



export default DraggableDataElement;