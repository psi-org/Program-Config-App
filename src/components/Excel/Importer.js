import { useState } from "react";
import ExcelJS from "exceljs/dist/es5/exceljs.browser";
import ImportStatusBox from "../UIElements/ImportStatusBox";
import { HNQIS2_TEMPLATE_HEADERS } from "../../configs/TemplateConstants";
import { readTemplateData } from '../STG_Details/importReader';

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { ReleaseNotes } from "../../configs/ReleaseNotes";
import ImportSummary from "../UIElements/ImportSummary";
import { getHNQIS2MappingList } from "../../configs/ExcelUtils";
import { HNQIS2_ORIGIN_SERVER_CELL, HNQIS2_TEMPLATE_VERSION_CELL } from "../../configs/Constants";
import FileSelector from "../UIElements/FileSelector";


const Importer = ({ setSavedAndValidated, displayForm, previous, setSaveStatus, setImportResults, programMetadata, currentSectionsData }) => {
    
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [currentTask, setCurrentTask] = useState(undefined);
    const [executedTasks, setExecutedTasks] = useState([]);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [isNotificationError, setNotificationError] = useState(false);
    const [fileName, setFileName] = useState('No file selected...');

    const [importSummary, setImportSummary] = useState(false);

    const setFile = (files) => {
        setNotificationError(false);
        setExecutedTasks([]);
        setFileName(files[0].name);
        setSelectedFile(files[0]);
    }

    const addExecutedTask = (Task) => {
        setExecutedTasks(executedTasks => [...executedTasks, Task]);
    }

    function hideForm() {
        displayForm(false);
    }

    const startImportProcess = () => {
        setExecutedTasks([]);
        setButtonDisabled(true);
        if (typeof selectedFile !== 'undefined') {
            if (!tasksHandler(1, 'Validating Template format (XLSX)', false, fileValidation)) return;

            const workbook = new ExcelJS.Workbook();
            const reader = new FileReader();

            reader.readAsArrayBuffer(selectedFile);
            reader.onload = async () => {

                const buffer = reader.result;
                let loadedWorkbook = await workbook.xlsx.load(buffer)
                let worksheets = tasksHandler(
                    2,
                    'Validating worksheets in the workbook',
                    true,
                    workbookValidation,
                    { workbook: loadedWorkbook }
                );

                if (!worksheets.status) return;

                const templateWS = worksheets.templateWS;
                const instructionsWS = worksheets.instructionsWS;
                const mappingWS = worksheets.mappingWS;
                const mappingDetails = getHNQIS2MappingList(mappingWS);
                const programDetails = getProgramDetails(instructionsWS, mappingDetails);

                if (!tasksHandler(
                    3,
                    'Validating Template version and origin server',
                    false,
                    serverAndVersionValidation,
                    {
                        instructionsWS,
                        templateVersionCell: HNQIS2_TEMPLATE_VERSION_CELL,
                        originServerCell: HNQIS2_ORIGIN_SERVER_CELL
                    }
                )) return;

                const headers = templateWS.getRow(1).values;
                headers.shift();

                if (!tasksHandler(4, 'Validating worksheet columns', true, worksheetValidation, { headers, templateHeadersList: HNQIS2_TEMPLATE_HEADERS })) return;

                let templateData = tasksHandler(5, 'Extracting data from the Template', true, getTemplateData, { templateWS, templateHeadersList: HNQIS2_TEMPLATE_HEADERS });
                if (!templateData.status) return;

                // Start import reading
                let { importedSections, importedScores, importSummaryValues } = readTemplateData(
                    templateData.data,
                    previous,
                    programDetails.dePrefix,
                    mappingDetails.optionSets,
                    mappingDetails.legendSets,
                    currentSectionsData
                );

                importSummaryValues.program = programDetails;
                importSummaryValues.mapping = mappingDetails;

                // Set new sections & questions
                setImportSummary(importSummaryValues);
                setImportResults(importSummaryValues);
                setSaveStatus('Validate & Save');
                setSavedAndValidated(false);

                let newScoresSection = previous.scoresSection;
                newScoresSection.dataElements = importedScores;
                delete newScoresSection.errors;

                previous.setSections(importedSections);
                previous.setScoresSection(newScoresSection);

                let programMetadata_new = programMetadata.programMetadata;
                programMetadata_new.dePrefix = programDetails.dePrefix;
                programMetadata_new.useCompetencyClass = programDetails.useCompetencyClass;
                programMetadata_new.healthArea = mappingDetails.healthAreas.find(ha => ha.name == programDetails.healthArea)?.code;
                programMetadata.setProgramMetadata(programMetadata_new);
            }
        }
        setButtonDisabled(false);
    }

    const getProgramDetails = (ws, mappingDetails) => {
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

    const tasksHandler = (step, message, initialStatus, actionFunction, params = {}) => {
        let task = { step, name: message, status: initialStatus ? 'success' : 'error' };
        setCurrentTask(task.name);

        let result = actionFunction(initialStatus, task, params);

        addExecutedTask(task);
        setCurrentTask(null);
        return result;
    }

    const fileValidation = (status, task, { }) => {

        if (selectedFile.name.endsWith('xlsx')) {
            task.status = "success";
            status = true;
        } else {
            task.name = "The provided file format is not XLSX";
            setNotificationError(true);
        }
        return status;

    }

    const serverAndVersionValidation = (status, task, { instructionsWS, templateVersionCell, originServerCell }) => {
        const templateVersion = instructionsWS.getCell(templateVersionCell).value;
        if (templateVersion === ReleaseNotes.at(-1).version) {
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

    const workbookValidation = (status, task, { workbook }) => {

        let templateWS;
        let instructionsWS;
        let mappingWS;
        workbook.eachSheet((worksheet, sheetId) => {
            let id = worksheet.getCell("A1").value;
            switch (id) {
                case 'I':
                    instructionsWS = worksheet;
                    break;
                case 'Parent Name':
                    templateWS = worksheet;
                    break;
                case 'M':
                    mappingWS = worksheet;
                    break;
                default:
                    break;
            }
        });

        let errorsArray = [];
        if (!instructionsWS) errorsArray.push('Instructions');
        if (!templateWS) errorsArray.push('Template');
        if (!mappingWS) errorsArray.push('Mapping');
        if (errorsArray.length > 0) {
            task.status = "error";
            status = false;
            task.name = `Missing the following tab(s): ${errorsArray.join(', ')}.`
            setNotificationError(true);
        }

        return { status, templateWS, instructionsWS, mappingWS };
    }

    const worksheetValidation = (status, task, { headers, templateHeadersList }) => {
        headers.forEach((value, key) => {
            if (value !== templateHeadersList[key]) {
                status = false;
                task.status = "error";
                task.name = 'Some Template columns are missing or misplaced.';
                setNotificationError(true);
            }
        });
        return status;
    }

    const getTemplateData = (status, task, { templateWS, templateHeadersList }) => {

        let templateData = [];
        let dataRow = 3;

        templateWS.eachRow((row, rowIndex) => {
            if (rowIndex >= dataRow) {
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

    return (<CustomMUIDialog open={true} maxWidth='sm' fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
            Template Importer
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ padding: '1em 2em' }}>

            {(currentTask || executedTasks.length > 0) &&
                <div style={{ width: '100%', marginBottom: '1em' }}>
                    <ImportStatusBox
                        title='HNQIS Configuration - Import Status'
                        currentTask={currentTask}
                        executedTasks={executedTasks}
                        isError={isNotificationError}
                    />
                </div>
            }
            {(importSummary) &&
                <ImportSummary title='Import Summary' importCategories={[
                    { name: 'Questions', content: importSummary.questions },
                    { name: 'Sections', content: importSummary.sections },
                    { name: 'Scores', content: importSummary.scores }
                ]} />
            }

            {!importSummary &&
                <FileSelector fileName={fileName} setFile={setFile} acceptedFiles={".xlsx"}/>
            }

        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color={!importSummary ? 'error' : 'primary'} variant={!importSummary ? 'text' : 'outlined'} disabled={buttonDisabled} onClick={() => hideForm()}>Close</Button>
            {!importSummary && <Button variant='outlined' startIcon={<UploadFileIcon />} disabled={buttonDisabled} onClick={() => startImportProcess()}> Import </Button>}
        </DialogActions>

    </CustomMUIDialog>)
}

export default Importer;