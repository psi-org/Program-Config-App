// *** Modules ***
import $ from 'jquery';
import {useEffect, useState} from 'react';

// *** IMAGES ***
import sec_svg from './../../images/i-drag_black.svg';
import scores_svg from './../../images/scores.svg';
import de_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import BadgeWarnings from "./BadgeWarnings";
import BadgeErrors from "./BadgeErrors";
import ValidationMessages from "./ValidationMessages";

const FEEDBACK_ORDER = "LP171jpctBm";

const ErrorReports = ({ errors }) => {

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
        <div>
            <div className="ml_item" style={{color:"#333333" , backgroundColor: "#ffe0b2", border: "0.5px solid #ffddc1", borderRadius: "4px"}}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={error_svg} />
                </div>
                <div className="ml_item-title">{'Errors Summary'}</div>
                <div className="ml_item-desc"></div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta">
                    <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                </div>
            </div>
            <div className="section_cont" style={{backgroundColor:"#fff3e0"}}>
                <div className={"ml_item"} key={'errorsSummary_0'}>
                    <div className="ml_item-icon"></div>
                    <div className="ml_item-title">
                        <div style={{width:'15%'}}><strong>{'Object Type'}</strong></div>
                        <div style={{width:'15%'}}><strong>{'UID'}</strong></div>
                        <div style={{width:'10%'}}><strong>{'Error Code'}</strong></div>
                        <div style={{width:'60%'}}><strong>{'Message'}</strong></div>
                    </div>
                    <div className="ml_item-warning_error"></div>
                    <div className="ml_item-cta"></div>
                </div>
                {
                    errors.map((e, idx) => {
                        return (
                            <div  className={"ml_item"} key={idx}>
                                <div className="ml_item-icon"></div>
                                <div className="ml_item-title">
                                    <div style={{width:'15%'}}>{e.type}</div>
                                    <div style={{width:'15%'}}>{e.uid}</div>
                                    <div style={{width:'10%'}}>{e.errorCode}</div>
                                    <div style={{width:'60%'}}>{e.message}</div>
                                </div>
                                <div className="ml_item-warning_error"></div>
                                <div className="ml_item-cta"> </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    );
};

export default ErrorReports;