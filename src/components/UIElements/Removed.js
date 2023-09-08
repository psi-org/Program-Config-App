import LaunchIcon from '@mui/icons-material/Launch';
import { IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { METADATA, tagStyle } from '../../configs/Constants.js';
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import error_svg from './../../images/i-error.svg';
import expanded_bottom_svg from './../../images/i-expanded-bottom_black.svg';

const Removed = ({ removedItems, tagText = 'Data Element(s)' }) => {

    const [expanded, setExpanded] = useState(false)

    return (
        removedItems.length > 0 &&
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
                <div className="ml_list-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <img className="ml_list-img" alt="sec" src={error_svg} />
                </div>
                <div className="ml_item-title">
                    <span>Removed</span>
                </div>
                <div className="ml_item-desc"><div style={tagStyle}>{removedItems.length} {tagText}</div></div>
                <div className="ml_item-warning_error "></div>
                <div className="ml_item-cta" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
                    <img className="bsct_cta" alt="exp" src={expanded ? contracted_bottom_svg : expanded_bottom_svg} />
                </div>
            </div>
            <div
                className="section_cont"
                style={{
                    backgroundColor: "#fab1a0",
                    padding: '16px 16px 8px',
                    marginBottom: '0.5em',
                    display: expanded ? 'block' : 'none'
                }}>
                {
                    removedItems.map((element, i) => {
                        const deMetadata = JSON.parse(element.attributeValues?.find(att => att.attribute.id == METADATA)?.value || "{}");
                        let tag, displayName;
                        let route = 'dataElementSection/dataElement';
                        let elemId = element.id;
                        switch (deMetadata.elemType) {
                            case 'label':
                                tag = '[ Label ]';
                                displayName = deMetadata.labelFormName;
                                break;
                            case 'question':
                                tag = '[ Question ]';
                                break;
                            case 'score':
                                tag = '[ Score ]';
                                break;
                            default:
                                if (element.trackedEntityAttribute) {
                                    tag = '[ Tracked Entity Attribute ]';
                                    displayName = element.name;
                                    route = 'programSection/trackedEntityAttribute';
                                    elemId = element.trackedEntityAttribute.id;
                                } else {
                                    tag = '[ Data Element ]';
                                }
                                break;
                        }

                        return (
                            <div
                                id={"de_" + element.id}
                                className={"ml_item"}
                                key={i}
                                style={{
                                    color: "#333333",
                                    backgroundColor: "#ffdad1",
                                    border: "0.5px solid #ffdad1",
                                    borderRadius: "4px"
                                }}>
                                <div className="ml_list-icon">
                                    <img className="ml_list-img" alt="de" src={error_svg} />
                                </div>
                                <div className="ml_item-title">
                                    <div><strong>{tag} </strong>{displayName || element.formName}</div>
                                </div>
                                <div className="ml_item-desc"></div>
                                <div className="ml_item-warning_error slctr_hidden"></div>
                                <div className="ml_item-cta">
                                    <a target="_blank" rel="noreferrer" href={(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL) + `/dhis-web-maintenance/index.html#/edit/${route}/${elemId}`}>
                                        <Tooltip title="Open in Maintenance App" placement="top">
                                            <IconButton size='small'>
                                                <LaunchIcon fontSize="inherit" />
                                            </IconButton>
                                        </Tooltip>
                                    </a>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    );
};

Removed.propTypes = {
    removedItems: PropTypes.array,
    tagText: PropTypes.string
}

export default Removed;