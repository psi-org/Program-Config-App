import { NoticeBox } from "@dhis2-ui/notice-box";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ExcelJS from "exceljs/dist/es5/exceljs.browser";
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { HNQIS2_ORIGIN_SERVER_CELL, HNQIS2_TEMPLATE_HEADERS, HNQIS2_TEMPLATE_VERSION_CELL, TEMPLATE_PROGRAM_TYPES, TRACKER_ORIGIN_SERVER_CELL, TRACKER_TEA_HEADERS, TRACKER_TEMPLATE_HEADERS, TRACKER_TEMPLATE_VERSION_CELL } from "../../configs/TemplateConstants.js";
import { getHNQIS2MappingList, getTrackerMappingList } from "../../utils/ExcelUtils.js";
import { getProgramDetailsHNQIS2, fileValidation, serverAndVersionValidation, workbookValidation, handleWorksheetReading, getProgramDetailsTracker, isTrackerType} from "../../utils/importerUtils.js";
import FileSelector from "../UIElements/FileSelector.js";
import ImportStatusBox from "../UIElements/ImportStatusBox.js";
import ImportSummary from "../UIElements/ImportSummary.js";
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'
import { importReadingHNQIS, importReadingHNQISMWI, importReadingTracker } from "./ImportReading.js";

const getSettings = (programType) => {
    if (isTrackerType(programType)) {
        return {
            isTracker: true,
            mappingDetails: getTrackerMappingList,
            programDetails: getProgramDetailsTracker,
            templateVersionCell: TRACKER_TEMPLATE_VERSION_CELL,
            originServerCell: TRACKER_ORIGIN_SERVER_CELL,
            templateHeadersList: TRACKER_TEMPLATE_HEADERS,
            structureColumn: 1,
            importReading: importReadingTracker
        }
    } else if (programType === TEMPLATE_PROGRAM_TYPES.hnqis2) {
        return {
            isTracker: false,
            mappingDetails: getHNQIS2MappingList,
            programDetails: getProgramDetailsHNQIS2,
            templateVersionCell: HNQIS2_TEMPLATE_VERSION_CELL,
            originServerCell: HNQIS2_ORIGIN_SERVER_CELL,
            templateHeadersList: HNQIS2_TEMPLATE_HEADERS,
            structureColumn: 2,
            importReading: importReadingHNQIS
        }
    } else if (programType === TEMPLATE_PROGRAM_TYPES.hnqismwi) {
        return {
            isTracker: false,
            mappingDetails: getHNQIS2MappingList,
            programDetails: getProgramDetailsHNQIS2,
            templateVersionCell: HNQIS2_TEMPLATE_VERSION_CELL,
            originServerCell: HNQIS2_ORIGIN_SERVER_CELL,
            templateHeadersList: HNQIS2_TEMPLATE_HEADERS,
            structureColumn: 2,
            importReading: importReadingHNQISMWI
        }
    }
}

