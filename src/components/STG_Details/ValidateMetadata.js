import { CircularLoader, NoticeBox } from "@dhis2/ui";
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import SaveIcon from '@mui/icons-material/Save';
import { METADATA, FEEDBACK_ORDER, MAX_FORM_NAME_LENGTH, MIN_FORM_NAME_LENGTH } from "../../configs/Constants";


import { useEffect, useState } from "react";
import SaveMetadata from "./SaveMetadata";

const ValidateMetadata = (props) => {
    let validationResults = {};
    const [processed, setProcessed] = useState(false);
    const [valid, setValid] = useState(false);
    const [save, setSave] = useState(false);
    const [validationMessage, setValidationMessage] = useState("Validation Pass. Please press 'SAVE' to proceed saving these data elements.");

    const validationSettings = {
        programDetails: {
            enable: true,
            checkHasFormName: { enable: true, title: "Form name not defined for element", errorMsg: { code: "EXW100", text: "A Form Name was not defined for the specified element." } },
            checkFormNameLength: { enable: true, title: "Form name length not valid", errorMsg: { code: "EXW112", text: `Given Form Name length is out of the accepted range (Between ${MIN_FORM_NAME_LENGTH} and ${MAX_FORM_NAME_LENGTH} characters).` } },
            //Disabled validation EXW103
            structureMatchesValue: { enable: false, title: "Label should be LONG_TEXT", errorMsg: { code: "EXW103", text: "The expected Value Type for the label Data Element is LONG_TEXT." } },
            hasFeedbackOrder: { enable: true, title: "Missing Feedback Order", errorMsg: { code: "EXW107", text: "The specified question has Numerator and Denominator assigned but does not contribute to any score." } },
            hasVarName: { enable: true, title: "Parent Name not valid", errorMsg: { code: "EXW110", text: "The specified question does not have a valid Parent Name." } },
            hasBothNumeratorDenominator: { enable: true, title: "Numerator or Denominator missing", errorMsg: { code: "EXW106", text: "The specified question lacks one of the scores (Numerator or Denominator)" } },
            validAggregationType: { enable: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW104", text: "The expected Aggregation Operator for the label Data Element is NONE" } },
            validAggregationQuestion: { enable: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW105", text: "The Data Element Aggregation Operator was not defined correctly. (SUM or AVERAGE for numeric types and NONE for text inputs)" } },
            isNumeratorNumeric: { enable: true, title: "Score is not numeric", errorMsg: { code: "EXW105", text: "The specified question Numerator is not numeric" } },
            isDenominatorNumeric: { enable: true, title: "Score is not numeric", errorMsg: { code: "EXW108", text: "The specified question Denominator is not numeric" } },
            hasParentQuestionNAnswerValue: { enable: true, title: "Incomplete Parent Logic", errorMsg: { code: "EXW109", text: "The specified question lacks one of the components for the Parent Logic." } }
        },
        scores: {
            enable: true,
            checkHasFormName: { enable: true, title: "Form name not defined for element", errorMsg: { code: "EXW100", text: "A Form Name was not defined for the specified element." } },
            checkFormNameLength: { enable: true, title: "Form name length not valid", errorMsg: { code: "EXW112", text: `Given Form Name length is out of the accepted range (Between ${MIN_FORM_NAME_LENGTH} and ${MAX_FORM_NAME_LENGTH} characters).` } },
            //Disabled validation EXW102
            structureMatchesValue: { enable: false, title: "Score should be NUMBER", errorMsg: { code: "EXW102", text: "The expected Value Type for the score Data Element is NUMBER." } },
            hasScoreFeedbackOrder: { enable: true, title: "Missing Feedback Order", errorMsg: { code: "EXW111", text: "The specified score Data Element lacks Feedback Order." } },
            hasBothNumeratorDenominator: { enable: true, title: "Numerator or Denominator missing", errorMsg: { code: "EXW106", text: "The specified question lacks one of the scores (Numerator or Denominator)" } },
            validAggregationType: { enable: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW103", text: "The expected Aggregation Operator for the score Data Element is AVERAGE" } }
        },
        feedbackOrder: {
            enable: true,
            checkGaps: { enable: true, title: "Feedback Order gap found", errorMsg: { code: "EW106", text: "A Feedback Order Gap was found, was expecting one of the following values" } },
            checkDuplicated: { enable: true, title: "Duplicated Feedback Order found", errorMsg: { code: "EW107", text: "The specified Feedback Order is shared by the Data Elements with the following codes" } },
            //Error Equivalents for Data Elements
            duplicatedFO: { enable: true, title: "Duplicated Feedback Order found", errorMsg: { code: "EW107", text: "The specified Data Element contains a duplicated Feedback Order." } },
            gapFO: { enable: true, title: "Feedback Order gap found", errorMsg: { code: "EW106", text: "The specified Data Element generates a gap in the Feedback Order sequence." } }
        }
    }

    const checkDuplicatedFeedbacks = props.hnqisMode?(scores) => scores.filter(score => scores.find(match => match.feedbackOrder === score.feedbackOrder && match.code !== score.code)):[];

    const groupBy = (data, key) => {
        return data.reduce((acu, cur) => {
            let b = acu.find(elem => elem[key] === cur[key])
            if (!b) acu.push({ feedbackOrder: cur[key], elements: [cur.code] })
            else b.elements.push(cur.code)
            return acu;
        }, []);
    };

    const compareFeddbackAandB = (a, b) => {
        //Assumes A < B
        let records = [0];
        let pos = 0;
        while (pos < b.length) {
            let x = a[pos] || 0;
            let y = b[pos];

            let diff = parseInt(y) - parseInt(x);
            records.push(diff);

            pos++;
        }

        records.shift()

        for (let index = 0; index < records.length; index++) {
            if (records[index] > 1 || records[index - 1] == 1) {
                return { records, expectedIndex: index }
            }

        }

        return false
    }

    const getFeedbackData = (sections) =>
        sections.map(section => {
            return section.dataElements.map(de => ({
                id: de.id,
                code: de.code,
                feedbackOrder: de.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value
            }))
                .filter(de => de.feedbackOrder)
        }).flat()
            .sort((a, b) => {
                let aStruct = a.feedbackOrder.split(".");
                let bStruct = b.feedbackOrder.split(".");

                while (true) {
                    let x = aStruct.shift(), y = bStruct.shift();

                    if (!x && !y) break;
                    if (!x && y) return -1;
                    if (x && !y) return 1;

                    if (parseInt(x) > parseInt(y)) return 1;
                    if (parseInt(x) < parseInt(y)) return -1;
                }

                return 0;
            });


    useEffect(() => {
        const importedSections = props.importedSections;
        const importedScore = props.importedScores;
        let errorCounts = 0;

        if ( verifyProgramDetail(props.importResults)) {
            let questions = [];
            let scores = [];

            validationResults.questions = questions;
            validationResults.scores = scores;

            // CHECK FEEDBACK DATA
            if (props.hnqisMode) {
                let { feedbacksErrors, feedbacksWarnings } = validateFeedbacks(importedSections.concat(importedScore))
                errorCounts += feedbacksErrors.length
                validationResults.feedbacks = feedbacksErrors;
            }

            //ADD FEEDBACK ERRORS TO DATA ELEMENTS
            if (props.hnqisMode) importedSections.forEach((section) => {
                delete section.errors
                let section_errors = 0;
                section.dataElements.forEach((dataElement) => {
                    delete dataElement.errors

                    validateSections(dataElement);
                    if (dataElement.errors) questions.push(dataElement);

                    if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                        let deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                        let deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg
                        dataElement.errors = dataElement.errors ? dataElement.errors.push(deErrs) : [deErrs];
                    }

                    if (dataElement.errors) {
                        errorCounts += dataElement.errors.length;
                        section_errors += dataElement.errors.length;
                    }
                });
                if (section_errors > 0) section.errors = section_errors;
            });

            let score_errors = 0;
            delete importedScore.errors
            if (props.hnqisMode) importedScore.dataElements.forEach((dataElement) => {
                delete dataElement.errors
                validateScores(dataElement);
                if (dataElement.errors) scores.push(dataElement);

                if (feedbacksErrors.find(fe => fe.instance.elements.find(e => e === dataElement.code))) {
                    let deFeedBackOrder = dataElement.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value

                    let deErrs = feedbacksErrors.find(fe => fe.instance.feedbackOrder === deFeedBackOrder).elementError.errorMsg
                    dataElement.errors = dataElement.errors ? dataElement.errors.push(deErrs) : [deErrs];
                }

                if (dataElement.errors) {
                    errorCounts += dataElement.errors.length;
                    score_errors += dataElement.errors.length;
                }

            });
            if (score_errors > 0) importedScore.errors = score_errors;

            // SUMMARY - RESULTS
            if (errorCounts === 0) {
                setValid(true);
                props.setValidationResults(false);
            } else {
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

        function verifyProgramDetail(importResults) {
            if (props.importResults) {
                if (props.importResults.program.id !== null && props.importResults.program.name !== null) {
                    let programDetail = props.importResults.mapping.programs.filter(prog => prog.name === props.importResults.program.name);
                    if (programDetail.length > 0 && programDetail[0].id === props.importResults.program.id) {
                        return true;
                    }
                }
                setValidationMessage("Programs Name and Id doesn't exist or is not valid. Please check the details again");
                return false;
            }
            return true;
        }

        function validateSections(dataElement) {
            const programDetailsValidationSettings = validationSettings.programDetails;
            if (programDetailsValidationSettings.enable) {
                let errors = [];
                let warnings = [];
                let metaData = getHNQISMetadata(dataElement);
                if (programDetailsValidationSettings.checkHasFormName.enable && !checkHasFormName(metaData, dataElement)) errors.push(programDetailsValidationSettings.checkHasFormName.errorMsg);
                if (programDetailsValidationSettings.checkFormNameLength.enable && !checkFormNameLength(metaData, dataElement)) errors.push(programDetailsValidationSettings.checkFormNameLength.errorMsg);
                if (programDetailsValidationSettings.structureMatchesValue.enable && !structureMatchesValue(metaData, dataElement, "label", "LONG_TEXT")) errors.push(programDetailsValidationSettings.structureMatchesValue.errorMsg);
                if (programDetailsValidationSettings.hasFeedbackOrder.enable && !hasFeedbackOrder(metaData, dataElement)) errors.push(programDetailsValidationSettings.hasFeedbackOrder.errorMsg);
                if (programDetailsValidationSettings.hasVarName.enable && !hasVarName(metaData, dataElement)) errors.push(programDetailsValidationSettings.hasVarName.errorMsg);
                if (programDetailsValidationSettings.hasBothNumeratorDenominator.enable && !hasBothNumeratorDenominator(metaData)) errors.push(programDetailsValidationSettings.hasBothNumeratorDenominator.errorMsg);
                if (programDetailsValidationSettings.validAggregationType.enable && !validAggregationType(metaData, dataElement, "label", "NONE")) errors.push(programDetailsValidationSettings.validAggregationType.errorMsg);
                if (programDetailsValidationSettings.validAggregationQuestion.enable && !validAggregationQuestion(metaData, dataElement)) errors.push(programDetailsValidationSettings.validAggregationQuestion.errorMsg);
                if (programDetailsValidationSettings.isNumeratorNumeric.enable && !isNumeric(metaData, "scoreNum")) errors.push(programDetailsValidationSettings.isNumeratorNumeric.errorMsg);
                if (programDetailsValidationSettings.isDenominatorNumeric.enable && !isNumeric(metaData, "scoreDen")) errors.push(programDetailsValidationSettings.isDenominatorNumeric.errorMsg);
                if (programDetailsValidationSettings.hasParentQuestionNAnswerValue.enable && !hasBothParentQuestionNAnswerValue(metaData)) errors.push(programDetailsValidationSettings.hasParentQuestionNAnswerValue.errorMsg);
                if (errors.length > 0) dataElement.errors = errors;
            }
        }

        function validateScores(dataElement) {
            const scoreValidationSettings = validationSettings.scores;
            if (scoreValidationSettings.enable) {
                let errors = [];
                let warnings = [];
                let metaData = getHNQISMetadata(dataElement);
                if (scoreValidationSettings.checkHasFormName.enable && !checkHasFormName(metaData, dataElement)) errors.push(scoreValidationSettings.checkHasFormName.errorMsg);
                if (scoreValidationSettings.structureMatchesValue.enable && !structureMatchesValue(metaData, dataElement, "score", "NUMBER")) errors.push(scoreValidationSettings.structureMatchesValue.errorMsg);
                if (scoreValidationSettings.hasScoreFeedbackOrder.enable && !hasScoreFeedbackOrder(metaData, dataElement)) errors.push(scoreValidationSettings.hasScoreFeedbackOrder.errorMsg);
                if (scoreValidationSettings.hasBothNumeratorDenominator.enable && !hasBothNumeratorDenominator(metaData)) errors.push(scoreValidationSettings.hasBothNumeratorDenominator.errorMsg);
                if (scoreValidationSettings.validAggregationType.enable && !validAggregationType(metaData, dataElement, "score", "AVERAGE")) errors.push(scoreValidationSettings.validAggregationType.errorMsg);

                if (errors.length > 0) dataElement.errors = errors;
            }
        }

        function validateFeedbacks(sections) {
            let feedbacksErrors = [];
            let feedbacksWarnings = [];

            const feedbackOrderValidationSettings = validationSettings.feedbackOrder;
            if (feedbackOrderValidationSettings.enable) {

                let feedbackData = getFeedbackData(sections)
                //console.log(feedbackData)
                let duplicatedFeedbacks = groupBy(checkDuplicatedFeedbacks(feedbackData), 'feedbackOrder')
                //console.log(duplicatedFeedbacks)

                if (feedbackOrderValidationSettings.checkDuplicated.enable) {
                    duplicatedFeedbacks.forEach(df => {
                        feedbacksErrors.push({ msg: feedbackOrderValidationSettings.checkDuplicated.errorMsg, instance: df, elementError: feedbackOrderValidationSettings.duplicatedFO });
                    })
                }

                if (feedbackOrderValidationSettings.checkGaps.enable) {
                    let index = 0

                    while (index < feedbackData.length - 1) {
                        let current = {
                            feedbackObject: feedbackData[index],
                            val: feedbackData[index].feedbackOrder,
                            levels: feedbackData[index].feedbackOrder.split('.')
                        }
                        let next = {
                            feedbackObject: feedbackData[index + 1],
                            val: feedbackData[index + 1].feedbackOrder,
                            levels: feedbackData[index + 1].feedbackOrder.split('.')
                        }

                        let result = compareFeddbackAandB(current.levels, next.levels)
                        //console.log(current.val+' vs '+next.val+(!result?'':' <<<<<< Feedback Order Gap Found'))
                        if (result) {
                            let errorIndex = result.expectedIndex
                            let expected = []

                            for (let i = errorIndex + 1; i >= 0; i--) {
                                let guess = current.levels.slice(0, i + 1);
                                guess[i] = (guess[i] ? parseInt(guess[i]) : 0) + 1
                                if (!guess.includes(undefined)) expected.push(guess.join('.'))
                            }

                            let instance = {
                                feedbackOrder: next.feedbackObject.feedbackOrder,
                                elements: [next.feedbackObject.code],
                                expectedValues: expected
                            }

                            feedbacksErrors.push({ msg: feedbackOrderValidationSettings.checkGaps.errorMsg, instance, elementError: feedbackOrderValidationSettings.gapFO });

                        }

                        index++
                    }
                }

            }
            return { feedbacksErrors, feedbacksWarnings }
        }

        function checkHasFormName(metaData, dataElement) {
            if (metaData.elem !== "") {
                if (metaData.elemType === "label") return (!isBlank(dataElement.name));
                return (!isBlank(dataElement.formName)); //displayname ? formName

            }
            return true;
        }

        function checkFormNameLength(metaData, dataElement) {
            if (metaData.elem !== "") {
                return (dataElement.formName.length <= MAX_FORM_NAME_LENGTH && dataElement.formName.length >= MIN_FORM_NAME_LENGTH)
            }
            return true;
        }

        function structureMatchesValue(metaData, dataElement, element, valueType) {
            if (metaData.elemType === element) return (dataElement.valueType === valueType);
            return true;
        }

        function isNumeric(metaData, type) {
            if (hasAttributeValue(metaData, type))
                return isNum(metaData[type]);
            return true;
        }

        function hasFeedbackOrder(metaData, dataElement) {
            if (hasAttributeValue(metaData, "scoreNum") && hasAttributeValue(metaData, "scoreDen"))
                return (getFeedbackOrder(dataElement) !== "");
            return true;
        }

        function hasScoreFeedbackOrder(metaData, dataElement) {
            if (metaData.elemType === "score")
                return (getFeedbackOrder(dataElement) !== "");
            return true;
        }

        function hasVarName(metaData, dataElement) {
            return hasAttributeValue(metaData, "varName") && isValidParentName(metaData, "varName")
        }

        function hasBothNumeratorDenominator(metaData) {
            if (hasAttributeValue(metaData, "scoreNum")) return hasAttributeValue(metaData, "scoreDen");
            else if (hasAttributeValue(metaData, "scoreDen")) return false;
            return true;
        }

        function hasBothParentQuestionNAnswerValue(metaData) {
            if (hasAttributeValue(metaData, "parentQuestion")) return hasAttributeValue(metaData, "parentValue");
            else if (hasAttributeValue(metaData, "parentValue")) return false;
            return true;
        }

        function getHNQISMetadata(dataElement) {
            let jsonData = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === METADATA);
            return (jsonData.length > 0) ? JSON.parse(jsonData[0].value) : '';
        }

        function getFeedbackOrder(dataElement) {
            let feedbackOrder = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === FEEDBACK_ORDER);
            return (feedbackOrder.length > 0) ? feedbackOrder[0].value : '';
        }

        function validAggregationType(metaData, dataElement, element, aggregationOperation) {
            if (metaData.elemType === element) return (dataElement.aggregationType === aggregationOperation);
            return true;
        }

        function validAggregationQuestion(metaData, dataElement) {
            if (metaData.elemType === "question") {
                if (dataElement.valueType === "NUMBER") return (dataElement.aggregationType === "SUM" || dataElement.aggregationType === "AVERAGE");
                else if (dataElement.valueType === "LONG_TEXT") return (dataElement.aggregationType === "NONE");
                return true;
            }
            return true;
        }

        function hasAttributeValue(json, key) {
            if (hasKey(json, key))
                return (json[key] !== "");
            return false;
        }

        function hasKey(json, key) {
            return (typeof json[key] !== 'undefined');
        }

        function isNum(value) {
            return !isNaN(value);
        }

        function isEmpty(str) {
            return (!str || str.length === 0);
        }

        function isBlank(str) {
            return (!str || /^\s*$/.test(str));
        }

        function isValidParentName(json, key) {
            return (/_S\d+Q\d+/.test(json[key]))
        }
    });

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={()=>props.setSavingMetadata(false)}>
            {props.hnqisMode?'Assessment Validation':'Save changes into the server?'}
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>
            {props.hnqisMode &&
                <NoticeBox error = {!valid} title={processed ? "Sections and Scores Validated": "Validating Sections and Scores"}>
                    {!processed && <CircularLoader small/> }
                    {validationMessage}
                </NoticeBox>
            }
            {!props.hnqisMode && 'This action cannot be undone'}
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color="error" disabled={!processed} onClick={()=>props.setSavingMetadata(false)}> Close </Button>
            <Button variant='outlined' startIcon={<SaveIcon />} disabled={!valid} onClick={()=>setSave(true)}> Save </Button>
            {save &&
                <SaveMetadata
                    hnqisMode={props.hnqisMode}
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
                    setErrorReports={props.setErrorReports}
                    refetchProgramStage={props.refetchProgramStage}
                />
            }
        </DialogActions>

    </CustomMUIDialog>)
}

export default ValidateMetadata;