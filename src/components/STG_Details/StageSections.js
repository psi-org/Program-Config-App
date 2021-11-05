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
import Configuration from "./Configuration";

const createMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const pr_delMutation = {
    resource: 'programRules',
    id: ({ id }) => id,
    type: 'delete'
};

const prv_delMutation = {
    resource: 'programRuleVariables',
    id: ({ id }) => id,
    type: 'delete'
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
    
    // Flags
    const [hasChanges, setHasChanges] = useState(false);
    const [saveAndBuild, setSaveAndBuild] = useState(false);
    const [exportToExcel, setExportToExcel] = useState(false);
    const [ exportStatus, setExportStatus] = useState("Download");

    // States
    const [sections, setSections] = useState(programStage.programStageSections.filter(s => s.name !="Scores" && s.name !="Critical Steps Calculations"));
    const [scoresSection, setScoresSection] = useState(programStage.programStageSections.find(s => s.name =="Scores"));
    console.log(scoresSection);
    const [criticalSection, setCriticalSection] = useState(programStage.programStageSections.find(s => s.name =="Critical Steps Calculations"));

    //Progress Bars states
    const [progressPR, setProgressPR] = useState(0);
    const [progressPRV, setProgressPRV] = useState(0);

    // Create Mutation
    let metadataDM= useDataMutation(createMutation);
    const createMetadata = {
        mutate : metadataDM[0],
        loading : metadataDM[1].loading,
        error : metadataDM[1].error,
        data : metadataDM[1].data
    };

    //Delete mutations
    const deletePR = useDataMutation(pr_delMutation);
    const deletePRV = useDataMutation(prv_delMutation);

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

        var newDataElements = [];
        const newSections = JSON.parse(JSON.stringify(sections)).map((section, idx) => {
            //Set new order
            section.sortOrder = ++idx;

            section.dataElements = section.dataElements.map((de, idx) => {
                //Get new order for DE
                let newDe = programStage.programStageDataElements.find(stageDE => stageDE.dataElement.id == de.id);
                newDe.sortOrder = ++idx;
                newDataElements.push(newDe);
                return de;
            });

            return section;
        });

        programStage.programStageDataElements = newDataElements;
        programStage.programStageSections = newSections;

        const metadata = {
            programStages: [programStage],
            programStageSections: newSections,
            programStageDataElements: newDataElements
        };

        createMetadata.mutate({ data: metadata }).then((res) => {
            setHasChanges(false);
            stageRefetch().then(response => setSections(response.results.programStageSections))
        });

    };

    const run = () => {
        // Set flag to enable/disable actions (buttons)
        setSaveAndBuild('Run');

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
                        // Construir JSON para importar :v
                        /**
                         * refetch() Llamar toda la stage
                         */
                        setSaveAndBuild('Completed');
                    })
                    
            });
        });
        
    };

    const configuration_download = () => {
        console.log("Program Stages: ", programStage);
        setExportToExcel(true);
        setExportStatus("Generating Configuration File...")
    };

    const configuration_import = () => {

    };

    return (
        <div style={{ padding: "5px" }}>
            <div style={{ margin: "5px 15px" }}>
                <ButtonStrip>
                    <Button disabled={!hasChanges || createMetadata.loading} onClick={() => commit()}>Save Changes test</Button>
                    <Button disabled={createMetadata.loading} primary onClick={() => run()}>Run Magic!</Button>
                    <Button name="generator" icon={exportToExcel ? '' : <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 14a1 1 0 01.993.883L21 15v3a3 3 0 01-2.824 2.995L18 21H6a3 3 0 01-2.995-2.824L3 18v-3a1 1 0 011.993-.117L5 15v3a1 1 0 00.883.993L6 19h12a1 1 0 00.993-.883L19 18v-3a1 1 0 011-1zM12 3a1 1 0 01.993.883L13 4v9.584l2.293-2.291a1 1 0 011.32-.083l.094.083a1 1 0 01.083 1.32l-.083.094-4 4a1 1 0 01-1.32.083l-.094-.083-4-4a1 1 0 011.32-1.497l.094.083L11 13.584V4a1 1 0 011-1z" fill="currentColor"></path></svg>}
                       loading={exportToExcel ? true : false} onClick={() => configuration_download()} disabled={exportToExcel}> {exportStatus}</Button>

                    <Button name="importer" icon={<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20 14a1 1 0 01.993.883L21 15v3a3 3 0 01-2.824 2.995L18 21H6a3 3 0 01-2.995-2.824L3 18v-3a1 1 0 011.993-.117L5 15v3a1 1 0 00.883.993L6 19h12a1 1 0 00.993-.883L19 18v-3a1 1 0 011-1zM12 4h.02c.023 0 .046.002.07.004L12 4a1.008 1.008 0 01.625.22l.082.073 4 4a1 1 0 01-1.32 1.497l-.094-.083L13 7.415V16a1 1 0 01-1.993.117L11 16V7.413L8.707 9.707a1 1 0 01-1.32.083l-.094-.083a1 1 0 01-.083-1.32l.083-.094 4-4 .082-.073.008-.007-.09.08A1.008 1.008 0 0111.982 4H12z" fill="currentColor"></path></svg>}
                        onClick={() => configuration_import()}> Import</Button>

                </ButtonStrip>
            </div>
            {exportToExcel && <Configuration ps={programStage} isLoading={setExportToExcel} status={setExportStatus}/>}
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
                    <ModalTitle>Saving &amp; Compiling</ModalTitle>
                    <ModalContent>
                        <div>
                            <span>Deleting old Program Rules</span>
                            <Progress percent={progressPR} status="" theme={(progressPR < 100) ? progressTheme("❌") : progressTheme("✅")} />
                        </div>
                        <div>
                            <span>Deleting old Program Variables</span>
                            <Progress percent={progressPRV} status="" theme={(progressPRV < 100) ? progressTheme("❌") : progressTheme("✅")} />
                        </div>

                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip>
                            <Button disabled={saveAndBuild != 'Completed'} onClick={() => setSaveAndBuild(false)}>Close</Button>
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