import { DHIS2_AGG_OPERATORS_MAP, DHIS2_VALUE_TYPES_MAP, FEEDBACK_ORDER, FEEDBACK_TEXT, MAX_FORM_NAME_LENGTH, MAX_SHORT_NAME_LENGTH, METADATA } from "../../configs/Constants";
import { ReleaseNotes, ReleaseNotesTracker } from "../../configs/ReleaseNotes";
import { HNQIS2_TEMPLATE_MAP, HQNIS2_PROGRAM_TYPE_CELL, TEMPLATE_PROGRAM_TYPES, TRACKER_PROGRAM_TYPE_CELL, TRACKER_TEMPLATE_MAP } from "../../configs/TemplateConstants";
import { buildAttributeValue, getKeyByValue, getObjectByProperty, getObjectIdByProperty } from "../../configs/Utils";

export const isTracker = (importType) => [TEMPLATE_PROGRAM_TYPES.tracker, TEMPLATE_PROGRAM_TYPES.event].includes(importType);

export const getProgramDetailsHNQIS2 = (ws, mappingDetails) => {
    let program = {};

    program.name = ws.getCell("C12").value;
    program.shortName = ws.getCell("C13").value;
    let result = mappingDetails.programs.filter(prog => prog.name === program.name);
    program.id = result[0]?.id;
    program.useCompetencyClass = ws.getCell("C14").value;
    program.dePrefix = ws.getCell("C15").value;
    program.healthArea = ws.getCell("C16").value;

    return program;
}

export const getProgramDetailsTracker = (ws) => {
    let program = {};

    program.id = ws.getCell("J17").value;
    program.dePrefix = ws.getCell("J18").value;
    program.name = ws.getCell("J19").value;
    program.shortName = ws.getCell("J20").value;
    program.trackedEntityType = ws.getCell("J21").value;
    program.catCombo = ws.getCell("J22").value;
    program.type = ws.getCell("J23").value;

    return program;
}

export const fileValidation = (status, task, { setNotificationError, selectedFile }) => {

    if (selectedFile.name.endsWith('xlsx')) {
        task.status = "success";
        status = true;
    } else {
        task.name = "The provided file format is not XLSX";
        setNotificationError(true);
    }
    return status;

}

export const serverAndVersionValidation = (status, task, { setNotificationError, instructionsWS, isTracker, templateVersionCell, originServerCell }) => {
    const templateVersion = instructionsWS.getCell(templateVersionCell).value;
    const releaseNotes = isTracker ? ReleaseNotesTracker : ReleaseNotes;
    if (templateVersion === releaseNotes.at(-1).version) {
        const originServer = instructionsWS.getCell(originServerCell).value;
        if (originServer === location.origin) {
            task.status = "success";
            status = true;
        } else {
            task.name = `The Template has been exported from a different server (${originServer.toString()}). Please Import a template downloaded from the current server (${location.origin})`
            setNotificationError(true);
        }
    } else {
        task.name = `The selected Template is no longer supported by the PCA. Please download a new Template using this version of the app.`
        setNotificationError(true);
    }

    return status;
}

