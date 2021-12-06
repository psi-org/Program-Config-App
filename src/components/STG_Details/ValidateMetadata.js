import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox, CircularLoader, ButtonStrip, Button } from "@dhis2/ui";
import {useState} from "react";

const   HNQIS2_METADATA = "haUflNqP85K",
        HNQIS2_CRITICAL_QUESTION = "NPwvdTt0Naj",
        HNQIS2_FEEDBACK_ORDER = 'LP171jpctBm';

const TAG = "ValidateMetadata.js";

const ValidateMetadata = (props) => {

    const {completed, setCompleted} = useState(false);
    const {valid, setValid} = useState(false);

    const importedSections = props.importedSections;
    const importedScore = props.importedScores;

    importedSections.forEach((section, sectionId) => {
        section.dataElements.forEach((dataElement, dataElementId) => {
            validateSections(dataElement);
        });
    });

    importedScore.dataElements.forEach((dataElement, dataElementId) => {
         validateScores(dataElement);
    });

    console.log(TAG, importedSections);
    console.log(TAG, importedScore);

    // setCompleted(true);

    function validateSections(dataElement)
    {
        let errors = [];
        let warnings = [];
        let metaData = getHNQISMetadata(dataElement);
        if (!checkHasFormName(metaData, dataElement)) errors.push({"EXW100": "A form name was not defined for the specified element."});
        if (!structureMatchesValue(metaData, dataElement, "label", "LONG_TEXT")) errors.push({"EW103":"The expected aggregation operator for the score Data Element is AVERAGE"});
        if (!hasFeedbackOrder(metaData, dataElement)) errors.push({"EXW105": "The specified question has numerator and denominator assigned but does not contribute to any score."});
        dataElement.errors = errors;
    }

    function validateScores(dataElement)
    {
        let errors = [];
        let warnings = [];
        let metaData = getHNQISMetadata(dataElement);
        if (!structureMatchesValue(metaData, dataElement, "score", "NUMBER")) errors.push({"EXW102": "The expected value type for the score Data Element is NUMBER"});
        dataElement.errors = errors;
    }

    function checkHasFormName(metaData, dataElement)
    {
        return (metaData.elemType !== "" && dataElement.displayName !== "");
    }

    function structureMatchesValue(metaData, dataElement, element, valueType)
    {
        if(metaData.elemType === element) return (dataElement.valueType === valueType);
    }

    function hasFeedbackOrder(metaData, dataElement)
    {
        if(hasAttributeValue(metaData, "scoreNum") && hasAttributeValue(metaData, "scoreDen"))
            if(getFeedbackOrder(dataElement) !== "")
                return true;
        return false;
    }

    function getHNQISMetadata(dataElement)
    {
        let jsonData = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === HNQIS2_METADATA);
        return (jsonData.length > 0) ? JSON.parse(jsonData[0].value) : '';
    }

    function getHNQISCriticalValue(dataElement)
    {
        let criticalData = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === HNQIS2_CRITICAL_QUESTION);
        return (criticalData.length > 0) ? criticalData[0].value : '';
    }

    function getFeedbackOrder(dataElement)
    {
        let feedbackOrder = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === HNQIS2_FEEDBACK_ORDER);
        return (feedbackOrder.length > 0) ? feedbackOrder[0].value : '';
    }

    function hasAttributeValue(json, key)
    {
        if(hasKey(json, key))
            if(json[key] !== "")
                return true;
        return false;
    }

    function hasKey(json, key)
    {
        return (typeof json[key] !== 'undefined');
    }

    return <Modal>
        <ModalTitle>Assessment Validation</ModalTitle>
        <ModalContent>
            <NoticeBox title="Validating Sections and Scores">
                {!completed && <CircularLoader small/> }
            </NoticeBox>
        </ModalContent>
        <ModalActions>
            <ButtonStrip right>
                <Button disabled={valid} success onClick={()=>props.setSaveMetadata(true)}>Save</Button>
                <Button disabled={completed} defaulton onClick={()=>props.setSavingMetadata(false)}>Close</Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
}

export default ValidateMetadata;