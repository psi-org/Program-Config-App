// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

//UI Elements
import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PublicIcon from '@mui/icons-material/Public';

// *** Routing ***
import { Link } from "react-router-dom";
import { useState } from "react";

// *** IMAGES ***
import move_vert_svg from './../../images/i-more_vert_black.svg';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import tinycolor from 'tinycolor2';

import { versionIsValid } from "../../configs/Utils";
import { SHARINGS_LIMIT_VERSION } from "../../configs/Constants";

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const ProgramItem = ({ program, downloadMetadata, shareProgram, assignOrgUnit, deleteProgram, prgTypeId, serverVersion }) => {
    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(false)

    const toggle = () => setOpen(!open)

    const dispatch = useDispatch();
    const { setProgram } = bindActionCreators(actionCreators, dispatch);
    const programType = program.attributeValues.find(av => av.attribute.id === prgTypeId)?.value || "Tracker";
    const typeTag = {
        "HNQIS2": { color: "#03a9f4", text: "HNQIS 2.0" },
        "HNQIS": { color: "#03a9f4", text: "HNQIS 1.X" },
        "RDQA": { color: "#00acc1", text: "RDQA PRG" },
        "EDS": { color: "#607d8b", text: "EDS" },
        "Tracker": { color: "#2c6693", text: "TRACKER" }
    }

    return (
        <div className="ml_item" style={{ color: "#333333", backgroundColor: "#F8F8F8", border: "0.5px solid #D5DDE5", borderRadius: "4px" }}>
            <div className="ml_list-icon"> {/* REMOVED ml_item-icon ... ml_item-icon TO delete cursor:move */}
                <div className="ml_item-desc" style={{ width: '3.2em' }}>
                    <div style={{backgroundColor:(program.style?.color || '#2c6693'), width:'3em', height:'3em', minWidth:'3em', minHeight:'3em', border: '1px solid #DDD', borderRadius:'10%', padding: '0'}}>
                        <img
                            src={`${(window.localStorage.DHIS2_BASE_URL || process.env.REACT_APP_DHIS2_BASE_URL)}/api/icons/${program.style?.icon || 'dhis2_logo_positive'}/icon.svg`}
                            style={{width: '100%', height: 'auto', borderRadius:'10%', zIndex:'999', filter: `brightness(0) invert(${tinycolor(program.style?.color || '#2c6693').isDark()?1:0})`, objectFit: 'cover'}}
                        />
                    </div>
                </div>
            </div>
            <div className="ml_item-title">
                {program.displayName}
            </div>
            <div className="ml_item-desc">
                <div style={{ backgroundColor: typeTag[programType].color, width: '85px', display: 'flex', justifyContent: 'center' }}>
                    {typeTag[programType].text}
                </div>
                <div>{program.programStages.length} program stages</div>
            </div>
            <div className="ml_item-cta">
                <img src={move_vert_svg} id={'menu' + program.id} alt="menu" onClick={() => { setRef(document.getElementById('menu' + program.id)); toggle() }} style={{ cursor: 'pointer' }} />
                {open &&
                    <Layer onClick={toggle}>
                        <Popper reference={ref} placement="bottom-end">
                            <FlyoutMenu>
                                <MenuItem label="Edit Program" icon={<EditIcon />} onClick={() => { toggle(); /* Add function */ }} />
                                <MenuItem label="Sharing Settings" icon={<ShareIcon/>} onClick={()=>{toggle(); shareProgram(program.id)}}/>
                                <MenuItem label={"Assign Organisation Unit"} icon={<PublicIcon/>} onClick={()=>{ toggle(); assignOrgUnit(program.id)}}/>
                                <MenuItem label="Export JSON Metadata" icon={<DownloadIcon />} onClick={() => { toggle(); downloadMetadata(program.id) }} />
                                <MenuItem disabled={/*!versionIsValid(serverVersion, SHARINGS_LIMIT_VERSION)*/ true} destructive label="Delete Program" icon={<DeleteIcon />} onClick={() => { toggle(); deleteProgram(program.id) }} />
                            </FlyoutMenu>
                        </Popper>
                    </Layer>
                }

                <Link to={"/program/" + program.id} style={{ color: '#333333' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => setProgram(program.id)}>
                        <NavigateNextIcon />
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default ProgramItem;