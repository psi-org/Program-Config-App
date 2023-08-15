import { useState } from "react";
import ExcelJS from "exceljs/dist/es5/exceljs.browser";
import ImportStatusBox from "../UIElements/ImportStatusBox";
import { HNQIS2_ORIGIN_SERVER_CELL, HNQIS2_TEMPLATE_HEADERS, HNQIS2_TEMPLATE_VERSION_CELL, TEMPLATE_PROGRAM_TYPES, TRACKER_ORIGIN_SERVER_CELL, TRACKER_TEA_HEADERS, TRACKER_TEA_MAP, TRACKER_TEMPLATE_HEADERS, TRACKER_TEMPLATE_VERSION_CELL } from "../../configs/TemplateConstants";
import { readTemplateData } from '../STG_Details/importReader';

import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImportSummary from "../UIElements/ImportSummary";
import { getHNQIS2MappingList, getTrackerMappingList } from "../../configs/ExcelUtils";
import FileSelector from "../UIElements/FileSelector";
import { getProgramDetailsHNQIS2, fileValidation, serverAndVersionValidation, workbookValidation, handleWorksheetReading, getProgramDetailsTracker, buildHNQIS2Summary, buildTrackerSummary, isTracker, countChanges, getBasicForm } from "./importerUtils";
import { buildBasicFormStage, setUpProgramStageSections } from "../../configs/Utils";

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

    const tasksHandler = (step, message, initialStatus, actionFunction, params = {}) => {
        let task = { step, name: message, status: initialStatus ? 'success' : 'error' };
        setCurrentTask(task.name);

        let result = actionFunction(initialStatus, task, { setNotificationError, ...params });

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
            if (!tasksHandler(1, 'Validating Template format (XLSX)', false, fileValidation, { setNotificationError, selectedFile })) return;

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
                    { setNotificationError, workbook: loadedWorkbook, isTracker, programSpecificType }
                );

                if (!worksheets.status) return;

                const templateWS = worksheets.templateWS;
                const instructionsWS = worksheets.instructionsWS;
                const mappingWS = worksheets.mappingWS;
                const teasWS = worksheets.teasWS;
                const mappingDetails = isTracker
                    ? getTrackerMappingList(mappingWS)
                    : getHNQIS2MappingList(mappingWS);
                let programDetails = !isTracker ? getProgramDetailsHNQIS2(instructionsWS, mappingDetails) : getProgramDetailsTracker(instructionsWS);

                if (!tasksHandler(
                    3,
                    'Validating Template version and origin server',
                    false,
                    serverAndVersionValidation,
                    {
                        setNotificationError,
                        instructionsWS,
                        isTracker,
                        templateVersionCell: isTracker ? TRACKER_TEMPLATE_VERSION_CELL : HNQIS2_TEMPLATE_VERSION_CELL,
                        originServerCell: isTracker ? TRACKER_ORIGIN_SERVER_CELL : HNQIS2_ORIGIN_SERVER_CELL
                    }
                )) return;

                let teaData;
                if (teasWS) {
                    indexModifier = 2;

                    const headers = teasWS.getRow(1).values;
                    headers.shift();

                    teaData = handleWorksheetReading(
                        tasksHandler,
                        teasWS,
                        setNotificationError,
                        headers,
                        TRACKER_TEA_HEADERS,
                        4,
                        1
                    ).data
                }

                let templateData = [];

                templateWS.forEach((currentTemplate, index) => {

                    const headers = currentTemplate.getRow(1).values;
                    headers.shift();

                    let currentTemplateData = handleWorksheetReading(
                        tasksHandler,
                        currentTemplate,
                        setNotificationError,
                        headers,
                        (isTracker ? TRACKER_TEMPLATE_HEADERS : HNQIS2_TEMPLATE_HEADERS),
                        (4 + (2 * index) + indexModifier),
                        (isTracker ? 1 : 2),
                        true
                    )
                    if (!currentTemplateData.status) return;
                    templateData.push(currentTemplateData);

                });

                let importSummaryValues =
                    isTracker
                        ? importReadingTracker(teaData, templateData, programDetails, mappingDetails, programSpecificType)
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
        let importSummaryValues = buildHNQIS2Summary();
        let { importedSections, importedScores } = readTemplateData({
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
        
        return importSummaryValues;
    }

    const importReadingTracker = (teaData, templateData, programDetails, mappingDetails, programSpecificType) => {
        let importSummaryValues = buildTrackerSummary(programSpecificType, currentStagesData.length);
        let importedStages = [];
        let importError = undefined;

        currentStagesData.forEach((currentStage, index) => {
            let stageIndex = templateData.findIndex(elem => elem.stageId === currentStage.id);
            if (stageIndex === -1) {
                importError = `The import process has failed. Some Stages are missing in the imported file (${currentStage.name}), please download a new Template and try again.`;
            } else {
                importSummaryValues.stages[index].stageName = currentStage.name;
                let { importedSections } = readTemplateData({
                    teaData,
                    currentData: { sections: setUpProgramStageSections(previous.stages.find(stage => stage.id === currentStage.id)), stageNumber: index + 1 },
                    templateData: templateData[stageIndex].data,
                    programPrefix: (programDetails.dePrefix) || programDetails.id,
                    optionSets: mappingDetails.optionSets,
                    legendSets: mappingDetails.legendSets,
                    currentSectionsData: setUpProgramStageSections(currentStage.programStageSections),
                    mode: programSpecificType,
                    importSummaryValues: importSummaryValues.stages[index]
                });

                importedStages.push({
                    id: currentStage.id,
                    name: currentStage.name,
                    stageNumber: index + 1,
                    importedSections
                });
            }
        })

        if (importError) return { error: importError };

        let importedProgramSections = [];
        if (teaData) {
            let programSectionIndex = -1;
            let isBasicForm = false;
            teaData.forEach(row => {
                switch (row[TRACKER_TEA_MAP.structure]) {
                    case 'Section':
                        if (row[TRACKER_TEA_MAP.programSection] === 'basic-form' && programSectionIndex === -1) isBasicForm = true;
                        if ((isBasicForm && importedProgramSections.length > 0)) break;
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

            let currentTEAData = {
                sections: []
            };
            if (previous.programSections.length === 0) {
                currentTEAData.sections.push({
                    id: 'basic-form',
                    trackedEntityAttributes: previous.teas
                })
            } else {
                previous.programSections.forEach(ps => {
                    let previousPS = {
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
        importSummaryValues.configurations = { teas: importedProgramSections, importedStages };

        return importSummaryValues;
    }

    return (<CustomMUIDialog open={true} maxWidth={isTracker(programSpecificType)?'lg':'sm'} fullWidth={true} >
        <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => hideForm()}>
            Template Importer
        </CustomMUIDialogTitle >
        <DialogContent dividers style={{ display: 'flex', flexDirection: isTracker(programSpecificType) ?'row':'column', justifyContent: 'space-between', padding: '1em 2em' }}>
            <div style={{ width: isTracker(programSpecificType) ? '49%' : '100%', maxHeight: '30rem', overflow: 'scroll', overflowX: 'hidden' }}>
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
                <div style={{ width: '49%', maxHeight: '30rem', overflow: 'scroll', overflowX: 'hidden'}}>
                    {importSummary.teaSummary && <ImportSummary title={`Import Summary - Tracked Entity Attributes`} importCategories={[
                        { name: 'Sections', content: importSummary.teaSummary.programSections },
                        { name: 'Tracked Entity Attributes', content: importSummary.teaSummary.teas }
                    ]} />}
                    {importSummary.stages.map((stage, index) => {
                        return <ImportSummary key={stage.stageName+index} title={`Import Summary - ${stage.stageName}`} importCategories={[
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

export default Importer;

