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

    return (
        <>
            <div className="ml_item" style={{color:"#333333" , backgroundColor: "#b2dfdb", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={cogs_svg} />
                </div>
                <div className="ml_item-title">
                    {stageSection.displayName}
                </div>
                <div className="ml_item-desc"><div>{stageSection.dataElements.length} Data Elements</div></div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta">
                    <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                </div>
            </div>
            <div className="section_cont" >
                {
                    stageSection.dataElements.map((dataElement, i) => {
                        return(
                            <div id={"de_"+dataElement.id} className={"ml_item"} key={i} style={{color:"#333333" , backgroundColor: "#b2dfdb", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
                                <div className="ml_list-icon">
                                    <img className="ml_list-img" alt="de" src={cogs_svg} />
                                </div>
                                <div className="ml_item-title">
                                    {dataElement.formName}
                                </div>
                                <div className="ml_item-warning_error slctr_hidden"></div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
};

export default CriticalCalculations;