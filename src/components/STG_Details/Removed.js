// *** Modules ***
import $ from 'jquery';
import { useEffect } from 'react';

// *** IMAGES ***
import sec_svg from './../../images/i-drag_black.svg';
import scores_svg from './../../images/scores.svg';
import de_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

const Removed = ({ importResults, index }) => {

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

    return (
        <>
            <div className="ml_item" style={{color:"#333333" , backgroundColor: "#ff7675", border: "0.5px solid #ff7675", borderRadius: "4px"}}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={error_svg} />
                </div>
                <div className="ml_item-title">
                    Removed
                </div>
                <div className="ml_item-desc"><div>{importResults.questions.removed + importResults.scores.removed} data elements</div></div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta">
                    {/*<img src={move_vert_svg} alt="menu" />*/}
                    <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                </div>
            </div>
            <div className="section_cont" style={{backgroundColor:"#fab1a0"}}>
                {
                    importResults.questions.removedItems.map((dataElement, i) => {
                        let deMetadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}");
                        let labelFormName = deMetadata.labelFormName;
                        
                        return(
                            <div id={"de_"+dataElement.id} className={"ml_item"} key={i} style={{color:"#333333" , backgroundColor: "#ffdad1", border: "0.5px solid #ffdad1", borderRadius: "4px"}}>
                                <div className="ml_list-icon">
                                    <img className="ml_list-img" alt="de" src={error_svg} />
                                </div>
                                <div className="ml_item-title">
                                    <div><strong>{labelFormName ? "[Label]" :"[Question]"} </strong>{labelFormName || dataElement.formName}</div>
                                </div>
                                <div className="ml_item-desc"></div>
                                <div className="ml_item-warning_error slctr_hidden"></div>
                                <div className="ml_item-cta">
                                    <a target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)+"/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/"+dataElement.id}><img className="bsct_cta" alt="exp" src={contracted_bottom_svg} /></a>
                                </div>
                            </div>
                        )
                    })
                }
                {
                    importResults.scores.removedItems.map((dataElement, i) => {
                        return(
                            <div id={"de_"+dataElement.id} className={"ml_item"} key={i} style={{color:"#333333" , backgroundColor: "#ffdad1", border: "0.5px solid #ffdad1", borderRadius: "4px"}}>
                                <div className="ml_list-icon">
                                    <img className="ml_list-img" alt="de" src={error_svg} />
                                </div>
                                <div className="ml_item-title">
                                    <div><strong>[Score] </strong> {dataElement.formName}</div>
                                </div>
                                <div className="ml_item-desc"></div>
                                <div className="ml_item-warning_error slctr_hidden"></div>
                                <div className="ml_item-cta">
                                <a target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)+"/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/"+dataElement.id}><img className="bsct_cta" alt="exp" src={contracted_bottom_svg} /></a>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
};

export default Removed;