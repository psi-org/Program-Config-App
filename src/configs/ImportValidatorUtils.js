import { FEEDBACK_ORDER, MAX_DATA_ELEMENT_NAME_LENGTH, METADATA, MIN_DATA_ELEMENT_NAME_LENGTH } from "./Constants";
import { extractAttributeValues, getPCAMetadataDE, hasAttributeValue, isBlank, isNum, isValidParentName } from "./Utils";

export const HNQIS2_VALIDATION_SETTINGS = {
    sections: {
        enabled: true,
        checkHasName: { enabled: true, title: "Section Form Name is not defined", errorMsg: { code: "EXW113", text: "A Form Name was not defined for the specified Section." } }
    },
    programDetails: {
        enabled: true,
        checkHasFormName: { enabled: true, title: "Element Form Name is not defined", errorMsg: { code: "EXW100", text: "A Form Name was not defined for the specified element." } },
        checkFormNameLength: { enabled: true, title: "Form name length not valid", errorMsg: { code: "EXW112", text: `Given Form Name length is out of the accepted range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters).` } },
        //Disabled validation EXW103
        structureMatchesValue: { enabled: false, title: "Label should be LONG_TEXT", errorMsg: { code: "EXW103", text: "The expected Value Type for the label Data Element is LONG_TEXT." } },
        hasFeedbackOrder: { enabled: true, title: "Missing Feedback Order", errorMsg: { code: "EXW107", text: "The specified question has Numerator and Denominator assigned but does not contribute to any score." } },
        hasVarName: { enabled: true, title: "Parent Name not valid", errorMsg: { code: "EXW110", text: "The specified question does not have a valid Parent Name." } },
        hasBothNumeratorDenominator: { enabled: true, title: "Numerator or Denominator missing", errorMsg: { code: "EXW106", text: "The specified question lacks one of the scores (Numerator or Denominator)" } },
        validAggregationType: { enabled: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW104", text: "The expected Aggregation Operator for the label Data Element is NONE" } },
        validAggregationQuestion: { enabled: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW105", text: "The Data Element Aggregation Operator was not defined correctly. (SUM or AVERAGE for Integer and Number types, and NONE for text inputs)" } },
        isNumeratorNumeric: { enabled: true, title: "Score is not numeric", errorMsg: { code: "EXW105", text: "The specified question Numerator is not numeric" } },
        isDenominatorNumeric: { enabled: true, title: "Score is not numeric", errorMsg: { code: "EXW108", text: "The specified question Denominator is not numeric" } },
        hasParentQuestionNAnswerValue: { enabled: true, title: "Incomplete Parent Logic", errorMsg: { code: "EXW109", text: "The specified question lacks one of the components for the Parent Logic." } },
        matchesScore: { enabled: true, title: "Score container not found", errorMsg: { code: "EXW110", text: "The specified question has been assigned to a score that is not defined." } }
    },
    scores: {
        enabled: true,
        checkHasFormName: { enabled: true, title: "Element Form Name is not defined", errorMsg: { code: "EXW100", text: "A Form Name was not defined for the specified element." } },
        checkFormNameLength: { enabled: true, title: "Form name length not valid", errorMsg: { code: "EXW112", text: `Given Form Name length is out of the accepted range (Between ${MIN_DATA_ELEMENT_NAME_LENGTH} and ${MAX_DATA_ELEMENT_NAME_LENGTH} characters).` } },
        //Disabled validation EXW102
        structureMatchesValue: { enabled: false, title: "Score should be NUMBER", errorMsg: { code: "EXW102", text: "The expected Value Type for the score Data Element is NUMBER." } },
        hasScoreFeedbackOrder: { enabled: true, title: "Missing Feedback Order", errorMsg: { code: "EXW111", text: "The specified score Data Element lacks Feedback Order." } },
        hasBothNumeratorDenominator: { enabled: true, title: "Numerator or Denominator missing", errorMsg: { code: "EXW106", text: "The specified question lacks one of the scores (Numerator or Denominator)" } },
        validAggregationType: { enabled: true, title: "Aggregation Type Not Valid", errorMsg: { code: "EW103", text: "The expected Aggregation Operator for the score Data Element is AVERAGE" } }
    },
    feedbackOrder: {
        enabled: true,
        checkGaps: { enabled: true, title: "Feedback Order gap found", errorMsg: { code: "EW106", text: "A Feedback Order Gap was found, was expecting one of the following values" } },
        checkDuplicated: { enabled: true, title: "Duplicated Feedback Order found", errorMsg: { code: "EW107", text: "The specified Feedback Order is shared by the Data Elements with the following codes" } },
        //Error Equivalents for Data Elements
        duplicatedFO: {
            enabled: true, title: "Duplicated Feedback Order found", errorMsg: { message: { code: "EW107", text: "The specified Data Element contains a duplicated Feedback Order." } }
        },
        gapFO: {
            enabled: true, title: "Feedback Order gap found", errorMsg: { message: { code: "EW106", text: "The specified Data Element generates a gap in the Feedback Order sequence." } }
        }
    }
}

export const TRACKER_VALIDATION_SETTINGS = {
    sections: {
        enabled: true,
        checkHasName: { enabled: true, title: "Section Name is not defined", errorMsg: { code: "EXWT100", text: "A Name was not defined for the specified section." } }
    },
    dataElements: {
        enabled: true,
        checkHasFormName: { enabled: true, title: "Element Name is not defined", errorMsg: { code: "EXWT101", text: "A Name was not defined for the specified element." } },
    },
    teas: {
        enabled: true,
        checkHasName: { enabled: true, title: "Element Name is not defined", errorMsg: { code: "EXWT101", text: "A Name was not defined for the specified element." } },
        checkDuplicated: { enabled: true, title: "Duplicated TEA", errorMsg: { code: "EXWT102", text: "The specified Tracked Entity Attribute is duplicated." } },
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

const buildFeedbackErrorObject = (message, instance, elementError) => {
    let errorObject = {
        message,
        instance,
        elementError,
        displayBadges: false
    };
    errorObject.title = errorObject.message.text + ': ' + (!errorObject.instance.expectedValues ? errorObject.instance.elements.join(', ') : errorObject.instance.expectedValues.join(' or ')) + '.'
    errorObject.tagName = `[ Feedback Order ${errorObject.instance.feedbackOrder} ]`
    return errorObject
}

export function validateFeedbacks(hnqisMode, sections) {
    let feedbacksErrors = [];
    let feedbacksWarnings = [];

    const feedbackOrderValidationSettings = HNQIS2_VALIDATION_SETTINGS.feedbackOrder;
    if (feedbackOrderValidationSettings.enabled) {

        let feedbackData = getFeedbackData(sections)
        let duplicatedFeedbacks = groupByKey(checkDuplicatedFeedbacks(hnqisMode, feedbackData), 'feedbackOrder')
        if (feedbackOrderValidationSettings.checkDuplicated.enabled) {
            duplicatedFeedbacks.forEach(df => {
                feedbacksErrors.push(buildFeedbackErrorObject(feedbackOrderValidationSettings.checkDuplicated.errorMsg, df, feedbackOrderValidationSettings.duplicatedFO));
            })
        }

        if (feedbackOrderValidationSettings.checkGaps.enabled) {
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
                    };
                    feedbacksErrors.push(buildFeedbackErrorObject(feedbackOrderValidationSettings.checkGaps.errorMsg, instance, feedbackOrderValidationSettings.gapFO));

                }

                index++
            }
        }

    }
    return { feedbacksErrors, feedbacksWarnings }
}

export const checkHasFormName = ({ metadata, dataElement }) => {
    if (metadata.elem !== "") {
        if (metadata.elemType === "label") return (!isBlank(dataElement.labelFormName));
        return (!isBlank(dataElement.formName));

    }
    return true;
}

export const checkSectionHasFormName = ({ section }) => !isBlank(section.name);


export const checkFormNameLength = ({ metadata, dataElement }) => {
    let formName = dataElement.labelFormName || dataElement.formName;
    if (metadata.elem !== "") {
        return (formName.replace(' [C]', '').length <= (MAX_DATA_ELEMENT_NAME_LENGTH) && formName.replace(' [C]', '').length >= MIN_DATA_ELEMENT_NAME_LENGTH)
    }
    return true;
}

export const structureMatchesValue = ({ metadata, dataElement, element, valueType }) => {
    if (metadata.elemType === element) return (dataElement.valueType === valueType);
    return true;
}

export const isNumeric = ({ metadata, property }) => {
    if (hasAttributeValue(metadata, property))
        return isNum(metadata[property]);
    return true;
}

export const hasFeedbackOrder = ({ metadata, dataElement }) => {
    if (hasAttributeValue(metadata, "scoreNum") && hasAttributeValue(metadata, "scoreDen"))
        return (getFeedbackOrder(dataElement) !== "");
    return true;
}

export const hasScoreFeedbackOrder = ({ metadata, dataElement }) => {
    if (metadata.elemType === "score")
        return (getFeedbackOrder(dataElement) !== "");
    return true;
}

export const hasVarName = ({ metadata }) => {
    return hasAttributeValue(metadata, "varName") && isValidParentName(metadata, "varName")
}

export const hasBothNumeratorDenominator = ({ metadata }) => {
    if (hasAttributeValue(metadata, "scoreNum")) return hasAttributeValue(metadata, "scoreDen");
    else if (hasAttributeValue(metadata, "scoreDen")) return false;
    return true;
}

export const hasBothParentQuestionNAnswerValue = ({ metadata }) => {
    if (hasAttributeValue(metadata, "parentQuestion")) return hasAttributeValue(metadata, "parentValue");
    else if (hasAttributeValue(metadata, "parentValue")) return false;
    return true;
}

export const questionMatchesScore = ({ importedScores, dataElement }) => {
    let feedbackOrder = dataElement.attributeValues.find(attributeValue => attributeValue.attribute.id === FEEDBACK_ORDER)?.value;
    if (!feedbackOrder) return true

    feedbackOrder = feedbackOrder.split('.').slice(0, -1).join('.')
    let compositeScores = importedScores.dataElements.map(score => score.attributeValues.find(att => att.attribute.id == FEEDBACK_ORDER)?.value);
    return compositeScores.includes(feedbackOrder)
}

export const getFeedbackOrder = (dataElement) => {
    let feedbackOrder = dataElement.attributeValues.filter(attributeValue => attributeValue.attribute.id === FEEDBACK_ORDER);
    return (feedbackOrder.length > 0) ? feedbackOrder[0].value : '';
}

export const validAggregationType = ({ metadata, dataElement, element, aggregationOperation }) => {
    if (metadata.elemType === element) return (dataElement.aggregationType === aggregationOperation);
    return true;
}

export const validAggregationQuestion = ({ metadata, dataElement }) => {
    if (metadata.elemType === "question") {
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

export const checkHasProperty = ({ object, property }) => {
    return (object[property] && !isBlank(object[property]));
}

export const checkDuplicatedTEA = ({ tea, teaList }) => {
    return tea !== 'Not Found' && teaList.filter(element => element === tea).length > 1;
}

const validate = (validation, validationFunction, params, errorsArray, negateResult = true) => {
    let validationResult = validationFunction({ ...params });
    if (negateResult) validationResult = !validationResult;
    if (validation.enabled && validationResult)
        errorsArray.push({
            message: validation.errorMsg,
        });
}

export const validateQuestions = (importedScores, dataElement, metadata, errorDetails) => {
    const validations = HNQIS2_VALIDATION_SETTINGS.programDetails;
    if (validations.enabled) {
        let errors = [];

        validate(validations.checkHasFormName, checkHasFormName, { metadata, dataElement }, errors);
        validate(validations.checkFormNameLength, checkFormNameLength, { metadata, dataElement }, errors);
        validate(validations.structureMatchesValue, structureMatchesValue, { metadata, dataElement, element:'label', valueType: 'LONG_TEXT' }, errors);
        validate(validations.hasFeedbackOrder, hasFeedbackOrder, { metadata, dataElement }, errors);
        validate(validations.hasVarName, hasVarName, { metadata }, errors);
        validate(validations.hasBothNumeratorDenominator, hasBothNumeratorDenominator, { metadata, dataElement }, errors);
        validate(validations.validAggregationType, validAggregationType, { metadata, dataElement, element: 'label', aggregationOperation: 'NONE'}, errors);
        validate(validations.validAggregationQuestion, validAggregationQuestion, { metadata, dataElement }, errors);
        validate(validations.isNumeratorNumeric, isNumeric, { metadata, property: 'scoreNum' }, errors);
        validate(validations.isDenominatorNumeric, isNumeric, { metadata, property: 'scoreDen' }, errors);
        validate(validations.hasParentQuestionNAnswerValue, hasBothParentQuestionNAnswerValue, { metadata }, errors);
        validate(validations.matchesScore, questionMatchesScore, { importedScores, dataElement }, errors);

        if (errors.length > 0) dataElement.errors = {
            title: errorDetails.title,
            tagName: errorDetails.tagName,
            errors,
            displayBadges: true
        };
    }
}

export const validateSectionsHNQIS2 = (section, errorDetails) => {
    const validations = HNQIS2_VALIDATION_SETTINGS.sections;
    if (validations.enabled) {
        let errors = [];

        validate(validations.checkHasName, checkSectionHasFormName, { section }, errors);

        if (errors.length > 0) section.errors = {
            title: errorDetails.title,
            tagName: errorDetails.tagName,
            errors,
            displayBadges: true
        };
    }
}

export const validateSections = (section, errorDetails) => {
    const validations = TRACKER_VALIDATION_SETTINGS.sections;
    if (validations.enabled) {
        let errors = [];

        validate(validations.checkHasName, checkSectionHasFormName, { section }, errors);

        if (errors.length > 0) section.errors = {
            title: errorDetails.title,
            tagName: errorDetails.tagName,
            errors,
            displayBadges: true
        };
    }
}

export const validateScores = (dataElement, errorDetails) => {
    const validations = HNQIS2_VALIDATION_SETTINGS.scores;
    if (validations.enabled) {
        let errors = [];
        let metadata = getPCAMetadataDE(dataElement);

        validate(validations.checkHasFormName, checkHasFormName, { metadata, dataElement }, errors);
        validate(validations.structureMatchesValue, structureMatchesValue, { metadata, dataElement, element: 'score', valueType: 'NUMBER' }, errors);
        validate(validations.hasScoreFeedbackOrder, hasScoreFeedbackOrder, { metadata, dataElement }, errors);
        validate(validations.hasBothNumeratorDenominator, hasBothNumeratorDenominator, { metadata, dataElement }, errors);
        validate(validations.validAggregationType, validAggregationType, { metadata, dataElement, element: 'score', aggregationOperation: 'AVERAGE' }, errors);
        
        if (errors.length > 0) dataElement.errors = {
            title: errorDetails.title,
            tagName: errorDetails.tagName,
            errors,
            displayBadges: true
        };
    }
}

export const validateTEA = (tea, teaList, errorDetails) => {
    const validations = TRACKER_VALIDATION_SETTINGS.teas;
    if (!validations.enabled) return;

    let errors = [];
    validate(validations.checkHasName, checkHasProperty, { object: tea.trackedEntityAttribute, property: 'name' }, errors);
    validate(validations.checkDuplicated, checkDuplicatedTEA, { tea: tea.trackedEntityAttribute.id, teaList: [...teaList] }, errors, false);

    if (errors.length > 0) tea.errors = {
        title: errorDetails.title,
        tagName: errorDetails.tagName,
        errors,
        displayBadges: true
    };

}

export const validateDataElement = (dataElement) => {
    const validations = TRACKER_VALIDATION_SETTINGS.dataElements;
    if (!validations.enabled) return;

    let errors = [];
    let metadata = getPCAMetadataDE(dataElement);
    
    if (errors.length > 0) dataElement.errors = errors;
    
}

export const getNewObjectsCount = (importResults) => extractAttributeValues(importResults, 'new').reduce((partialSum, a) => partialSum + a, 0)