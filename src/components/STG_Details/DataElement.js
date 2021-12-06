import { Draggable } from "react-beautiful-dnd";

// *** IMAGES ***
import de_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

import {colors,IconAdd16,IconDelete16,IconEdit16, Tag } from '@dhis2/ui';

const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
    FEEDBACK_TEXT = "yhKEe6BLEer",
    CRITICAL_QUESTION = "NPwvdTt0Naj",
    METADATA = "haUflNqP85K",
    SCORE_DEN = "l7WdLDhE3xW",
    SCORE_NUM = "Zyr7rlDOJy8";

const DraggableDataElement = ({dataElement,index}) => {

    let classNames = '';
    
    let metadata = dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value;
    if(metadata) metadata=JSON.parse(metadata);
    let renderFormName = metadata?.labelFormName;

    classNames+= (metadata?.labelFormName) ? " ml_item de_label_type" : " ml_item de_type";
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
    <Draggable key={dataElement.id || index} draggableId={dataElement.id || dataElement.formName.slice(-15)} index={index} isDragDisabled={dataElement.importStatus!=undefined}>
        {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                <div id={"de_"+dataElement.id} className={classNames}>
                    <div className="ml_item-icon">
                        <img className="ml_list-img" alt="de" src={de_svg} />
                    </div>
                    <div className="ml_item-title"> 
                        {deImportStatus} { renderFormName || dataElement.formName}
                    </div>
                    <div className="ml_item-warning_error slctr_hidden">
                        {/* <img src={warning_svg} alt="wrng" />
                        <img src={error_svg} alt="err" />
                        <div className="ml_item-cw">
                            3
                        </div>
                        <div className="ml_item-ce">
                            2
                        </div> */}
                    </div>
                    <div className="ml_item-cta">
                        <a target="_blank" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)+"/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/"+dataElement.id}><img className="bsct_cta" alt="exp" src={contracted_bottom_svg} /></a>
                    </div>
                </div>
            </div>
        )}
    </Draggable>
    );
};



export default DraggableDataElement;