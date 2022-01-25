import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox, CircularLoader, ButtonStrip, Button } from "@dhis2/ui";
import {useEffect, useState} from "react";
import SaveMetadata from "./SaveMetadata";

const   METADATA = "haUflNqP85K",
        CRITICAL_QUESTION = "NPwvdTt0Naj",
        FEEDBACK_ORDER = 'LP171jpctBm';

const ValidateMetadata = (props) => {
    let validationResults = {};
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState("Validation Pass. Please press 'SAVE' to proceed saving these data elements.");

    const validationSettings = {
        programDetails: {
            enable: true,
            checkHasFormName: {enable: true, title: "Form name defined for element", errorMsg: {code: "EXW100", text: "A form name was not defined for the specified element."}},
            //Disabled validation EXW103
            structureMatchesValue: {enable: false, title: "Label should be LONG_TEXT", errorMsg: {code: "EXW103", text: "The expected value type for the label Data Element is LONG_TEXT."}},
            hasFeedbackOrder: {enable: true, title: "Verifies Feedback orders", errorMsg: {code: "EXW107", text: "The specified question has numerator and denominator assigned but does not contribute to any score."}},
            hasVarName: {enable: true, title: "Verifies Parent Name field", errorMsg: {code: "EXW110", text: "The specified question does not have a valid parent name."}},
            hasBothNumeratorDenominator: {enable: true, title: "Numerator and Denominator exists", errorMsg: {code: "EXW106", text: "The specified question lacks one of the scores (numerator or denominator)"}},
            validAggregationType: {enable: true, title: "Valid Aggregation TYpe", errorMsg: {code: "EW104", text: "The expected aggregation operator for the label Data Element is NONE"}},
            validAggregationQuestion: {enable: true, title: "Valid Aggregation Type", errorMsg: {code: "EW105", text: "The Data Element aggregation operator was not defined correctly. (SUM or AVERAGE for numeric types and NONE for text inputs)"}},
            isNumeratorNumeric: {enable: true, title: "Score is Numeric", errorMsg: {code: "EXW105", text: "The specified question numerator is not numeric"}},
            isDenominatorNumeric: {enable: true, title: "Score is Numeric", errorMsg: {code: "EXW108", text: "The specified question numerator is not numeric"}},
            hasParentQuestionNAnswerValue: {enable: true, title: "Complete Parent Logic", errorMsg: {code: "EXW109", text: "The specified question lacks one of the components for the parent logic."}}

        },
        scores: {
            enable: true,
            checkHasFormName: {enable: true, title: "Form name defined for element", errorMsg: {code: "EXW100", text: "A form name was not defined for the specified element."}},
            //Disabled validation EXW102
            structureMatchesValue: {enable: false, title: "Score should be NUMBER", errorMsg: {code: "EXW102", text: "The expected value type for the score Data Element is NUMBER."}},
            hasScoreFeedbackOrder: {enable: true, title: "Verifies Feedback orders for score Data Elements", errorMsg: {code: "EXW111", text: "The specified score Data Element lacks Feedback Order."}},
            hasBothNumeratorDenominator: {enable: true, title: "Numerator and Denominator exists", errorMsg: {code: "EXW106", text: "The specified question lacks one of the scores (numerator or denominator)"}},
            validAggregationType: {enable: true, title: "Valid Aggregation Type", errorMsg: {code: "EW103", text: "The expected aggregation operator for the score Data Element is AVERAGE"}},

        }
    }


    useEffect(()=> {
        const importedSections = props.importedSections;
        const importedScore = props.importedScores;
        let errorCounts = 0;

        if(verifyProgramDetail(props.importResults))
        {
            let questions = [];
            let scores = [];
            importedSections.forEach((section) => {
                let section_errors = 0;
                section.dataElements.forEach((dataElement) => {
                    validateSections(dataElement);
                    if(dataElement.errors)
                    {
                        errorCounts+=dataElement.errors.length;
                        section_errors+=dataElement.errors.length;
                        questions.push(dataElement);
                    }
                });
                if(section_errors > 0) section.errors = section_errors;
            });

            let score_errors = 0;
            importedScore.dataElements.forEach((dataElement) => {
                validateScores(dataElement);
                if (dataElement.errors)
                {
                    errorCounts+=dataElement.errors.length;
                    score_errors += dataElement.errors.length;
                    scores.push(dataElement);
                }
            });
            validationResults.questions = questions;
            validationResults.scores = scores;
            if(score_errors > 0 ) importedScore.errors = score_errors;

            if(errorCounts === 0)
            {
                setValid(true);
                props.setValidationResults(false);
            }
            else
            {
                setValidationMessage("Some Validation Errors occurred. Please check / fix the issues before proceeding.");
                props.setSavingMetadata(false);
                props.setValidationResults(validationResults);
            }
            props.previous.setSections(importedSections);
            props.previous.setScoresSection(importedScore);


        } else {
            setValid(false);
        }
        setProcessed(true);

        function verifyProgramDetail(importResults)
        {
            if (props.importResults)
            {
                if (props.importResults.program.id !== null && props.importResults.program.name !== null)
                {
                    let programDetail = props.importResults.mapping.programs.filter(prog => prog.name === props.importResults.program.name);
                    if (programDetail.length > 0 && programDetail[0].id === props.importResults.program.id)
                    {
                        return true;
                    }
                }
                setValidationMessage("Programs Name and Id doesn't exist or is not valid. Please check the details again");
                return false;
            }
            return true;
        }

        function validateSections(dataElement)
        {
            const programDetailsValidationSettings = validationSettings.programDetails;
            if (programDetailsValidationSettings.enable) {
                let errors = [];
                let warnings = [];
                let metaData = getHNQISMetadata(dataElement);
                if (programDetailsValidationSettings.checkHasFormName.enable && !checkHasFormName(metaData, dataElement)) errors.push(programDetailsValidationSettings.checkHasFormName.errorMsg);
                if (programDetailsValidationSettings.structureMatchesValue.enable && !structureMatchesValue(metaData, dataElement, "label", "LONG_TEXT")) errors.push(programDetailsValidationSettings.structureMatchesValue.errorMsg);
                if (programDetailsValidationSettings.hasFeedbackOrder.enable && !hasFeedbackOrder(metaData, dataElement)) errors.push(programDetailsValidationSettings.hasFeedbackOrder.errorMsg);
                if (programDetailsValidationSettings.hasVarName.enable && !hasVarName(metaData, dataElement)) errors.push(programDetailsValidationSettings.hasVarName.errorMsg);
                if (programDetailsValidationSettings.hasBothNumeratorDenominator.enable && !hasBothNumeratorDenominator(metaData)) errors.push(programDetailsValidationSettings.hasBothNumeratorDenominator.errorMsg);
                if (programDetailsValidationSettings.validAggregationType.enable && !validAggregationType(metaData, dataElement, "label", "NONE")) errors.push(programDetailsValidationSettings.validAggregationType.errorMsg);
                if (programDetailsValidationSettings.validAggregationQuestion.enable && !validAggregationQuestion(metaData, dataElement)) errors.push(programDetailsValidationSettings.validAggregationQuestion.errorMsg);
                if (programDetailsValidationSettings.isNumeratorNumeric.enable && !isNumeric(metaData, "scoreNum")) errors.push(programDetailsValidationSettings.isNumeratorNumeric.errorMsg);
                if (programDetailsValidationSettings.isDenominatorNumeric.enable && !isNumeric(metaData, "scoreDen")) errors.push(programDetailsValidationSettings.isDenominatorNumeric.errorMsg);
                if (programDetailsValidationSettings.hasParentQuestionNAnswerValue.enable && !hasBothParentQuestionNAnswerValue(metaData)) errors.push(programDetailsValidationSettings.hasParentQuestionNAnswerValue.errorMsg);
                if(errors.length > 0) dataElement.errors = errors;
            }
        }

        function validateScores(dataElement)
        {
            const scoreValidationSettings = validationSettings.scores;
            if(scoreValidationSettings.enable)
            {
                let errors = [];
                let warnings = [];
                let metaData = getHNQISMetadata(dataElement);
                if (scoreValidationSettings.checkHasFormName.enable && !checkHasFormName(metaData, dataElement)) errors.push(scoreValidationSettings.checkHasFormName.errorMsg);
                if (scoreValidationSettings.structureMatchesValue.enable && !structureMatchesValue(metaData, dataElement, "score", "NUMBER")) errors.push(scoreValidationSettings.structureMatchesValue.errorMsg);
                if (scoreValidationSettings.hasScoreFeedbackOrder.enable && !hasScoreFeedbackOrder(metaData, dataElement)) errors.push(scoreValidationSettings.hasScoreFeedbackOrder.errorMsg);
                if (scoreValidationSettings.hasBothNumeratorDenominator.enable && !hasBothNumeratorDenominator(metaData)) errors.push(scoreValidationSettings.hasBothNumeratorDenominator.errorMsg);
                if (scoreValidationSettings.validAggregationType.enable && !validAggregationType(metaData, dataElement, "score", "AVERAGE")) errors.push(scoreValidationSettings.validAggregationType.errorMsg);

                if(errors.length > 0) dataElement.errors = errors;
            }
        }

        function checkHasFormName(metaData, dataElement)
        {
            if (metaData.elem !== "")
            {
                if(metaData.elemType === "label") return (!isBlank(dataElement.name));
                return (!isBlank(dataElement.formName)); //displayname ? formName

            }
            return true;
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

        function hasScoreFeedbackOrder(metaData, dataElement)
        {
            if(metaData.elemType === "score")
                return (getFeedbackOrder(dataElement) !== "");
            return true;
        }

        function hasVarName(metaData, dataElement)
        {
            return hasAttributeValue(metaData, "varName") && isValidParentName(metaData,"varName")
        }

        function hasBothNumeratorDenominator(metaData)
        {
            if(hasAttributeValue(metaData, "scoreNum")) return hasAttributeValue(metaData, "scoreDen");
            else if(hasAttributeValue(metaData, "scoreDen")) return false;
            return true;
        }

        function hasBothParentQuestionNAnswerValue(metaData)
        {
            if(hasAttributeValue(metaData, "parentQuestion")) return hasAttributeValue(metaData, "parentValue");
            else if(hasAttributeValue(metaData, "parentValue")) return false;
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

        function validAggregationType(metaData, dataElement, element, aggregationOperation)
        {
            if(metaData.elemType === element) return (dataElement.aggregationType === aggregationOperation);
            return true;
        }

        function validAggregationQuestion(metaData, dataElement)
        {
            if(metaData.elemType === "question")
            {
                if(dataElement.valueType === "NUMBER") return (dataElement.aggregationType === "SUM" || dataElement.aggregationType === "AVERAGE");
                else if (dataElement.valueType === "LONG_TEXT") return (dataElement.aggregationType === "NONE");
                return true;
            }
            return true;
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

        function isEmpty(str)
        {
            return (!str || str.length === 0 );
        }

        function isBlank(str)
        {
            return (!str || /^\s*$/.test(str));
        }

        function isValidParentName(json,key)
        {
            return (/_S\d+Q\d+/.test(json[key]))
        }
    });

    return  <Modal>
                <ModalTitle>Assessment Validation</ModalTitle>
                <ModalContent>
                    <NoticeBox error = {!valid} title={processed ? "Sections and Scores Validated": "Validating Sections and Scores"}>
                        {!processed && <CircularLoader small/> }
                        {validationMessage}
                    </NoticeBox>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip right>
                        <Button disabled={!valid} primary onClick={()=>setSave(true)}>Save</Button>
                        <Button disabled={!processed} default onClick={()=>props.setSavingMetadata(false)}>Close</Button>
                    </ButtonStrip>
                </ModalActions>
                {
                    save &&
                    <SaveMetadata
                        newDEQty={props.newDEQty}
                        programStage={props.programStage}
                        importedSections={props.importedSections}
                        importedScores={props.importedScores}
                        criticalSection={props.criticalSection}
                        setSavingMetadata={props.setSavingMetadata}
                        setSavedAndValidated={props.setSavedAndValidated}
                        removedItems={props.removedItems}
                        programMetadata={props.programMetadata}
                        setImportResults={props.setImportResults}
                    />
                }
            </Modal>
}

export default ValidateMetadata;