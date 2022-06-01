// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

import StageNew from "./StageNew";

// *** Routing ***
import { Link } from "react-router-dom";
import { useRef, useState } from "react";

// *** IMAGES ***
import stg_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expand_left_svg from './../../images/i-expand-left_black.svg';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import Chip from '@mui/material/Chip';

import { FlyoutMenu, MenuItem, Popper, Layer } from "@dhis2/ui";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const StageItem = ({stage,setNotification,stagesRefetch,setNewStage,editStatus}) => {

  const dispatch = useDispatch();
  const { setProgramStage } = bindActionCreators(actionCreators, dispatch);
  const [showStageForm,setShowStageForm] = useState(false)

  const [ref, setRef] = useState(undefined);
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)

  const editStage = stage => {
    setShowStageForm(true)
  }
  return (
    <div className="ml_item" style={{color:"#333333" , backgroundColor: "#c5e3fc", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
      <div className="ml_list-icon"> {/* REMOVED ml_item-icon ... ml_item-icon TO delete cursor:move */}
        <img className="ml_list-img" alt="prg" src={stg_svg} />
      </div>
      <div className="ml_item-title">
        <div>{stage.displayName}</div>
        {editStatus && <Chip label={editStatus.toUpperCase()} color="success" className="blink-opacity-2" style={{marginLeft:'1em'}} /> }
      </div>
      <div className="ml_item-desc">
        <div>{stage.programStageSections.length} program stages sections</div>
      </div>
      <div className="ml_item-warning_error ">
      </div>
      <div className="ml_item-cta">
        <img src={move_vert_svg} id={'menu' + stage.id} alt="menu" onClick={() => { setRef(document.getElementById('menu' + stage.id)); toggle() }} style={{ cursor: 'pointer' }} />
        {open &&
          <Layer onClick={toggle}>
              <Popper reference={ref} placement="bottom-end">
                  <FlyoutMenu>
                      <MenuItem label="Edit Program Stage" icon={<EditIcon />} onClick={() => { toggle(); editStage(stage); }} />
                      {/* <MenuItem disabled={true} destructive label="Delete Program Stage" icon={<DeleteIcon />} onClick={() => { toggle(); deleteProgram(program.id) }} /> */}
                  </FlyoutMenu>
              </Popper>
          </Layer>
        }
        <Link to={"/programStage/"+stage.id} style={{color: '#333333'}}>
          <div style={{display: 'flex', alignItems: 'center'}} onClick={()=> setProgramStage(stage.id)}>
            <NavigateNextIcon/>
          </div>
        </Link>
        { 
          showStageForm &&  
          <StageNew 
            programId={stage.program.id} 
            setShowStageForm={setShowStageForm} 
            setNotification={setNotification} 
            stagesRefetch={stagesRefetch} 
            programName={stage.program.name} 
            data={stage} 
            setNewStage={setNewStage} /> 
        }
      </div>
    </div>
  );
}

export default StageItem;