import { useDataQuery } from "@dhis2/app-runtime";
import { useSelector } from "react-redux";
import { Chip, CircularLoader, NoticeBox } from '@dhis2/ui';

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
import MuiChip from '@mui/material/Chip';
import { formatAlert, truncateString } from "../../configs/Utils";
import ImportDownloadButton from "../UIElements/ImportDownloadButton";
import DataProcessorTracker from "../Excel/DataProcessorTracker";
import Importer from "../Excel/Importer";
import { TEMPLATE_PROGRAM_TYPES } from "../../configs/TemplateConstants";

const dataElementQuery = 'aggregationType,attributeValues[value,attribute],code,description,displayName,domainType,formName,id,legendSet,legendSets[id,name],name,optionSet[id,name],optionSetValue,sharing,shortName,style,valueType';
const stageDataElementsQuery = `categoryCombo,compulsory,dataElement[${dataElementQuery}],displayInReports,id,name,programStage,sortOrder,style`;
const stageSectionsQuery = `dataElements[${dataElementQuery}],displayName,id,name,sortOrder`;
const stagesQuery = `id,name,displayName,formType,programStageSections[${stageSectionsQuery}],description,program[id,name],minDaysFromStart,repeatable,periodType,displayGenerateEventBox,autoGenerateEvent,openAfterEnrollment,reportDateToUse,remindCompleted,allowGenerateNextVisit,featureType,attributeValues,publicAccess,notificationTemplates,programStageDataElements[${stageDataElementsQuery}],sortOrder`

const query = {
    results: {
        resource: 'programs',
        id: ({ program }) => program,
        params: {
            fields: ['id', 'displayName', 'programType', 'code', 'attributeValues', `programStages[${stagesQuery}]`, 'withoutRegistration']
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
    const [newStage, setNewStage] = useState();
    const [selectedIndexTemplate, setSelectedIndexTemplate] = useState(0);
    const [importerEnabled, setImporterEnabled] = useState(false);
    const [exportToExcel, setExportToExcel] = useState(false);
    const [exportStatus, setExportStatus] = useState("Download Template");
    const [importResults, setImportResults] = useState();

    // IMPORT TEMPLATE SCOPE
    const [importDialog, setImportDialog] = useState(false);
    // 

    useEffect(() => {
    }, [exportToExcel, setExportStatus])

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
            No program ID was provided, please try again! <Link to="/">Go to programs list</Link>
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

    const hnqisMode = !!data.results.attributeValues.find(av => av.value === "HNQIS2")

    if (hnqisMode && !h2Ready) return (
        <div style={{ margin: '2em' }}>
            <NoticeBox title="HNQIS 2.0 Metadata is missing or out of date" error>
                <span>First go to the <Link to="/">Home Screen</Link> and Install the latest HNQIS 2.0 Metadata to continue.</span>
            </NoticeBox>
        </div>
    )

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p">
                    <Link to={'/'}><Chip>Home</Chip></Link>/
                    <Chip>{'Program: ' + truncateString(data.results.displayName)}</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns" style={{ display: 'flex', alignItems: 'center' }}>
                    {!hnqisMode && !data.results.withoutRegistration &&
                        <>
                            <MuiButton
                                variant="outlined"
                                color='inherit'
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => setShowStageForm(true)}
                                disabled={showStageForm}>
                                Add Program Stage
                            </MuiButton>
                        </>
                    }
                    {
                        !hnqisMode &&
                        <>
                            <ImportDownloadButton
                                value={selectedIndexTemplate}
                                setValue={setSelectedIndexTemplate}
                                disabled={exportToExcel}
                                setStatus={setExportStatus}
                                setImporterEnabled={setImporterEnabled}
                                setExportToExcel={setExportToExcel}
                            />
                            {!hnqisMode && exportToExcel &&
                                <DataProcessorTracker
                                    programId={program}
                                    isLoading={setExportToExcel}
                                    setStatus={setExportStatus}
                                />}
                        </>
                    }
                </div>
            </div>
            <div className="title" style={{ padding: '1.5em 1em 0', overflow: 'hidden', display: 'flex', maxWidth: '100vw', justifyContent: 'start', alignItems: 'center' }}>
                <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {!data.results.withoutRegistration ? 'Program Stages for Program ' : 'Event Program '}
                    <strong style={{ maxWidth: '100%' }}>
                        {data.results.displayName}
                    </strong>
                </span>
                {data.results.withoutRegistration &&
                    <MuiChip style={{ marginLeft: '1em' }} label="Read Only" variant="outlined" />
                }
            </div>
            <div className="wrapper" style={{ padding: '1em 1.2em 0' }}>
                <div className="layout_prgms_stages">
                    <div className="list-ml_item">
                        {
                            data.results.programStages.sort((stageA, stageB) =>
                                (stageA.sortOrder > stageB.sortOrder) ? 1 : ((stageA.sortOrder < stageB.sortOrder) ? -1 : 0)
                            ).map((programStage) => {
                                return (
                                    <StageItem
                                        stage={programStage}
                                        key={programStage.id}
                                        setNotification={setNotification}
                                        stagesRefetch={refetch}
                                        setNewStage={setNewStage}
                                        editStatus={newStage?.stage === programStage.id && newStage?.mode}
                                        hnqisMode={hnqisMode}
                                        eventMode={data.results.withoutRegistration}
                                    />
                                )
                            })
                        }
                        {data.results.programStages.length === 0 &&
                            <div className="title" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2em' }}>There are currently no Stages in this Program</div>
                        }
                    </div>
                </div>
                {showStageForm && <StageNew setShowStageForm={setShowStageForm} stagesRefetch={refetch} setNotification={setNotification} programId={program} programName={data.results.displayName} setNewStage={setNewStage} />}
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={notification !== undefined}
                    key={'topcenter'}>
                    <Alert onClose={() => setNotification(undefined)} severity={notification?.severity || snackSeverity} sx={{ width: '100%' }}>
                        {formatAlert(notification?.message)}
                    </Alert>
                </Snackbar>
                {!hnqisMode && importerEnabled &&
                    <Importer
                        displayForm={setImporterEnabled}
                        setImportResults={setImportResults}
                        importType='TRACKER'
                        currentStagesData={data.results.programStages}
                        programSpecificType={data.results.withoutRegistration ? TEMPLATE_PROGRAM_TYPES.event : TEMPLATE_PROGRAM_TYPES.tracker}
                        previous={{ stages: data.results.programStages }}
                    />
                }
            </div>
        </div>
    );
}

export default ProgramDetails;

