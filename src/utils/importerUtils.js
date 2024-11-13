import { DHIS2_AGG_OPERATORS_MAP, DHIS2_VALUE_TYPES_MAP, FEEDBACK_ORDER, FEEDBACK_TEXT, MAX_DATA_ELEMENT_NAME_LENGTH, MAX_SHORT_NAME_LENGTH, METADATA, OPTION_SET_YESNONA } from "../configs/Constants.js";
import { ReleaseNotes, ReleaseNotesTracker } from "../configs/ReleaseNotes.js";
import { HNQIS2_TEMPLATE_MAP, HNQISMWI_TEMPLATE_MAP, HQNIS2_PROGRAM_TYPE_CELL, TEMPLATE_PROGRAM_TYPES, TRACKER_PROGRAM_TYPE_CELL, TRACKER_TEMPLATE_MAP } from "../configs/TemplateConstants.js";
import { buildAttributeValue, getKeyByValue, getObjectByProperty, getObjectIdByProperty, isLabelType, programIsHNQIS } from "./Utils.js";

export const isTrackerType = (importType) => [TEMPLATE_PROGRAM_TYPES.tracker, TEMPLATE_PROGRAM_TYPES.event].includes(importType);

export const getProgramDetailsHNQIS2 = (ws, mappingDetails) => {
    const program = {};

    program.name = ws.getCell("C12").value;
    program.shortName = ws.getCell("C13").value;
    const result = mappingDetails.programs.filter(prog => prog.name === program.name);
    program.id = result[0]?.id;
    program.useCompetencyClass = ws.getCell("C14").value;
    program.dePrefix = ws.getCell("C15").value;
    program.healthArea = ws.getCell("C16").value;

    return program;
}

