import { Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Button, LinearLoader, CircularLoader, Card, Box, NoticeBox, Tag } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from "@dhis2/app-service-data";
import { useState } from "react";

const queryId = {
    results: {
        resource: 'system/id.json',
        params: ({n}) => ({ limit: n })
    }
};

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const FEEDBACK_ORDER = "LP171jpctBm", //COMPOSITE_SCORE
    FEEDBACK_TEXT = "yhKEe6BLEer",
    CRITICAL_QUESTION = "NPwvdTt0Naj",
    METADATA = "haUflNqP85K",
    SCORE_DEN = "l7WdLDhE3xW",
    SCORE_NUM = "Zyr7rlDOJy8";

const SaveMetadata = ({newDEQty,programStage,importedSections,importedScores,criticalSection,setSavingMetadata,setSavedAndValidated}) => {

    const [completed, setCompleted] = useState(false);
    const [errorStatus,setErrorStatus] = useState(false);
    const [successStatus,setSuccessStatus] = useState(false);
    const [typeReports,setTypeReports] = useState([]);

    // Create Mutation
    let metadataDM= useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate : metadataDM[0],
        loading : metadataDM[1].loading,
        error : metadataDM[1].error,
        data : metadataDM[1].data,
        called: metadataDM[1].called
    };
    
    // Get Ids for new Data Elements
    const idsQuery = useDataQuery(queryId, { variables: {n: newDEQty }});
    const uidPool = idsQuery.data?.results.codes;

    if(uidPool && !completed && !metadataRequest.called){
        let new_dataElements = [];
        let new_programStageDataElements = [];
    
        /**
         * Delete importStatus: section & Data Elements
         * Prepare new data elements (payloads)
         * Get program stage data elements for each question
         */
        importedSections.forEach((section,secIdx) =>{

            if(section.importStatus == 'new') section.id = uidPool.shift();

            section.dataElements.forEach((dataElement,deIdx) => {
                let DE_metadata = JSON.parse(dataElement.attributeValues.find(att => att.attribute.id == METADATA)?.value || "{}");
                
                // Check if new DE
                if(dataElement.importStatus=='new'){
                    dataElement.id = uidPool.shift();
                    new_dataElements.push(dataElement);
                }
                delete dataElement.importStatus;
                new_programStageDataElements.push({
                    compulsory: (DE_metadata.compulsory=='Yes' && !DE_metadata.parentQuestion), // True: mandatory is Yes and has no parents.
                    //programStage: { id : programStage.id},
                    sortOrder: deIdx+1,
                    dataElement: { id: dataElement.id }
                });
                //return dataElement;
            });
    
            delete section.importStatus;
            section.sortOrder = secIdx+1;
            //return section
        });

        /**
         * Edit imported scores
         * Prepare new scores data elements payload
         */
        importedScores.dataElements.forEach((score,scoreIdx) =>{

            // Check if new DE
            if(score.importStatus=='new'){
                score.id = uidPool.shift();
                new_dataElements.push(score);
            }

            delete score.importStatus;
            new_programStageDataElements.push({
                //name:score.name,
                compulsory: false,
                //programStage: programStage.id,
                sortOrder: scoreIdx+1,
                dataElement: { id: score.id }
            });
        });

        // let new_scoresSection = {
        //     name:'Scores',
        //     sortOrder: importedScores.length+1,
        //     dataElements: importedScores
        // };
        

        /**
         * Set new critical scores section : order
         */

        criticalSection.sortOrder = importedSections.length + 2;

        /**
         * Replace sections and Data Elements on program stage
         */

        programStage.programStageSections = [].concat(importedSections,importedScores,criticalSection);
        programStage.programStageDataElements = new_programStageDataElements;

        let metadata = {
            dataElements: new_dataElements,
            programStages: [programStage],
            programStageSections: programStage.programStageSections,
            programStageDataElements: programStage.programStageDataElements
        };

        console.log(metadata);

        metadataRequest.mutate({ data: metadata }).then(response => {
                console.info(response);
                if(response.status!='OK'){
                    setErrorStatus(true);
                    setTypeReports(response.typeReports);
                    setCompleted(true);
                    return;
                }
                
                setCompleted(true);
                setSuccessStatus(true);
                setSavedAndValidated(true);
        });
        
    }

    return <Modal>
        <ModalTitle>Save assesment</ModalTitle>
        <ModalContent>
            <NoticeBox title="Saving content" error={errorStatus}>
                {!completed && <CircularLoader small />}
                {
                    successStatus && 
                    (
                    <div>
                        <p><strong>Process completed! "Run Magic" button is now enabled</strong></p>
                        {typeReports.length>0 && typeReports.map(tr => {
                            <div> {tr.klass} | <Tag>{"Created: "+tr.stats.created}</Tag>
                            <Tag>{"Deleted :" + tr.stats.deleted}</Tag>
                            <Tag>{"Ignored :" + tr.stats.ignored}</Tag>
                            <Tag>{"Updated :" + tr.stats.updated}</Tag>
                            <Tag>{"Total :" + tr.stats.total}</Tag></div>
                        })}
                    </div>
                    )
                }
                {
                    errorStatus && 
                    <div>
                        <p><strong>Process ended with errors</strong></p>
                    </div>
                }
            </NoticeBox>
        </ModalContent>
        <ModalActions>
            <ButtonStrip middle>
                {/*<Button disabled={!completed} primary onClick={()=>window.location.reload(false)}>Reload</Button>*/}
                <Button disabled={!completed} onClick={()=>setSavingMetadata(false)}>Close</Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>

};


export default SaveMetadata;