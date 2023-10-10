import React from 'react';
import { coerce, gte, lte, satisfies } from 'semver';
import { METADATA } from '../configs/Constants.js';

export function splitPosition(position) {
    return position.split(/(\d+)/);
}
export function number2Character(numb) {
    const zPlace = 25;
    let quo = 0;

    if (numb > zPlace) {
        quo = ~~(numb / 26);
        numb = numb % 26;
    }

    return (quo !== 0 ? String.fromCharCode(64 + quo) : '') + String.fromCharCode(65 + numb);
}
export function character2Number(rangeString) {
    let pos = 0;
    const ranges = rangeString.split("");

    if (ranges.length > 1) {
        ranges.forEach(r => {
            pos = pos + (characterPos(r) - 65);
        });
        return pos;
    }

    return characterPos(ranges[0]) - 65;
}
export function columnCharacters(startCharacter, dataObj) {
    const columns = [];
    const posStartCharacter = character2Number(startCharacter);
    Object.keys(dataObj).forEach((key, index) => {
        columns.push(number2Character(posStartCharacter + index));
    });
    return columns;
}
export function arrayObjectToStringConverter(arrayOfObj, key) {
    let final = "";
    arrayOfObj.forEach(element => {
        final += element[key] + ",";
    });
    return final.slice(0, -1);
}

export function DeepCopy(obj) {
    return (typeof obj !== "undefined") ? JSON.parse(JSON.stringify(obj)) : null;
}

export function ShallowCopy(obj) { return { ...obj } }

function characterPos(chr) {
    return chr.charCodeAt(0);
}

export function versionIsValid(serverVersion, limitMin, limitMax) {
    const coercedVersion = coerce(serverVersion).version;
    return satisfies(coercedVersion, `>=${limitMin} <=${limitMax}`);
}

export function parseErrors(response) {
    const errorRes = response.response || response;
    let index = 0
    return errorRes.typeReports?.reduce((reports, typeReport) =>
        reports.concat(
            typeReport.objectReports.map(objectReport =>
                objectReport.errorReports.map(err => {
                    index += 1;
                    return (<p key={index}>{err.message}</p>)
                })
            )
        ), []
    ).flat() || <p>{response.httpStatus}: {response.message}.</p>
}

export function parseErrorsJoin(response, joinVal) {
    const errorRes = response.response || response;
    return errorRes.typeReports?.reduce((reports, typeReport) =>
        reports.concat(
            typeReport.objectReports.map(objectReport =>
                objectReport.errorReports.map(err => err.message)
            )
        ), []
    ).flat().join(joinVal) || (response.httpStatus + ": " + response.message + ".")
}


export function parseErrorsUL(response) {
    const errorRes = response.response || response;
    let index = 0
    return <ul>{
        errorRes.typeReports?.reduce((reports, typeReport) =>
            reports.concat(
                typeReport.objectReports.map(objectReport =>
                    objectReport.errorReports.map(err => {
                        index += 1;
                        return (<li key={index}>{err.message}</li>)
                    })
                )
            ), []
        ).flat() || <li>{response.httpStatus}: {response.message}.</li>
    }
    </ul>
}

export const parseErrorsSaveMetadata = (e) => {
    const errors = e.response || e;
    const data = errors.typeReports.map(tr => {
        const type = tr.klass.split('.').pop()
        return tr.objectReports.map(or => or.errorReports.map(er => ({ type, uid: or.uid, errorCode: er.errorCode, message: er.message })))
    })
    return data.flat(2)
}

export function truncateString(strVal, characters = 50, useEllipsis = true) {
    return (strVal.substring(0, characters) + ((strVal.length > characters && useEllipsis) ? '...' : ''))
}

export function formatAlert(text) {
    return text?.split('\\n').map((elem, index) => <p key={index}>{elem}</p>)
}

export function extractMetadataPermissions(permissions) {
    return permissions.slice(0, 2) + '------';
}

export function getUniqueKeys(arrayOfObjects) {
    const uniqueKeys = new Set();

    for (const obj of arrayOfObjects) {
        const keys = Object.keys(obj);
        keys.forEach(key => uniqueKeys.add(key));
    }

    return Array.from(uniqueKeys).sort().map(key => ({ key, selected: true }));
}

