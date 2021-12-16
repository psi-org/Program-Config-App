// *** DnD *** 
import { Droppable, Draggable } from "react-beautiful-dnd";

// *** Components ***
import DraggableDataElement from "./DataElement";

// *** Routing ***
import { Link } from "react-router-dom";

// *** Modules ***
import $ from 'jquery';
import { useEffect } from 'react';

// *** IMAGES ***
import sec_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

import { colors, IconAdd16, IconDelete16, IconEdit16, Tag, Tooltip } from '@dhis2/ui';

const DraggableSection = ({ stageSection, index }) => {

    useEffect(() => {
        $('img.bsct_cta').off().on("click", function (e) {
            if ($(this).attr('src').indexOf('i-expanded-bottom_black') > -1) {
                $(this).attr('src', contracted_bottom_svg);
                $(this).parent().parent().css({
                    'margin': '0px',
                    'border-radius': '4px 4px 0 0'
                });
                $(this).parent().parent().next().css({
                    'display': 'block'
                });
            } else {
                $(this).attr('src', expanded_bottom_svg);
                $(this).parent().parent().css({
                    'margin': '0 0 8px',
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
        sectionImportSummary = <><Tag positive>New: {stageSection.newDataElements}</Tag> <Tag neutral>Updated: {stageSection.updatedDataElements}</Tag></>
    }

    var classNames = (stageSection.importStatus) ? ' import_' + stageSection.importStatus : '';

    return (
        <Draggable key={stageSection.id || 'section' + index} draggableId={String(stageSection.id || index)} index={index} isDragDisabled={stageSection.importStatus != undefined}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                    <div className={"ml_item" + classNames} style={{color:"#333333" , backgroundColor: "#b2dfdb", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
                        <div className="ml_item-icon">
                            <img className="ml_list-img" alt="sec" src={sec_svg} />
                        </div>
                        <div className="ml_item-title">
                            {sectionImportStatus} {stageSection.displayName} 
                        </div>
                        <div className="ml_item-desc"><div>{stageSection.dataElements.length} data elements</div> {sectionImportSummary}</div>
                        <div className="ml_item-warning_error ">
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
                            <img src={move_vert_svg} alt="menu" />
                            <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                        </div>
                    </div>
                    <Droppable droppableId={stageSection.id || 'dropSec' + index} type="DATA_ELEMENT">
                        {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className={"section_cont "} >
                                {
                                    stageSection.dataElements.map((de, i) => {
                                        return <DraggableDataElement dataElement={de} index={i} key={de.id || i} />;
                                    })
                                }
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
};

export default DraggableSection;