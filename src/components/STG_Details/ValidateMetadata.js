import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox, CircularLoader, ButtonStrip, Button } from "@dhis2/ui";
import {useEffect, useState} from "react";

const   METADATA = "haUflNqP85K",
        CRITICAL_QUESTION = "NPwvdTt0Naj",
        FEEDBACK_ORDER = 'LP171jpctBm';

const ValidateMetadata = (props) => {

    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);

    useEffect(()=> {
        const importedSections = props.importedSections;
        const importedScore = props.importedScores;
        let errorCounts = 0;

        importedSections.forEach((section) => {
            section.dataElements.forEach((dataElement) => {
                validateSections(dataElement);
                errorCounts+=dataElement.errors.length;
            });
        });

        importedScore.dataElements.forEach((dataElement) => {
             validateScores(dataElement);
            errorCounts+=dataElement.errors.length;
        });

        console.log("errors count: ", errorCounts);
        if(errorCounts === 0) setValid(true);

        setProcessed(true);
        console.log("Imported Score: ", importedScore);

        props.previous.setSections(importedSections);
        props.previous.setScoresSection(importedScore);

        function validateSections(dataElement)
        {
            let errors = [];
            let warnings = [];
            let metaData = getHNQISMetadata(dataElement);
            if (!checkHasFormName(metaData, dataElement)) errors.push({"EXW100": "A form name was not defined for the specified element."});
            if (!structureMatchesValue(metaData, dataElement, "label", "LONG_TEXT")) errors.push({"EXW103":"The expected value type for the label Data Element is LONG_TEXT"});
            if (!hasFeedbackOrder(metaData, dataElement)) errors.push({"EXW107": "The specified question has numerator and denominator assigned but does not contribute to any score."});
            if (!hasBothNumeratorDenominator(metaData)) errors.push({"EXW106": "The specified question lacks one of the scores (numerator or denominator)"});
            if (!isNumeric(metaData, "scoreNum")) errors.push({"EXW105": "The specified question numerator is not numeric"});
            if (!isNumeric(metaData, "scoreDen")) errors.push({"EXW108": "The specified question denominator is not numeric"});
            dataElement.errors = errors;
        }

        function validateScores(dataElement)
        {
            let errors = [];
            let warnings = [];
            let metaData = getHNQISMetadata(dataElement);
            if (!structureMatchesValue(metaData, dataElement, "score", "NUMBER")) errors.push({"EXW102": "The expected value type for the score Data Element is NUMBER"});
            if (!hasBothNumeratorDenominator(metaData)) errors.push({"EXW106": "The specified question lacks one of the scores (numerator or denominator)"});
            dataElement.errors = errors;
        }

        function checkHasFormName(metaData, dataElement)
        {
            return (metaData.elemType !== "" && dataElement.displayName !== "");
        }

        function structureMatchesValue(metaData, dataElement, element, valueType)
        {
            if(metaData.elemType === element) return (dataElement.valueType === valueType);
            return true;
        }

        function isNumeric(metaData, type)
        {
            if(hasAttributeValue(metaData, type))
                return isNum(metaData[type]);
            return true;
        }

        function hasFeedbackOrder(metaData, dataElement)
        {
            if(hasAttributeValue(metaData, "scoreNum") && hasAttributeValue(metaData, "scoreDen"))
                return (getFeedbackOrder(dataElement) !== "");
            return true;
        }

        function hasBothNumeratorDenominator(metaData)
        {
            if(hasAttributeValue(metaData, "scoreNum")) return hasAttributeValue(metaData, "scoreDen");
            else if(hasAttributeValue(metaData, "scoreDen")) return false;
            return true;
        }

        function getHNQISMetadata(dataElement)
        {
            let jsonData = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === METADATA);
            return (jsonData.length > 0) ? JSON.parse(jsonData[0].value) : '';
        }

        function getHNQISCriticalValue(dataElement)
        {
            let criticalData = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === CRITICAL_QUESTION);
            return (criticalData.length > 0) ? criticalData[0].value : '';
        }

        function getFeedbackOrder(dataElement)
        {
            let feedbackOrder = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === FEEDBACK_ORDER);
            return (feedbackOrder.length > 0) ? feedbackOrder[0].value : '';
        }

        function hasAttributeValue(json, key)
        {
            if(hasKey(json, key))
                return (json[key] !== "");
            return false;
        }

        function hasKey(json, key)
        {
            return (typeof json[key] !== 'undefined');
        }

        function isNum(value)
        {
            return !isNaN(value);
        }
    });

    return <Modal>
        <ModalTitle>Assessment Validation</ModalTitle>
        <ModalContent>
            <NoticeBox title={processed ? "Sections and Scores Validated": "Validating Sections and Scores"}>
                {!processed && <CircularLoader small/> }
            </NoticeBox>
        </ModalContent>
        <ModalActions>
            <ButtonStrip right>
                <Button disabled={!valid} primary onClick={()=>props.setSaveMetadata(true)}>Save</Button>
                <Button disabled={!processed} default onClick={()=>props.setSavingMetadata(false)}>Close</Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
}

export default ValidateMetadata;