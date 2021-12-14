
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

    const showIssues = function(dataElements) {
        setShowValidationMessage(true);
        setErrors(dataElements);
    }

    return  (
                <>
                    <div className="ml_item" style={{ color: "#333333", backgroundColor: "#ff7675" }}>
                        <div className="ml_item-icon_secondary">
                            <img className="ml_list-img" alt="sec" src={error_svg} />
                        </div>
                        <div className="ml_item-title">
                            Validation Errors | <span>{props.validationResults.questions.length + props.validationResults.scores.length} data elements</span>
                        </div>
                        <div className="ml_item-warning_error "></div>
                        <div className="ml_item-cta">
                            <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                            <img src={move_vert_svg} alt="menu" />
                        </div>
                    </div>
                    <div className="section_cont" style={{backgroundColor:"#fab1a0"}}>
                        {
                            props.validationResults.questions.map((question, i) => {
                                let classNames = "ml_item";
                                return (
                                    <div id={"de_"+question.id} className={classNames} key={i} style={{backgroundColor:"#ffdad1"}}>
                                        <div className="ml_item-icon">
                                            <img src={error_svg} alt="error_dataElement" className="ml_list-img"/>
                                        </div>
                                        <div className="ml_item-title">
                                            <div><strong>Question: </strong>{question.formName}</div>
                                        </div>
                                        <div className="ml_item-cta ml_item-warning_error" onClick={()=>showIssues([question])}>
                                            {question.warnings && question.warnings.length > 0 && <BadgeWarnings counts={question.warnings.length}/> }
                                            {question.errors && question.errors.length > 0 && <BadgeErrors counts={question.errors.length}/> }
                                        </div>
                                    </div>
                                )
                            })
                        }
                        {
                            props.validationResults.scores.map((score, i) => {
                                let classNames = "ml_item";
                                return (
                                    <div id={"de_"+score.id} className={classNames} key={i} style={{backgroundColor:"#ffdad1"}}>
                                        <div className="ml_item-icon">
                                            <img src={error_svg} alt="error_dataElement" className="ml_list-img"/>
                                        </div>
                                        <div className="ml_item-title">
                                            <div><strong>Score: </strong>{score.formName}</div>
                                        </div>
                                        <div className="ml_item-cta ml_item-warning_error" onClick={()=>showIssues([score])}>
                                            {score.warnings && score.warnings.length > 0 && <BadgeWarnings counts={score.warnings.length}/> }
                                            {score.errors && score.errors.length > 0 && <BadgeErrors counts={score.errors.length}/> }
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