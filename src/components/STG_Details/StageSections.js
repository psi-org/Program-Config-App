// DHIS2 UI
import { Button, ButtonStrip, AlertBar, AlertStack, ComponentCover, CenteredContent, CircularLoader, Card, Modal, ModalTitle, ModalContent, ModalActions, LinearLoader, Chip } from "@dhis2/ui";

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

const createMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const deleteMetadataMutation = {
    resource: 'metadata?ca=DELETE',
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

    const [exportStatus, setExportStatus] = useState("Download");
    const [importerEnabled, setImporterEnabled] = useState(false);
    const [importResults, setImportResults] = useState(false);
    const [progressSteps, setProgressSteps] = useState(0);


    // States
    const [sections, setSections] = useState(programStage.programStageSections.filter(s => s.name != "Scores" && s.name != "Critical Steps Calculations"));
    const [scoresSection, setScoresSection] = useState(programStage.programStageSections.find(s => s.name == "Scores"));
    const [criticalSection, setCriticalSection] = useState(programStage.programStageSections.find(s => s.name == "Critical Steps Calculations"));
    const [programStageDataElements, setProgramStageDataElements] = useState(programStage.programStageDataElements);

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
    const uidPool = idsQuery.data?.results.codes;

    // Fetch Program Rules from Program
    const prDQ = useDataQuery(queryPR, { variables: { programId: programStage.program.id } });

    // Fetch Program Rule Variables from Program
    const prvDQ = useDataQuery(queryPRV, { variables: { programId: programStage.program.id } });

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
                setSaveStatus('Save & Validate');
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
                setSaveStatus('Save & Validate');
                break;
            default:
        }
        setSections(newSections);
    };

    const commit = () => {

        setSavingMetadata(true);
        return;

        // Program Stage Data Elements
        var newDataElements = [];

        // Program Stage Sections
        var newSections = JSON.parse(JSON.stringify(sections)).map((section, sectionIdx) => {
            //Set new order for each section
            section.sortOrder = ++sectionIdx;
            section.dataElements = section.dataElements.map((de, deIdx) => {
                //Get new order for DE
                let newDe = programStage.programStageDataElements.find(stageDE => stageDE.dataElement.id == de.id);
                newDe.sortOrder = ++deIdx;
                newDataElements.push(newDe);
                return de;
            });
            return section;
        });

        // Critical Steps Calculation
        criticalSection.sortOrder = newSections.length + 1;
        criticalSection.dataElements.forEach((de, i) => {
            let newDe = programStage.programStageDataElements.find(stageDE => stageDE.dataElement.id == de.id);
            if (newDe) {
                newDe.sortOrder = ++i;
                newDataElements.push(newDe);
            }
        });
        newSections.push(criticalSection);

        // Scores
        scoresSection.sortOrder = newSections.length + 2;
        scoresSection.dataElements.forEach((de, i) => {
            let newDe = programStage.programStageDataElements.find(stageDE => stageDE.dataElement.id == de.id);
            if (newDe) {
                newDe.sortOrder = ++i;
                newDataElements.push(newDe);
            }
        });
        newSections.push(scoresSection);

        const metadata = {
            programStages: [programStage],
            programStageSections: programStage.programStageSections,
            programStageDataElements: programStage.programStageDataElements
        };

        createMetadata.mutate({ data: metadata }).then(response => {
            //console.info(response);
            stageRefetch();
            setSaveStatus(true);
        });
    };

    const configuration_download = () => {
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

        const programRuleVariables = buildProgramRuleVariables(sections, compositeScores, programId);
        const { programRules, programRuleActions } = buildProgramRules(sections, programId, compositeScores, scoresMapping, uidPool); //useCompetencyClass

        const metadata = { programRuleVariables, programRules, programRuleActions };

        // IV. Delete old metadata
        setProgressSteps(4);

        const oldMetadata = {
            programRules: prDQ.data.results.programRules.map(pr => ({ id: pr.id })),
            programRuleVariables: prvDQ.data.results.programRuleVariables.map(prv => ({ id: prv.id }))
        };

        // V. Import new metadata

        deleteMetadata({ data: oldMetadata }).then((res) => {
            setProgressSteps(5);

            createMetadata.mutate({ data: metadata }).then(response => {
                console.log(response);
                setSaveAndBuild('Completed');
                setSavedAndValidated(false);

                prDQ.refetch();
                prvDQ.refetch();
            });
        });

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
                    {
                        /**
                         * 1 . Validate Configuration
                         * When import || d&d -> 2. Save and validate
                         */
                    }
                    <Button disabled={createMetadata.loading} onClick={() => commit()}>{saveStatus}</Button>
                    <Button disabled={!savedAndValidated} primary onClick={() => run()}>Run Magic!</Button>
                    <Button name="generator" icon={exportToExcel ? '' : <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 14a1 1 0 01.993.883L21 15v3a3 3 0 01-2.824 2.995L18 21H6a3 3 0 01-2.995-2.824L3 18v-3a1 1 0 011.993-.117L5 15v3a1 1 0 00.883.993L6 19h12a1 1 0 00.993-.883L19 18v-3a1 1 0 011-1zM12 3a1 1 0 01.993.883L13 4v9.584l2.293-2.291a1 1 0 011.32-.083l.094.083a1 1 0 01.083 1.32l-.083.094-4 4a1 1 0 01-1.32.083l-.094-.083-4-4a1 1 0 011.32-1.497l.094.083L11 13.584V4a1 1 0 011-1z" fill="currentColor"></path></svg>}
                        loading={exportToExcel ? true : false} onClick={() => configuration_download()} disabled={exportToExcel}> {exportStatus}</Button>

                    <Button name="importer" icon={<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 14a1 1 0 01.993.883L21 15v3a3 3 0 01-2.824 2.995L18 21H6a3 3 0 01-2.995-2.824L3 18v-3a1 1 0 011.993-.117L5 15v3a1 1 0 00.883.993L6 19h12a1 1 0 00.993-.883L19 18v-3a1 1 0 011-1zM12 4h.02c.023 0 .046.002.07.004L12 4a1.008 1.008 0 01.625.22l.082.073 4 4a1 1 0 01-1.32 1.497l-.094-.083L13 7.415V16a1 1 0 01-1.993.117L11 16V7.413L8.707 9.707a1 1 0 01-1.32.083l-.094-.083a1 1 0 01-.083-1.32l.083-.094 4-4 .082-.073.008-.007-.09.08A1.008 1.008 0 0111.982 4H12z" fill="currentColor"></path></svg>}
                        onClick={() => configuration_import()}> Import</Button>

                </ButtonStrip>
                </div>
            </div>
            <div className="title">Sections for program stage {programStage.displayName}</div>
            {exportToExcel && <DataProcessor ps={programStage} isLoading={setExportToExcel} />}
            {
                createMetadata.loading &&
                <ComponentCover translucent>
                    <CenteredContent>
                        <CircularLoader large />
                    </CenteredContent>
                </ComponentCover>
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

            {createMetadata.data && (!createMetadata.data.status || createMetadata.data.status == "ERROR") &&
                <AlertStack>
                    <AlertBar critical>
                        {"Process ended with error in the following objects: " + createMetadata.data.typeReports.map(tr => tr.klass.split('.').at(-1)).join(', ') + "."}
                    </AlertBar>
                </AlertStack>
            }
            {saveAndBuild &&
                <Modal>
                    <ModalTitle>SETTING UP PROGRAM</ModalTitle>
                    <ModalContent>
                        {(progressSteps > 0) &&
                            <div className="progressItem">
                                <img src={contracted_bottom_svg} /><p>Checking scores</p>
                            </div>
                        }
                        {(progressSteps > 1) &&
                            <div className="progressItem">
                                <img src={contracted_bottom_svg} /><p>Reading assesment's questions</p>
                            </div>
                        }
                        {(progressSteps > 2) &&
                            <div className="progressItem">
                                <img src={contracted_bottom_svg} /><p>Building new metadata</p>
                            </div>
                        }
                        {(progressSteps > 3) &&
                            <div className="progressItem">
                                <img src={contracted_bottom_svg} /><p>Deleting old metadata</p>
                            </div>
                        }
                        {(progressSteps > 4) &&
                            <div className="progressItem">
                                <img src={contracted_bottom_svg} /><p>Importing new metadata</p>
                            </div>
                        }
                        {
                        /*
                        <div>
                            <span>Deleting old Program Rules</span>
                            <Progress percent={progressPR} status="" theme={(progressPR < 100) ? progressTheme("❌") : progressTheme("✅")} />
                        </div>
                        <div>
                            <span>Deleting old Program Variables</span>
                            <Progress percent={progressPRV} status="" theme={(progressPRV < 100) ? progressTheme("❌") : progressTheme("✅")} />
                        </div>
                        */}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip>
                            <Button disabled={saveAndBuild != 'Completed'} onClick={() => { setSaveAndBuild(false); setProgressSteps(0); }}>Close</Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            }
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="wrapper" style={{ overflow: 'auto' }}>
                    <div className="layout_prgms_stages">
                        {
                            importResults && (importResults.questions.removed > 0 || importResults.scores.removed > 0) &&
                            <Removed importResults={importResults} index={0} key={"removedSec"} />
                        }
                        <Droppable droppableId="dpb-sections" type="SECTION">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="list-ml_item">
                                    {
                                        sections.map((pss, idx) => {
                                            return <DraggableSection stageSection={pss} index={idx} key={pss.id || idx} />
                                        })
                                    }
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <Scores stageSection={scoresSection} index={0} key={scoresSection.id} />
                        <CriticalCalculations stageSection={criticalSection} index={0} key={criticalSection.id} />
                    </div>
                </div>
            </DragDropContext>
            {importerEnabled && <Importer displayForm={setImporterEnabled} previous={{ sections, setSections, scoresSection, setScoresSection }} setSaveStatus={setSaveStatus} setImportResults={setImportResults} />}
            {
                savingMetadata &&
                <SaveMetadata
                    newDEQty={importResults ? importResults.questions.new + importResults.scores.new + importResults.sections.new : 0}
                    programStage={programStage}
                    importedSections={sections}
                    importedScores={scoresSection}
                    criticalSection={criticalSection}
                    // createMetadata={createMetadata}
                    setSavingMetadata={setSavingMetadata}
                    setSavedAndValidated={setSavedAndValidated}
                />
            }

        </div>
    )
}

export default StageSections;