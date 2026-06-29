import { NoticeBox } from '@dhis2-ui/notice-box';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  HNQIS2_ORIGIN_SERVER_CELL,
  HNQIS2_TEMPLATE_HEADERS,
  HNQIS2_TEMPLATE_VERSION_CELL,
  TRACKER_ORIGIN_SERVER_CELL,
  TRACKER_TEA_HEADERS,
  TRACKER_TEA_MAP,
  TRACKER_TEMPLATE_HEADERS,
  TRACKER_TEMPLATE_VERSION_CELL,
} from '../../configs/TemplateConstants.js';
import type { PcaSection } from '../../types';
import {
  getHNQIS2MappingList,
  getTrackerMappingList,
} from '../../utils/ExcelUtils.js';
import {
  getProgramDetailsHNQIS2,
  fileValidation,
  serverAndVersionValidation,
  workbookValidation,
  handleWorksheetReading,
  getProgramDetailsTracker,
  buildHNQIS2Summary,
  buildTrackerSummary,
  isTracker,
  countChanges,
  getBasicForm,
} from '../../utils/importerUtils.js';
import { setUpProgramStageSections } from '../../utils/Utils.jsx';
import { readTemplateData } from '../STG_Details/importReader.js';
import CustomMUIDialog from '../UIElements/CustomMUIDialog.js';
import CustomMUIDialogTitle from '../UIElements/CustomMUIDialogTitle.jsx';
import FileSelector from '../UIElements/FileSelector.jsx';
import ImportStatusBox from '../UIElements/ImportStatusBox.jsx';
import ImportSummary from '../UIElements/ImportSummary.jsx';

interface SummaryObject {
  new: number;
  updated: number;
  removed: number;
}

// StageSummary extended to include tracker stage identity fields
interface StageSummary {
  stageName?: string;
  id?: string;
  sections: SummaryObject;
  dataElements: SummaryObject;
}

interface ImportResults {
  stages?: StageSummary[];
  teaSummary?: {
    programSections: SummaryObject;
    teas: SummaryObject;
  };
  questions?: SummaryObject;
  sections?: SummaryObject;
  scores?: SummaryObject;
}

export interface TrackedEntityAttribute {
  id: string;
  name: string;
}

interface PreviousData {
  teas: {
    trackedEntityAttribute: TrackedEntityAttribute;
    valueType: string;
    allowFutureDate: boolean;
    displayInList: boolean;
    mandatory: boolean;
    searchable: boolean;
  }[];
  scoresSection: PcaSection;
  stages: { id: string }[];
  setSections: (sections: PcaSection[]) => void;
  setScoresSection: (scoresSection: PcaSection) => void;
  programSections: {
    id: string;
    trackedEntityAttributes: TrackedEntityAttribute[];
  }[];
}

type CurrentStagesData = {
  name: string;
  id: string;
  programStageSections: {
    id: string;
    name: string;
    displayName: string;
    sortOrder: number;
    dataElements: { id: string }[];
  }[];
}[];

enum ProgramTypesEnum {
  TRACKER = 'Tracker Program',
  HNQIS2 = 'HNQIS2',
  HNQIS3 = 'HNQIS3',
  EVENT = 'Event Program',
}

export interface ProgramMetadataHandlers {
  setProgramMetadata: (programMetadata: ProgramMetadata) => void;
  programMetadata: ProgramMetadata;
}

export interface ProgramMetadata {
  dePrefix: string;
  useCompetencyClass: boolean;
  healthArea: { name: string }[];
}

export type CurrentSectionsData = {
  dataElements: {
    sharing: string;
    attributeValues: unknown[];
    style: unknown;
    categoryCombo: unknown;
    id: string;
  }[];
}[];

interface Task {
  step: number;
  name: string;
  status: string;
}

interface TaskHandlerConfig {
  step: number;
  message: string;
  initialStatus: boolean;
}

interface TemplateWorksheetData {
  data: unknown[];
  stageId?: string;
  status: boolean;
}

