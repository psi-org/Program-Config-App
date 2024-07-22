import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { Chip, CircularLoader, NoticeBox, IconCheckmarkCircle24, IconCross24 } from '@dhis2/ui';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import { Button, DialogActions, DialogContent, Tooltip } from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import MuiButton from '@mui/material/Button';
import MuiChip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { bindActionCreators } from "redux";
import { BUILD_VERSION, DATASTORE_H2_METADATA, GENERATED_OBJECTS_NAMESPACE, H2_METADATA_VERSION, METADATA, NAMESPACE } from "../../configs/Constants.js";
import { TEMPLATE_PROGRAM_TYPES } from "../../configs/TemplateConstants.js";
import actionCreators from "../../state/action-creators";
import { DeepCopy, formatAlert, getPCAMetadataDE, getProgramQuery, mapIdArray, padValue, setPCAMetadata, truncateString, versionGTE } from "../../utils/Utils.js";
import DataProcessorTracker from "../Excel/DataProcessorTracker.js";
import Importer from "../Excel/Importer.js";
import ValidateTracker from "../PRG_Details/ValidateTracker.js";
import { hideShowLogic } from "../STG_Details/Scripting.js";
import CustomMUIDialog from "../UIElements/CustomMUIDialog.js";
import CustomMUIDialogTitle from "../UIElements/CustomMUIDialogTitle.js";
import ErrorReports from "../UIElements/ErrorReports.js";
import Errors from "../UIElements/Errors.js";
import ImportDownloadButton from "../UIElements/ImportDownloadButton.js";
import Removed from "../UIElements/Removed.js";
import StageItem from "./StageItem.js";
import StageNew from "./StageNew.js";


const query = {
    results: {
        resource: 'programs',
        id: ({ program }) => program,
        params: {
            fields: getProgramQuery()
        }
    },
};

const createMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const deleteMetadataMutation = {
    resource: 'metadata?importStrategy=DELETE',
    type: 'create',
    data: ({ data }) => data
};

const queryProgramSettings = {
    results: {
        resource: 'programs',
        id: ({ programId }) => programId,
        params: {
            fields: ['lastUpdated', 'id', 'href', 'created', 'name', 'shortName', 'publicAccess', 'ignoreOverdueEvents', 'skipOffline', 'enrollmentDateLabel', 'onlyEnrollOnce', 'version', 'displayFormName', 'displayEnrollmentDateLabel', 'selectIncidentDatesInFuture', 'maxTeiCountToReturn', 'selectEnrollmentDatesInFuture', 'registration', 'openDaysAfterCoEndDate', 'favorite', 'useFirstStageDuringRegistration', 'displayName', 'completeEventsExpiryDays', 'displayShortName', 'externalAccess', 'withoutRegistration', 'minAttributesRequiredToSearch', 'displayFrontPageList', 'programType', 'accessLevel', 'displayIncidentDate', 'expiryDays', 'categoryCombo', 'sharing', 'access', 'trackedEntityType', 'createdBy', 'user', 'programIndicators', 'translations', 'userGroupAccesses', 'attributeValues', 'userRoles', 'userAccesses', 'favorites', 'programRuleVariables', 'programTrackedEntityAttributes', 'notificationTemplates', 'organisationUnits', 'programSections', 'programStages', 'style']
        }
    },
}

const queryIds = {
    results: {
        resource: 'system/id.json',
        params: ({ n }) => ({
            limit: n
        })
    }
};

const queryPR = {
    results: {
        resource: 'programRules',
        params: ({ programId }) => ({
            fields: ['id', 'name', 'condition', 'programRuleActions'],
            pageSize: 1000,
            filter: ['program.id:eq:' + programId, 'description:eq:_Scripted']
        })
    }
};

