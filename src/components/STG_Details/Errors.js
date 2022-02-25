
import $ from 'jquery';
import {useEffect, useState} from 'react';

import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import ValidationMessages from "./ValidationMessages";
import BadgeWarnings from "./BadgeWarnings";
import BadgeErrors from "./BadgeErrors";

const Errors = (props) => {
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [ errors, setErrors ] = useState([]);
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

    const showIssues = function(dataElements) {
        setShowValidationMessage(true);
        setErrors(dataElements);
    }

    return  (
                <>
                <div className="ml_item" style={{color:"#333333" , backgroundColor: "#ff7675", border: "0.5px solid #ff7675", borderRadius: "4px"}}>
                    <div className="ml_list-icon_secondary">
                        <img className="ml_list-img" alt="sec" src={error_svg} />
                    </div>
                    <div className="ml_item-title">
                        Validation Errors | <span>{props.validationResults.questions.length + props.validationResults.scores.length + props.validationResults.feedbacks.reduce((acu,cur)=> acu+cur.instance.elements.length,0 )} data elements</span>
                    </div>
                    <div className="ml_item-warning_error "></div>
                    <div className="ml_item-cta">
                        <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                        {/*<img src={move_vert_svg} alt="menu" />*/}
                    </div>
                </div>
                <div className="section_cont" style={{backgroundColor:"#ffdad1"}}>
                    {
                        props.validationResults.questions.map((question, i) => {
                            let deMetadata = JSON.parse(question.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}");
                            let labelFormName = deMetadata.labelFormName;
                            return (
                                <div id={"de_" + question.id} className={"ml_item"} key={i} >
                                    <div className="ml_item-icon">
                                        <img src={error_svg} alt="error_dataElement" className="ml_list-img"/>
                                    </div>
                                    <div className="ml_item-title">
                                        <div><strong>{labelFormName ? "[Label]" :"[Question]"} </strong>{labelFormName || question.formName}</div>
                                    </div>
                                    <div className="ml_item-warning_error" onClick={()=>showIssues([question])}>
                                        {question.warnings && question.warnings.length > 0 && <BadgeWarnings counts={question.warnings.length}/> }
                                        {question.errors && question.errors.length > 0 && <BadgeErrors counts={question.errors.length}/> }
                                    </div>
                                    
                                </div>
                            )
                        })
                    }
                    {
                        props.validationResults.scores.map((score, i) => {
                            return (
                                <div id={"de_" + score.id} className={"ml_item"} key={i} >
                                    <div className="ml_item-icon">
                                        <img src={error_svg} alt="error_dataElement" className="ml_list-img"/>
                                    </div>
                                    <div className="ml_item-title">
                                        <div><strong>[Score] </strong>{score.formName}</div>
                                    </div>
                                    <div className="ml_item-warning_error" onClick={()=>showIssues([score])}>
                                        {score.warnings && score.warnings.length > 0 && <BadgeWarnings counts={score.warnings.length}/> }
                                        {score.errors && score.errors.length > 0 && <BadgeErrors counts={score.errors.length}/> }
                                    </div>
                                    
                                </div>
                            )
                        })
                    }
                    {
                        props.validationResults.feedbacks.map((error, i) => {
                            return (
                                <div id={"f_" + i} className={"ml_item"} key={i} >
                                    <div className="ml_item-icon">
                                        <img src={error_svg} alt="error_FeedbackOrder" className="ml_list-img"/>
                                    </div>
                                    <div className="ml_item-title">
                                        <div><strong>[ {error.instance.feedbackOrder} ] </strong> {error.msg.text + ': ' + error.instance.elements.join(', ')+'.'}</div>
                                        
                                    </div>
                                    <div className="ml_item-warning_error" >
                                        {/* {score.warnings && score.warnings.length > 0 && <BadgeWarnings counts={score.warnings.length}/> }
                                        {score.errors && score.errors.length > 0 && <BadgeErrors counts={score.errors.length}/> } */}
                                    </div>
                                    
                                </div>
                            )
                        })
                    }
                    
                </div>
                {showValidationMessage && <ValidationMessages dataElements={errors} showValidationMessage={setShowValidationMessage} /> }
                </>
            )
}

export default Errors;