export const workbookValidation = (status, task, { setNotificationError, workbook, isTracker, programSpecificType }) => {

    let templateWS = [];
    let teasWS;
    let instructionsWS;
    let mappingWS;
    let isEvent = false;
    workbook.eachSheet((worksheet, sheetId) => {
        if (worksheet.getCell("L1").value === 'Program TEA Id') {
            teasWS = worksheet;
        } else if (worksheet.getCell("Q1").value === 'Stage ID' || worksheet.getCell("A1").value === 'Parent Name') {
            templateWS.push(worksheet);
        } else {
            let id = worksheet.getCell("A1").value;
            switch (id) {
                case 'I':
                    instructionsWS = worksheet;
                    if (isTracker) {
                        isEvent = worksheet.getCell(TRACKER_PROGRAM_TYPE_CELL).value === TEMPLATE_PROGRAM_TYPES.event;
                    }
                    break;
                case 'M':
                    mappingWS = worksheet;
                    break;
                default:
                    if (worksheet.name === 'Instructions') {
                        instructionsWS = worksheet;
                    } else if (worksheet.name === 'Mapping') {
                        mappingWS = worksheet;
                    }
                    break;
            }
        }
    });

    const templateIsHNQIS = instructionsWS.getCell(HQNIS2_PROGRAM_TYPE_CELL).value === TEMPLATE_PROGRAM_TYPES.hnqis2;
    const templateTracker = getKeyByValue(TEMPLATE_PROGRAM_TYPES, instructionsWS.getCell(TRACKER_PROGRAM_TYPE_CELL).value);
    const templateType = (templateIsHNQIS || !templateTracker)
        ? TEMPLATE_PROGRAM_TYPES.hnqis2
        : instructionsWS.getCell(TRACKER_PROGRAM_TYPE_CELL).value;

    if (
        (templateIsHNQIS && programSpecificType !== TEMPLATE_PROGRAM_TYPES.hnqis2) ||
        (!templateIsHNQIS && programSpecificType !== TEMPLATE_PROGRAM_TYPES[templateTracker])
    ) {
        task.status = "error";
        task.name = `The provided Template (${templateType}) cannot be imported in the current Program (${programSpecificType})`
        status = false;
        setNotificationError(true);
    }

    if (!status) return false;
    
    let errorsArray = [];
    if (!instructionsWS) errorsArray.push('Instructions');
    if (isTracker && !teasWS && !isEvent) errorsArray.push('TEAs');
    if (templateWS.length === 0) errorsArray.push((isTracker && !isEvent) ? 'Stage Template(s)' : 'Template');
    if (!mappingWS) errorsArray.push('Mapping');
    if (errorsArray.length > 0) {
        task.status = "error";
        status = false;
        task.name = `Missing the following required Tab(s): ${errorsArray.join(', ')}.`;
        setNotificationError(true);
    }

    return { status, teasWS, templateWS, instructionsWS, mappingWS };
}

const worksheetValidation = (status, task, { setNotificationError, sheetName, headers, templateHeadersList }) => {
    headers.forEach((value, key) => {
        if (value !== templateHeadersList[key]) {
            status = false;
            task.status = "error";
            task.name = `${sheetName}: Some Template columns are missing or misplaced.`;
            setNotificationError(true);
        }
    });
    return status;
}

const getWorksheetData = (status, task, { currentWorksheet, templateHeadersList, structureColumn }) => {

    let templateData = [];
    let dataRow = 3;

    currentWorksheet.eachRow((row, rowIndex) => {
        console.log(row.values)
        if (rowIndex >= dataRow && row.values[structureColumn]) {
            let dataRow = {};
            let rowVals = row.values;
            templateHeadersList.forEach((header, index) => {
                dataRow[header] = rowVals[index + 1]
            })
            templateData.push(dataRow);
        }
    });

    return { status, data: templateData };
}

export const handleWorksheetReading = (tasksHandler, currentWorksheet, setNotificationError, headers, templateHeadersList, startingIndex,structureColumn) => {
    if (!tasksHandler(
        startingIndex,
        `${currentWorksheet.name}: Validating worksheet columns`,
        true,
        worksheetValidation,
        {
            setNotificationError,
            sheetName: currentWorksheet.name,
            headers,
            templateHeadersList
        }
    )) return;

    return tasksHandler(
        startingIndex + 1,
        `Extracting data from '${currentWorksheet.name}'`,
        true,
        getWorksheetData,
        {
            currentWorksheet,
            templateHeadersList,
            structureColumn
        }
    );

}

const buildSummaryObject = () => ({ new: 0, updated: 0, removed: 0 });

