// *** Modules ***
import $ from 'jquery';
import { useEffect } from 'react';

// *** IMAGES ***
import sec_svg from './../../images/i-drag_black.svg';
import de_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import cogs_svg from './../../images/cogs.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

const CriticalCalculations = ({ stageSection, index }) => {

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

    return (
        <>
            <div className="ml_item" style={{ color: "#333333", backgroundColor: "#e3f2fd" }}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={cogs_svg} />
                </div>
                <div className="ml_item-title">
                    {stageSection.displayName}
                </div>
                <div className="ml_item-desc"><div>{stageSection.dataElements.length} data elements</div></div>
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
            <div className="section_cont" >
                {
                    stageSection.dataElements.map((dataElement, i) => {
                        return(
                            <div id={"de_"+dataElement.id} className={"ml_item de_type"} key={i}>
                                <div className="ml_list-icon">
                                    <img className="ml_list-img" alt="de" src={cogs_svg} />
                                </div>
                                <div className="ml_item-title">
                                    {dataElement.formName}
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
                                {/* <div className="ml_item-cta">
                                    <a target="_blank" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)+"/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/"+dataElement.id}><img className="bsct_cta" alt="exp" src={contracted_bottom_svg} /></a>
                                </div> */}
                            </div>
                        )
                        //return <DraggableDataElement dataElement={de} index={i} key={de.id} />;
                    })
                }
            </div>
        </>
    );
};

export default CriticalCalculations;