// HNQIS2/HNQIS3 import result
interface HNQISSummary {
  questions: SummaryObject;
  sections: SummaryObject;
  scores: SummaryObject;
  program?: unknown;
  mapping?: unknown;
  configurations?: {
    skippedSections?: { stage: string }[];
  };
}

// Tracker / Event import result
interface TrackerSummary {
  stages: StageSummary[];
  teaSummary?: {
    programSections: SummaryObject;
    teas: SummaryObject;
  };
  program?: unknown;
  mapping?: unknown;
  configurations?: {
    teas: unknown[];
    importedStages: unknown[];
    skippedSections: { stage: string }[];
  };
}

type ImportSummaryState = HNQISSummary | TrackerSummary;

//* Tracker Only: currentStagesData
//* HNQIS Only: setSaveStatus, programMetadata, currentSectionsData, setSavedAndValidated
const Importer = ({
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
}: {
  displayForm: (open: boolean) => void;
  setImportResults: (
    results?: ImportResults | { stages?: StageSummary[] } | { error: string }
  ) => void;
  setValidationResults: (result?: never) => void;
  previous: PreviousData;
  currentStagesData: CurrentStagesData;
  programSpecificType: ProgramTypesEnum;
  setSaveStatus: (status: string) => void;
  programMetadata: ProgramMetadataHandlers;
  currentSectionsData: CurrentSectionsData;
  setSavedAndValidated: (savedAndValidated: boolean) => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [currentTask, setCurrentTask] = useState<string | null | undefined>(
    undefined
  );
  const [executedTasks, setExecutedTasks] = useState<Task[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isNotificationError, setNotificationError] = useState(false);
  const [fileName, setFileName] = useState('No file selected...');

  const [importSummary, setImportSummary] = useState<
    ImportSummaryState | undefined
  >(undefined); //TODO: Find out why we're using boolean here

  const setFile = (files: File[]) => {
    setNotificationError(false);
    setExecutedTasks([]);
    setFileName(files[0]?.name || 'No file selected...');
    setSelectedFile(files[0]);
  };

  const addExecutedTask = (Task: Task) => {
    setExecutedTasks((executedTasks) => [...executedTasks, Task]);
  };

  function hideForm() {
    displayForm(false);
  }

  const tasksHandler = <T,>(
    { step, message, initialStatus }: TaskHandlerConfig,
    actionFunction: (
      status: boolean,
      task: Task,
      params: Record<string, unknown>
    ) => T,
    params: Record<string, unknown> = {}
  ): T => {
    const task: Task = {
      step,
      name: message,
      status: initialStatus ? 'success' : 'error',
    };
    setCurrentTask(task.name);

    const result = actionFunction(initialStatus, task, {
      setNotificationError,
      ...params,
    });

    addExecutedTask(task);
    setCurrentTask(null);
    return result;
  };

  const startImportProcess = (isTracker: boolean) => {
    setExecutedTasks([]);
    setButtonDisabled(true);
    setImportResults(undefined);
    setValidationResults(undefined);
    setNotificationError(false);
    let indexModifier = 0;
    if (selectedFile) {
      if (
        !tasksHandler(
          {
            step: 1,
            message: 'Validating Template format (XLSX)',
            initialStatus: false,
          },
          fileValidation as unknown as (
            status: boolean,
            task: Task,
            params: Record<string, unknown>
          ) => boolean,
          { setNotificationError, selectedFile }
        )
      ) {
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const reader = new FileReader();

      reader.readAsArrayBuffer(selectedFile);
      reader.onload = async () => {
        const buffer = reader.result;
        const loadedWorkbook = await workbook.xlsx.load(buffer);
        const worksheets = tasksHandler(
          {
            step: 2,
            message: 'Validating worksheets in the workbook',
            initialStatus: true,
          },
          workbookValidation as unknown as (
            status: boolean,
            task: Task,
            params: Record<string, unknown>
          ) =>
            | {
                status: boolean;
                templateWS: { getRow: (n: number) => { values: unknown[] } }[];
                instructionsWS: unknown;
                mappingWS: unknown;
                teasWS:
                  | { getRow: (n: number) => { values: unknown[] } }
                  | undefined;
              }
            | undefined,
          {
            setNotificationError,
            workbook: loadedWorkbook,
            isTracker,
            programSpecificType,
          }
        );

        if (!worksheets?.status) {
          return;
        }

        const templateWS = worksheets.templateWS;
        const instructionsWS = worksheets.instructionsWS;
        const mappingWS = worksheets.mappingWS;
        const teasWS = worksheets.teasWS;
        const mappingDetails = isTracker
          ? getTrackerMappingList(mappingWS)
          : getHNQIS2MappingList(mappingWS);
        const programDetails = !isTracker
          ? getProgramDetailsHNQIS2(instructionsWS, mappingDetails)
          : getProgramDetailsTracker(instructionsWS);

        if (
          !tasksHandler(
            {
              step: 3,
              message: 'Validating Template version and origin server',
              initialStatus: false,
            },
            serverAndVersionValidation as unknown as (
              status: boolean,
              task: Task,
              params: Record<string, unknown>
            ) => boolean,
            {
              setNotificationError,
              instructionsWS,
              isTracker,
              templateVersionCell: isTracker
                ? TRACKER_TEMPLATE_VERSION_CELL
                : HNQIS2_TEMPLATE_VERSION_CELL,
              originServerCell: isTracker
                ? TRACKER_ORIGIN_SERVER_CELL
                : HNQIS2_ORIGIN_SERVER_CELL,
            }
          )
        ) {
          return;
        }

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
            structureColumn: 1,
          }).data;
        }

        const templateData: TemplateWorksheetData[] = [];
        let stopFlag = false;

        templateWS.forEach(
          (
            currentTemplate: { getRow: (n: number) => { values: unknown[] } },
            index: number
          ) => {
            const headers = currentTemplate.getRow(1).values as unknown[];
            headers.shift();

            const currentTemplateData = handleWorksheetReading({
              tasksHandler,
              currentWorksheet: currentTemplate,
              setNotificationError,
              headers,
              templateHeadersList: isTracker
                ? TRACKER_TEMPLATE_HEADERS
                : HNQIS2_TEMPLATE_HEADERS,
              startingIndex: 4 + 2 * index + indexModifier,
              structureColumn: isTracker ? 1 : 2,
              isTrackerTemplate: true,
            });

            if (!currentTemplateData?.status) {
              stopFlag = true;
              return;
            }

            templateData.push(currentTemplateData);
          }
        );

        if (stopFlag) {
          return;
        }

        const importSummaryValues = isTracker
          ? importReadingTracker(
              { teaData, templateData },
              { programDetails, mappingDetails },
              programSpecificType
            )
          : importReadingHNQIS(templateData, programDetails, mappingDetails);

        if ('error' in importSummaryValues) {
          addExecutedTask({
            step: 10000,
            name: (importSummaryValues as { error: string }).error,
            status: 'error',
          });
          setNotificationError(true);
        } else {
          setImportSummary(importSummaryValues);
          setImportResults(importSummaryValues);
          setSaveStatus('Validate & Save');
          setSavedAndValidated(false);
        }
      };
    }
    setButtonDisabled(false);
  };

  const importReadingHNQIS = (
    templateData: TemplateWorksheetData[],
    programDetails: unknown,
    mappingDetails: unknown
  ): HNQISSummary => {
    const pd = programDetails as Record<string, unknown>;
    const md = mappingDetails as Record<string, unknown>;
    const importSummaryValues = buildHNQIS2Summary() as HNQISSummary;
    const { importedSections, importedScores } = readTemplateData({
      templateData: templateData[0].data,
      currentData: previous,
      programPrefix: (pd.dePrefix || pd.id) as string | undefined,
      optionSets: md.optionSets,
      legendSets: md.legendSets,
      currentSectionsData,
      mode: programSpecificType,
      importSummaryValues,
    });

    importSummaryValues.program = pd;
    importSummaryValues.mapping = md;

    const newScoresSection = previous.scoresSection;
    newScoresSection.dataElements =
      importedScores as import('../../types').PcaDataElement[];
    delete newScoresSection.errors;

    previous.setSections(
      importedSections as import('../../types').PcaSection[]
    );
    previous.setScoresSection(newScoresSection);

    const programMetadata_new = programMetadata.programMetadata;
    programMetadata_new.dePrefix = pd.dePrefix as string;
    programMetadata_new.useCompetencyClass = pd.useCompetencyClass as boolean;
    programMetadata_new.healthArea = (
      md.healthAreas as { name: string; code?: string }[]
    ).find((ha: { name: string; code?: string }) => ha.name == pd.healthArea)
      ?.code as unknown as { name: string }[];
    programMetadata.setProgramMetadata(programMetadata_new);

    return importSummaryValues;
  };

  const importReadingTracker = (
    {
      teaData,
      templateData,
    }: {
      teaData: Record<string, unknown>[] | undefined;
      templateData: TemplateWorksheetData[];
    },
    {
      programDetails: rawProgramDetails,
      mappingDetails: rawMappingDetails,
    }: { programDetails: unknown; mappingDetails: unknown },
    programSpecificType: ProgramTypesEnum
  ): TrackerSummary | { error: string } => {
    const programDetails = rawProgramDetails as Record<string, unknown>;
    const mappingDetails = rawMappingDetails as Record<string, unknown>;
    const importSummaryValues = buildTrackerSummary(
      programSpecificType,
      currentStagesData.length
    ) as TrackerSummary;
    const importedStages: unknown[] = [];
    let importError: string | undefined = undefined;
    const skippedSections: { stage: string; ignoredSections: unknown[] }[] = [];

    currentStagesData.forEach((currentStage, index) => {
      const stageIndex = templateData.findIndex(
        (elem) => elem.stageId === currentStage.id
      );
      if (stageIndex === -1) {
        importError = `The import process has failed. Some Stages are missing in the imported file (${currentStage.name}), please download a new Template and try again.`;
      } else {
        importSummaryValues.stages[index].stageName = currentStage.name;
        importSummaryValues.stages[index].id = currentStage.id;
        const { importedSections, ignoredSections } = readTemplateData({
          currentData: {
            sections: setUpProgramStageSections(
              previous.stages.find((stage) => stage.id === currentStage.id)
            ),
            stageNumber: index + 1,
          },
          templateData: templateData[stageIndex].data,
          programPrefix: (programDetails.dePrefix || programDetails.id) as
            | string
            | undefined,
          optionSets: mappingDetails.optionSets,
          legendSets: mappingDetails.legendSets,
          currentSectionsData: setUpProgramStageSections(currentStage),
          mode: programSpecificType,
          importSummaryValues: importSummaryValues.stages[index],
        });

        if ((ignoredSections ?? []).length > 0) {
          skippedSections.push({
            stage: currentStage.name,
            ignoredSections: ignoredSections ?? [],
          });
        }

        importedStages.push({
          id: currentStage.id,
          name: currentStage.name,
          stageNumber: index + 1,
          importedSections,
        });
      }
    });

    if (importError) {
      return { error: importError };
    }

    const importedProgramSections: {
      id?: unknown;
      name: unknown;
      sortOrder: number;
      trackedEntityAttributes: unknown[];
      importStatus: string;
      isBasicForm: boolean;
    }[] = [];
    const ignoredProgramSections: { name: unknown; rowNum: number }[] = [];
    if (teaData) {
      let programSectionIndex = -1;
      let isBasicForm = false;
      teaData.forEach((row: Record<string, unknown>, rowNum: number) => {
        switch (row[TRACKER_TEA_MAP.structure]) {
          case 'Section':
            if (
              row[TRACKER_TEA_MAP.programSection] === 'basic-form' &&
              programSectionIndex === -1
            ) {
              isBasicForm = true;
            }
            if (isBasicForm && importedProgramSections.length > 0) {
              ignoredProgramSections.push({
                name: row[TRACKER_TEA_MAP.name],
                rowNum: rowNum + 3,
              });
              break;
            }
            programSectionIndex += 1;
            importedProgramSections[programSectionIndex] = {
              id: row[TRACKER_TEA_MAP.programSection] || undefined,
              name: row[TRACKER_TEA_MAP.name],
              sortOrder: programSectionIndex,
              trackedEntityAttributes: [],
              importStatus: row[TRACKER_TEA_MAP.programSection]
                ? 'update'
                : 'new',
              isBasicForm,
            };
            if (row[TRACKER_TEA_MAP.programSection]) {
              importSummaryValues.teaSummary!.programSections.updated += 1;
            } else {
              importSummaryValues.teaSummary!.programSections.new += 1;
            }
            break;
          case 'TEA':
            if (programSectionIndex === -1) {
              programSectionIndex += 1;
              isBasicForm = true;
              importedProgramSections[programSectionIndex] = getBasicForm(
                'TEA'
              ) as (typeof importedProgramSections)[0];
            }
            importedProgramSections[
              programSectionIndex
            ].trackedEntityAttributes.push({
              trackedEntityAttribute: {
                id: (row[TRACKER_TEA_MAP.uid] as { result?: unknown } | null)
                  ?.result,
                name: row[TRACKER_TEA_MAP.name],
              },
              valueType: (
                row[TRACKER_TEA_MAP.valueType] as { result?: unknown } | null
              )?.result,
              allowFutureDate: row[TRACKER_TEA_MAP.allowFutureDate] === 'Yes',
              displayInList: row[TRACKER_TEA_MAP.displayInList] === 'Yes',
              mandatory: row[TRACKER_TEA_MAP.mandatory] === 'Yes',
              searchable: row[TRACKER_TEA_MAP.searchable] === 'Yes',
              programTrackedEntityAttribute: row[TRACKER_TEA_MAP.programTea],
            });
            break;
        }
      });

      if (ignoredProgramSections.length > 0) {
        skippedSections.push({
          stage: 'Tracked Entity Attributes',
          ignoredSections: ignoredProgramSections,
        });
      }

      const currentTEAData: {
        sections: {
          id: string;
          trackedEntityAttributes: PreviousData['teas'];
        }[];
      } = {
        sections: [],
      };
      if (previous.programSections.length === 0) {
        currentTEAData.sections.push({
          id: 'basic-form',
          trackedEntityAttributes: previous.teas,
        });
      } else {
        previous.programSections.forEach((ps) => {
          const previousPS = {
            id: ps.id,
            trackedEntityAttributes: previous.teas.filter((tea) =>
              ps.trackedEntityAttributes.find(
                (psTEA) => psTEA.id === tea.trackedEntityAttribute.id
              )
            ),
          };

          currentTEAData.sections.push(previousPS);
        });
      }

      countChanges({
        sections: importedProgramSections,
        sectionsSummary: importSummaryValues.teaSummary!.programSections,
        countObject: 'trackedEntityAttributes',
        summaryObject: importSummaryValues.teaSummary!.teas,
        currentData: currentTEAData.sections,
        impObjId: 'programTrackedEntityAttribute',
      });
    }

    importSummaryValues.program = programDetails;
    importSummaryValues.mapping = mappingDetails;
    importSummaryValues.configurations = {
      teas: importedProgramSections,
      importedStages,
      skippedSections,
    };

    return importSummaryValues;
  };

  return (
    <CustomMUIDialog
      open={true}
      maxWidth={isTracker(programSpecificType) ? 'lg' : 'sm'}
      fullWidth={true}
    >
      <CustomMUIDialogTitle
        id="customized-dialog-title"
        onClose={() => hideForm()}
      >
        Template Importer
      </CustomMUIDialogTitle>
      <DialogContent
        dividers
        style={{
          display: 'flex',
          flexDirection: isTracker(programSpecificType) ? 'row' : 'column',
          justifyContent: 'space-between',
          padding: '1em 2em',
        }}
      >
        <div
          style={{
            width: isTracker(programSpecificType) ? '49%' : '100%',
            maxHeight: '30rem',
            overflow: 'scroll',
            overflowX: 'hidden',
          }}
        >
          {(currentTask || executedTasks.length > 0) && (
            <div style={{ width: '100%', marginBottom: '1em' }}>
              <ImportStatusBox
                title="Configuration File - Import Status"
                currentTask={currentTask}
                executedTasks={executedTasks}
                isError={isNotificationError}
              />
              {(importSummary?.configurations?.skippedSections?.length ?? 0) >
                0 && (
                <div style={{ width: '100%', marginTop: '0.5em' }}>
                  <NoticeBox
                    title={
                      'One or more Program Stages were imported as Basic Form. To keep the Stage Sections, delete the light blue row and make sure that the first available row is a Section in the following Stage Template(s):'
                    }
                    warning={true}
                  >
                    <ul>
                      {[
                        ...new Set(
                          importSummary?.configurations?.skippedSections?.map(
                            (ss) => ss.stage
                          ) ?? []
                        ),
                      ].map((stage) => (
                        <li key={stage}>{stage}</li>
                      ))}
                    </ul>
                  </NoticeBox>
                </div>
              )}
            </div>
          )}
          {importSummary && !isTracker(programSpecificType) && (
            <ImportSummary
              title="Import Summary"
              importCategories={[
                {
                  name: 'Questions/Labels',
                  content: (importSummary as HNQISSummary).questions,
                },
                {
                  name: 'Sections',
                  content: (importSummary as HNQISSummary).sections,
                },
                {
                  name: 'Scores',
                  content: (importSummary as HNQISSummary).scores,
                },
              ]}
            />
          )}

          {!importSummary && (
            <FileSelector
              fileName={fileName}
              setFile={setFile}
              acceptedFiles={'.xlsx'}
            />
          )}
        </div>

        {importSummary && isTracker(programSpecificType) && (
          <div
            style={{
              width: '49%',
              maxHeight: '30rem',
              overflow: 'scroll',
              overflowX: 'hidden',
            }}
          >
            {(importSummary as TrackerSummary).teaSummary && (
              <ImportSummary
                title={`Import Summary - Tracked Entity Attributes`}
                importCategories={[
                  {
                    name: 'Sections',
                    content: (importSummary as TrackerSummary).teaSummary!
                      .programSections,
                  },
                  {
                    name: 'Tracked Entity Attributes',
                    content: (importSummary as TrackerSummary).teaSummary!.teas,
                  },
                ]}
              />
            )}
            {(importSummary as TrackerSummary).stages.map(
              (stage: StageSummary, index: number) => {
                return (
                  <ImportSummary
                    key={(stage.stageName ?? '') + index}
                    title={`Import Summary - ${stage.stageName ?? ''}`}
                    importCategories={[
                      { name: 'Sections', content: stage.sections },
                      {
                        name: 'Stage Data Elements',
                        content: stage.dataElements,
                      },
                    ]}
                  />
                );
              }
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions style={{ padding: '1em' }}>
        <Button
          color={!importSummary ? 'error' : 'primary'}
          variant={!importSummary ? 'text' : 'outlined'}
          disabled={buttonDisabled}
          onClick={() => hideForm()}
        >
          Close
        </Button>
        {!importSummary && (
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={buttonDisabled || !selectedFile}
            onClick={() => startImportProcess(isTracker(programSpecificType))}
          >
            Import
          </Button>
        )}
      </DialogActions>
    </CustomMUIDialog>
  );
};

Importer.propTypes = {
  currentSectionsData: PropTypes.array,
  currentStagesData: PropTypes.array,
  previous: PropTypes.object,
  programMetadata: PropTypes.object,
  programSpecificType: PropTypes.string,
  setSaveStatus: PropTypes.func,
  setSavedAndValidated: PropTypes.func,
};

export default Importer;
