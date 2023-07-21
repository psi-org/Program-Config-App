import { ReleaseNotes, ReleaseNotesTracker } from "../../configs/ReleaseNotes";
import { HQNIS2_PROGRAM_TYPE_CELL, TRACKER_PROGRAM_TYPE_CELL } from "../../configs/TemplateConstants";

export const getProgramDetailsHNQIS2 = (ws, mappingDetails) => {
    let program = {};

    program.name = ws.getCell("C12").value;
    program.shortName = ws.getCell("C13").value;
    let result = mappingDetails.programs.filter(prog => prog.name === program.name);
    program.id = result[0].id;
    program.useCompetencyClass = ws.getCell("C14").value;
    program.dePrefix = ws.getCell("C15").value;
    program.healthArea = ws.getCell("C16").value;

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
            task.name = "The Template has been exported from a different server"
            setNotificationError(true);
        }
    } else {
        task.name = "The Template is outdated"
        setNotificationError(true);
    }

    return status;
}

export const templateTypeValidation = (status, task, { setNotificationError, instructionsWS, isTracker, specificType }) => {

    const providedTemplate = isTracker
        ? instructionsWS.getCell(TRACKER_PROGRAM_TYPE_CELL)
        : instructionsWS.getCell(HQNIS2_PROGRAM_TYPE_CELL);

    if (providedTemplate.value === specificType) {
        task.status = "success";
        status = true;
    } else {
        task.name = `The provided Template cannot be imported in the current Program`
        setNotificationError(true);
    }

    return status;
}

//! Check how Tracer/Event is defined, use specificType?
export const workbookValidation = (status, task, { setNotificationError, workbook, isTracker }) => {

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
                        isEvent = worksheet.getCell(TRACKER_PROGRAM_TYPE_CELL).value === 'Event Program';
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

    let errorsArray = [];
    if (!instructionsWS) errorsArray.push('Instructions');
    if (isTracker && !teasWS && !isEvent) errorsArray.push('TEAs');
    if (templateWS.length === 0) errorsArray.push((isTracker && !isEvent) ? 'Stage Template(s)' : 'Template');
    if (!mappingWS) errorsArray.push('Mapping');
    if (errorsArray.length > 0) {
        task.status = "error";
        status = false;
        task.name = `Missing the following tab(s): ${errorsArray.join(', ')}.`;
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

const getWorksheetData = (status, task, { currentWorksheet, templateHeadersList }) => {

    let templateData = [];
    let dataRow = 3;

    currentWorksheet.eachRow((row, rowIndex) => {
        if (rowIndex >= dataRow && row.values[1]) {
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

export const handleWorksheetReading = (tasksHandler, currentWorksheet, setNotificationError, headers, templateHeadersList, startingIndex) => {
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
        `Extracting data from ${currentWorksheet.name}`,
        true,
        getWorksheetData,
        {
            currentWorksheet,
            templateHeadersList
        }
    );

}