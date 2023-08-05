import {useState} from 'react';

// *** IMAGES ***
import error_svg from './../../images/i-error.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
const ErrorReports = ({ errors }) => {

    const [expanded, setExpanded] = useState(false)

    return (
        <div>
            <div
                className="ml_item"
                style={{
                    color: "#333333",
                    backgroundColor: "#ffe0b2",
                    border: "0.5px solid #ffddc1",
                    borderRadius: expanded ? '4px 4px 0 0' : '4px',
                    marginBottom: expanded ? '0' : '0.5em'
                }}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={error_svg} />
                </div>
                <div className="ml_item-title">
                    <span>Errors Summary</span>
                </div>
                <div className="ml_item-desc"></div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta" onClick={() => setExpanded(!expanded)}>
                    <img className="bsct_cta" alt="exp" src={expanded ? contracted_bottom_svg : expanded_bottom_svg} />
                </div>
            </div>
            <div
                className="section_cont"
                style={{
                    backgroundColor: "#fff3e0",
                    padding: '16px 16px 8px',
                    marginBottom: '0.5em',
                    display: expanded ? 'block' : 'none'
                }}>
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