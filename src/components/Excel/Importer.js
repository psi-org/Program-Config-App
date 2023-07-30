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
import { getProgramDetailsHNQIS2, fileValidation, serverAndVersionValidation, workbookValidation, handleWorksheetReading, getProgramDetailsTracker, buildHNQIS2Summary, buildTrackerSummary, isTracker, countChanges } from "./importerUtils";
import { setUpProgramStageSections } from "../../configs/Utils";

//* Tracker Only: currentStagesData
//* HNQIS Only: setSaveStatus, programMetadata, currentSectionsData, setSavedAndValidated
const Importer = (
    {
        displayForm,
        setImportResults,
        importType,
        previous,
        currentStagesData,
        programSpecificType,
        setSaveStatus,
        programMetadata,
        currentSectionsData,
        setSavedAndValidated
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
                        4
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
                        (4 + (2 * index) + indexModifier)
                    )

                    if (!currentTemplateData.status) return;
                    templateData.push(currentTemplateData);

                });

                if (isTracker) {
                    importReadingTracker(teaData, templateData, programDetails, mappingDetails, programSpecificType);
                } else {
                    importReadingHNQIS(templateData, programDetails, mappingDetails)
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

        console.log({ templateData, importedSections, importedScores, importSummaryValues })

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

    const importReadingTracker = (teaData, templateData, programDetails, mappingDetails, programSpecificType) => {
        let importSummaryValues = buildTrackerSummary(programSpecificType, templateData.length);
        let importedStages = [];
        currentStagesData.forEach((currentStage, index) => {
            importSummaryValues.stages[index].stageName = currentStage.name;
            let { importedSections } = readTemplateData({
                teaData,
                currentData: { sections: setUpProgramStageSections(previous.stages.find(stage => stage.id === currentStage.id)) },
                templateData: templateData[index].data,
                programPrefix: programDetails.dePrefix || programDetails.id,
                optionSets: mappingDetails.optionSets,
                legendSets: mappingDetails.legendSets,
                currentSectionsData: setUpProgramStageSections(currentStage.programStageSections),
                mode: programSpecificType,
                importSummaryValues: importSummaryValues.stages[index]
            });
            importedStages.push({
                id: currentStage.id,
                name: currentStage.name,
                importedSections
            })
        })

        //TODO: Reuse importReader content as much as possible
        let importedProgramSections = [];
        if (teaData) {
            let programSectionIndex = -1;
            teaData.forEach(row => {
                switch (row[TRACKER_TEA_MAP.structure]) {
                    case 'Section':
                        programSectionIndex += 1;
                        importedProgramSections[programSectionIndex] = {
                            id: row[TRACKER_TEA_MAP.programSection] || undefined,
                            name: row[TRACKER_TEA_MAP.name],
                            sortOrder: programSectionIndex,
                            trackedEntityAttributes: [],
                            importStatus: row[TRACKER_TEA_MAP.programSection] ? 'update' : 'new',
                            isBasicForm: row[TRACKER_TEA_MAP.programSection] === 'basic-form'
                        }
                        row[TRACKER_TEA_MAP.programSection] ? importSummaryValues.teaSummary.programSections.updated++ : importSummaryValues.teaSummary.programSections.new++;
                        break;
                    case 'TEA':
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
        importSummaryValues.importedProgramSections = importedProgramSections;

        console.warn(importSummaryValues, importedStages)

        /*
    
        console.log({ templateData, mappingDetails, importedSections, importedScores, importSummaryValues })
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
        programMetadata.setProgramMetadata(programMetadata_new);*/
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
            {importSummary && programSpecificType === TEMPLATE_PROGRAM_TYPES.hnqis2 &&
                <ImportSummary title='Import Summary' importCategories={[
                    { name: 'Questions', content: importSummary.questions },
                    { name: 'Sections', content: importSummary.sections },
                    { name: 'Scores', content: importSummary.scores }
                ]} />
            }

            {importSummary && isTracker(programSpecificType) &&
                /*<ImportSummary title=`Import Summary - ${}` importCategories={[
                    { name: 'Sections', content: importSummary.sections },
                    { name: 'Data Elements', content: importSummary.questions }
                ]} />*/<></>
            }

            {!importSummary &&
                <FileSelector fileName={fileName} setFile={setFile} acceptedFiles={".xlsx"} />
            }

        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
            <Button color={!importSummary ? 'error' : 'primary'} variant={!importSummary ? 'text' : 'outlined'} disabled={buttonDisabled} onClick={() => hideForm()}>Close</Button>
            {!importSummary && <Button variant='outlined' startIcon={<UploadFileIcon />} disabled={buttonDisabled} onClick={() => startImportProcess(isTracker(programSpecificType))}> Import </Button>}
        </DialogActions>

    </CustomMUIDialog>)
}

export default Importer;

