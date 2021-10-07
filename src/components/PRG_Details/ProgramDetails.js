import { useDataQuery } from "@dhis2/app-runtime";
import { useSelector } from "react-redux";
import {CircularLoader, NoticeBox} from '@dhis2/ui';

// ------------------
import { Link, useParams } from "react-router-dom";
import StageItem from "./StageItem";
// ------------------
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";


const query = {
    results: {
        resource: 'programs',
        id: ({program}) => program,
        params: {
            fields: ['id','displayName','programType','code','programStages[id,name,displayName,programStageSections]']
        }
    },
};

const ProgramDetails = () => {

    const {id} = useParams();

    if(id && id.length==11){
        const dispatch = useDispatch();
        const { setProgram } = bindActionCreators(actionCreators, dispatch);
        setProgram(id);
    }

    const program = useSelector(state => state.program);

    if(!program) return (
        <NoticeBox title="Missing Program ID" error>
            No program ID was given, please try again! <Link to="/">Go to programs list</Link>
        </NoticeBox>
    )
    
    const { loading, error, data } = useDataQuery(query, {variables:{program}});
    
    if (error) { 
        return (
            <NoticeBox title="Error retrieving program details">
                <span>{JSON.stringify(error)}</span>
            </NoticeBox>
        )
    }
    if (loading) { return <span><CircularLoader /></span> }

    return (
        <div className="wrapper">
            <div className="layout_prgms_stages">
                <div className="list-ml_item">
                {
                    data.results.programStages.map((programStage) => {
                        return(
                            <StageItem stage={programStage} key={programStage.id} />
                        )
                    })
                }
                </div>
            </div>
        </div>
    );
}

export default ProgramDetails;

