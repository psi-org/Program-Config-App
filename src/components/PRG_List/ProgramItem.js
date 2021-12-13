// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

// *** Routing ***
import { Link } from "react-router-dom";

// *** IMAGES ***
import prg_svg from './../../images/i-program_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expand_left_svg from './../../images/i-expand-left_black.svg';

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //

const ProgramItem = ({program}) => {

  const dispatch = useDispatch();
  const { setProgram } = bindActionCreators(actionCreators, dispatch);

  return (
    <div className="ml_item" style={{color:"#333333" , backgroundColor: "#F8F8F8", border: "0.5px solid #D5DDE5", borderRadius: "4px"}}>
      <div className=""> {/* REMOVED ml_item-icon ... ml_item-icon TO delete cursor:move */}
        <img className="ml_list-img" alt="prg" src={prg_svg} />
      </div>
      <div className="ml_item-title">
        {program.displayName} | <span>{program.programStages.length} program stages</span>
      </div>
      <div className="ml_item-warning_error ">
        {/*
          <img src={warning_svg} alt="wrng" />
          <img src={error_svg} alt="err" />
        
        <div className="ml_item-cw">
          3
        </div>
        <div className="ml_item-ce">
          2
        </div>
        */}
      </div>
      <div className="ml_item-cta">
        <Link to={"/program/"+program.id}>
          <img className="bsct_cta" alt="exp" src={expand_left_svg} onClick={()=> setProgram(program.id)}/>
        </Link>
        { /* Kebab menu icon : <img src={move_vert_svg} alt="menu"  />*/}
      </div>
    </div>
  );
}

export default ProgramItem;