export const getProgramDetailsTracker = (ws) => {
    const program = {};

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

    const templateWS = [];
    let teasWS;
    let instructionsWS;
    let mappingWS;
    let isEvent = false;
    workbook.eachSheet((worksheet) => {
        if (worksheet.getCell("L1").value === 'Program TEA Id') {
            teasWS = worksheet;
        } else if (worksheet.getCell("R1").value === 'Stage ID' || worksheet.getCell("A1").value === 'Parent Name') {
            templateWS.push(worksheet);
        } else {
            const id = worksheet.getCell("A1").value;
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

    const hnqisProgramTypeCell = instructionsWS.getCell(HQNIS2_PROGRAM_TYPE_CELL).value;
    const templateIsHNQIS = programIsHNQIS(hnqisProgramTypeCell);
    const templateTracker = getKeyByValue(TEMPLATE_PROGRAM_TYPES, instructionsWS.getCell(TRACKER_PROGRAM_TYPE_CELL).value);
    const templateType = (templateIsHNQIS || !templateTracker)
        ? hnqisProgramTypeCell
        : instructionsWS.getCell(TRACKER_PROGRAM_TYPE_CELL).value;
    
    if (
        (templateIsHNQIS && programSpecificType !== hnqisProgramTypeCell) ||
        (!templateIsHNQIS && programSpecificType !== TEMPLATE_PROGRAM_TYPES[templateTracker])
    ) {
        task.status = "error";
        task.name = `The provided Template (${templateType}) cannot be imported in the current Program (${programSpecificType})`
        status = false;
        setNotificationError(true);
    }

    if (!status) { return false }
    
    const errorsArray = [];
    if (!instructionsWS) { errorsArray.push('Instructions') }
    if (isTracker && !teasWS && !isEvent) { errorsArray.push('TEAs') }
    if (templateWS.length === 0) { errorsArray.push((isTracker && !isEvent) ? 'Stage Template(s)' : 'Template') }
    if (!mappingWS) { errorsArray.push('Mapping') }
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

const getWorksheetData = (status, task, { currentWorksheet, templateHeadersList, structureColumn, isTrackerTemplate }) => {

    const templateData = [];
    let stageId;
    const dataRow = 3;

    currentWorksheet.eachRow((row, rowIndex) => {
        if (rowIndex >= dataRow && row.values[structureColumn]) {
            const dataRow = {};
            const rowVals = row.values;
            templateHeadersList.forEach((header, index) => {
                dataRow[header] = rowVals[index + 1]
            })
            templateData.push(dataRow);
        }
    });

    if (isTrackerTemplate) { stageId = currentWorksheet.getCell("R2").value }

    return { status, data: templateData, stageId };
}

export const handleWorksheetReading = ({ tasksHandler, currentWorksheet, setNotificationError, headers, templateHeadersList, startingIndex, structureColumn, isTrackerTemplate = false }) => {
    if (!tasksHandler(
        { step: startingIndex, message: `${currentWorksheet.name}: Validating worksheet columns`, initialStatus: true },
        worksheetValidation,
        {
            setNotificationError,
            sheetName: currentWorksheet.name,
            headers,
            templateHeadersList
        }
    )) { return }

    return tasksHandler(
        { step: startingIndex + 1, message: `Extracting data from '${currentWorksheet.name}'`, initialStatus: true },
        getWorksheetData,
        {
            currentWorksheet,
            templateHeadersList,
            structureColumn,
            isTrackerTemplate
        }
    );

}

const buildSummaryObject = () => ({ new: 0, updated: 0, removed: 0 });

export const buildHNQIS2Summary = () => ({
    questions: buildSummaryObject(),
    sections: buildSummaryObject(),
    scores: buildSummaryObject()
})

export const buildHNQISMWISummary = () => ({
    sections: buildSummaryObject(),
    standards: buildSummaryObject(),
    criterions: buildSummaryObject(),
    dataElements: buildSummaryObject(),
})

export const buildTrackerSummary = (mode, stages) => { 
    const result = { stages: [] };
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

export const mapImportedDEHNQIS2 = ({ data, programPrefix, type, optionSets, legendSets, dataElementsPool }) => {
    let code = "";

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

    if (type == 'score') {
        code = programPrefix + '_CS' + data[HNQIS2_TEMPLATE_MAP.feedbackOrder];
        parsedDE.aggregationType = 'AVERAGE';
        data[HNQIS2_TEMPLATE_MAP.valueType] = 'NUMBER';
    } else {
        if (type == 'label') {
            data[HNQIS2_TEMPLATE_MAP.valueType] = 'LONG_TEXT';
            parsedDE.aggregationType = 'NONE';
        }

        code = programPrefix + (data[HNQIS2_TEMPLATE_MAP.parentName]?.result || '???');
    }

    parsedDE.code = code;
    parsedDE.name = (code + data[HNQIS2_TEMPLATE_MAP.formName]).slice(0, MAX_DATA_ELEMENT_NAME_LENGTH);
    parsedDE.shortName = (code + data[HNQIS2_TEMPLATE_MAP.formName])?.slice(0, MAX_SHORT_NAME_LENGTH);
    parsedDE.valueType = data[HNQIS2_TEMPLATE_MAP.valueType];

    parsedDE.parentName = data[HNQIS2_TEMPLATE_MAP.parentName]?.result || '???';

    parsedDE.attributeValues = (existingDe?.attributeValues?.filter(att =>
        ![FEEDBACK_ORDER, FEEDBACK_TEXT, METADATA].includes(att.attribute.id)
    ) || []);

    const metadata = {
        elemType: type,
        varName: data[HNQIS2_TEMPLATE_MAP.parentName]?.result || '???',
        autoNaming: 'Yes'
    };

    if (type === 'question') {

        metadata.isCompulsory = data[HNQIS2_TEMPLATE_MAP.isCompulsory] || "No"
        metadata.isCritical = data[HNQIS2_TEMPLATE_MAP.isCritical] || "No"

        if (data[HNQIS2_TEMPLATE_MAP.optionSet] && data[HNQIS2_TEMPLATE_MAP.optionSet] !== "") {
            const os = getObjectByProperty(data[HNQIS2_TEMPLATE_MAP.optionSet], optionSets, 'optionSet');
            if (os) {
                parsedDE.optionSet = { id: os.id };
                parsedDE.optionSetValue = true;
                parsedDE.valueType = os.valueType;
            }
        }

        switch (parsedDE.valueType) {
            case 'TEXT':
            case 'LONG_TEXT':
                parsedDE.aggregationType = 'NONE';
                break;
            default:
                parsedDE.aggregationType = 'SUM';
        }

        if (data[HNQIS2_TEMPLATE_MAP.legend] && data[HNQIS2_TEMPLATE_MAP.legend] !== "") {
            parsedDE.legendSet = { id: getObjectIdByProperty(data[HNQIS2_TEMPLATE_MAP.legend], legendSets, 'legendSet') };
            parsedDE.legendSets = [
                { id: getObjectIdByProperty(data[HNQIS2_TEMPLATE_MAP.legend], legendSets, 'legendSet') }
            ];
        }

        if (data[HNQIS2_TEMPLATE_MAP.scoreNum] !== "") { metadata.scoreNum = data[HNQIS2_TEMPLATE_MAP.scoreNum] }
        if (data[HNQIS2_TEMPLATE_MAP.scoreDen] !== "") { metadata.scoreDen = data[HNQIS2_TEMPLATE_MAP.scoreDen] }
    }

    if (data[HNQIS2_TEMPLATE_MAP.feedbackOrder] && data[HNQIS2_TEMPLATE_MAP.feedbackOrder] !== "") {
        parsedDE.attributeValues.push(buildAttributeValue(FEEDBACK_ORDER, String(data[HNQIS2_TEMPLATE_MAP.feedbackOrder])))
    }

    if (data[HNQIS2_TEMPLATE_MAP.feedbackText] && data[HNQIS2_TEMPLATE_MAP.feedbackText] !== "") {
        parsedDE.attributeValues.push(buildAttributeValue(FEEDBACK_TEXT, data[HNQIS2_TEMPLATE_MAP.feedbackText]))
    }

    if (data[HNQIS2_TEMPLATE_MAP.parentQuestion] !== "") {
        metadata.parentQuestion = data[HNQIS2_TEMPLATE_MAP.parentQuestion];
        parsedDE.parentQuestion = data[HNQIS2_TEMPLATE_MAP.parentQuestion];   // TO BE REPLACED WITH PARENT DATA ELEMENT'S UID
    }
    if (data[HNQIS2_TEMPLATE_MAP.parentValue] !== "") { metadata.parentValue = data[HNQIS2_TEMPLATE_MAP.parentValue] }

    if (type == 'label') { metadata.labelFormName = data[HNQIS2_TEMPLATE_MAP.formName] }

    parsedDE.attributeValues.push(
        {
            attribute: { id: METADATA },
            value: JSON.stringify(metadata)
        }
    );


    return parsedDE;
};

export const mapImportedDE = ({ data, programPrefix, stageNumber, optionSets, legendSets, dataElementsPool }) => {
    
    const autoNaming = data[TRACKER_TEMPLATE_MAP.autoNaming] === 'No' ? false : true;
    const stagePrefix = `_PS${stageNumber}`;
    const code = autoNaming
        ? programPrefix + stagePrefix +(data[TRACKER_TEMPLATE_MAP.correlative]?.result || '???')
        : data[TRACKER_TEMPLATE_MAP.code];

    const existingDe = dataElementsPool[data[TRACKER_TEMPLATE_MAP.dataElementId]] || {};
    const parsedDE = JSON.parse(JSON.stringify(existingDe));


    parsedDE.id = data[TRACKER_TEMPLATE_MAP.dataElementId] || undefined;
    parsedDE.name = autoNaming
        ? (code + data[TRACKER_TEMPLATE_MAP.formName]).slice(0, MAX_DATA_ELEMENT_NAME_LENGTH)
        : data[TRACKER_TEMPLATE_MAP.name];
    parsedDE.shortName = autoNaming
        ? (code + data[TRACKER_TEMPLATE_MAP.formName])?.slice(0, MAX_SHORT_NAME_LENGTH)
        : data[TRACKER_TEMPLATE_MAP.shortName];
    parsedDE.code = autoNaming ? code : data[TRACKER_TEMPLATE_MAP.code];
    parsedDE.description = data[TRACKER_TEMPLATE_MAP.description];
    parsedDE.formName = data[TRACKER_TEMPLATE_MAP.formName]
    parsedDE.domainType = 'TRACKER';
    parsedDE.valueType = getKeyByValue(DHIS2_VALUE_TYPES_MAP, data[TRACKER_TEMPLATE_MAP.valueType]);
    parsedDE.aggregationType = getKeyByValue(DHIS2_AGG_OPERATORS_MAP, data[TRACKER_TEMPLATE_MAP.aggOperator] || 'None');
    parsedDE.parentName = data[TRACKER_TEMPLATE_MAP.correlative]?.result?stagePrefix+data[TRACKER_TEMPLATE_MAP.correlative]?.result:undefined;
    parsedDE.attributeValues = (existingDe?.attributeValues?.filter(att =>
        ![METADATA].includes(att.attribute.id)
    ) || [])


    if (data[TRACKER_TEMPLATE_MAP.optionSet] && data[TRACKER_TEMPLATE_MAP.optionSet] !== "") {
        const os = getObjectByProperty(data[TRACKER_TEMPLATE_MAP.optionSet], optionSets, 'optionSet');
        if (os) {
            parsedDE.optionSet = { id: os.id };
            parsedDE.optionSetValue = true;
            parsedDE.valueType = os.valueType;
        }
    }

    if (data[TRACKER_TEMPLATE_MAP.legend] && data[TRACKER_TEMPLATE_MAP.legend] !== "") {
        parsedDE.legendSet = { id: getObjectIdByProperty(data[TRACKER_TEMPLATE_MAP.legend], legendSets, 'legendSet') };
        parsedDE.legendSets = [
            { id: getObjectIdByProperty(data[TRACKER_TEMPLATE_MAP.legend], legendSets, 'legendSet') }
        ];
    }

    const metadata = {
        isCompulsory: data[TRACKER_TEMPLATE_MAP.isCompulsory] || "No",
        varName: stagePrefix+data[TRACKER_TEMPLATE_MAP.correlative]?.result,
        autoNaming: autoNaming ? 'Yes' : 'No'
    };
    
    if (data[TRACKER_TEMPLATE_MAP.parentQuestion] && data[TRACKER_TEMPLATE_MAP.parentQuestion] !== "") {
        metadata.parentQuestion = stagePrefix+data[TRACKER_TEMPLATE_MAP.parentQuestion];
        parsedDE.parentQuestion = stagePrefix+data[TRACKER_TEMPLATE_MAP.parentQuestion];   // TO BE REPLACED WITH PARENT DATA ELEMENT'S UID
    }
    if (data[TRACKER_TEMPLATE_MAP.parentValue] !== "") {
        metadata.parentValue = data[TRACKER_TEMPLATE_MAP.parentValue]
    }

    parsedDE.attributeValues.push(
        {
            attribute: { id: METADATA },
            value: JSON.stringify(metadata)
        }
    );

    return parsedDE;
};

export const mapImportedDEHNQISMWI = ({ data, programPrefix, type, legendSets, dataElementsPool }) => {
    let code = "";

    const existingDe = dataElementsPool[data[HNQISMWI_TEMPLATE_MAP.dataElementId]] || {};

    const parsedDE = JSON.parse(JSON.stringify(existingDe));

    parsedDE.id = data[HNQISMWI_TEMPLATE_MAP.dataElementId] || undefined;
    parsedDE.description = data[HNQISMWI_TEMPLATE_MAP.description];

    if (type === 'label') {
        parsedDE.formName = '     ';
    } else if (type === 'Std Overview') {
        parsedDE.formName = 'Standard Overview';
    } else {
        parsedDE.formName = data[HNQISMWI_TEMPLATE_MAP.formName] || '';
    }
    
    parsedDE.domainType = 'TRACKER';

    if (isLabelType(type)) {
        data[HNQISMWI_TEMPLATE_MAP.valueType] = 'LONG_TEXT';
        parsedDE.aggregationType = 'NONE';
    }

    code = programPrefix + (data[HNQISMWI_TEMPLATE_MAP.parentName]?.result || '???');

    parsedDE.code = code;
    parsedDE.name = (code + '_' + data[HNQISMWI_TEMPLATE_MAP.formName]).slice(0, MAX_DATA_ELEMENT_NAME_LENGTH);
    parsedDE.shortName = (code + '_' + data[HNQISMWI_TEMPLATE_MAP.formName])?.slice(0, MAX_SHORT_NAME_LENGTH);
    parsedDE.valueType = data[HNQISMWI_TEMPLATE_MAP.valueType];

    parsedDE.parentName = data[HNQISMWI_TEMPLATE_MAP.parentName]?.result || '???';

    parsedDE.attributeValues = (existingDe?.attributeValues?.filter(att =>
        ![FEEDBACK_ORDER, FEEDBACK_TEXT, METADATA].includes(att.attribute.id)
    ) || []);

    const metadata = {
        elemType: type,
        varName: data[HNQISMWI_TEMPLATE_MAP.parentName]?.result || '???',
        autoNaming: 'Yes'
    };

    if (type === 'question') {

        metadata.isCompulsory = data[HNQISMWI_TEMPLATE_MAP.isCompulsory] || "Yes"

        parsedDE.optionSet = { id: OPTION_SET_YESNONA };
        parsedDE.optionSetValue = true;
        parsedDE.valueType = 'NUMBER';

        parsedDE.aggregationType = 'SUM';

        /*if (data[HNQISMWI_TEMPLATE_MAP.legend] && data[HNQISMWI_TEMPLATE_MAP.legend] !== "") {
            parsedDE.legendSet = { id: getObjectIdByProperty(data[HNQISMWI_TEMPLATE_MAP.legend], legendSets, 'legendSet') };
            parsedDE.legendSets = [
                { id: getObjectIdByProperty(data[HNQISMWI_TEMPLATE_MAP.legend], legendSets, 'legendSet') }
            ];
        }*/
    }

    if (data[HNQISMWI_TEMPLATE_MAP.feedbackText] && data[HNQISMWI_TEMPLATE_MAP.feedbackText] !== "") {
        parsedDE.attributeValues.push(buildAttributeValue(FEEDBACK_TEXT, data[HNQISMWI_TEMPLATE_MAP.feedbackText]))
    }

    if (data[HNQISMWI_TEMPLATE_MAP.parentQuestion] !== "") {
        metadata.parentQuestion = data[HNQISMWI_TEMPLATE_MAP.parentQuestion];
        parsedDE.parentQuestion = data[HNQISMWI_TEMPLATE_MAP.parentQuestion];   // TO BE REPLACED WITH PARENT DATA ELEMENT'S UID
    }
    if (data[HNQISMWI_TEMPLATE_MAP.parentValue] !== "") {
        metadata.parentValue = data[HNQISMWI_TEMPLATE_MAP.parentValue];
    }

    if (isLabelType(type)) { metadata.labelFormName = data[HNQISMWI_TEMPLATE_MAP.formName] }

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
    const removedObjects = currentData.map(sec => {
        // Section removed -> Increase counter
        if (!sections.find(i_sec => i_sec[impSectionId] == sec[sectionId])) { sectionsSummary.removed++ }
        return sec[countObject].filter(obj =>
            !sections.find(i_sec => i_sec[countObject].find(i_obj => i_obj[impObjId] == obj[objId]))
        )
    }).flat();

    summaryObject.removed = removedObjects.length;
    summaryObject.removedItems = removedObjects;
}

export const getBasicForm = (type) => {
    const result = {
        id: 'basic-form',
        name: 'Basic Form',
        sortOrder: 0,
        importStatus: 'update',
        isBasicForm: true
    };
    if (type === 'TEA') { result.trackedEntityAttributes = [] }
    if (type === 'DE') { result.dataElements = [] }
    return result;
}