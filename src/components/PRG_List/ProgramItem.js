// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

//UI Elements
import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

// *** Routing ***
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

// *** IMAGES ***
import prg_svg from './../../images/i-program_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expand_left_svg from './../../images/i-expand-left_black.svg';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const ProgramItem = ({ program, downloadMetadata, deleteProgram, prgTypeId }) => {
    const [ref, setRef] = useState(undefined);
    const [open, setOpen] = useState(false)

    const toggle = () => setOpen(!open)

    const dispatch = useDispatch();
    const { setProgram } = bindActionCreators(actionCreators, dispatch);
    const programType = program.attributeValues.find(av => av.attribute.id === prgTypeId)?.value || "Tracker";
    const typeTag = {
        "HNQIS2": { color: "#03a9f4", text: "HNQIS 2.0" },
        "HNQIS": { color: "#03a9f4", text: "HNQIS 1.X" },
        "RDQA": { color: "#00b0b5", text: "RDQA PRG" },
        "EDS": { color: "#607d8b", text: "EDS" },
        "Tracker": { color: "#2c6693", text: "TRACKER" }
    }

    return (
        <div className="ml_item" style={{ color: "#333333", backgroundColor: "#F8F8F8", border: "0.5px solid #D5DDE5", borderRadius: "4px" }}>
            <div className="ml_list-icon"> {/* REMOVED ml_item-icon ... ml_item-icon TO delete cursor:move */}
                <div className="ml_item-desc" style={{ width: '100px' }}>
                    <div style={{ backgroundColor: typeTag[programType].color, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {typeTag[programType].text}
                    </div>
                </div>
            </div>
            <div className="ml_item-title">
                {program.displayName}
            </div>
            <div className="ml_item-desc"><div>{program.programStages.length} program stages</div></div>
            <div className="ml_item-warning_error ">
            </div>
            <div className="ml_item-cta">
                <img src={move_vert_svg} id={'menu' + program.id} alt="menu" onClick={() => { setRef(document.getElementById('menu' + program.id)); toggle() }} style={{ cursor: 'pointer' }} />
                {open &&
                    <Layer onClick={toggle}>
                        <Popper reference={ref} placement="bottom-end">
                            <FlyoutMenu>
                                <MenuItem disabled={true} label="Edit Program" icon={<EditIcon />} onClick={() => { toggle(); /* Add function */ }} />
                                <MenuItem label="Export JSON Metadata" icon={<DownloadIcon />} onClick={() => { toggle(); downloadMetadata(program.id) }} />
                                <MenuItem disabled={true} destructive label="Delete Program" icon={<DeleteIcon />} onClick={() => { toggle(); deleteProgram(program.id) }} />
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