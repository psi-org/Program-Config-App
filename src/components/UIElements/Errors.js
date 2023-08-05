import { useState } from 'react';

import error_svg from './../../images/i-error.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import ValidationMessages from "../STG_Details/ValidationMessages";
import { METADATA } from '../../configs/Constants';
import { ValidationErrorItem } from './ValidationErrorItem';

const Errors = ({ validationResults, index }) => {
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [errors, setErrors] = useState([]);
    const [expanded, setExpanded] = useState(false)

    console.log(validationResults)

    const showIssues = function (dataElements) {
        setShowValidationMessage(true);
        setErrors(dataElements);
    }
    //TODO: Generalize Errors component
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
                    <span>Validation Errors on {validationResults.questions.length + validationResults.scores.length + validationResults.feedbacks.reduce((acu, cur) => acu + cur.instance.elements.length, 0)} Data Elements</span>
                </div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta" onClick={() => setExpanded(!expanded)}>
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
                    validationResults.questions.map((question, i) => {
                        let deMetadata = JSON.parse(question.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
                        let labelFormName = deMetadata.labelFormName;
                        return (
                            <ValidationErrorItem 
                                key={i} 
                                id={'de_' + question.id} 
                                tagName={labelFormName ? '[ Label ]' : '[ Question ]'}
                                errorTitle={labelFormName || question.formName}
                                errorObject={question}
                                setShowValidationMessage={setShowValidationMessage}
                                setErrors={setErrors}
                            />
                        )
                    })
                }
                {
                    validationResults.scores.map((score, i) => {
                        return (
                            <ValidationErrorItem 
                                key={i} 
                                id={'cs_' + score.id} 
                                tagName={'[ Score ]'}
                                errorTitle={score.formName}
                                errorObject={score}
                                setShowValidationMessage={setShowValidationMessage}
                                setErrors={setErrors}
                            />
                        )
                    })
                }
                {
                    validationResults.feedbacks.map((error, i) => {
                        return (
                            <ValidationErrorItem 
                                key={i} 
                                id={'f_' + i} 
                                tagName={`[ Feedback Order ${error.instance.feedbackOrder} ]`}
                                errorTitle={error.msg.text + ': ' + (!error.instance.expectedValues ? error.instance.elements.join(', ') : error.instance.expectedValues.join(' or ')) + '.'}
                                setShowValidationMessage={setShowValidationMessage}
                                setErrors={setErrors}
                            />
                        )
                    })
                }

            </div>
            {showValidationMessage && <ValidationMessages dataElements={errors} showValidationMessage={setShowValidationMessage} />}
        </>
    )
}

export default Errors;