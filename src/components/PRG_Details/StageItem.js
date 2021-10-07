// *** Global State ***
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";

// *** Routing ***
import { Link } from "react-router-dom";

// *** IMAGES ***
import stg_svg from './../../images/i-drag_black.svg';
import warning_svg from './../../images/i-warning.svg';
import error_svg from './../../images/i-error.svg';
import move_vert_svg from './../../images/i-more_vert_black.svg';
import expand_left_svg from './../../images/i-expand-left_black.svg';

const StageItem = ({stage}) => {

  const dispatch = useDispatch();
  const { setProgramStage } = bindActionCreators(actionCreators, dispatch);

  return (
    <div className="ml_item" style={{color:"#333333" , backgroundColor: "#5DD9A9"}}>
      <div className="ml_item-icon">
        <img className="ml_list-img" alt="prg" src={stg_svg} />
      </div>
      <div className="ml_item-title">
        {stage.displayName} | <span>{stage.programStageSections.length} program stages sections</span>
      </div>
      <div className="ml_item-warning_error ">
        <img src={warning_svg} alt="wrng" />
        <img src={error_svg} alt="err" />
        <div className="ml_item-cw">
          3
        </div>
        <div className="ml_item-ce">
          2
        </div>
      </div>
      <div className="ml_item-cta">
        <Link to={"/programStage/"+stage.id}>
          <img className="bsct_cta" alt="exp" src={expand_left_svg} onClick={()=> setProgramStage(stage.id)}/>
        </Link>
        <img src={move_vert_svg} alt="menu"  />
      </div>
    </div>
  );
}

export default StageItem;