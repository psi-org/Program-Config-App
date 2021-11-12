// DHIS2 UI
import { Button, ButtonStrip, AlertBar, AlertStack, ComponentCover, CenteredContent, CircularLoader, Card, Modal, ModalTitle, ModalContent, ModalActions, LinearLoader } from "@dhis2/ui";

// React Hooks
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableSection from "./Section";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import Scores from "./Scores";
import CriticalCalculations from "./CriticalCalculations";
import {checkScores,readQuestionComposites,buildProgramRuleVariables,buildProgramRules} from "./Scripting";
import contracted_bottom_svg from './../../images/i-contracted-bottom_black.svg';

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

// const pr_delMutation = {
//     resource: 'programRules',
//     id: ({ id }) => id,
//     type: 'delete'
// };

// const prv_delMutation = {
//     resource: 'programRuleVariables',
//     id: ({ id }) => id,
//     type: 'delete'
// };

const queryIds = {
    results: {
        resource: 'system/id.json',
        params: ({n}) => ({
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

const progressTheme = (icon) => ({
    error: {
        symbol: icon,
        trailColor: 'pink',
        color: 'red'
    },
    default: {
        symbol: icon,
        trailColor: 'lightblue',
        color: 'blue'
    },
    active: {
        symbol: icon,
        trailColor: 'lightblue',
        color: 'blue'
    },
    success: {
        symbol: icon,
        trailColor: 'lime',
        color: 'green'
    }
});

const StageSections = ({ programStage, stageRefetch }) => {

    // Globals
    const programId = programStage.program.id;
    const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
        FEEDBACK_TEXT = "yhKEe6BLEer",
        CRITICAL_QUESTION = "NPwvdTt0Naj",
        METADATA = "haUflNqP85K",
        SCORE_DEN = "l7WdLDhE3xW",
        SCORE_NUM = "Zyr7rlDOJy8";

    
    // Flags
    const [hasChanges, setHasChanges] = useState(false);
    const [saveAndBuild, setSaveAndBuild] = useState(false);
    const [progressSteps,setProgressSteps]= useState(0);

    // States
    const [sections, setSections] = useState(programStage.programStageSections.filter(s => s.name !="Scores" && s.name !="Critical Steps Calculations"));
    const [scoresSection, setScoresSection] = useState(programStage.programStageSections.find(s => s.name =="Scores"));
    const [criticalSection, setCriticalSection] = useState(programStage.programStageSections.find(s => s.name =="Critical Steps Calculations"));

    const [programStageDataElements, setProgramStageDataElements] = useState(programStage.programStageDataElements);

    //Progress Bars states
    // const [progressPR, setProgressPR] = useState(0);
    // const [progressPRV, setProgressPRV] = useState(0);

    // Create Mutation
    let metadataDM= useDataMutation(createMutation);
    const createMetadata = {
        mutate : metadataDM[0],
        loading : metadataDM[1].loading,
        error : metadataDM[1].error,
        data : metadataDM[1].data
    };

    //Delete mutations
    const deleteMetadata = useDataMutation(deleteMetadataMutation)[0];
    // const deletePR = useDataMutation(pr_delMutation);
    // const deletePRV = useDataMutation(prv_delMutation);

    // Get Ids
    const idsQuery = useDataQuery(queryIds, { variables: {n: programStage.programStageDataElements.length * 5 }});
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
                setHasChanges(true);
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
                setHasChanges(true);
                break;
            default:
        }
        setSections(newSections);
    };

    const commit = () => {

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
        criticalSection.dataElements.forEach((de,i) => { 
            let newDe = programStage.programStageDataElements.find(stageDE => stageDE.dataElement.id == de.id);
            if(newDe){
                newDe.sortOrder = ++i;
                newDataElements.push(newDe);
            }
        });
        newSections.push(criticalSection);

        // Scores
        scoresSection.sortOrder = newSections.length + 2;
        scoresSection.dataElements.forEach((de,i) => { 
            let newDe = programStage.programStageDataElements.find(stageDE => stageDE.dataElement.id == de.id);
            if(newDe){
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
            setHasChanges(false);
        });
    };

    const deleteOldMetadata = () => {
        
        const oldProgramRules = prDQ.data.results.programRules.map(pr => ({id:pr.id}));
        const oldProgramRuleVariables = prvDQ.data.results.programRuleVariables.map(prv => ({id:prv.id}));

        return;

        // Fetch
        prDQ.refetch().then((prResult) => {
            const programRules = prResult.results.programRules;
            prvDQ.refetch().then((prvResult) => {

                const programRuleVariables = prvResult.results.programRuleVariables;
                
                let stepPR = 100 / programRules.length;
                let stepPRV = 100 / programRuleVariables.length;

                const progressFunction = (origin, step, doDelete, setProgressValue, index, resolve)=>{
                    if(origin.length == 0){
                        setProgressValue(100);
                        return resolve();
                    }

                    doDelete({ id: origin[index].id}).then(()=>{
                        setProgressValue(step*(index+1));
                        if(index < origin.length-1){
                            setTimeout(progressFunction(origin, step, doDelete, setProgressValue, index+1, resolve),0)
                        }else{
                            return resolve();
                        }
                    });
                }

                function progressPromise(origin, step, doDelete, setProgressValue, index = 0){
                    return new Promise((resolve, reject)=>{
                        progressFunction(origin, step, doDelete, setProgressValue, index, resolve)
                    })
                }

                progressPromise(programRules,stepPR,deletePR[0],setProgressPR)
                    .then(() => progressPromise(programRuleVariables,stepPRV,deletePRV[0],setProgressPRV))
                    .then(() => {
                        /**
                         * refetch() Llamar toda la stage
                         */
                        
                    })
                    
            });
        });
        
    };

    const run = () => {
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

        const metadata = {programRuleVariables, programRules, programRuleActions};

        // IV. Delete old metadata
        setProgressSteps(4);
        
        const oldMetadata = {
            programRules : prDQ.data.results.programRules.map(pr => ({id:pr.id})),
            programRuleVariables : prvDQ.data.results.programRuleVariables.map(prv => ({id:prv.id}))
        };

        // V. Import new metadata

        deleteMetadata({ data: oldMetadata }).then((res)=>{
            console.log(res);
            setProgressSteps(5);
            
            createMetadata.mutate({ data: metadata }).then(response => {
                console.log(response);
                setSaveAndBuild('Completed');

                prDQ.refetch();
                prvDQ.refetch();
            });
        });
        
    }

    return (
        <div style={{ padding: "5px" }}>
            <div style={{ margin: "5px 15px" }}>
                <ButtonStrip>
                    <Button disabled={!hasChanges || createMetadata.loading} onClick={() => commit()}>Save Changes</Button>
                    <Button disabled={createMetadata.loading} primary onClick={() => run()}>Run Magic!</Button>

                </ButtonStrip>
            </div>

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
                        { (progressSteps > 0) && 
                            <div className="progressItem">
                                <img src={contracted_bottom_svg}/><p>Checking scores</p>
                            </div>
                        }
                        { (progressSteps > 1) && 
                            <div className="progressItem">
                                <img src={contracted_bottom_svg}/><p>Reading assesment's questions</p>
                            </div>
                        }
                        { (progressSteps > 2) && 
                            <div className="progressItem">
                                <img src={contracted_bottom_svg}/><p>Building new metadata</p>
                            </div>
                        }
                        { (progressSteps > 3) && 
                            <div className="progressItem">
                                <img src={contracted_bottom_svg}/><p>Deleting old metadata</p>
                            </div>
                        }
                        { (progressSteps > 4) && 
                            <div className="progressItem">
                                <img src={contracted_bottom_svg}/><p>Importing new metadata</p>
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
                            <Button disabled={saveAndBuild != 'Completed'} onClick={() =>{ setSaveAndBuild(false); setProgressSteps(0); }}>Close</Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            }
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="wrapper" style={{ overflow: 'auto' }}>
                    <div className="layout_prgms_stages">
                        <Droppable droppableId="dpb-sections" type="SECTION">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="list-ml_item">
                                    {
                                        sections.map((pss, idx) => {
                                            return <DraggableSection stageSection={pss} index={idx} key={pss.id} />
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
        </div>
    )
}

export default StageSections;