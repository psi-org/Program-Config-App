// *** Modules ***
import $ from 'jquery';
import { useEffect, useState } from 'react';

// *** IMAGES ***
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import BadgeWarnings from "../UIElements/BadgeWarnings";
import BadgeErrors from "../UIElements/BadgeErrors";
import ValidationMessages from "./ValidationMessages";

import LaunchIcon from '@mui/icons-material/Launch';
import RuleIcon from '@mui/icons-material/Rule';
import { Button, IconButton } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import ProgramRulesList from '../UIElements/ProgramRulesList';
import Tooltip from '@mui/material/Tooltip';
import PercentIcon from '@mui/icons-material/Percent';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { FEEDBACK_ORDER, tagStyle } from '../../configs/Constants';

const Scores = ({ stageSection, program, index }) => {
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [errors, setErrors] = useState([]);
    const [scoreRules, setScoreRules] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const showIssues = function (dataElements) {
        setShowValidationMessage(true);
        setErrors(dataElements);
    }

    return (
        <div>
            <div className="ml_item"
                style={{
                    color: "#333333",
                    backgroundColor: "#B2DFDB",
                    border: "0.5px solid #D5DDE5",
                    borderRadius: expanded ? '4px 4px 0 0' : '4px',
                    marginBottom: expanded ? '0' : '0.5em'
                }}>
                <div className="ml_list-icon">
                    {/*<img className="ml_list-img" alt="sec" src={scores_svg} />*/}
                    <PercentIcon />
                </div>
                <div className="ml_item-title">
                    {stageSection.displayName}
                </div>
                <div className="ml_item-desc">
                    <div style={tagStyle}>{stageSection.dataElements.length} Data Elements</div>
                </div>
                <div className="ml_item-warning_error " onClick={() => showIssues(stageSection.dataElements)}>
                    {stageSection.warnings && stageSection.warnings > 0 && <BadgeWarnings counts={stageSection.warnings} />}
                    {stageSection.errors && stageSection.errors > 0 && <BadgeErrors counts={stageSection.errors} />}
                </div>
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
                        let classNames = "ml_item" + ((dataElement.importStatus) ? ' import_' + dataElement.importStatus : '');
                        let compositiveIndicator = dataElement.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value;
                        return (
                            <div
                                id={"de_" + dataElement.id}
                                className={classNames}
                                key={i}
                                style={{
                                    backgroundColor: "#e0f2f1",
                                    border: "0.5px solid #d5dde5",
                                    borderRadius: "4px"
                                }}
                            >
                                <div className="ml_item-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                    {/*<img className="ml_list-img" alt="de" src={scores_svg} />*/}
                                    <PercentIcon />
                                </div>
                                <div className="ml_item-title" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <p style={{ minWidth: '4.5em', maxWidth: '4.5em', marginRight: '0.5em' }}><strong>[ {compositiveIndicator} ]</strong></p>
                                    <p>{dataElement.formName || <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <em style={{ marginRight: '0.5em' }}>{dataElement.name}</em>
                                        <Tooltip title="No Form Name provided" placement="right" color="warning">
                                            <WarningAmberIcon fontSize="small" />
                                        </Tooltip>
                                    </span>}</p>
                                </div>
                                <div className="ml_item-warning_error" onClick={() => showIssues([dataElement])}>
                                    {dataElement.warnings && dataElement.warnings.length > 0 && <BadgeWarnings counts={dataElement.warnings.length} />}
                                    {dataElement.errors && dataElement.errors.errors.length > 0 && <BadgeErrors counts={dataElement.errors.errors.length} />}
                                </div>
                                <div className="ml_item-cta">
                                    <Tooltip title="View Program Rules" placement="top">
                                        <IconButton aria-label="Rules" color="success" onClick={() => setScoreRules(dataElement)} size='small'>
                                            <RuleIcon fontSize='inherit' />
                                        </IconButton>
                                    </Tooltip>
                                    <a target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL) + "/dhis-web-maintenance/index.html#/edit/dataElementSection/dataElement/" + dataElement.id} style={{ textDecoration: 'none', color: 'black' }}>
                                        <Tooltip title="Open in Maintenance App" placement="top">
                                            <IconButton size='small'>
                                                <LaunchIcon fontSize='inherit' />
                                            </IconButton>
                                        </Tooltip>
                                    </a>
                                </div>
                            </div>
                        )
                    })
                }
                {showValidationMessage && <ValidationMessages dataElements={errors} showValidationMessage={setShowValidationMessage} />}
                {scoreRules && (
                    <CustomMUIDialog open={!!scoreRules} maxWidth='md' fullWidth={true} onClose={() => setScoreRules(false)}>
                        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => setScoreRules(false)}>
                            <strong><em>Related Program Rules</em></strong>
                        </CustomMUIDialogTitle >
                        <DialogContent dividers style={{ padding: '1em 2em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
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