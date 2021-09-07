import { Link, Redirect } from 'react-router-dom';
import './ProgramItem.css';

import {useSelector, useDispatch} from 'react-redux';
import { bindActionCreators } from "redux";
import actionCreators from '../../state/action-creators';

// https://clone.psi-mis.org/api/29/programs/pezQRuP6DE2.json?fields=id,name,programStages[id,name]

const ProgramItem = ({ title, uid}) => {

    const program = useSelector(state => state.program);
    const dispatch = useDispatch();

    const {setProgram} = bindActionCreators(actionCreators,dispatch);

    const goToProgramDetails = (programId) => {
        // vvv Use Query HERE vvv
        //const programData = programs[programId];
        console.log(programId);

        setProgram(programId);
        //Change container data [HTML]
        return (
            <Redirect to={`/program/${programId}`} />
        );
        //setMainContent(<ProgramDetails programData={programData}  setMainContent={setMainContent} />);
    };


    return (
        <div className="programItem">
            <div className="title">
                <h4>{title}</h4>
            </div>
            <div className="uid">
                <h4>{uid}</h4>
            </div>
            <div className="action">
            <Link to={`/program`}>
                <button onClick={()=>setProgram(uid)}>View details</button>
            </Link>
            </div>

        </div>
    )
}

export default ProgramItem;