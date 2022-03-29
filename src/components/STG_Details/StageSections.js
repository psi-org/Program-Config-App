// DHIS2 UI
import { Button, ButtonStrip, AlertBar, AlertStack, ComponentCover, CenteredContent, CircularLoader, Modal, ModalTitle, ModalContent, ModalActions, Chip, IconSync24, IconCheckmarkCircle24, IconCross24 } from "@dhis2/ui";

import download_svg from './../../images/i-download.svg';
import upload_svg from './../../images/i-upload.svg';

// React Hooks
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableSection from "./Section";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import Scores from "./Scores";
import CriticalCalculations from "./CriticalCalculations";
import DataProcessor from "../Excel/DataProcessor";
import Importer from "../Excel/Importer";
import { checkScores, readQuestionComposites, buildProgramRuleVariables, buildProgramRules } from "./Scripting";
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';
import SaveMetadata from "./SaveMetadata";
import { Link } from "react-router-dom";
import Removed from "./Removed";
import ValidateMetadata from "./ValidateMetadata";
import Errors from "./Errors";
import ErrorReports from "./ErrorReports";
import DataElementForm from "./DataElementForm";

import CachedIcon from '@mui/icons-material/Cached';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';


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

const StageSections = ({ programStage, stageRefetch }) => {

    // Globals
    const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
        FEEDBACK_TEXT = "yhKEe6BLEer",
        CRITICAL_QUESTION = "NPwvdTt0Naj",
        METADATA = "haUflNqP85K",
        SCORE_DEN = "l7WdLDhE3xW",
        SCORE_NUM = "Zyr7rlDOJy8";

    const programId = programStage.program.id;

    // Flags
    const [saveStatus, setSaveStatus] = useState('Validate');
    const [saveAndBuild, setSaveAndBuild] = useState(false);
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [savedAndValidated, setSavedAndValidated] = useState(false)
    const [exportToExcel, setExportToExcel] = useState(false);
    //const { hasNotice, setHasNotice } = useState(false);

    const [ exportStatus, setExportStatus] = useState("Download Template");
    const [ importerEnabled, setImporterEnabled ] = useState(false);
    const [ importResults, setImportResults] = useState(false);
    const [ progressSteps,setProgressSteps ]= useState(0);
    const [ isValid, setIsValid ] = useState(true);
    const [ validationResults, setValidationResults] = useState(false);

    const [ deToEdit, setDeToEdit ] = useState('')

    const [ uidPool, setUidPool ] = useState([]);

    useEffect(()=> { 
        if(importerEnabled){
            setErrorReports(undefined)
            setValidationResults(false)
        }
    },[importerEnabled])

    // States
    const [sections, setSections] = useState(programStage.programStageSections.filter(s => s.name != "Scores" && s.name != "Critical Steps Calculations"));
    const [scoresSection, setScoresSection] = useState(programStage.programStageSections.find(s => s.name == "Scores"));
    const [criticalSection, setCriticalSection] = useState(programStage.programStageSections.find(s => s.name == "Critical Steps Calculations"));
    const [programStageDataElements, setProgramStageDataElements] = useState(programStage.programStageDataElements);
    const [programMetadata,setProgramMetadata] = useState(JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}"));
    const [errorReports,setErrorReports] = useState(undefined)

    // Create Mutation
    let metadataDM = useDataMutation(createMutation);
    const createMetadata = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data
    };

    //Delete mutations
    const deleteMetadata = useDataMutation(deleteMetadataMutation)[0];

    // Get Ids
    const idsQuery = useDataQuery(queryIds, { variables: { n: programStage.programStageDataElements.length * 5 } });
    //setUidPool(idsQuery.data?.results.codes);

    // Fetch Program Rules from Program
    const prDQ = useDataQuery(queryPR, { variables: { programId: programStage.program.id } });

    // Fetch Program Rule Variables from Program
    const prvDQ = useDataQuery(queryPRV, { variables: { programId: programStage.program.id } });

    useEffect(()=>{
        let n = (sections.reduce((prev,acu)=> prev + acu.dataElements.length,0) + scoresSection.dataElements.length + criticalSection.dataElements.length) * 5;
        //No Sections , get minimum ids for core Program Rules
        if(n<50) n=50

        idsQuery.refetch({n}).then(data=>{
            if(data){
                setUidPool(data.results.codes)
            }
        })
    },[sections]);

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const onDragEnd = (result) => {
        // Dropped outside of Droppable
        if (!result.destination) return;

        // Copy of sections from state
        let newSections = sections;

        switch (result.type) {
            case 'SECTION':
                newSections = reorder(
                    sections,
                    result.source.index,
                    result.destination.index
                );
                setSaveStatus('Validate & Save');
                break;
            case 'DATA_ELEMENT':
                if (result.source.droppableId == result.destination.droppableId) {
                    //Same section
                    let sectionIndex = newSections.findIndex(s => s.id == result.source.droppableId);
                    newSections[sectionIndex].dataElements = reorder(
                        newSections[sectionIndex].dataElements,
                        result.source.index,
                        result.destination.index
                    );
                } else {
                    //Different section
                    let element = newSections.find(s => s.id == result.source.droppableId).dataElements.splice(result.source.index, 1)[0];
                    newSections.find(s => s.id == result.destination.droppableId).dataElements.splice(result.destination.index, 0, element);
                }
                setSaveStatus('Validate & Save');
                break;
            default:
        }
        setSections(newSections);
    };

    const commit = () => {
        if(createMetadata.data && createMetadata.data.status) delete createMetadata.data.status
        setSavingMetadata(true);
        return;
    };

    const configuration_download = (e) => {
        e.preventDefault();
        setExportToExcel(true);
        setExportStatus("Generating Configuration File...")
    };

    const configuration_import = () => {
        setImporterEnabled(true);
    };

    const run = () => {
        if (!savedAndValidated) return;

        // Set flag to enable/disable actions (buttons)
        setSaveAndBuild('Run');

        // --------------- PROCESSING ---------------- //
        // Globals, States & more...

        // I. Scores Checking
        // Requires: scoresSection
        //      Break point: When duplicated scores found
        setProgressSteps(1);

        const { uniqueScores, compositeScores, duplicatedScores } = checkScores(scoresSection.dataElements);
        if (!uniqueScores) throw { msg: "Duplicated scores", duplicatedScores, status: 400 };
        const scoresMapping = scoresSection.dataElements.reduce((acc, cur) => (
            {
                ...acc,
                [cur.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value]: cur
            }), {});   // { feedbackOrder:deUid, ... }

        // II. Read questions
        // Requires: sections (with or WITHOUT scores&critical)
        //      Breakpoint: When a score is missing
        setProgressSteps(2);

        const questionCompositeScores = readQuestionComposites(sections);
        const missingComposites = questionCompositeScores.filter(cs => !compositeScores.includes(cs));
        if (missingComposites.length > 0) throw { msg: "Some questions Feedback Order don't match any Score item", missingComposites, status: 400 }

        // III. Build new metadata
        // Program Rule Variables : Data Elements (questions & labels) , Calculated Values, Critical Steps + Competency Class
        setProgressSteps(3);
        
        const programRuleVariables = buildProgramRuleVariables(sections, compositeScores, programId,programMetadata.useCompetencyClass);
        const { programRules, programRuleActions } = buildProgramRules(sections, programStage.id, programId, compositeScores, scoresMapping, uidPool,programMetadata.useCompetencyClass,programMetadata.healthArea); //useCompetencyClass

        const metadata = { programRuleVariables, programRules, programRuleActions };

        // IV. Delete old metadata
        setProgressSteps(4);

        const oldMetadata = {
            programRules: prDQ.data.results.programRules.map(pr => ({ id: pr.id })),
            programRuleVariables: prvDQ.data.results.programRuleVariables.map(prv => ({ id: prv.id }))
        };

        // V. Import new metadata

        deleteMetadata({ data: oldMetadata }).then((res) => {
            if(res.status=='OK'){
                setProgressSteps(5);

                createMetadata.mutate({ data: metadata }).then(response => {
                    
                    if(response.status=='OK'){
                        setSaveAndBuild('Completed');
                        setSavedAndValidated(false);

                        prDQ.refetch();
                        prvDQ.refetch();
                        setProgressSteps(6);
                    }
                });
            }
            
        });

        

    }

    const parseErrors = (e) => {
        let data = e.typeReports.map(tr=>{
            let type = tr.klass.split('.').pop()
            return tr.objectReports.map(or =>  or.errorReports.map(er => ({type,uid:or.uid,errorCode:er.errorCode,message:er.message})))
        })
        return data.flat().flat()
    }

    return (
        <div className="cont_stage">
            <div className="sub_nav">
                <div className="cnt_p">
                <Link to={'/'}><Chip>Home</Chip></Link>/
                    <Link to={'/program/' + programStage.program.id}><Chip>Program: {programStage.program.name}</Chip></Link>/
                    <Chip>Stage: {programStage.displayName}</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns">
                <ButtonStrip>
                    <Button icon={<CheckCircleOutlineIcon />} disabled={createMetadata.loading} onClick={() => commit()}> {saveStatus}</Button>
                    <Button icon={<ConstructionIcon/>} disabled={!savedAndValidated} primary onClick={() => run()}>Set up program</Button>
                    <Button icon={<FileDownloadIcon/>} name="generator"
                        loading={exportToExcel ? true : false} onClick={() => configuration_download(event)} disabled={exportToExcel}>{exportStatus}</Button>
                    <Button icon={<PublishIcon/>} name="importer"
                        onClick={() => setImporterEnabled(true)}>Import Template</Button>
                    <Button name="Reload" icon={<CachedIcon/>} onClick={()=> {window.location.reload()}}>Reload</Button>
                </ButtonStrip>
                </div>
            </div>
            {importerEnabled && <Importer displayForm={setImporterEnabled} previous={{sections,setSections, scoresSection, setScoresSection}} setSaveStatus={setSaveStatus} setImportResults={setImportResults} programMetadata={{programMetadata,setProgramMetadata}} />}
            <div className="title">Sections for program stage {programStage.displayName}</div>
            {exportToExcel && <DataProcessor programName={programStage.program.name} ps={programStage} isLoading={setExportToExcel} setStatus={setExportStatus}/>}
            {
                createMetadata.loading &&
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={open}
                    onClick={handleClose}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                /* <ComponentCover translucent>
                </ComponentCover> */
            }

            {createMetadata.error &&
                <AlertStack>
                    <AlertBar critical>
                        {"Error: " + JSON.stringify(createMetadata.error.message)}
                    </AlertBar>
                </AlertStack>
            }

            {createMetadata.data && createMetadata.data.status == "OK" &&
                <AlertStack>
                    <AlertBar>
                        {"Process completed successfully"}
                    </AlertBar>
                </AlertStack>
            }

            {createMetadata.data && (createMetadata.data.status == "ERROR") &&
                <AlertStack>
                    <AlertBar critical>
                        {"Process ended with error. Please check Errors Summary section for more details."}
                    </AlertBar>
                </AlertStack>
            }
            {saveAndBuild &&
                <Modal>
                    <ModalTitle>SETTING UP PROGRAM</ModalTitle>
                    <ModalContent>
                        {(progressSteps > 0) &&
                            <div className="progressItem">
                                {progressSteps===1 && <CircularLoader small/>}
                                {progressSteps===1 && createMetadata?.data?.status=="ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps!==1 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Checking scores</p>
                            </div>
                        }
                        {(progressSteps > 1) &&
                            <div className="progressItem">
                                {progressSteps===2 && <CircularLoader small/>}
                                {progressSteps===2 && createMetadata?.data?.status=="ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps!==2 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Reading assesment's questions</p>
                            </div>
                        }
                        {(progressSteps > 2) &&
                            <div className="progressItem">
                                {progressSteps===3 && <CircularLoader small/>}
                                {progressSteps===3 && createMetadata?.data?.status==="ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps!==3 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Building new metadata</p>
                            </div>
                        }
                        {(progressSteps > 3) &&
                            <div className="progressItem">
                                {progressSteps===4 && createMetadata?.data?.status!=="ERROR" && <CircularLoader small/>}
                                {progressSteps===4 && createMetadata?.data?.status==="ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps!==4 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Deleting old metadata</p>
                            </div>
                        }
                        {(progressSteps > 4) &&
                            <div className="progressItem">
                                {progressSteps===5 && createMetadata?.data?.status!=="ERROR" && <CircularLoader small/>}
                                {progressSteps===5 && createMetadata?.data?.status==="ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps!==5 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Importing new metadata</p>
                            </div>
                        }
                        {(progressSteps > 5) &&
                            <div className="progressItem">
                                <IconCheckmarkCircle24 color={'#00b894'} />
                                <p> Done!</p>
                            </div>
                        }
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip>
                            <Button disabled={(saveAndBuild != 'Completed') && (createMetadata?.data?.status !== 'ERROR')} onClick={() => { setSaveAndBuild(false); setProgressSteps(0); }}>{`Close`}</Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            }
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="wrapper" style={{ overflow: 'auto' }}>
                    <div className="layout_prgms_stages">
                        {/* { programStageDataElements &&  <DataElementForm programStageDataElement={programStageDataElements[5]} /> } */}
                        {
                            importResults && (importResults.questions.removed > 0 || importResults.scores.removed > 0) &&
                            <Removed importResults={importResults} index={0} key={"removedSec"} />
                        }
                        {
                            validationResults && (validationResults.questions.length > 0 || validationResults.scores.length > 0 || validationResults.feedbacks.length > 0) &&
                            <Errors validationResults={validationResults} index={0} key={"validationSec"}/>
                        }
                        {
                            errorReports && <ErrorReports errors={errorReports} />
                        }
                        {
                            createMetadata.data && createMetadata.data.status =='ERROR' && <ErrorReports errors={parseErrors(createMetadata.data)} />
                        }
                        <Droppable droppableId="dpb-sections" type="SECTION">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="list-ml_item">
                                    {
                                        sections.map((pss, idx) => {
                                            return <DraggableSection stageSection={pss} stageDataElements={programStageDataElements} deToEdit={deToEdit} setDeToEdit={setDeToEdit} index={idx} key={pss.id || idx} />
                                        })
                                    }
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <CriticalCalculations stageSection={criticalSection} index={0} key={criticalSection.id} />
                        <Scores stageSection={scoresSection} index={0} key={scoresSection.id} />
                        
                    </div>
                </div>
            </DragDropContext>
            {
                savingMetadata &&
                <ValidateMetadata
                    newDEQty={importResults ? importResults.questions.new + importResults.scores.new + importResults.sections.new : 0} 
                    programStage={programStage}
                    importedSections={sections}
                    importedScores={scoresSection}
                    criticalSection={criticalSection}
                    removedItems={importResults ? importResults.questions.removedItems.concat(importResults.scores.removedItems):[]}

                    // createMetadata={createMetadata}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    previous={{sections,setSections, scoresSection, setScoresSection}}
                    setImportResults = {setImportResults}
                    importResults = {importResults}
                    setIsValid = {setIsValid}
                    setValidationResults = {setValidationResults}
                    programMetadata={programMetadata}
                    setErrorReports={setErrorReports}
                    />
            }

        </div>
    )
}

export default StageSections;