import { useDataQuery } from "@dhis2/app-runtime";
import { useSelector } from "react-redux";
import { Button, Chip, CircularLoader, NoticeBox } from '@dhis2/ui';

// ------------------
import { Link, useParams } from "react-router-dom";
import StageItem from "./StageItem";
import StageNew from "./StageNew";
// ------------------
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actionCreators from "../../state/action-creators";
import { useState, useEffect } from "react";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MuiButton from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const query = {
    results: {
        resource: 'programs',
        id: ({ program }) => program,
        params: {
            fields: ['id', 'displayName', 'programType', 'code', 'attributeValues','programStages[id,name,displayName,formType,programStageSections,description,program[id,name],minDaysFromStart,repeatable,periodType,displayGenerateEventBox,autoGenerateEvent,openAfterEnrollment,reportDateToUse,remindCompleted,allowGenerateNextVisit,featureType,attributeValues,publicAccess,notificationTemplates,programStageDataElements']
        }
    },
};

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProgramDetails = () => {

    const h2Ready = localStorage.getItem('h2Ready') === 'true'

    const { id } = useParams();
    const [showStageForm, setShowStageForm] = useState(false);
    const [notification, setNotification] = useState(undefined);
    const [snackSeverity, setSnackSeverity] = useState(undefined);
    const [newStage,setNewStage] = useState()

    useEffect(()=>{
        
    },[newStage])

    useEffect(() => {
        if (notification) setSnackSeverity(notification.severity)
    }, [notification])

    if (id && id.length == 11) {
        const dispatch = useDispatch();
        const { setProgram } = bindActionCreators(actionCreators, dispatch);
        setProgram(id);
    }

    const program = useSelector(state => state.program);

    if (!program) return (
        <NoticeBox title="Missing Program ID" error>
            No program ID was given, please try again! <Link to="/">Go to programs list</Link>
        </NoticeBox>
    )

    const { loading, error, data, refetch } = useDataQuery(query, { variables: { program } });

    if (error) {
        return (
            <NoticeBox title="Error retrieving program details">
                <span>{JSON.stringify(error)}</span>
            </NoticeBox>
        )
    }
    if (loading) { return <span><CircularLoader /></span> }

    const hnqisMode = !!data.results.attributeValues.find(av=>av.value==="HNQIS2")

    if(hnqisMode && !h2Ready) return (
        <div style={{margin:'2em'}}>
            <NoticeBox title="HNQIS 2.0 Metadata is missing or out of date" error>
                <span>First go to <Link to="/">Home Screen</Link> and Install the latest HNQIS 2.0 Metadata to continue</span>
            </NoticeBox>
        </div>
    )

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p">
                    <Link to={'/'}><Chip>Home</Chip></Link>/
                    <Chip>Program: {data.results.displayName}</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns">
                    <MuiButton
                        variant="outlined"
                        color='inherit'
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setShowStageForm(true)}
                        disabled={showStageForm}>
                        Add Program Stage
                    </MuiButton>
                </div>
            </div>
            <div className="wrapper">
                <div className="title">Program Stages for Program {data.results.displayName}</div>
                <div className="layout_prgms_stages">
                    <div className="list-ml_item">
                        {
                            data.results.programStages.map((programStage) => {
                                return (
                                    <StageItem
                                        stage={programStage}
                                        key={programStage.id}
                                        setNotification={setNotification}
                                        stagesRefetch={refetch}
                                        setNewStage={setNewStage}
                                        editStatus={newStage?.stage===programStage.id && newStage?.mode }
                                    />
                                )
                            })
                        }
                        {data.results.programStages.length === 0 &&
                            <div className="title" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2em'}}>There are currently no Stages in this Program</div>
                        }
                    </div>
                </div>
                {showStageForm && <StageNew setShowStageForm={setShowStageForm} stagesRefetch={refetch} setNotification={setNotification} programId={program} programName={data.results.displayName} setNewStage={setNewStage}/>}
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={notification !== undefined}
                    key={'topcenter'}>
                    <Alert onClose={() => setNotification(undefined)} severity={notification?.severity || snackSeverity} sx={{ width: '100%' }}>
                        {notification?.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    );
}

export default ProgramDetails;

