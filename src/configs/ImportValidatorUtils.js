import { FEEDBACK_ORDER, MAX_DATA_ELEMENT_NAME_LENGTH, METADATA, MIN_DATA_ELEMENT_NAME_LENGTH } from "./Constants";
import { hasAttributeValue, isBlank, isNum, isValidParentName } from "./Utils";

export const HNQIS2_VALIDATION_SETTINGS = {
    programDetails: {
        enable: true,
        checkHasFormName: { enable: true, title: "Form name not defined for element", errorMsg: { code: "EXW100", text: "A Form Name was not defined for the specified element." } },
        checkFormNameLength: { enable: true, title: "Form name length not valid", errorMsg: { code: "EXW112", text: `Given Form Name length is out of the accepted range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters).` } },
        //Disabled validation EXW103
        structureMatchesValue: { enable: false, title: "Label should be LONG_TEXT", errorMsg: { code: "EXW103", text: "The expected Value Type for the label Data Element is LONG_TEXT." } },
        hasFeedbackOrder: { enable: true, title: "Missing Feedback Order", errorMsg: { code: "EXW107", text: "The specified question has Numerator and Denominator assigned but does not contribute to any score." } },
        hasVarName: { enable: true, title: "Parent Name not valid", errorMsg: { code: "EXW110", text: "The specified question does not have a valid Parent Name." } },
        hasBothNumeratorDenominator: { enable: true, title: "Numerator or Denominator missing", errorMsg: { code: "EXW106", text: "The specified question lacks one of the scores (Numerator or Denominator)" } },
        validAggregationType: { enable: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW104", text: "The expected Aggregation Operator for the label Data Element is NONE" } },
        validAggregationQuestion: { enable: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW105", text: "The Data Element Aggregation Operator was not defined correctly. (SUM or AVERAGE for Integer and Number types, and NONE for text inputs)" } },
        isNumeratorNumeric: { enable: true, title: "Score is not numeric", errorMsg: { code: "EXW105", text: "The specified question Numerator is not numeric" } },
        isDenominatorNumeric: { enable: true, title: "Score is not numeric", errorMsg: { code: "EXW108", text: "The specified question Denominator is not numeric" } },
        hasParentQuestionNAnswerValue: { enable: true, title: "Incomplete Parent Logic", errorMsg: { code: "EXW109", text: "The specified question lacks one of the components for the Parent Logic." } },
        matchesScore: { enable: true, title: "Score container not found", errorMsg: { code: "EXW110", text: "The specified question has been assigned to a score that is not defined." } }
    },
    scores: {
        enable: true,
        checkHasFormName: { enable: true, title: "Form name not defined for element", errorMsg: { code: "EXW100", text: "A Form Name was not defined for the specified element." } },
        checkFormNameLength: { enable: true, title: "Form name length not valid", errorMsg: { code: "EXW112", text: `Given Form Name length is out of the accepted range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters).` } },
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

export const groupByKey = (data, key) => {
    return data.reduce((acu, cur) => {
        let b = acu.find(elem => elem[key] === cur[key])
        if (!b) acu.push({ feedbackOrder: cur[key], elements: [cur.code] })
        else b.elements.push(cur.code)
        return acu;
    }, []);
};

export const compareFeddbackAandB = (a, b) => {
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

export const getFeedbackData = (sections) => sections.map(section => {
    return section.dataElements.map(de => ({
        id: de.id,
        code: de.code,
        feedbackOrder: de.attributeValues.find(att => att.attribute.id === FEEDBACK_ORDER)?.value
    }))
        .filter(de => de.feedbackOrder)
}).flat().sort((a, b) => {
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

export function verifyProgramDetail(importResults, setValidationMessage) {
    if (importResults) {
        if (importResults.program.id !== null && importResults.program.name !== null) {
            let programDetail = importResults.mapping.programs.filter(prog => prog.name === importResults.program.name);
            if (programDetail.length > 0 && programDetail[0]?.id === importResults.program.id) {
                return true;
            }
        }
        setValidationMessage("Program Name and ID are not valid. Please check the settings in the Instructions Tab.");
        return false;
    }
    return true;
}

const checkDuplicatedFeedbacks = (hnqisMode, scores) => {
    if (hnqisMode) {
        return scores.filter(score =>
            scores.find(match => match.feedbackOrder === score.feedbackOrder && match.code !== score.code)
        )
    }
    return [];
}

export function validateFeedbacks(hnqisMode, sections) {
    let feedbacksErrors = [];
    let feedbacksWarnings = [];

    const feedbackOrderValidationSettings = HNQIS2_VALIDATION_SETTINGS.feedbackOrder;
    if (feedbackOrderValidationSettings.enable) {

        let feedbackData = getFeedbackData(sections)
        let duplicatedFeedbacks = groupByKey(checkDuplicatedFeedbacks(hnqisMode, feedbackData), 'feedbackOrder')

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

export const checkHasFormName = (metaData, dataElement) => {
    if (metaData.elem !== "") {
        if (metaData.elemType === "label") return (!isBlank(dataElement.labelFormName));
        return (!isBlank(dataElement.formName));

    }
    return true;
}

export const checkFormNameLength = (metaData, dataElement) => {
    let formName = dataElement.labelFormName || dataElement.formName;
    if (metaData.elem !== "") {
        return (formName.replace(' [C]', '').length <= (MAX_DATA_ELEMENT_NAME_LENGTH) && formName.replace(' [C]', '').length >= MIN_DATA_ELEMENT_NAME_LENGTH)
    }
    return true;
}

export const structureMatchesValue = (metaData, dataElement, element, valueType) => {
    if (metaData.elemType === element) return (dataElement.valueType === valueType);
    return true;
}

export const isNumeric = (metaData, type) => {
    if (hasAttributeValue(metaData, type))
        return isNum(metaData[type]);
    return true;
}

export const hasFeedbackOrder = (metaData, dataElement) => {
    if (hasAttributeValue(metaData, "scoreNum") && hasAttributeValue(metaData, "scoreDen"))
        return (getFeedbackOrder(dataElement) !== "");
    return true;
}

export const hasScoreFeedbackOrder = (metaData, dataElement) => {
    if (metaData.elemType === "score")
        return (getFeedbackOrder(dataElement) !== "");
    return true;
}

export const hasVarName = (metaData, dataElement) => {
    return hasAttributeValue(metaData, "varName") && isValidParentName(metaData, "varName")
}

export const hasBothNumeratorDenominator = (metaData) => {
    if (hasAttributeValue(metaData, "scoreNum")) return hasAttributeValue(metaData, "scoreDen");
    else if (hasAttributeValue(metaData, "scoreDen")) return false;
    return true;
}

export const hasBothParentQuestionNAnswerValue = (metaData) => {
    if (hasAttributeValue(metaData, "parentQuestion")) return hasAttributeValue(metaData, "parentValue");
    else if (hasAttributeValue(metaData, "parentValue")) return false;
    return true;
}

export const questionMatchesScore = (importedScores, dataElement) => {
    let feedbackOrder = dataElement.attributeValues.find(attributeValue => attributeValue.attribute.id === FEEDBACK_ORDER)?.value;
    if (!feedbackOrder) return true

    feedbackOrder = feedbackOrder.split('.').slice(0, -1).join('.')
    let compositeScores = importedScores.dataElements.map(score => score.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value);
    return compositeScores.includes(feedbackOrder)
}

export const getHNQISMetadata = (dataElement) => {
    let jsonData = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === METADATA);
    return (jsonData.length > 0) ? JSON.parse(jsonData[0].value) : '';
}

export const getFeedbackOrder = (dataElement) => {
    let feedbackOrder = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === FEEDBACK_ORDER);
    return (feedbackOrder.length > 0) ? feedbackOrder[0].value : '';
}

export const validAggregationType = (metaData, dataElement, element, aggregationOperation) => {
    if (metaData.elemType === element) return (dataElement.aggregationType === aggregationOperation);
    return true;
}

export const validAggregationQuestion = (metaData, dataElement) => {
    if (metaData.elemType === "question") {
        if (
            dataElement.valueType === "NUMBER" ||
            dataElement.valueType === "INTEGER"
        )
            return (
                dataElement.aggregationType === "SUM" ||
                dataElement.aggregationType === "AVERAGE"
            );
        else if (dataElement.valueType === "LONG_TEXT")
            return dataElement.aggregationType === "NONE";
        return true;
    }
    return true;
}

export const validateSections = (importedScores, dataElement) => {
    const programDetailsValidationSettings = HNQIS2_VALIDATION_SETTINGS.programDetails;
    if (programDetailsValidationSettings.enable) {
        let errors = [];
        let warnings = [];
        let metaData = getHNQISMetadata(dataElement);
        dataElement.labelFormName = metaData.labelFormName;
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
        if (programDetailsValidationSettings.matchesScore.enable && !questionMatchesScore(importedScores, dataElement)) errors.push(programDetailsValidationSettings.matchesScore.errorMsg);
        if (errors.length > 0) dataElement.errors = errors;
    }
}

export const validateScores = (dataElement) => {
    const scoreValidationSettings = HNQIS2_VALIDATION_SETTINGS.scores;
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