const queryPRV = {
    results: {
        resource: 'programRuleVariables',
        params: ({ programId }) => ({
            fields: ['id', 'name'],
            pageSize: 2000,
            filter: ['program.id:eq:' + programId, 'name:$like:_']
        })
    }
};

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`
    }
};

const ProgramDetails = () => {

    const { data: hnqis2Metadata, loading: metadataLoading  } = useDataQuery(queryHNQIS2Metadata);

    const h2Ready = localStorage.getItem('h2Ready') === 'true';

    const { id } = useParams();

    if (id && id.length === 11) {
        const dispatch = useDispatch();
        const { setProgram } = bindActionCreators(actionCreators, dispatch);
        setProgram(id);
    }

    const program = useSelector(state => state.program);

    const queryDataStore = {
        results: {
            resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${program}`,
        },
    };

    const dsCreateMutation = {
        resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${program}`,
        type: "create",
        data: ({ data }) => data,
    };

    const dsUpdateMutation = {
        resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${program}`,
        type: "update",
        data: ({ data }) => data,
    };

    const metadataDM = useDataMutation(createMutation, {
        onError: (err) => {
            console.error(err)
        }
    });

    const createMetadata = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data
    };

    const deleteMetadata = useDataMutation(deleteMetadataMutation, {
        onError: (err) => {
            console.error(err)
        }
    })[0];

    const [showStageForm, setShowStageForm] = useState(false);
    const [notification, setNotification] = useState(undefined);
    const [snackSeverity, setSnackSeverity] = useState(undefined);
    const [newStage, setNewStage] = useState();
    const [importerEnabled, setImporterEnabled] = useState(false);
    const [exportToExcel, setExportToExcel] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Validate');
    const [importResults, setImportResults] = useState();
    const [savedAndValidated, setSavedAndValidated] = useState(false);
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [validationResults, setValidationResults] = useState(undefined);
    const [errorReports, setErrorReports] = useState(undefined);
    const [backupData, setBackupData] = useState()
    const [progressSteps, setProgressSteps] = useState(0);
    const [saveAndBuild, setSaveAndBuild] = useState(false);

    useEffect(() => {
        if (notification) { setSnackSeverity(notification.severity) }
    }, [notification])

    // ***** DATASTORE ***** //

    const { refetch: getDataStore } = useDataQuery(queryDataStore);

    const [dataStoreCreate] = useDataMutation(dsCreateMutation, {
        onError: (err) => {
            console.log(err);
        }
    });
    const [dataStoreUpdate] = useDataMutation(dsUpdateMutation, {
        onError: (err) => {
            console.log(err);
        }
    });

    // Get Ids
    const idsQuery = useDataQuery(queryIds, { lazy: true, variables: { n: 0 } });
    //setUidPool(idsQuery.data?.results.codes);

    // Fetch Program Rules from Program
    const prDQ = useDataQuery(queryPR, { variables: { programId: program } });

    // Fetch Program Rule Variables from Program
    const prvDQ = useDataQuery(queryPRV, { variables: { programId: program } });

    const { loading, error, data, refetch } = useDataQuery(query, { variables: { program } });

    const { refetch: getProgramSettings } = useDataQuery(queryProgramSettings, { lazy: true, variables: { program } });

    const storeBackupdata = () => {
        setBackupData({
            programData: data.results
        })
    }

    useEffect(() => {
        if (data && !backupData) { storeBackupdata() }
    }, [data])

    useEffect(() => {
        if (savedAndValidated) { storeBackupdata() }
    }, [savedAndValidated])

    if (!program) {
        return (
            <NoticeBox title="Missing Program ID" error>
                No program ID was provided, please try again! <Link to="/">Go to programs list</Link>
            </NoticeBox>
        )
    }

    if (error) {
        return (
            <NoticeBox title="Error retrieving program details">
                <span>{JSON.stringify(error)}</span>
            </NoticeBox>
        )
    }

    if (loading) { return <span><CircularLoader /></span> }

    const hnqisMode = !!data.results.attributeValues.find(av => av.value === "HNQIS2");
    const readOnly = !!data.results.attributeValues.find(av => av.value === "HNQIS");

    if (hnqisMode && !h2Ready) {
        return (
            <div style={{ margin: '2em' }}>
                <NoticeBox title="HNQIS 2.0 Metadata is missing or out of date" error>
                    <span>First go to the <Link to="/">Home Screen</Link> and Install the latest HNQIS 2.0 Metadata to continue.</span>
                </NoticeBox>
            </div>
        )
    }

    const commit = () => {
        if (createMetadata.data && createMetadata.data.status) { delete createMetadata.data.status }
        setSavingMetadata(true);
        return;
    };

    const updateProgramBuildVersion = (programId, pcaMetadata) => {
        getProgramSettings({ programId }).then(res => {
            const program = res.results;
            pcaMetadata.buildVersion = BUILD_VERSION;
            setPCAMetadata(program, pcaMetadata);

            createMetadata.mutate({ data: { programs: [program] } }).then(response => {
                if (response.status == 'OK') {
                    setProgressSteps(6)
                    setSaveAndBuild('Completed');
                    setSavedAndValidated(false);

                    prDQ.refetch();
                    prvDQ.refetch();
                }
            })
        })
    }

    const buildProgramRulesTracker = () => {
        if (!savedAndValidated) { return }
        //--------------------- NEW METADATA --------------------//
        refetch({ program }).then(programConfig => {

            setProgressSteps(1);

            const pcaMetadata = JSON.parse(programConfig.results?.attributeValues?.find(pa => pa.attribute.id === METADATA)?.value || "{}")
            setSaveAndBuild('Run');

            const programStages = programConfig.results?.programStages;
            const n = (programStages?.reduce((acu, cur) => acu + (cur.programStageDataElements?.length || 0), 0) || 0) * 4;

            idsQuery.refetch({ n }).then(uidData => {
                if (uidData) {
                    const uidPool = uidData.results.codes;
                    setProgressSteps(2);

                    const hideShowGroup = {};
                    const programRuleVariables = [];

                    // Data Elements Variables
                    programStages.forEach((stage, stgIdx) => {
                        const stageSections = (stage.programStageSections && stage.programStageSections.length > 0)
                            ? stage.programStageSections
                            : [{
                                dataElements: stage.programStageDataElements.map(psde => psde.dataElement)
                            }];

                        const varNameRef = stageSections.map(sec => sec.dataElements.map(de => {
                            const metadata = getPCAMetadataDE(de)
                            return { id: de.id, varName: metadata.varName }
                        })).flat();

                        stageSections.forEach((section, secIdx) => {
                            section.dataElements.forEach((dataElement, deIdx) => {

                                programRuleVariables.push({
                                    id: uidPool.shift(),
                                    name: `_PS${padValue(stgIdx + 1, "00")}_S${padValue(secIdx + 1, "00")}E${padValue(deIdx + 1, "000")}`,
                                    programRuleVariableSourceType: "DATAELEMENT_CURRENT_EVENT",
                                    useCodeForOptionSet: dataElement.optionSet?.id ? true : false,
                                    program: { id: program },
                                    dataElement: { id: dataElement.id }
                                });

                                const metadata = getPCAMetadataDE(dataElement);

                                if (metadata.parentQuestion !== undefined && metadata.parentValue !== undefined) {
                                    const parentQuestion = varNameRef.find(de => de.id === String(metadata.parentQuestion)).varName;
                                    const parentValue = String(metadata.parentValue);

                                    !hideShowGroup[parentQuestion] ? hideShowGroup[parentQuestion] = {} : undefined;
                                    !hideShowGroup[parentQuestion][parentValue] ? hideShowGroup[parentQuestion][parentValue] = [] : undefined;
                                    !hideShowGroup[parentQuestion][parentValue].push({ id: dataElement.id, mandatory: metadata.isCompulsory });
                                }
                            });
                        });
                    });

                    const { hideShowRules, hideShowActions } = hideShowLogic(hideShowGroup, program, uidPool);

                    const metadata = { programRuleVariables, programRules: hideShowRules, programRuleActions: hideShowActions };

                    setProgressSteps(3);

                    getDataStore().then((dataStoreResult) => {
                        const programRefereces = {
                            programRules: mapIdArray(hideShowRules),
                            programRuleVariables: mapIdArray(programRuleVariables),
                        };

                        let dataStoreData;
                        let sendToDataStore;

                        if (!dataStoreResult?.results) {
                            sendToDataStore = dataStoreCreate;
                            dataStoreData = {};
                        } else {
                            sendToDataStore = dataStoreUpdate;
                            dataStoreData = dataStoreResult.results;
                        }

                        // Saving UIDs of old objects
                        const toDeleteReferences = DeepCopy(dataStoreData);

                        const fallbackRuleVariables = prvDQ.data.results.programRuleVariables.filter(prv => {
                            return prv.name[0] == "_";
                        });

                        const programRulesDel = toDeleteReferences?.programRules || mapIdArray(prDQ.data.results.programRules);
                        const programRuleVariablesDel = toDeleteReferences?.programRuleVariables || mapIdArray(fallbackRuleVariables);

                        const oldMetadata = {
                            programRules: (programRulesDel.length > 0 ? programRulesDel : undefined),
                            programRuleVariables: (programRuleVariablesDel.length > 0 ? programRuleVariablesDel : undefined),
                        };

                        // Setting new UIDs
                        dataStoreData = programRefereces;
                        deleteMetadata({ data: oldMetadata }).then((res) => {
                            if (res.status == 'OK') {
                                setProgressSteps(4);
                                createMetadata.mutate({ data: metadata }).then(response => {
                                    if (response.status == 'OK') {
                                        sendToDataStore({ data: dataStoreData }).then(dataStoreResp => {
                                            if (dataStoreResp.status != 'OK') {
                                                console.error(dataStoreResp);
                                            } else {
                                                setProgressSteps(5);
                                                updateProgramBuildVersion(program, pcaMetadata);
                                            }
                                        })
                                    }
                                });
                            }

                        });
                    });

                }
            })

        })
    }

    if (hnqisMode && !metadataLoading && !versionGTE(hnqis2Metadata?.results?.version, H2_METADATA_VERSION)) {
        return (<>
            <NoticeBox title="Check HNQIS2 Metadata" error>
                <p>The latest PCA Metadata Package is required to access this HNQIS2 Program.</p>
            </NoticeBox>
        </>);
    }

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p">
                    <Link to={'/'}><Chip>Home</Chip></Link>/
                    <Chip>{'Program: ' + truncateString(data.results.displayName)}</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns" style={{ display: 'flex', alignItems: 'center' }}>
                    {!hnqisMode && !readOnly &&
                        <>
                            <Button
                                color='inherit'
                                size='medium'
                                variant='outlined'
                                startIcon={<CheckCircleOutlineIcon />}
                                disabled={createMetadata.loading || !data?.results}
                                onClick={() => commit()}
                            > {saveStatus}</Button>

                            <Button
                                variant='contained'
                                onClick={() => buildProgramRulesTracker()}
                                startIcon={<ConstructionIcon />}
                                size='medium'
                                disabled={!savedAndValidated}
                            >Build Program Rules</Button>

                            <ImportDownloadButton
                                disabled={exportToExcel}
                                setImporterEnabled={setImporterEnabled}
                                setExportToExcel={setExportToExcel}
                            />

                            {!hnqisMode && exportToExcel &&
                                <DataProcessorTracker
                                    programId={program}
                                    isLoading={setExportToExcel}
                                />}
                        </>
                    }
                </div>
            </div>
            <div className="title" style={{ padding: '1.5em 1em 0', overflow: 'hidden', display: 'flex', maxWidth: '100vw', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '75%'
                }}>

                    <span>
                        {!data.results.withoutRegistration ? 'Program Stages for Program ' : 'Event Program '}
                        <Tooltip title={data.results.displayName} placement="bottom">
                            <strong style={{ maxWidth: '100%' }}>
                                {data.results.displayName}
                            </strong>
                        </Tooltip>
                    </span>

                    {readOnly &&
                        <MuiChip style={{ marginLeft: '1em' }} label="Read Only" variant="outlined" />
                    }
                </div>


                {!hnqisMode && !data.results.withoutRegistration &&
                    <MuiButton
                        variant="contained"
                        color='primary'
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setShowStageForm(true)}
                        disabled={showStageForm || importResults !== undefined}>
                        Add Program Stage
                    </MuiButton>
                }
            </div>
            {
                !hnqisMode && saveAndBuild &&

                <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
                    <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => { if ((saveAndBuild === 'Completed') || (createMetadata?.data?.status === 'ERROR')) { setSaveAndBuild(false); setProgressSteps(0); } }}>
                        Setting Up Program Rules for {data.results.displayName}
                    </CustomMUIDialogTitle >
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        {(progressSteps > 0) &&
                            <div className="progressItem">
                                {progressSteps === 1 && <CircularLoader small />}
                                {progressSteps === 1 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 1 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Fetching IDs</p>
                            </div>
                        }
                        {(progressSteps > 1) &&
                            <div className="progressItem">
                                {progressSteps === 2 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 2 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 2 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Building new Metadata</p>
                            </div>
                        }
                        {(progressSteps > 2) &&
                            <div className="progressItem">
                                {progressSteps === 3 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 3 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 3 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Deleting old Metadata</p>
                            </div>
                        }
                        {(progressSteps > 3) &&
                            <div className="progressItem">
                                {progressSteps === 4 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 4 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 4 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p style={{ maxWidth: '90%' }}> Importing new Metadata</p>
                            </div>
                        }
                        {(progressSteps > 4) &&
                            <div className="progressItem">
                                <IconCheckmarkCircle24 color={'#00b894'} />
                                <p> Process completed</p>
                            </div>
                        }
                    </DialogContent>

                    <DialogActions style={{ padding: '1em' }}>
                        <Button variant='outlined' disabled={(saveAndBuild != 'Completed') && (createMetadata?.data?.status !== 'ERROR')} onClick={() => { setSaveAndBuild(false); setProgressSteps(0); }}> Done </Button>
                    </DialogActions>

                </CustomMUIDialog>
            }
            <div className="wrapper" style={{ padding: '1em 1.2em 0', height: '75vh' }}>
                <div className="layout_prgms_stages">
                    <div className="list-ml_item">
                        {
                            errorReports && <ErrorReports errors={errorReports} />
                        }
                        {
                            validationResults &&
                            <Errors
                                validationResults={
                                    (validationResults.teas.sections.concat(validationResults.teas.teas))
                                        .concat(validationResults.stages.sections.concat(validationResults.stages.dataElements))
                                        .map(tea => tea.errors)
                                }
                                key={"validationSec"}
                            />
                        }
                        {importResults &&
                            <Removed
                                removedItems={
                                    (importResults.teaSummary
                                        ? importResults.teaSummary.teas.removedItems
                                        : []
                                    ).concat(importResults.stages.map(stage =>
                                        stage.dataElements.removedItems
                                    ).flat())
                                }
                                key={"removedSec"}
                                tagText='Object(s)'
                            />
                        }
                        <div style={{ width: '100%', padding: '0.5em 0' }}>
                            {
                                data.results.programStages.sort((stageA, stageB) =>
                                    (stageA.sortOrder > stageB.sortOrder) ? 1 : ((stageA.sortOrder < stageB.sortOrder) ? -1 : 0)
                                ).map((programStage) => {
                                    return (
                                        <StageItem
                                            stage={programStage}
                                            programSharing={DeepCopy(data.results.sharing)}
                                            importResults={importResults?.configurations?.importedStages?.find(result => result.id === programStage.id)}
                                            key={programStage.id}
                                            setNotification={setNotification}
                                            stagesRefetch={refetch}
                                            setNewStage={setNewStage}
                                            editStatus={newStage?.stage === programStage.id ? (newStage?.mode || '') : ''}
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
                </div>
                {showStageForm &&
                    <StageNew
                        setShowStageForm={setShowStageForm}
                        programSharing={DeepCopy(data.results.sharing)}
                        stagesRefetch={refetch}
                        setNotification={setNotification}
                        programId={program}
                        programName={data.results.displayName}
                        setNewStage={setNewStage}
                    />}
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
                        setValidationResults={setValidationResults}
                        setSaveStatus={setSaveStatus}
                        currentStagesData={DeepCopy(backupData.programData.programStages)}
                        programSpecificType={data.results.withoutRegistration ? TEMPLATE_PROGRAM_TYPES.event : TEMPLATE_PROGRAM_TYPES.tracker}
                        previous={{ stages: DeepCopy(backupData.programData.programStages), programSections: DeepCopy(backupData.programData.programSections), teas: DeepCopy(backupData.programData.programTrackedEntityAttributes) }}
                        setSavedAndValidated={setSavedAndValidated}
                    />
                }
                {
                    savingMetadata &&
                    <ValidateTracker
                        importResults={importResults}
                        setImportResults={setImportResults}
                        programMetadata={data.results}
                        setSavingMetadata={setSavingMetadata}
                        setSavedAndValidated={setSavedAndValidated}
                        setValidationResults={setValidationResults}
                        setErrorReports={setErrorReports}
                    />
                }
            </div>
        </div >
    );
}

export default ProgramDetails;

