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

import LaunchIcon from '@mui/icons-material/Launch';
import RuleIcon from '@mui/icons-material/Rule';
import { Button, IconButton } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import ProgramRulesList from '../UIElements/ProgramRulesList';


const FEEDBACK_ORDER = "LP171jpctBm";

const Scores = ({ stageSection, program, index }) => {
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [ errors, setErrors ] = useState([]);
    const [scoreRules,setScoreRules] = useState(false)

    useEffect(()=>{
    },[scoreRules])

    const showIssues = function(dataElements) {
        setShowValidationMessage(true);
        setErrors(dataElements);
    }

    return (
        <div>
            <div className="ml_item" style={{color:"#333333" , backgroundColor: "#B2DFDB", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
                <div className="ml_list-icon">
                    <img className="ml_list-img" alt="sec" src={scores_svg} />
                </div>
                <div className="ml_item-title">
                    {stageSection.displayName}
                </div>
                <div className="ml_item-desc"><div>{stageSection.dataElements.length} data elements</div></div>
                <div className="ml_item-warning_error " onClick={()=>showIssues(stageSection.dataElements)}>
                    {stageSection.warnings && stageSection.warnings > 0 && <BadgeWarnings counts={stageSection.warnings}/> }
                    {stageSection.errors && stageSection.errors > 0 && <BadgeErrors counts={stageSection.errors}/> }
                </div>
                <div className="ml_item-cta">
                    <img src={move_vert_svg} alt="menu" />
                    <img className="bsct_cta" alt="exp" src={expanded_bottom_svg} />
                </div>
            </div>
            <div className="section_cont" >
                {
                    stageSection.dataElements.map((dataElement, i) => {
                        let classNames = "ml_item" + ((dataElement.importStatus) ? ' import_' + dataElement.importStatus : '');
                        let compositiveIndicator = dataElement.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value;
                        return (
                            <div id={"de_" + dataElement.id} className={classNames} key={i}>
                                <div className="ml_item-icon">
                                    <img className="ml_list-img" alt="de" src={scores_svg} />
                                </div>
                                <div className="ml_item-title">
                                    {`[ ${compositiveIndicator} ] ${dataElement.formName}`}
                                </div>
                                <div className="ml_item-warning_error" onClick={()=>showIssues([dataElement])}>
                                    {dataElement.warnings && dataElement.warnings.length > 0 && <BadgeWarnings counts={dataElement.warnings.length}/> }
                                    {dataElement.errors && dataElement.errors.length > 0 && <BadgeErrors counts={dataElement.errors.length}/> }
                                </div>
                                <div className="ml_item-cta">
                                    <IconButton aria-label="Rules" color="success" onClick={()=>setScoreRules(dataElement)}>
                                        <RuleIcon />
                                    </IconButton>
                                    <a target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL) + "/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/" + dataElement.id} style={{textDecoration:'none',color:'black'}}>
                                        <IconButton>
                                            <LaunchIcon/>
                                        </IconButton>
                                    </a>
                                </div>
                            </div>
                        )
                    })
                }
                {showValidationMessage && <ValidationMessages dataElements={errors} showValidationMessage={setShowValidationMessage} /> }
                {scoreRules && (
                    <CustomMUIDialog open={!!scoreRules} maxWidth='md' fullWidth={true} onClose={()=>setScoreRules(false)}>
                        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setScoreRules(false)}>
                            <strong><em>Related Program Rules</em></strong>
                        </CustomMUIDialogTitle >
                        <DialogContent dividers style={{ padding: '1em 2em', display:'flex', flexDirection:'column', gap:'1em' }}>
                            <div style={{display:'flex', flexDirection:'column', gap:'1.5em'}}>
                                <h3>Score: {`[${scoreRules.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value}] ${scoreRules.formName}`}</h3>
                                <div>
                                    <ProgramRulesList program={program} dataElement={scoreRules.id} variables={[]} compositiveIndicator={scoreRules.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value} />
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions style={{ padding: '1em' }}>
                            <Button color={'error'} variant={'outlined'} onClick={() => setScoreRules(false)}>Close</Button>
                        </DialogActions>
                    </CustomMUIDialog>
                )}
            </div>
        </div>
    );
};

export default Scores;