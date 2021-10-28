import { Draggable } from "react-beautiful-dnd";

// *** IMAGES ***
import de_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
    FEEDBACK_TEXT = "yhKEe6BLEer",
    CRITICAL_QUESTION = "NPwvdTt0Naj",
    METADATA = "haUflNqP85K",
    SCORE_DEN = "l7WdLDhE3xW",
    SCORE_NUM = "Zyr7rlDOJy8";

const DraggableDataElement = ({dataElement,index}) => {

    let renderFormName = undefined;
    let metadata = dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value;
    if(metadata) metadata=JSON.parse(metadata);
    if(metadata?.labelFormName) renderFormName = metadata.labelFormName;

    return (
    <Draggable key={dataElement.id} draggableId={dataElement.id} index={index}>
        {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                <div id={"de_"+dataElement.id} className={renderFormName?"ml_item de_label_type":"ml_item de_type"}>
                    <div className="ml_item-icon">
                        <img className="ml_list-img" alt="de" src={de_svg} />
                    </div>
                    <div className="ml_item-title">
                        {renderFormName || dataElement.formName}
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