/*Returns an object with:
    * key = value -> Last value
    * value = object -> Object with more objects
    * value = array -> Object with array of objects (the array is a list of all the unique keys)
*/
export function getJSONKeyTree(obj, level = 1, index = 0) {
    const res = {}
    for (const key in obj) {
        if (!!obj[key] && obj[key].constructor !== Array && obj[key].constructor === Object && index < level) {
            const subRes = getJSONKeyTree(obj[key], level, index + 1)
            res[key] = Object.keys(subRes).map(key => subRes[key][0])
        } else if (Array.isArray(obj[key])) {
            res[key] = getUniqueKeys(obj[key])
        } else {
            res[key] = [{ key, selected: true }]
        }
    }
    return res
}

export function changeAttributeValue(obj, attribute, newValue) {
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            changeAttributeValue(obj[i], attribute, newValue);
        }
    } else if (typeof obj === 'object') {
        for (const key in obj) {
            if (key === attribute) {
                obj[key] = newValue;
            } else {
                changeAttributeValue(obj[key], attribute, newValue);
            }
        }
    }
}

export function removeKey(obj, key) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item) => removeKey(item, key));
    } else {
        Object.keys(obj).forEach((k) => {
            if (k === key) {
                delete obj[k];
            } else {
                removeKey(obj[k], key);
            }
        });
    }

    return obj;
}

export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

export const getObjectIdByProperty = (propertyValue, object, property) => {
    return object.find(o => o[property] == propertyValue)?.id
};

export const getObjectByProperty = (propertyValue, object, property) => {
    return object.find(o => o[property] == propertyValue)
};

export const buildAttributeValue = (attributeId, value) => ({
    attribute: { id: attributeId },
    value
})

export const buildBasicFormStage = (stageDataElements) => ({
    id: 'basic-form',
    name: "Basic Form",
    displayName: "Basic Form",
    sortOrder: '1',
    dataElements: stageDataElements?.map(de => DeepCopy(de.dataElement)) || []
})

export const setUpProgramStageSections = (programStage) => {
    if (programStage.formType === 'SECTION') {
        return programStage.programStageSections;
    } else {
        return [buildBasicFormStage(programStage.programStageDataElements)];
    }
}

export const hasAttributeValue = (json, key) => {
    if (typeof json[key] !== 'undefined') {
        return (json[key] !== "");
    }
    return false;
}

export const isNum = (value) => {
    return !isNaN(value);
}

export const isEmpty = (str) => {
    return (!str || str.length === 0);
}

export const isBlank = (str) => {
    return (!str || /^\s*$/.test(str));
}

export const isValidParentName = (json, key) => {
    return (/_S\d+Q\d+/.test(json[key]))
}

export const isValidCorrelative = (json, key) => {
    return (/_PS\d+_S\d+E\d+/.test(json[key]))
}

export const extractAttributeValues = (obj, targetAttribute, resultList = []) => {
    if (typeof obj === 'object' && obj !== null) {
        if (obj[targetAttribute] !== undefined) {
            resultList.push(obj[targetAttribute]);
        }

        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                extractAttributeValues(obj[key], targetAttribute, resultList);
            }
        }
    }
    return resultList;
}

export const getPCAMetadataDE = (dataElement) => {
    const jsonData = dataElement.attributeValues?.find(attributeValue => attributeValue.attribute.id === METADATA);
    return jsonData ? JSON.parse(jsonData.value) : {};
}