export const buildHNQIS2Summary = () => ({
    questions: buildSummaryObject(),
    sections: buildSummaryObject(),
    scores: buildSummaryObject()
})

export const buildTrackerSummary = (mode, stages) => { 
    let result = { stages: [] };
    for (let index = 0; index < stages; index++) {
        result.stages.push({
            sections: buildSummaryObject(),
            dataElements: buildSummaryObject()
        })
    }
    if (mode === TEMPLATE_PROGRAM_TYPES.tracker) {
        result.teaSummary = {
            teas: buildSummaryObject(),
            programSections: buildSummaryObject()
        }
    }
    return result;
}

export const mapImportedDEHNQIS2 = (data, programPrefix, type, optionSets, legendSets, dataElementsPool) => {
    let code = "";

    let aggType;
    

    const existingDe = dataElementsPool[data[HNQIS2_TEMPLATE_MAP.dataElementId]] || {};

    const parsedDE = JSON.parse(JSON.stringify(existingDe));

    const criticalIdentifier = data[HNQIS2_TEMPLATE_MAP.isCritical] == 'Yes' ? ' [C]' : '';

    parsedDE.id = data[HNQIS2_TEMPLATE_MAP.dataElementId] || undefined;
    parsedDE.description = data[HNQIS2_TEMPLATE_MAP.description];
    parsedDE.formName = (type == 'label')
        ? '     '
        : data[HNQIS2_TEMPLATE_MAP.formName]
            ? (data[HNQIS2_TEMPLATE_MAP.formName] + criticalIdentifier)
            : '';
    parsedDE.domainType = 'TRACKER';

    if (data[HNQIS2_TEMPLATE_MAP.optionSet] && data[HNQIS2_TEMPLATE_MAP.optionSet] !== "") {
        let os = getObjectByProperty(data[HNQIS2_TEMPLATE_MAP.optionSet], optionSets, 'optionSet');
        parsedDE.optionSet = { id: os.id };
        parsedDE.optionSetValue = true;
        data[HNQIS2_TEMPLATE_MAP.valueType] = os.valueType;
    }

    if (type == 'score') {
        code = programPrefix + '_CS' + data[HNQIS2_TEMPLATE_MAP.feedbackOrder];
        aggType = 'AVERAGE';
        data[HNQIS2_TEMPLATE_MAP.valueType] = 'NUMBER';
    } else {
        if (type == 'label') data[HNQIS2_TEMPLATE_MAP.valueType] = 'LONG_TEXT';

        code = programPrefix + '_' + (data[HNQIS2_TEMPLATE_MAP.parentName]?.result || '???');
        switch (data[HNQIS2_TEMPLATE_MAP.valueType]) {
            case 'TEXT':
            case 'LONG_TEXT':
                aggType = 'NONE';
                break;
            default:
                aggType = 'SUM';
        }
    }

    parsedDE.code = code;
    parsedDE.name = (code + '_' + data[HNQIS2_TEMPLATE_MAP.formName]).slice(0, MAX_FORM_NAME_LENGTH);
    parsedDE.shortName = (code + '_' + data[HNQIS2_TEMPLATE_MAP.formName])?.slice(0, MAX_SHORT_NAME_LENGTH);
    parsedDE.valueType = data[HNQIS2_TEMPLATE_MAP.valueType];
    parsedDE.aggregationType = aggType;

    parsedDE.parentName = data[HNQIS2_TEMPLATE_MAP.parentName]?.result || '???';
    parsedDE.attributeValues = (existingDe?.attributeValues?.filter(att =>
        ![FEEDBACK_ORDER, FEEDBACK_TEXT, METADATA].includes(att.attribute.id)
    ) || []);

    if (data[HNQIS2_TEMPLATE_MAP.legend] && data[HNQIS2_TEMPLATE_MAP.legend] !== "") {
        parsedDE.legendSet = { id: getObjectIdByProperty(data[HNQIS2_TEMPLATE_MAP.legend], legendSets, 'legendSet') };
        parsedDE.legendSets = [
            { id: getObjectIdByProperty(data[HNQIS2_TEMPLATE_MAP.legend], legendSets, 'legendSet') }
        ];
    }

    if (data[HNQIS2_TEMPLATE_MAP.feedbackOrder] && data[HNQIS2_TEMPLATE_MAP.feedbackOrder] !== "")
        parsedDE.attributeValues.push(buildAttributeValue(FEEDBACK_ORDER, String(data[HNQIS2_TEMPLATE_MAP.feedbackOrder])));

    if (data[HNQIS2_TEMPLATE_MAP.feedbackText] && data[HNQIS2_TEMPLATE_MAP.feedbackText] !== "")
        parsedDE.attributeValues.push(buildAttributeValue(FEEDBACK_TEXT, data[HNQIS2_TEMPLATE_MAP.feedbackText]));

    const metadata = {
        isCompulsory: data[HNQIS2_TEMPLATE_MAP.isCompulsory] || "No",
        isCritical: data[HNQIS2_TEMPLATE_MAP.isCritical] || "No",
        elemType: type,
        varName: data[HNQIS2_TEMPLATE_MAP.parentName]?.result || '???',
        autoNaming: 'Yes'
    };

    if (data[HNQIS2_TEMPLATE_MAP.scoreNum] !== "") metadata.scoreNum = data[HNQIS2_TEMPLATE_MAP.scoreNum];
    if (data[HNQIS2_TEMPLATE_MAP.scoreDen] !== "") metadata.scoreDen = data[HNQIS2_TEMPLATE_MAP.scoreDen];

    if (data[HNQIS2_TEMPLATE_MAP.parentQuestion] !== "") {
        metadata.parentQuestion = data[HNQIS2_TEMPLATE_MAP.parentQuestion];
        parsedDE.parentQuestion = data[HNQIS2_TEMPLATE_MAP.parentQuestion];   // TO BE REPLACED WITH PARENT DATA ELEMENT'S UID
    }
    if (data[HNQIS2_TEMPLATE_MAP.parentValue] !== "") metadata.parentValue = data[HNQIS2_TEMPLATE_MAP.parentValue];

    if (type == 'label') metadata.labelFormName = data[HNQIS2_TEMPLATE_MAP.formName];

    parsedDE.attributeValues.push(
        {
            attribute: { id: METADATA },
            value: JSON.stringify(metadata)
        }
    );

    return parsedDE;
};

