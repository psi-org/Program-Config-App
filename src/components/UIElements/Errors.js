import { useState } from 'react';

import error_svg from './../../images/i-error.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import ValidationMessages from "../UIElements/ValidationMessages";
import { METADATA, tagStyle } from '../../configs/Constants';
import { ValidationErrorItem } from './ValidationErrorItem';
import { extractAttributeValues } from '../../configs/Utils';

const Errors = ({ validationResults }) => {
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [errors, setErrors] = useState([]);
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <div
                className="ml_item"
                style={{
                    color: "#333333",
                    backgroundColor: "#ff7675",
                    border: "0.5px solid #ff7675",
                    borderRadius: expanded ? '4px 4px 0 0' : '4px',
                    marginBottom: expanded ? '0' : '0.5em'
                }}>
                <div className="ml_list-icon_secondary" style={{ display: 'flex', alignItems: 'center' }}>
                    <img className="ml_list-img" alt="sec" src={error_svg} />
                </div>
                <div className="ml_item-title">
                    <span>Validation Errors</span>
                </div>
                <div className="ml_item-desc"><div style={tagStyle}>{validationResults.reduce((acu, cur) => acu + (cur.errors?.length || 1), 0)} Validation Error(s)</div></div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
                    <img className="bsct_cta" alt="exp" src={expanded ? contracted_bottom_svg : expanded_bottom_svg} />
                </div>
            </div>
            <div
                className="section_cont"
                style={{
                    backgroundColor: "#ffdad1",
                    padding: '16px 16px 8px',
                    marginBottom: '0.5em',
                    display: expanded ? 'block' : 'none'
                }}>
                {
                    validationResults.sort((a, b) => { 
                        if (a.title > b.title) return 1;
                        if (a.title < b.title) return -1;
                        return 0;
                    }).map((errorDetails, i) => {
                        return (
                            <ValidationErrorItem 
                                key={i} 
                                id={'errorDetails_' + i} 
                                tagName={errorDetails.tagName}
                                errorTitle={errorDetails.title}
                                errorObject={errorDetails}
                                displayBadges={ errorDetails.displayBadges }
                                setShowValidationMessage={setShowValidationMessage}
                                setErrors={setErrors}
                            />
                        )
                    })
                }

            </div>
            {showValidationMessage && <ValidationMessages objects={errors} showValidationMessage={setShowValidationMessage} />}
        </>
    )
}

export default Errors;