// DHIS2 UI
import { ButtonStrip, AlertBar, AlertStack, ComponentCover, CircularLoader, Chip, IconCheckmarkCircle24, IconCross24 } from "@dhis2/ui";

// React Hooks
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableSection from "./Section";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";

import "react-sweet-progress/lib/style.css";
import Scores from "./Scores";
import CriticalCalculations from "./CriticalCalculations";
import DataProcessor from "../Excel/DataProcessor";
import Importer from "../Excel/Importer";
import { checkScores, readQuestionComposites, buildProgramRuleVariables, buildProgramRules } from "./Scripting";
import { Link } from "react-router-dom";
import Removed from "./Removed";
import ValidateMetadata from "./ValidateMetadata";
import Errors from "./Errors";
import ErrorReports from "./ErrorReports";

import CachedIcon from '@mui/icons-material/Cached';
import PublishIcon from '@mui/icons-material/Publish';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import AddBoxIcon from '@mui/icons-material/AddBox';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'

import SectionManager from './SectionManager'
import DataElementManager from './DataElementManager'

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

    const [exportStatus, setExportStatus] = useState("Download Template");
    const [importerEnabled, setImporterEnabled] = useState(false);
    const [importResults, setImportResults] = useState(false);
    const [progressSteps, setProgressSteps] = useState(0);
    const [isValid, setIsValid] = useState(true);
    const [validationResults, setValidationResults] = useState(false);

    const [editSectionIndex, setEditSectionIndex] = useState(undefined);
    const [newSectionIndex, setNewSectionIndex] = useState(undefined);
    const [showSectionManager, setShowSectionManager] = useState(false);

    const [deToEdit, setDeToEdit] = useState('')

    //const [snackbarContent, setSnackbarContent] = useState('')

    const [snackParams, setSnackParams] = useState(false)
    const pushNotification = (content, severity = "success") => setSnackParams({ content, severity })

    const [uidPool, setUidPool] = useState([]);

    useEffect(() => {
        if (importerEnabled) {
            setErrorReports(undefined)
            setValidationResults(false)
        }
    }, [importerEnabled])

    // States
    const [removedElements, setRemovedElements] = useState([])
    const originalProgramStageDataElements = programStage.programStageDataElements.reduce((acu, cur) => acu.concat(cur), [])
    const [sections, setSections] = useState([...programStage.programStageSections.filter(s => s.name != "Scores" && s.name != "Critical Steps Calculations")]);
    const [scoresSection, setScoresSection] = useState({ ...programStage.programStageSections.find(s => s.name == "Scores") });
    const [criticalSection, setCriticalSection] = useState(programStage.programStageSections.find(s => s.name == "Critical Steps Calculations"));
    const [programStageDataElements, setProgramStageDataElements] = useState([...programStage.programStageDataElements]);
    const [programMetadata, setProgramMetadata] = useState(JSON.parse(programStage.program.attributeValues.find(att => att.attribute.id == "haUflNqP85K")?.value || "{}"));
    const [errorReports, setErrorReports] = useState(undefined)

    // ***** DATA ELEMENT ACTIONS ***** //
    const updateDEValues = (dataElementId, sectionId, stageDataElement) => {

        let sectionIdx = sections.findIndex(s => s.id === sectionId)
        let section_DE_idx = sections[sectionIdx].dataElements.findIndex(de => de.id === dataElementId)
        let stage_DE_idx = programStageDataElements.findIndex(psde => psde.dataElement.id === dataElementId)

        programStageDataElements[stage_DE_idx] = stageDataElement
        sections[sectionIdx].dataElements[section_DE_idx] = stageDataElement.dataElement

        setProgramStageDataElements(programStageDataElements)
        setSections(sections)
        setDeToEdit('')
        pushNotification(<span>Data Element edited! <strong>Remember to Validate and Save!</strong></span>)
    }

    const removeDE = (id, section) => {
        let psdeIdx = programStageDataElements.findIndex(psde => psde.dataElement.id === id)
        let sectionIdx = sections.find(s => s.id === section)?.dataElements.findIndex(de => de.id === id)

        if (sectionIdx > -1 && psdeIdx > -1) {
            sections.find(s => s.id === section)?.dataElements.splice(sectionIdx, 1)
            programStageDataElements.splice(psdeIdx, 1)
            setSections(sections)
            setProgramStageDataElements(programStageDataElements)
            pushNotification(<span>Data Element removed! <strong>Remember to Validate and Save!</strong></span>, "info")
        }
    }

    const saveAdd = (params) => {
        let dataElementObjects = params.newDataElements.map(psde => psde.dataElement)

        sections.find(s => s.id === params.deRef.section).dataElements.splice(params.deRef.index, 0, ...dataElementObjects/* ...params.newDataElements */)
        let newProgramStageDataElements = programStageDataElements.concat(params.newDataElements)

        setSections(sections)
        setProgramStageDataElements(newProgramStageDataElements)
        setDeManager(false)
        pushNotification(<span>{params.newDataElements.length} Data Element{params.newDataElements.length > 1 ? 's' : ''} added! <strong>Remember to Validate and Save!</strong></span>)
    }

    const [deManager, setDeManager] = useState(false)

    const DEActions = {
        deToEdit,
        setEdit: de => setDeToEdit(de),
        update: (de, section, stageDe) => updateDEValues(de, section, stageDe),
        remove: (de, section) => removeDE(de, section),
        add: (index, section) => setDeManager({
            index,
            section,
            stage: programStage.id,
            sectionName: sections.find(s => s.id === section).displayName
        })
    }
    // ***** END OF DATA ELEMENT ACTIONS ***** //

    // ***** SECTIONS ACTIONS ***** //
    const handleSectionEdit = (section = undefined, newSection = undefined) => {
        setEditSectionIndex(section)
        setNewSectionIndex(newSection)
        setShowSectionManager(true)
    }

    const removeSection = section => {
        let idx = sections.findIndex(s => s.id === section.id)
        let newPSDEs = programStageDataElements.filter(psde => !section.dataElements.find(de => de.id === psde.dataElement.id))
        setProgramStageDataElements(newPSDEs)
        sections.splice(idx, 1)
        setSections(sections)
        pushNotification(<span>{`Section '${section.name}' removed! `}<strong>Remember to Validate and Save!</strong></span>, "info")
    }

    const SectionActions = {
        append : () => handleSectionEdit(undefined,sections.length),
        handleSectionEdit: (section = undefined, newSection = undefined) => handleSectionEdit(section, newSection),
        remove: id => removeSection(id)
    }

    // ***** END OF SECTIONS ACTIONS ***** //

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

    useEffect(() => {
        let n = (sections.reduce((prev, acu) => prev + acu.dataElements.length, 0) + scoresSection.dataElements.length + criticalSection.dataElements.length) * 5;
        //No Sections , get minimum ids for core Program Rules
        if (n < 50) n = 50

        idsQuery.refetch({ n }).then(data => {
            if (data) {
                setUidPool(data.results.codes)
            }
        })
    }, [sections]);

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
        if (createMetadata.data && createMetadata.data.status) delete createMetadata.data.status
        let removed = originalProgramStageDataElements.filter(psde => !programStageDataElements.find(de => de.dataElement.id === psde.dataElement.id)).map(psde => psde.dataElement)
        setRemovedElements(removed)
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

        const programRuleVariables = buildProgramRuleVariables(sections, compositeScores, programId, programMetadata.useCompetencyClass);
        const { programRules, programRuleActions } = buildProgramRules(sections, programStage.id, programId, compositeScores, scoresMapping, uidPool, programMetadata.useCompetencyClass, programMetadata.healthArea); //useCompetencyClass

        const metadata = { programRuleVariables, programRules, programRuleActions };

        // IV. Delete old metadata
        setProgressSteps(4);

        const oldMetadata = {
            programRules: prDQ.data.results.programRules.map(pr => ({ id: pr.id })),
            programRuleVariables: prvDQ.data.results.programRuleVariables.map(prv => ({ id: prv.id }))
        };

        // V. Import new metadata

        deleteMetadata({ data: oldMetadata }).then((res) => {
            if (res.status == 'OK') {
                setProgressSteps(5);

                createMetadata.mutate({ data: metadata }).then(response => {

                    if (response.status == 'OK') {
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
        let data = e.typeReports.map(tr => {
            let type = tr.klass.split('.').pop()
            return tr.objectReports.map(or => or.errorReports.map(er => ({ type, uid: or.uid, errorCode: er.errorCode, message: er.message })))
        })
        return data.flat().flat()
    }

    return (
        <div className="cont_stage">
            <div className="sub_nav align-items-center">
                <div className="cnt_p">
                    <Link to={'/'}><Chip>Home</Chip></Link>/
                    <Link to={'/program/' + programStage.program.id}><Chip>Program: {programStage.program.name}</Chip></Link>/
                    <Chip>Stage: {programStage.displayName}</Chip>
                </div>
                <div className="c_srch"></div>
                <div className="c_btns" style={{ color: '#444444' }}>
                    <ButtonStrip>
                        <Button color='inherit' variant='outlined' startIcon={<CheckCircleOutlineIcon />} disabled={createMetadata.loading} onClick={() => commit()}> {saveStatus}</Button>
                        <Button variant='contained' startIcon={<ConstructionIcon />} disabled={!savedAndValidated} onClick={() => run()}>Set up program</Button>
                        <Button color='inherit' variant='outlined' startIcon={!exportToExcel?<FileDownloadIcon />:<CircularLoader small />} name="generator"
                            onClick={() => configuration_download(event)} disabled={exportToExcel}>{exportStatus}</Button>
                        <Button color='inherit' variant='outlined' startIcon={<PublishIcon />} name="importer"
                            onClick={() => setImporterEnabled(true)}>Import Template</Button>
                        <Button color='inherit' name="Reload" variant='outlined' startIcon={<CachedIcon />} onClick={() => { window.location.reload() }}>Reload</Button>
                    </ButtonStrip>
                </div>
            </div>
            {importerEnabled && <Importer displayForm={setImporterEnabled} previous={{ sections, setSections, scoresSection, setScoresSection }} setSaveStatus={setSaveStatus} setImportResults={setImportResults} programMetadata={{ programMetadata, setProgramMetadata }} />}
            <div className="title">Sections for program stage {programStage.displayName}</div>
            {exportToExcel && <DataProcessor programName={programStage.program.name} ps={programStage} isLoading={setExportToExcel} setStatus={setExportStatus} />}
            {
                createMetadata.loading && <ComponentCover translucent></ComponentCover>
                /* <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={open}
                    onClick={handleClose}
                >
                    <CircularProgress color="inherit" />
                </Backdrop> */

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

                <CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
                    <CustomMUIDialogTitle id="customized-dialog-title" onClose={false}>
                        Setting Up Program
                    </CustomMUIDialogTitle >
                    <DialogContent dividers style={{ padding: '1em 2em' }}>
                        {(progressSteps > 0) &&
                            <div className="progressItem">
                                {progressSteps === 1 && <CircularLoader small />}
                                {progressSteps === 1 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 1 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Checking scores</p>
                            </div>
                        }
                        {(progressSteps > 1) &&
                            <div className="progressItem">
                                {progressSteps === 2 && <CircularLoader small />}
                                {progressSteps === 2 && createMetadata?.data?.status == "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 2 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Reading assesment's questions</p>
                            </div>
                        }
                        {(progressSteps > 2) &&
                            <div className="progressItem">
                                {progressSteps === 3 && <CircularLoader small />}
                                {progressSteps === 3 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 3 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Building new metadata</p>
                            </div>
                        }
                        {(progressSteps > 3) &&
                            <div className="progressItem">
                                {progressSteps === 4 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 4 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 4 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Deleting old metadata</p>
                            </div>
                        }
                        {(progressSteps > 4) &&
                            <div className="progressItem">
                                {progressSteps === 5 && createMetadata?.data?.status !== "ERROR" && <CircularLoader small />}
                                {progressSteps === 5 && createMetadata?.data?.status === "ERROR" && <IconCross24 color={'#d63031'} />}
                                {progressSteps !== 5 && <IconCheckmarkCircle24 color={'#00b894'} />}
                                <p> Importing new metadata</p>
                            </div>
                        }
                        {(progressSteps > 5) &&
                            <div className="progressItem">
                                <IconCheckmarkCircle24 color={'#00b894'} />
                                <p> Done!</p>
                            </div>
                        }
                    </DialogContent>

                    <DialogActions style={{ padding: '1em' }}>
                        <Button variant='outlined' disabled={(saveAndBuild != 'Completed') && (createMetadata?.data?.status !== 'ERROR')} onClick={() => { setSaveAndBuild(false); setProgressSteps(0); }}> Done </Button>
                    </DialogActions>

                </CustomMUIDialog>
            }
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="wrapper" style={{ overflow: 'auto' }}>
                    <div className="layout_prgms_stages">
                        {sections.length === 0 && 
                            <Button startIcon={<AddBoxIcon/>} variant='contained' style={{margin: '8px'}} onClick={SectionActions.append}>
                                Add New Section
                            </Button>
                        }
                        {/* { programStageDataElements &&  <DataElementForm programStageDataElement={programStageDataElements[5]} /> } */}
                        {
                            importResults && (importResults.questions.removed > 0 || importResults.scores.removed > 0) &&
                            <Removed importResults={importResults} index={0} key={"removedSec"} />
                        }
                        {
                            validationResults && (validationResults.questions.length > 0 || validationResults.scores.length > 0 || validationResults.feedbacks.length > 0) &&
                            <Errors validationResults={validationResults} index={0} key={"validationSec"} />
                        }
                        {
                            errorReports && <ErrorReports errors={errorReports} />
                        }
                        {
                            createMetadata.data && createMetadata.data.status == 'ERROR' && <ErrorReports errors={parseErrors(createMetadata.data)} />
                        }
                        <Droppable droppableId="dpb-sections" type="SECTION">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="list-ml_item">
                                    {
                                        sections.map((pss, idx) => {
                                            return <DraggableSection stageSection={pss} stageDataElements={programStageDataElements} DEActions={DEActions} index={idx} key={pss.id || idx} SectionActions={SectionActions} /* handleSectionEdit={handleSectionEdit} */ />
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
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={!!snackParams}
                autoHideDuration={6000}
                onClose={() => setSnackParams(false)}
            >
                <Alert onClose={() => setSnackParams(false)} severity={snackParams.severity} sx={{ width: '100%' }}>
                    {snackParams.content}
                </Alert>
            </Snackbar>
            {
                savingMetadata &&
                <ValidateMetadata
                    newDEQty={importResults ? importResults.questions.new + importResults.scores.new + importResults.sections.new : 0}
                    programStage={programStage}
                    importedSections={sections}
                    importedScores={scoresSection}
                    criticalSection={criticalSection}
                    removedItems={importResults ? importResults.questions.removedItems.concat(importResults.scores.removedItems) : removedElements /*[]*/}

                    // createMetadata={createMetadata}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                    previous={{ sections, setSections, scoresSection, setScoresSection }}
                    setImportResults={setImportResults}
                    importResults={importResults}
                    setIsValid={setIsValid}
                    setValidationResults={setValidationResults}
                    programMetadata={programMetadata}
                    setErrorReports={setErrorReports}
                />
            }
            {showSectionManager &&
                <SectionManager
                    sectionIndex={editSectionIndex}
                    newSectionIndex={newSectionIndex}
                    setShowSectionForm={setShowSectionManager}
                    sections={sections}
                    refreshSections={setSections}
                    notify={pushNotification}
                />
            }
            {deManager &&
                <DataElementManager
                    deRef={deManager}
                    setDeManager={setDeManager}
                    programStageDataElements={programStageDataElements}
                    saveAdd={saveAdd}
                /* sectionIndex={editSectionIndex}
                newSectionIndex={newSectionIndex}
                setShowSectionForm={setShowSectionManager}
                sections={sections}
                refreshSections={setSections} 
                 */
                />
            }
        </div>
    )
}

export default StageSections;