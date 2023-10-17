import { NoticeBox } from "@dhis2-ui/notice-box";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ExcelJS from "exceljs/dist/es5/exceljs.browser";
import PropTypes from 'prop-types';
import React, { useState } from "react";
import { HNQIS2_ORIGIN_SERVER_CELL, HNQIS2_TEMPLATE_HEADERS, HNQIS2_TEMPLATE_VERSION_CELL, TEMPLATE_PROGRAM_TYPES, TRACKER_ORIGIN_SERVER_CELL, TRACKER_TEA_HEADERS, TRACKER_TEA_MAP, TRACKER_TEMPLATE_HEADERS, TRACKER_TEMPLATE_VERSION_CELL } from "../../configs/TemplateConstants.js";
import { getHNQIS2MappingList, getTrackerMappingList } from "../../utils/ExcelUtils.js";
import { getProgramDetailsHNQIS2, fileValidation, serverAndVersionValidation, workbookValidation, handleWorksheetReading, getProgramDetailsTracker, buildHNQIS2Summary, buildTrackerSummary, isTracker, countChanges, getBasicForm } from "../../utils/importerUtils.js";
import { setUpProgramStageSections } from "../../utils/Utils.js";
import { readTemplateData } from '../STG_Details/importReader.js';
import FileSelector from "../UIElements/FileSelector.js";
import ImportStatusBox from "../UIElements/ImportStatusBox.js";
import ImportSummary from "../UIElements/ImportSummary.js";
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'

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

    const startImportProcess = (isTracker) => {
        setExecutedTasks([]);
        setButtonDisabled(true);
        setImportResults(undefined);
        setValidationResults(undefined);
        setNotificationError(false);
        let indexModifier = 0;
        if (typeof selectedFile !== 'undefined') {
            if (!tasksHandler({ step: 1, message: 'Validating Template format (XLSX)', initialStatus: false }, fileValidation, { setNotificationError, selectedFile })) { return }

            const workbook = new ExcelJS.Workbook();
            const reader = new FileReader();

            reader.readAsArrayBuffer(selectedFile);
            reader.onload = async () => {

                const buffer = reader.result;
                const loadedWorkbook = await workbook.xlsx.load(buffer)
                const worksheets = tasksHandler(
                    { step: 2, message: 'Validating worksheets in the workbook', initialStatus: true },
                    workbookValidation,
                    { setNotificationError, workbook: loadedWorkbook, isTracker, programSpecificType }
                );

                if (!worksheets?.status) { return }

                const templateWS = worksheets.templateWS;
                const instructionsWS = worksheets.instructionsWS;
                const mappingWS = worksheets.mappingWS;
                const teasWS = worksheets.teasWS;
                const mappingDetails = isTracker
                    ? getTrackerMappingList(mappingWS)
                    : getHNQIS2MappingList(mappingWS);
                const programDetails = !isTracker ? getProgramDetailsHNQIS2(instructionsWS, mappingDetails) : getProgramDetailsTracker(instructionsWS);

                if (!tasksHandler(
                    { step: 3, message: 'Validating Template version and origin server', initialStatus: false },
                    serverAndVersionValidation,
                    {
                        setNotificationError,
                        instructionsWS,
                        isTracker,
                        templateVersionCell: isTracker ? TRACKER_TEMPLATE_VERSION_CELL : HNQIS2_TEMPLATE_VERSION_CELL,
                        originServerCell: isTracker ? TRACKER_ORIGIN_SERVER_CELL : HNQIS2_ORIGIN_SERVER_CELL
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
                        templateHeadersList: (isTracker ? TRACKER_TEMPLATE_HEADERS : HNQIS2_TEMPLATE_HEADERS),
                        startingIndex: (4 + (2 * index) + indexModifier),
                        structureColumn: (isTracker ? 1 : 2),
                        isTrackerTemplate: true
                    });
                
                    if (!currentTemplateData?.status) {
                        stopFlag = true;
                        return;
                    }
                    
                    templateData.push(currentTemplateData);

                });

                if (stopFlag) { return }

                const importSummaryValues =
                    isTracker
                        ? importReadingTracker({ teaData, templateData }, { programDetails, mappingDetails }, programSpecificType)
                        : importReadingHNQIS(templateData, programDetails, mappingDetails);

                if (importSummaryValues.error) {
                    addExecutedTask({ step: 10000, name: importSummaryValues.error, status: 'error' });
                    setNotificationError(true);
                } else {
                    setImportSummary(importSummaryValues);
                    setImportResults(importSummaryValues);
                    setSaveStatus('Validate & Save');
                    setSavedAndValidated(false);
                }
            }
        }
        setButtonDisabled(false);
    }

    const importReadingHNQIS = (templateData, programDetails, mappingDetails) => {
        const importSummaryValues = buildHNQIS2Summary();
        const { importedSections, importedScores } = readTemplateData({
            templateData: templateData[0].data,
            currentData: previous,
            programPrefix: programDetails.dePrefix || programDetails.id,
            optionSets: mappingDetails.optionSets,
            legendSets: mappingDetails.legendSets,
            currentSectionsData,
            mode: TEMPLATE_PROGRAM_TYPES.hnqis2,
            importSummaryValues
        });

        importSummaryValues.program = programDetails;
        importSummaryValues.mapping = mappingDetails;

        const newScoresSection = previous.scoresSection;
        newScoresSection.dataElements = importedScores;
        delete newScoresSection.errors;

        previous.setSections(importedSections);
        previous.setScoresSection(newScoresSection);

        const programMetadata_new = programMetadata.programMetadata;
        programMetadata_new.dePrefix = programDetails.dePrefix;
        programMetadata_new.useCompetencyClass = programDetails.useCompetencyClass;
        programMetadata_new.healthArea = mappingDetails.healthAreas.find(ha => ha.name == programDetails.healthArea)?.code;
        programMetadata.setProgramMetadata(programMetadata_new);

        return importSummaryValues;
    }

    const importReadingTracker = ({ teaData, templateData }, { programDetails, mappingDetails }, programSpecificType) => {
        const importSummaryValues = buildTrackerSummary(programSpecificType, currentStagesData.length);
        const importedStages = [];
        let importError = undefined;
        const skippedSections = [];

        currentStagesData.forEach((currentStage, index) => {
            const stageIndex = templateData.findIndex(elem => elem.stageId === currentStage.id);
            if (stageIndex === -1) {
                importError = `The import process has failed. Some Stages are missing in the imported file (${currentStage.name}), please download a new Template and try again.`;
            } else {
                importSummaryValues.stages[index].stageName = currentStage.name;
                importSummaryValues.stages[index].id = currentStage.id;
                const { importedSections, ignoredSections } = readTemplateData({
                    currentData: { sections: setUpProgramStageSections(previous.stages.find(stage => stage.id === currentStage.id)), stageNumber: index + 1 },
                    templateData: templateData[stageIndex].data,
                    programPrefix: (programDetails.dePrefix) || programDetails.id,
                    optionSets: mappingDetails.optionSets,
                    legendSets: mappingDetails.legendSets,
                    currentSectionsData: setUpProgramStageSections(currentStage.programStageSections),
                    mode: programSpecificType,
                    importSummaryValues: importSummaryValues.stages[index]
                });

                if (ignoredSections.length > 0) { skippedSections.push({ stage: currentStage.name, ignoredSections }) }

                importedStages.push({
                    id: currentStage.id,
                    name: currentStage.name,
                    stageNumber: index + 1,
                    importedSections
                });
            }
        })

        if (importError) { return { error: importError } }

        const importedProgramSections = [];
        const ignoredProgramSections = [];
        if (teaData) {
            let programSectionIndex = -1;
            let isBasicForm = false;
            teaData.forEach((row, rowNum) => {
                switch (row[TRACKER_TEA_MAP.structure]) {
                    case 'Section':
                        if (row[TRACKER_TEA_MAP.programSection] === 'basic-form' && programSectionIndex === -1) { isBasicForm = true }
                        if ((isBasicForm && importedProgramSections.length > 0)) {
                            ignoredProgramSections.push({ name: row[TRACKER_TEA_MAP.name], rowNum: rowNum + 3 });
                            break;
                        }
                        programSectionIndex += 1;
                        importedProgramSections[programSectionIndex] = {
                            id: row[TRACKER_TEA_MAP.programSection] || undefined,
                            name: row[TRACKER_TEA_MAP.name],
                            sortOrder: programSectionIndex,
                            trackedEntityAttributes: [],
                            importStatus: row[TRACKER_TEA_MAP.programSection] ? 'update' : 'new',
                            isBasicForm
                        }
                        row[TRACKER_TEA_MAP.programSection] ? importSummaryValues.teaSummary.programSections.updated++ : importSummaryValues.teaSummary.programSections.new++;
                        break;
                    case 'TEA':
                        if (programSectionIndex === -1) {
                            programSectionIndex += 1;
                            isBasicForm = true;
                            importedProgramSections[programSectionIndex] = getBasicForm('TEA');
                        }
                        importedProgramSections[programSectionIndex].trackedEntityAttributes.push({
                            trackedEntityAttribute: { id: row[TRACKER_TEA_MAP.uid]?.result, name: row[TRACKER_TEA_MAP.name] },
                            valueType: row[TRACKER_TEA_MAP.valueType]?.result,
                            allowFutureDate: row[TRACKER_TEA_MAP.allowFutureDate] === 'Yes',
                            displayInList: row[TRACKER_TEA_MAP.displayInList] === 'Yes',
                            mandatory: row[TRACKER_TEA_MAP.mandatory] === 'Yes',
                            searchable: row[TRACKER_TEA_MAP.searchable] === 'Yes',
                            programTrackedEntityAttribute: row[TRACKER_TEA_MAP.programTea]
                        });
                        break;
                }
            });

            if (ignoredProgramSections.length > 0) { skippedSections.push({ stage: 'Tracked Entity Attributes', ignoredSections: ignoredProgramSections }) }

            const currentTEAData = {
                sections: []
            };
            if (previous.programSections.length === 0) {
                currentTEAData.sections.push({
                    id: 'basic-form',
                    trackedEntityAttributes: previous.teas
                })
            } else {
                previous.programSections.forEach(ps => {
                    const previousPS = {
                        id: ps.id,
                        trackedEntityAttributes: previous.teas.filter(tea =>
                            ps.trackedEntityAttributes.find(psTEA =>
                                psTEA.id === tea.trackedEntityAttribute.id
                            )
                        )
                    };

                    currentTEAData.sections.push(previousPS)
                })
            }

            countChanges({
                sections: importedProgramSections,
                sectionsSummary: importSummaryValues.teaSummary.programSections,
                countObject: 'trackedEntityAttributes',
                summaryObject: importSummaryValues.teaSummary.teas,
                currentData: currentTEAData.sections,
                impObjId: 'programTrackedEntityAttribute',
            })
        }

        importSummaryValues.program = programDetails;
        importSummaryValues.mapping = mappingDetails;
        importSummaryValues.configurations = { teas: importedProgramSections, importedStages, skippedSections };

        return importSummaryValues;
    }

    return (<CustomMUIDialog open={true} maxWidth={isTracker(programSpecificType) ? 'lg' : 'sm'} fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
            Template Importer
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ display: 'flex', flexDirection: isTracker(programSpecificType) ? 'row' : 'column', justifyContent: 'space-between', padding: '1em 2em' }}>
            <div style={{ width: isTracker(programSpecificType) ? '49%' : '100%', maxHeight: '30rem', overflow: 'scroll', overflowX: 'hidden' }}>
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

                {!importSummary &&
                    <FileSelector fileName={fileName} setFile={setFile} acceptedFiles={".xlsx"} />
                }
            </div>

            {importSummary && isTracker(programSpecificType) &&
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
            {!importSummary && <Button variant='outlined' startIcon={<UploadFileIcon />} disabled={buttonDisabled} onClick={() => startImportProcess(isTracker(programSpecificType))}> Import </Button>}
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