export const mapImportedDE = (data, programPrefix, optionSets, legendSets, dataElementsPool) => {
    
    const autoNaming = data[TRACKER_TEMPLATE_MAP.autoNaming] === 'No' ? false : true;
    const code = autoNaming
        ? programPrefix + '_' + (data[TRACKER_TEMPLATE_MAP.correlative]?.result || '???')
        : data[TRACKER_TEMPLATE_MAP.code];

    const existingDe = dataElementsPool[data[TRACKER_TEMPLATE_MAP.dataElementId]] || {};
    const parsedDE = JSON.parse(JSON.stringify(existingDe));


    parsedDE.id = data[TRACKER_TEMPLATE_MAP.dataElementId] || undefined;
    parsedDE.name = autoNaming
        ? (code + '_' + data[TRACKER_TEMPLATE_MAP.formName]).slice(0, MAX_FORM_NAME_LENGTH)
        : data[TRACKER_TEMPLATE_MAP.name];
    parsedDE.shortName = autoNaming
        ? (code + '_' + data[TRACKER_TEMPLATE_MAP.formName])?.slice(0, MAX_SHORT_NAME_LENGTH)
        : data[TRACKER_TEMPLATE_MAP.shortName];
    parsedDE.code = autoNaming ? code : data[TRACKER_TEMPLATE_MAP.code];
    parsedDE.description = data[TRACKER_TEMPLATE_MAP.description];
    parsedDE.formName = data[TRACKER_TEMPLATE_MAP.formName]
    parsedDE.domainType = 'TRACKER';
    parsedDE.valueType = getKeyByValue(DHIS2_VALUE_TYPES_MAP, data[TRACKER_TEMPLATE_MAP.valueType]);
    parsedDE.aggregationType = getKeyByValue(DHIS2_AGG_OPERATORS_MAP, data[TRACKER_TEMPLATE_MAP.aggOperator] || 'None');
    parsedDE.parentName = data[TRACKER_TEMPLATE_MAP.parentName]?.result;
    parsedDE.attributeValues = (existingDe?.attributeValues?.filter(att =>
        ![METADATA].includes(att.attribute.id)
    ) || [])


    if (data[TRACKER_TEMPLATE_MAP.optionSet] && data[TRACKER_TEMPLATE_MAP.optionSet] !== "") {
        let os = getObjectByProperty(data[TRACKER_TEMPLATE_MAP.optionSet], optionSets, 'optionSet');
        parsedDE.optionSet = { id: os.id };
        parsedDE.optionSetValue = true;
        parsedDE.valueType = os.valueType;
    }

    if (data[TRACKER_TEMPLATE_MAP.legend] && data[TRACKER_TEMPLATE_MAP.legend] !== "") {
        parsedDE.legendSet = { id: getObjectIdByProperty(data[TRACKER_TEMPLATE_MAP.legend], legendSets, 'legendSet') };
        parsedDE.legendSets = [
            { id: getObjectIdByProperty(data[TRACKER_TEMPLATE_MAP.legend], legendSets, 'legendSet') }
        ];
    }

    const metadata = {
        isCompulsory: data[TRACKER_TEMPLATE_MAP.isCompulsory] || "No",
        varName: data[TRACKER_TEMPLATE_MAP.correlative]?.result,
        autoNaming: autoNaming ? 'Yes' : 'No'
    };

    if (data[TRACKER_TEMPLATE_MAP.parentQuestion] !== "") {
        metadata.parentQuestion = data[TRACKER_TEMPLATE_MAP.parentQuestion];
        parsedDE.parentQuestion = data[TRACKER_TEMPLATE_MAP.parentQuestion];   // TO BE REPLACED WITH PARENT DATA ELEMENT'S UID
    }
    if (data[TRACKER_TEMPLATE_MAP.parentValue] !== "") metadata.parentValue = data[TRACKER_TEMPLATE_MAP.parentValue];

    parsedDE.attributeValues.push(
        {
            attribute: { id: METADATA },
            value: JSON.stringify(metadata)
        }
    );

    return parsedDE;
};

export const countChanges = (
    {
        sections,
        sectionsSummary,
        countObject,
        summaryObject,
        currentData,
        objId = 'id',
        impObjId = 'id',
        sectionId = 'id',
        impSectionId = 'id'
    }
) => {
    sections.forEach(i_section => {
        i_section.newValues = 0;
        i_section.updatedValues = 0;

        i_section[countObject].map(i_obj => {
            if (i_obj[impObjId] == null) {
                //New object
                i_obj.importStatus = 'new';
                summaryObject.new++;
                i_section.newValues++;
            } else {
                //Updated object
                i_obj.importStatus = 'update';
                summaryObject.updated++;
                i_section.updatedValues++;
            }

            return i_obj;
        })
    });

    // Compare previous objects with imported data -> Get removed data
    let removedObjects = currentData.map(sec => {
        // Section removed -> Increase counter
        if (!sections.find(i_sec => i_sec[impSectionId] == sec[sectionId])) sectionsSummary.removed++;
        return sec[countObject].filter(obj =>
            !sections.find(i_sec => i_sec[countObject].find(i_obj => i_obj[impObjId] == obj[objId]))
        )
    }).flat();

    summaryObject.removed = removedObjects.length;
    summaryObject.removedItems = removedObjects;
}