import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { tagStyle } from '../../configs/Constants.js';
import cogs_svg from './../../images/cogs.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';

const CriticalCalculations = ({ stageSection }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <div className="ml_item"
                style={{
                    color: "#333333",
                    backgroundColor: "#b2dfdb",
                    border: "0.5px solid #D5DDE5",
                    borderRadius: expanded ? '4px 4px 0 0' : '4px',
                    marginBottom: expanded ? '0' : '0.5em'
                }}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={cogs_svg} />
                </div>
                <div className="ml_item-title">
                    {stageSection.displayName}
                </div>
                <div className="ml_item-desc">
                    <div style={tagStyle}>{stageSection.dataElements.length} Data Elements</div>
                </div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta" onClick={() => setExpanded(!expanded)}>
                    <img className="bsct_cta" alt="exp" src={expanded ? contracted_bottom_svg : expanded_bottom_svg} style={{ cursor: 'pointer' }} />
                </div>
            </div>
            <div className="section_cont" style={{
                padding: '16px 16px 8px',
                marginBottom: '0.5em',
                display: expanded ? 'block' : 'none'
            }}>
                {
                    stageSection.dataElements.map((dataElement, i) => {
                        return (
                            <div id={"de_" + dataElement.id} className={"ml_item"} key={i} style={{ color: "#333333", backgroundColor: "#b2dfdb", border: "0.5px solid #D5DDE5", borderRadius: "4px" }}>
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

CriticalCalculations.propTypes = {
    stageSection: PropTypes.object
}

export default CriticalCalculations;