export const getProgramQuery = () => {
    const dataElementQuery = 'aggregationType,attributeValues[value,attribute],code,description,displayName,domainType,formName,id,legendSet,legendSets[id,name],name,optionSet[id,name],optionSetValue,sharing,shortName,style,valueType,categoryCombo';
    const stageDataElementsQuery = `categoryCombo,compulsory,dataElement[${dataElementQuery}],displayInReports,id,name,programStage,sortOrder,style`;
    const stageSectionsQuery = `dataElements[${dataElementQuery}],displayName,id,name,sortOrder`;
    const stagesQuery = `id,name,displayName,formType,programStageSections[${stageSectionsQuery}],description,program[id,name],minDaysFromStart,repeatable,periodType,displayGenerateEventBox,autoGenerateEvent,openAfterEnrollment,reportDateToUse,remindCompleted,allowGenerateNextVisit,featureType,attributeValues,publicAccess,notificationTemplates,programStageDataElements[${stageDataElementsQuery}],sortOrder,sharing`
    const programSectionsQuery = 'id,name,renderType,sortOrder,program,sharing,translations,attributeValues,trackedEntityAttributes';
    const programTrackedEntityAttributes = 'id,name,mandatory,renderOptionsAsRadio,valueType,searchable,displayInList,sortOrder,program,trackedEntityAttribute[id,name],programTrackedEntityAttributeGroups,translations,userGroupAccesses,attributeValues,userAccessesattributeValues,displayInList,id,mandatory,name,program,programTrackedEntityAttributeGroups,renderOptionsAsRadio,searchable,sortOrder,trackedEntityAttribute,translations,userAccesses,userGroupAccesses,valueType';

    return [
        'accessLevel',
        'categoryCombo',
        'completeEventsExpiryDays',
        'description',
        'displayFrontPageList',
        'displayIncidentDate',
        'enrollmentDateLabel',
        'expiryDays',
        'id',
        'ignoreOverdueEvents',
        'maxTeiCountToReturn',
        'minAttributesRequiredToSearch',
        'name',
        'onlyEnrollOnce',
        'organisationUnits',
        'programIndicators',
        'programRuleVariables',
        'displayName',
        'programType',
        'code',
        'attributeValues',
        `programStages[${stagesQuery}]`,
        'withoutRegistration',
        `programSections[${programSectionsQuery}]`,
        `programTrackedEntityAttributes[${programTrackedEntityAttributes}]`,
        'programType',
        'publicAccess',
        'registration',
        'selectEnrollmentDatesInFuture',
        'selectIncidentDatesInFuture',
        'shortName',
        'skipOffline',
        'style',
        'trackedEntityType',
        'translations',
        'useFirstStageDuringRegistration',
        'user',
        'userAccesses',
        'userGroupAccesses',
        'sharing',
        'openDaysAfterCoEndDate'
    ];
}

export const setPCAMetadata = (scopeObject, newMetadata) => {
    const pcaMetadataIndex = scopeObject.attributeValues.findIndex(att => att.attribute.id == METADATA)
    if (pcaMetadataIndex > -1) {
        scopeObject.attributeValues[pcaMetadataIndex].value = JSON.stringify(newMetadata);
    } else {
        scopeObject.attributeValues.push({
            value: JSON.stringify(newMetadata),
            attribute: {
                id: METADATA
            }
        })
    }
}

export const mergeWithPriority = (priorityObject, secondaryObject) => {
    const mergedObject = DeepCopy(secondaryObject);

    for (const key in priorityObject) {
        if (Object.hasOwn(priorityObject, key)) {
            mergedObject[key] = priorityObject[key];
        }
    }

    return mergedObject;
}

export const getPureValue = (value) => {
    let res = value;
    if (typeof value === 'string') {
        res = value.replaceAll('"', '');
    }
    return res;
}

export const concatArraysUnique = (array1, array2) => {
    return [...array1].filter(value =>
        !array2.includes(value)
    ).concat([...array2])
}

export const extractMetadataPermissionsAllLevels = (sharing) => {
    if (sharing !== null && typeof sharing === 'object') {
        if (Object.hasOwn(sharing,'access')) {
            sharing['access'] = extractMetadataPermissions(sharing['access']);
        }
        for (var key in sharing) {
            if (Object.hasOwn(sharing, key)) {
                extractMetadataPermissionsAllLevels(sharing[key]);
            }
        }
    }
    return sharing;
}

export const removeWindowsForbiddenCharacters = (string) => string.replaceAll(/[*?:\\/[\]]+/g, '');

export const padValue = (value, format) => {
    const valueText = value + "";
    const sliceLength = format.length - valueText.length;

    if (sliceLength < 1) { return valueText }
    
    return format.slice(0, sliceLength) + valueText;
}