//* Tracker Only: currentStagesData
//* HNQIS Only: setSaveStatus, programMetadata, currentSectionsData, setSavedAndValidated
const Importer = (
    {
        displayForm,
        setImportResults,
        setValidationResults,
        previous,
        currentStagesData,
        programSpecificType,
        setSaveStatus,
        programMetadata,
        currentSectionsData,
        setSavedAndValidated,
    }
) => {

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
        setFileName(files[0]?.name || 'No file selected...');
        setSelectedFile(files[0]);
    }

    const addExecutedTask = (Task) => {
        setExecutedTasks(executedTasks => [...executedTasks, Task]);
    }

    function hideForm() {
        displayForm(false);
    }

    const tasksHandler = ({ step, message, initialStatus }, actionFunction, params = {}) => {
        const task = { step, name: message, status: initialStatus ? 'success' : 'error' };
        setCurrentTask(task.name);

        const result = actionFunction(initialStatus, task, { setNotificationError, ...params });

        addExecutedTask(task);
        setCurrentTask(null);
        return result;
    }

    const startImportProcess = (programType) => {
        setExecutedTasks([]);
        setButtonDisabled(true);
        setImportResults(undefined);
        setValidationResults(undefined);
        setNotificationError(false);

        console.log(programType);
        const settings = getSettings(programType);
        
        let indexModifier = 0;
        if (typeof selectedFile !== 'undefined') {
            if (!tasksHandler(
                { step: 1, message: 'Validating Template format (XLSX)', initialStatus: false },
                fileValidation,
                { setNotificationError, selectedFile }
            )) { return };

            const workbook = new ExcelJS.Workbook();
            const reader = new FileReader();

            reader.readAsArrayBuffer(selectedFile);
            reader.onload = async () => {

                const buffer = reader.result;
                const loadedWorkbook = await workbook.xlsx.load(buffer)
                const worksheets = tasksHandler(
                    { step: 2, message: 'Validating worksheets in the workbook', initialStatus: true },
                    workbookValidation,
                    {
                        setNotificationError,
                        workbook: loadedWorkbook,
                        isTracker: settings.isTracker,
                        programSpecificType
                    }
                );

                if (!worksheets?.status) { return }

                const templateWS = worksheets.templateWS;
                const instructionsWS = worksheets.instructionsWS;
                const mappingWS = worksheets.mappingWS;
                const teasWS = worksheets.teasWS;
                const mappingDetails = settings.mappingDetails(mappingWS);
                const programDetails = settings.programDetails(instructionsWS, mappingDetails);

                if (!tasksHandler(
                    { step: 3, message: 'Validating Template version and origin server', initialStatus: false },
                    serverAndVersionValidation,
                    {
                        setNotificationError,
                        instructionsWS,
                        isTracker: settings.isTracker,
                        templateVersionCell: settings.templateVersionCell,
                        originServerCell: settings.originServerCell
                    }
                )) { return }

                let teaData;
                if (teasWS) {
                    indexModifier = 2;

                    const headers = teasWS.getRow(1).values;
                    headers.shift();

                    teaData = handleWorksheetReading({
                        tasksHandler,
                        currentWorksheet: teasWS,
                        setNotificationError,
                        headers,
                        templateHeadersList: TRACKER_TEA_HEADERS,
                        startingIndex: 4,
                        structureColumn: 1
                    }).data
                }

                const templateData = [];
                let stopFlag = false;

                templateWS.forEach((currentTemplate, index) => {

                    const headers = currentTemplate.getRow(1).values;
                    headers.shift();

                    const currentTemplateData = handleWorksheetReading({
                        tasksHandler,
                        currentWorksheet: currentTemplate,
                        setNotificationError,
                        headers,
                        templateHeadersList: settings.templateHeadersList,
                        startingIndex: (4 + (2 * index) + indexModifier),
                        structureColumn: settings.structureColumn,
                        isTrackerTemplate: true
                    });
                
                    if (!currentTemplateData?.status) {
                        stopFlag = true;
                        return;
                    }
                    
                    templateData.push(currentTemplateData);

                });

                if (stopFlag) { return }

                const importSummaryValues = settings.importReading(
                    { teaData, templateData },
                    { programDetails, mappingDetails },
                    { programSpecificType, programMetadata, currentSectionsData, previous, currentStagesData }
                );

                if (importSummaryValues.error) {
                    addExecutedTask({ step: 10000, name: importSummaryValues.error, status: 'error' });
                    setNotificationError(true);
                    return;
                }

                setImportSummary(importSummaryValues);
                setImportResults(importSummaryValues);
                setSaveStatus('Validate & Save');
                setSavedAndValidated(false);
            }
        }
        setButtonDisabled(false);
    }

    return (<CustomMUIDialog open={true} maxWidth={isTrackerType(programSpecificType) ? 'lg' : 'sm'} fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
            Template Importer
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ display: 'flex', flexDirection: isTrackerType(programSpecificType) ? 'row' : 'column', justifyContent: 'space-between', padding: '1em 2em' }}>
            <div style={{ width: isTrackerType(programSpecificType) ? '49%' : '100%', maxHeight: '30rem', overflow: 'scroll', overflowX: 'hidden' }}>
                {(currentTask || executedTasks.length > 0) &&
                    <div style={{ width: '100%', marginBottom: '1em' }}>
                        <ImportStatusBox
                            title='Configurations File - Import Status'
                            currentTask={currentTask}
                            executedTasks={executedTasks}
                            isError={isNotificationError}
                        />
                        {importSummary?.configurations?.skippedSections?.length > 0 &&
                            <div style={{ width: '100%', marginTop: '0.5em' }}>
                                <NoticeBox title={'One or more Program Stages were imported as Basic Form. To keep the Stage Sections, delete the light blue row and make sure that the first available row is a Section in the following Stage Template(s):'} warning={true}>
                                    <ul>{[...new Set(importSummary.configurations.skippedSections.map(ss => ss.stage))].map(stage => <li key={stage}>{stage}</li>)}</ul>
                                </NoticeBox>
                            </div>
                        }
                    </div>
                }
                {importSummary && programSpecificType === TEMPLATE_PROGRAM_TYPES.hnqis2 &&
                    <ImportSummary title='Import Summary' importCategories={[
                        { name: 'Questions', content: importSummary.questions },
                        { name: 'Sections', content: importSummary.sections },
                        { name: 'Scores', content: importSummary.scores }
                    ]} />
                }

                {importSummary && programSpecificType === TEMPLATE_PROGRAM_TYPES.hnqismwi &&
                    <ImportSummary title='Import Summary' importCategories={[
                        { name: 'Sections', content: importSummary.sections },
                        { name: 'Data Elements', content: importSummary.questions }
                    ]} />
                }

                {!importSummary &&
                    <FileSelector fileName={fileName} setFile={setFile} acceptedFiles={".xlsx"} />
                }
            </div>

            {importSummary && isTrackerType(programSpecificType) &&
                <div style={{ width: '49%', maxHeight: '30rem', overflow: 'scroll', overflowX: 'hidden' }}>
                    {importSummary.teaSummary && <ImportSummary title={`Import Summary - Tracked Entity Attributes`} importCategories={[
                        { name: 'Sections', content: importSummary.teaSummary.programSections },
                        { name: 'Tracked Entity Attributes', content: importSummary.teaSummary.teas }
                    ]} />}
                    {importSummary.stages.map((stage, index) => {
                        return <ImportSummary key={stage.stageName + index} title={`Import Summary - ${stage.stageName}`} importCategories={[
                            { name: 'Sections', content: stage.sections },
                            { name: 'Stage Data Elements', content: stage.dataElements }
                        ]} />
                    })}
                </div>
            }

        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color={!importSummary ? 'error' : 'primary'} variant={!importSummary ? 'text' : 'outlined'} disabled={buttonDisabled} onClick={() => hideForm()}>Close</Button>
            {!importSummary && <Button variant='outlined' startIcon={<UploadFileIcon />} disabled={buttonDisabled} onClick={() => startImportProcess(programSpecificType)}> Import </Button>}
        </DialogActions>

    </CustomMUIDialog>)
}

Importer.propTypes = {
    currentSectionsData: PropTypes.array,
    currentStagesData: PropTypes.array,
    displayForm: PropTypes.func,
    previous: PropTypes.object,
    programMetadata: PropTypes.object,
    programSpecificType: PropTypes.string,
    setImportResults: PropTypes.func,
    setSaveStatus: PropTypes.func,
    setSavedAndValidated: PropTypes.func,
    setValidationResults: PropTypes.func
}

export default Importer;

