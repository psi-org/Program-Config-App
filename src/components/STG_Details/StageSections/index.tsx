import { useDataMutation, useDataQuery } from '@dhis2/app-service-data';
import type { Mutation } from '@dhis2/app-service-data';
import {
  ButtonStrip,
  AlertBar,
  AlertStack,
  // @ts-expect-error ComponentCover exists at runtime but is missing from the type declarations
  ComponentCover,
  CircularLoader,
  Chip,
  NoticeBox,
} from '@dhis2/ui';
// @ts-expect-error CSS module has no type declarations
import 'react-sweet-progress/lib/style.css';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MuiChip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import {
  FEEDBACK_ORDER,
  GENERATED_OBJECTS_NAMESPACE,
  H2_METADATA_VERSION,
  METADATA,
  PCA_PROGRAM_TYPE_ATTRIBUTE,
} from '../../../configs/Constants';
import type { ProgramStageDataElement } from '../../../types';
import {
  DeepCopy,
  buildBasicFormStage,
  extractMetadataPermissions,
  getAttributeValue,
  hnqisTypes,
  isModernHnqisProgramType,
  mapIdArray,
  truncateString,
  versionGTE,
} from '../../../utils/Utils';
import DataProcessor from '../../Excel/DataProcessor';
import Importer from '../../Excel/Importer';
import ErrorReports from '../../UIElements/ErrorReports';
import Errors from '../../UIElements/Errors';
import ImportDownloadButton from '../../UIElements/ImportDownloadButton';
import Removed from '../../UIElements/Removed';
import CriticalCalculations from '../CriticalCalculations';
import DataElementManager from '../DataElementManager';
import Scores from '../Scores';
import {
  checkScores,
  readQuestionComposites,
  buildProgramRuleVariables,
  buildProgramRules,
  buildProgramIndicators,
  buildH2BaseVisualizations,
  buildFeedbackTree,
  buildFeedbackRules,
} from '../Scripting';
import DraggableSection from '../Section';
import SectionManager from '../SectionManager';
import ValidateMetadata from '../ValidateMetadata';
import DisclaimerDialog from './components/DisclaimerDialog';
import SetupProgressDialog from './components/SetupProgressDialog';
import SetupSplitButton from './components/SetupSplitButton';
import {
  createMutation,
  deleteMetadataMutation,
  queryIds,
  queryPR,
  queryPRV,
  queryPIndicators,
  queryMaps,
  queryVisualizations,
  queryEventReport,
  updateAndroidSettingsAnalytics,
  queryAndroidSettingsAnalytics,
  updateAndroidSettingsSynchronization,
  queryAndroidSettingsSynchronization,
  queryDashboards,
  queryPCAMetadata,
  queryOrganizationsUnit,
  queryProgramSettings,
  queryCurrentUser,
  queryHNQIS2Metadata,
} from './stageSections.queries';
import type {
  StageSectionsProps,
  ProgramStageSection,
  SnackParams,
  BackupData,
  DEManagerState,
  DEActionsInterface,
  SectionActionsInterface,
  AddedSectionState,
  NormalizedError,
  SaveAndBuildState,
  ResolvedPcaMetadata,
  SharingSettings,
} from './stageSections.types';

const StageSections = ({
  programStage,
  stageRefetch,
  hnqisMode,
  readOnly,
}: StageSectionsProps) => {
  const programId = programStage.program.id;

  const queryDataStore = {
    results: {
      resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programId}`,
    },
  };
  const dsCreateMutation = {
    resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programId}`,
    type: 'create',
    data: ({ data }: { data: unknown }) => data,
  } as unknown as Mutation;
  const dsUpdateMutation = {
    resource: `dataStore/${GENERATED_OBJECTS_NAMESPACE}/${programId}`,
    type: 'update',
    data: ({ data }: { data: unknown }) => data,
  } as unknown as Mutation;

  // ── State ──────────────────────────────────────────────────────────────────
  const [addedSection, setAddedSection] = useState<
    AddedSectionState | undefined
  >();
  const [allAuth, setAllAuth] = useState(false);
  const [androidSettingsError, setAndroidSettingsError] =
    useState<unknown>(undefined);
  const [backupData, setBackupData] = useState<BackupData | undefined>();
  const [criticalSection, setCriticalSection] = useState<
    ProgramStageSection | undefined
  >(
    programStage.programStageSections.find(
      (s) => hnqisMode && s.name === 'Critical Steps Calculations'
    )
  );
  const [deManager, setDeManager] = useState<DEManagerState | null>(null);
  const [deToEdit, setDeToEdit] = useState('');
  const [editSectionIndex, setEditSectionIndex] = useState<
    number | undefined
  >();
  const [errorReports, setErrorReports] = useState<unknown>(undefined);
  const [exportToExcel, setExportToExcel] = useState(false);
  const [importerEnabled, setImporterEnabled] = useState(false);
  const [importResults, setImportResults] = useState<
    Record<string, any> | false
  >(false);
  const [isSectionMode] = useState(
    programStage.formType === 'SECTION' ||
      programStage.programStageDataElements.length === 0
  );
  const [newSectionIndex, setNewSectionIndex] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const [originalProgramStageDataElements] = useState<
    ProgramStageDataElement[]
  >(programStage.programStageDataElements.flat());
  const [programMetadata, setProgramMetadata] = useState<
    Record<string, any> | undefined
  >();
  const [programSettingsError, setProgramSettingsError] = useState<
    1 | 2 | undefined
  >();
  const [programStageDataElements, setProgramStageDataElements] = useState<
    ProgramStageDataElement[]
  >([...programStage.programStageDataElements]);
  const [progressSteps, setProgressSteps] = useState(0);
  const [removedElements, setRemovedElements] = useState<
    ProgramStageDataElement[]
  >([]);
  const [runError, setRunError] = useState<NormalizedError | null>(null);
  const [saveAndBuild, setSaveAndBuild] = useState<SaveAndBuildState>(false);
  const [savedAndValidated, setSavedAndValidated] = useState(false);
  const [saveStatus, setSaveStatus] = useState(
    hnqisMode ? 'Validate' : 'Save Changes'
  );
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [scoresSection, setScoresSection] = useState<
    ProgramStageSection | undefined
  >(
    programStage.programStageSections.find(
      (s) => hnqisMode && s.name === 'Scores'
    )
  );
  const [sections, setSections] = useState<ProgramStageSection[]>(
    isSectionMode
      ? programStage.programStageSections.filter(
          (s) =>
            (s.name !== 'Scores' && s.name !== 'Critical Steps Calculations') ||
            !hnqisMode
        )
      : [
          buildBasicFormStage(
            programStage.programStageDataElements
          ) as unknown as ProgramStageSection,
        ]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [snackParams, setSnackParams] = useState<SnackParams | false>(false);
  const [uidPool, setUidPool] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<
    Record<string, any> | undefined
  >();

  const anchorRef = useRef<HTMLDivElement>(null);
  const runInFlightRef = useRef(false);

  // ── DHIS2 queries ─────────────────────────────────────────────────────────

  const [androidSettingsSyncUpdate, { error: androidSettingsSyncUpdateError }] =
    useDataMutation(
      updateAndroidSettingsSynchronization as unknown as Mutation,
      {
        onError: (err: unknown) => setAndroidSettingsError(err),
      }
    );

  const [androidSettingsUpdate, { error: androidSettingsUpdateError }] =
    useDataMutation(updateAndroidSettingsAnalytics as unknown as Mutation, {
      onError: (err: unknown) => setAndroidSettingsError(err),
    });

  const metadataDM = useDataMutation(createMutation as unknown as Mutation, {
    onError: (err: unknown) => console.error(err),
  });
  const createMetadata = {
    mutate: metadataDM[0],
    loading: metadataDM[1].loading,
    error: metadataDM[1].error,
    data: metadataDM[1].data,
  };

  const [deleteMetadata, { error: deleteError, loading: deleteLoading }] =
    useDataMutation(deleteMetadataMutation as unknown as Mutation, {
      onError: () => setProgressSteps(6),
    });

  const { data: androidSettings, refetch: refreshAndroidSettings } =
    useDataQuery(queryAndroidSettingsAnalytics);
  const { data: currentUser } = useDataQuery(queryCurrentUser);
  const { data: hnqis2Metadata, loading: metadataLoading } =
    useDataQuery(queryHNQIS2Metadata);
  const { refetch: getProgramSettings } = useDataQuery(queryProgramSettings, {
    lazy: true,
    variables: { programId },
  });
  const { refetch: refreshAndroidSettingsSync } = useDataQuery(
    queryAndroidSettingsSynchronization
  );
  const { refetch: setOuLevel } = useDataQuery(queryOrganizationsUnit, {
    lazy: true,
    variables: { ouLevel: undefined },
  });
  const idsQuery = useDataQuery(queryIds, {
    lazy: true,
    variables: { n: programStage.programStageDataElements.length * 5 },
  });
  const prDQ = useDataQuery(queryPR, { variables: { programId } });
  const prvDQ = useDataQuery(queryPRV, { variables: { programId } });
  const pIndDQ = useDataQuery(queryPIndicators, { variables: { programId } });
  const visualizationsDQ = useDataQuery(queryVisualizations, {
    variables: { programId },
  });
  const eventReportDQ = useDataQuery(queryEventReport, {
    variables: { programId },
  });
  const mapsDQ = useDataQuery(queryMaps, { variables: { programId } });
  const dashboardsDQ = useDataQuery(queryDashboards, {
    variables: { programId },
  });
  const { data: programAttributes } = useDataQuery(queryPCAMetadata, {
    variables: { programId },
  });
  const { refetch: getDataStore } = useDataQuery(queryDataStore);
  const [dataStoreCreate] = useDataMutation(dsCreateMutation, {
    onError: (err: unknown) => console.error(err),
  });
  const [dataStoreUpdate] = useDataMutation(dsUpdateMutation, {
    onError: (err: unknown) => console.error(err),
  });

  const stagesList = useMemo(
    () => (programAttributes as any)?.results?.programs?.[0]?.programStages,
    [programAttributes]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const pushNotification = useCallback(
    (content: React.ReactNode, severity: SnackParams['severity'] = 'success') =>
      setSnackParams({ content, severity }),
    []
  );

  const normalizeError = (err: unknown): NormalizedError => {
    if (!err) {
      return { message: 'Unknown error' };
    }
    if (typeof err === 'string') {
      return { message: err };
    }
    const e = err as Record<string, unknown>;
    if (e.message) {
      return { message: e.message as string, raw: err };
    }
    if ((e.details as Record<string, unknown>)?.message) {
      return {
        message: (e.details as Record<string, unknown>).message as string,
        raw: err,
      };
    }
    if (e.httpStatus || e.status) {
      return { message: `${e.httpStatus ?? e.status}`, raw: err };
    }
    return { message: JSON.stringify(err), raw: err };
  };

  const parseErrors = (e: Record<string, unknown>) =>
    (e.typeReports as Array<Record<string, unknown>>).flatMap((tr) => {
      const type = (tr.klass as string).split('.').pop();
      return (tr.objectReports as Array<Record<string, unknown>>).flatMap(
        (or) =>
          (or.errorReports as Array<Record<string, unknown>>).map((er) => ({
            type,
            uid: or.uid,
            errorCode: er.errorCode,
            message: er.message,
          }))
      );
    });

  const finishRun = useCallback(
    (maybeErr?: unknown) => {
      if (maybeErr) {
        const e = normalizeError(maybeErr);
        setRunError(e);
        const errObj = maybeErr as Record<string, unknown>;
        if (errObj?.typeReports) {
          setErrorReports(parseErrors(errObj));
        }
        pushNotification(
          <span>
            Setup failed: <strong>{e.message}</strong>
          </span>,
          'error'
        );
      }
      setSaveAndBuild('Completed');
      runInFlightRef.current = false;
    },
    [pushNotification]
  );

  const safeStep = async <T,>(
    stepNo: number,
    fn: () => Promise<T>
  ): Promise<T> => {
    setProgressSteps(stepNo);
    return fn();
  };

  const storeBackupData = useCallback(() => {
    setBackupData({
      sections,
      scoresSection,
      currentSectionsData: programStage.programStageSections,
    });
  }, [sections, scoresSection, programStage.programStageSections]);

  const getUIDs = useCallback(() => {
    const n = Math.max(
      (sections.reduce((acc, s) => acc + s.dataElements.length, 10) * 10 +
        ((scoresSection as ProgramStageSection)?.dataElements?.length ?? 10) *
          2 +
        (criticalSection?.dataElements?.length ?? 10) * 5 +
        (3 + 2) +
        (3 + 5) +
        1) *
        4,
      50
    );
    idsQuery.refetch({ n }).then((data: unknown) => {
      if (data) {
        setUidPool((data as Record<string, { codes: string[] }>).results.codes);
      }
    });
  }, [sections, scoresSection, criticalSection, idsQuery]);

  // ── Data Element Actions ──────────────────────────────────────────────────

  const updateDEValues = useCallback(
    (
      dataElementId: string,
      sectionId: string,
      stageDataElement: ProgramStageDataElement
    ) => {
      const sectionIdx = sections.findIndex((s) => s.id === sectionId);
      const sectionDEIdx = sections[sectionIdx].dataElements.findIndex(
        (de) => de.id === dataElementId
      );
      const stageDEIdx = programStageDataElements.findIndex(
        (psde) => psde.dataElement?.id === dataElementId
      );

      programStageDataElements[stageDEIdx] = stageDataElement;
      sections[sectionIdx].dataElements[sectionDEIdx] =
        stageDataElement.dataElement!;

      setProgramStageDataElements([...programStageDataElements]);
      setSections([...sections]);
      setDeToEdit('');
      pushNotification(
        <span>
          Data Element edited!{' '}
          <strong>
            Remember to{' '}
            {hnqisMode ? 'Validate and Save!' : 'save your changes!'}
          </strong>
        </span>
      );
    },
    [sections, programStageDataElements, hnqisMode, pushNotification]
  );

  const removeDE = useCallback(
    (id: string, sectionId: string) => {
      const psdeIdx = programStageDataElements.findIndex(
        (psde) => psde.dataElement?.id === id
      );
      const section = sections.find((s) => s.id === sectionId);
      const sectionDEIdx =
        section?.dataElements.findIndex((de) => de.id === id) ?? -1;

      if (sectionDEIdx === -1 || psdeIdx === -1) {
        return;
      }

      section!.dataElements.splice(sectionDEIdx, 1);
      programStageDataElements.splice(psdeIdx, 1);
      setSections([...sections]);
      setProgramStageDataElements([...programStageDataElements]);
      if (hnqisMode) {
        setSaveStatus('Validate & Save');
      }
      pushNotification(
        <span>
          Data Element removed!{' '}
          <strong>
            Remember to{' '}
            {hnqisMode ? 'Validate and Save!' : 'save your changes!'}
          </strong>
        </span>,
        'info'
      );
    },
    [sections, programStageDataElements, hnqisMode, pushNotification]
  );

  const saveAdd = useCallback(
    (params: Record<string, any>) => {
      const dataElementObjects = params.newDataElements.map(
        (psde: any) => psde.dataElement
      );
      const sectionIndex = sections.findIndex(
        (s) => s.id === params.deRef.section
      );
      const toBeAdded = params.newDataElements.map((de: any) => ({
        id: de.dataElement.id,
        mode: de.type,
      }));
      params.newDataElements.forEach((de: any) => delete de.type);

      sections
        .find((s) => s.id === params.deRef.section)!
        .dataElements.splice(params.deRef.index, 0, ...dataElementObjects);

      setProgramStageDataElements(
        programStageDataElements.concat(params.newDataElements)
      );
      setSections([...sections]);
      setDeManager(null);
      pushNotification(
        <span>
          {params.newDataElements.length} Data Element
          {params.newDataElements.length > 1 ? 's' : ''} added!{' '}
          <strong>
            Remember to{' '}
            {hnqisMode ? 'Validate and Save!' : 'save your changes!'}
          </strong>
        </span>
      );
      setAddedSection({
        index: sectionIndex,
        mode: 'Updated',
        dataElements: toBeAdded,
      });
    },
    [sections, programStageDataElements, hnqisMode, pushNotification]
  );

  const DEActions: DEActionsInterface = useMemo(
    () => ({
      deToEdit,
      setEdit: setDeToEdit,
      update: updateDEValues,
      remove: removeDE,
      add: (index: number, section: string) =>
        setDeManager({
          index,
          section,
          stage: programStage.id,
          sectionName:
            sections.find((s) => s.id === section)?.displayName ?? '',
        }),
    }),
    [deToEdit, updateDEValues, removeDE, programStage.id, sections]
  );

  // ── Section Actions ───────────────────────────────────────────────────────

  const handleSectionEdit = useCallback(
    (section?: number, newSection?: number) => {
      setEditSectionIndex(section);
      setNewSectionIndex(newSection);
      setShowSectionManager(true);
    },
    []
  );

  const removeSection = useCallback(
    (section: ProgramStageSection) => {
      const idx = sections.findIndex((s) => s.id === section.id);
      const newPSDEs = programStageDataElements.filter(
        (psde) =>
          !section.dataElements.find((de) => de.id === psde.dataElement?.id)
      );
      setProgramStageDataElements(newPSDEs);
      sections.splice(idx, 1);
      setSections([...sections]);
      if (hnqisMode) {
        setSaveStatus('Validate & Save');
      }
      pushNotification(
        <span>
          {`Section '${section.name}' removed! `}
          <strong>
            Remember to{' '}
            {hnqisMode ? 'Validate and Save!' : 'save your changes!'}
          </strong>
        </span>,
        'info'
      );
    },
    [sections, programStageDataElements, hnqisMode, pushNotification]
  );

  const SectionActions: SectionActionsInterface = useMemo(
    () => ({
      append: () => handleSectionEdit(undefined, sections.length),
      handleSectionEdit,
      remove: removeSection,
    }),
    [handleSectionEdit, removeSection, sections.length]
  );

  // ── Drag and Drop ─────────────────────────────────────────────────────────

  const reorder = <T,>(
    list: T[],
    startIndex: number,
    endIndex: number
  ): T[] => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) {
        return;
      }
      if (
        result.type === 'SECTION' &&
        result.source.index === result.destination.index
      ) {
        return;
      }
      if (
        result.type === 'DATA_ELEMENT' &&
        result.source.droppableId === result.destination.droppableId &&
        result.source.index === result.destination.index
      ) {
        return;
      }

      setAddedSection(undefined);
      let newSections = [...sections];

      if (result.type === 'SECTION') {
        newSections = reorder(
          sections,
          result.source.index,
          result.destination.index
        );
      } else if (result.type === 'DATA_ELEMENT') {
        if (result.source.droppableId === result.destination.droppableId) {
          const sectionIndex = newSections.findIndex(
            (s) => s.id === result.source.droppableId
          );
          newSections[sectionIndex].dataElements = reorder(
            newSections[sectionIndex].dataElements,
            result.source.index,
            result.destination.index
          );
        } else {
          const element = newSections
            .find((s) => s.id === result.source.droppableId)!
            .dataElements.splice(result.source.index, 1)[0];
          newSections
            .find((s) => s.id === result.destination.droppableId)!
            .dataElements.splice(result.destination.index, 0, element);
        }
      }

      setSaveStatus(hnqisMode ? 'Validate & Save' : 'Save Changes');
      setSections(newSections);
    },
    [sections, hnqisMode]
  );

  // ── Save / Commit ─────────────────────────────────────────────────────────

  const commit = useCallback(() => {
    setAddedSection(undefined);
    if ((createMetadata.data as any)?.status) {
      delete (createMetadata.data as Record<string, unknown>).status;
    }
    const removed = originalProgramStageDataElements
      .filter(
        (psde) =>
          !programStageDataElements.find(
            (de) => de.dataElement?.id === psde.dataElement?.id
          )
      )
      .map((psde) => psde.dataElement!);
    setRemovedElements(removed as ProgramStageDataElement[]);
    setSavingMetadata(true);
  }, [
    createMetadata.data,
    originalProgramStageDataElements,
    programStageDataElements,
  ]);

  // ── Android Settings ──────────────────────────────────────────────────────

  const buildAndroidSettings = (
    settings: Record<string, any>,
    newUID: string,
    androidSettingsVisualizations: unknown[]
  ) => {
    const viz = settings.results.dhisVisualizations ?? {
      dataSet: {},
      home: [],
      program: {},
    };
    if (!viz.home) {
      viz.home = [];
    }
    settings.results.dhisVisualizations = viz;
    viz.home = viz.home.filter((s: any) => s.program !== programId);

    if (programMetadata?.createAndroidAnalytics === 'Yes') {
      viz.home.push({
        id: newUID,
        name: programStage.program.name,
        program: programId,
        visualizations: androidSettingsVisualizations,
      });
    }

    settings.results.lastUpdated = new Date().toISOString();
    return settings;
  };

  const applyAndroidSettingsAsync = async (
    androidSettingsVisualizations: unknown[],
    localUidPool: string[]
  ) => {
    try {
      const analytics = await refreshAndroidSettings();
      if ((analytics as any)?.results) {
        const settings = buildAndroidSettings(
          analytics as Record<string, any>,
          localUidPool.shift()!,
          androidSettingsVisualizations
        );
        const r = await androidSettingsUpdate({ data: settings.results });
        if ((r as any)?.status !== 'OK') {
          setAndroidSettingsError(r);
        }
      }

      const sync = await refreshAndroidSettingsSync();
      if ((sync as any)?.results) {
        const settings = (sync as any).results;
        const teiAmount = programMetadata?.teiDownloadAmount ?? 5;
        settings.programSettings.specificSettings[programId] = {
          enrollmentDateDownload: 'ANY',
          enrollmentDownload: 'ONLY_ACTIVE',
          id: programId,
          name: programStage.program.name,
          settingDownload: 'ALL_ORG_UNITS',
          summarySettings: `${teiAmount} TEI all OU`,
          teiDownload: teiAmount,
          updateDownload: 'ANY',
        };
        const r2 = await androidSettingsSyncUpdate({ data: settings });
        if ((r2 as any)?.status !== 'OK') {
          setAndroidSettingsError(r2);
        } else {
          setAndroidSettingsError(undefined);
        }
      }
    } catch (e) {
      setAndroidSettingsError((e as any)?.details ?? e);
    }
  };

  // ── Update Program Build Version ──────────────────────────────────────────

  const updateProgramBuildVersion = useCallback(
    async (pid: string) => {
      const res = await getProgramSettings({ programId: pid });
      (res as any).results?.attributeValues?.forEach((av: any) => {
        if (av.attribute.id === METADATA) {
          const pcaMetadata = JSON.parse(av.value || '{}');
          pcaMetadata.buildVersion = (import.meta as any).env.DHIS2_APP_VERSION;
          av.value = JSON.stringify(pcaMetadata);
        }
      });

      const response = await createMetadata.mutate({
        data: { programs: [(res as any).results] },
      });
      if ((response as any)?.status === 'OK') {
        setProgressSteps(8);
        setSaveAndBuild('Completed');
        setSavedAndValidated(false);
        prDQ.refetch();
        prvDQ.refetch();
        pIndDQ.refetch();
        visualizationsDQ.refetch();
        eventReportDQ.refetch();
        mapsDQ.refetch();
        getUIDs();
        return;
      }
      throw new Error('Failed to update Program build version');
    },
    [
      getProgramSettings,
      createMetadata.mutate,
      prDQ,
      prvDQ,
      pIndDQ,
      visualizationsDQ,
      eventReportDQ,
      mapsDQ,
      getUIDs,
    ]
  );

  // ── Main Setup Run ────────────────────────────────────────────────────────

  const run = async () => {
    if (!savedAndValidated || runInFlightRef.current) {
      return;
    }

    runInFlightRef.current = true;
    setRunError(null);
    setProgramSettingsError(undefined);
    setAndroidSettingsError(undefined);
    setSaveAndBuild('Run');

    const localUidPool = [...uidPool];

    try {
      // STEP 1: validate program config and resolve OU levels to numeric values
      const { pcaMetadata, programConfig } = await safeStep(1, async () => {
        const programConfig = (programAttributes as any)?.results
          ?.programs?.[0];
        if (!programConfig) {
          throw new Error('Program attributes not loaded yet');
        }

        const rawMetadata = programConfig.attributeValues?.find(
          (pa: any) => pa.attribute.id === METADATA
        )?.value;
        const pcaMetadata: ResolvedPcaMetadata = JSON.parse(
          rawMetadata || '{}'
        );

        const required = [
          'ouRoot',
          'ouLevelTable',
          'ouLevelMap',
          'useUserOrgUnit',
        ];
        const missing = required.filter(
          (k) => !Object.prototype.hasOwnProperty.call(pcaMetadata, k)
        );
        if (missing.length) {
          setProgramSettingsError(1);
          throw new Error('Global analytics settings missing');
        }

        const ouData = await setOuLevel({
          ouLevel: [
            pcaMetadata.ouLevelTable as unknown as string,
            pcaMetadata.ouLevelMap as unknown as string,
          ],
        });
        const levels = (ouData as any)?.results?.organisationUnitLevels as
          | any[]
          | undefined;
        if (!levels?.length) {
          setProgramSettingsError(2);
          throw new Error('Configured Organisation Unit Levels not found');
        }

        const visualizationLevel = levels.find(
          (l: Record<string, unknown>) => l.id === pcaMetadata.ouLevelTable
        );
        const mapLevel = levels.find(
          (l: Record<string, unknown>) => l.id === pcaMetadata.ouLevelMap
        );
        if (!visualizationLevel || !mapLevel) {
          setProgramSettingsError(2);
          throw new Error('Configured Organisation Unit Levels not found');
        }

        pcaMetadata.ouLevelTable =
          visualizationLevel.offlineLevels ?? visualizationLevel.level;
        pcaMetadata.ouLevelMap = mapLevel.offlineLevels ?? mapLevel.level;
        pcaMetadata.useUserOrgUnit =
          (pcaMetadata.useUserOrgUnit as unknown as string) === 'Yes';

        return { pcaMetadata, programConfig };
      });

      const sharingSettings: SharingSettings = { ...programConfig.sharing };
      sharingSettings.public = extractMetadataPermissions(
        sharingSettings.public
      );
      sharingSettings.users = sharingSettings.users ?? {};
      sharingSettings.userGroups = sharingSettings.userGroups ?? {};
      Object.keys(sharingSettings.users).forEach(
        (k) =>
          (sharingSettings.users[k].access = extractMetadataPermissions(
            sharingSettings.users[k].access
          ))
      );
      Object.keys(sharingSettings.userGroups).forEach(
        (k) =>
          (sharingSettings.userGroups[k].access = extractMetadataPermissions(
            sharingSettings.userGroups[k].access
          ))
      );

      const actionPlanID = programStage.program.programStages.filter(
        (ps) => ps.id !== programStage.id
      )[0]?.id;

      // STEP 2: validate scores
      await safeStep(2, async () => {
        const result = checkScores(
          (scoresSection as ProgramStageSection).dataElements
        ) as any;
        if (!result.uniqueScores) {
          throw {
            msg: 'Duplicated scores',
            duplicatedScores: result.duplicatedScores,
            status: 400,
          };
        }
      });
      const { compositeScores } = checkScores(
        (scoresSection as ProgramStageSection).dataElements
      ) as any;

      // STEP 3: validate question composite scores
      await safeStep(3, async () => {
        const questionCompositeScores = (readQuestionComposites as any)(
          sections
        );
        const missing = questionCompositeScores.filter(
          (cs: string) => !compositeScores.includes(cs)
        );
        if (missing.length) {
          throw {
            msg: "Some questions Feedback Order don't match any Score item",
            missingComposites: missing,
            status: 400,
          };
        }
      });

      // STEP 4: build all metadata payloads
      const {
        metadata,
        androidSettingsVisualizations,
        oldMetadata,
        sendToDataStore,
        dataStoreData,
      } = await safeStep(4, async () => {
        type AttributeValueEntry = { attribute: { id: string }; value: string };
        const scoresMapping = (
          scoresSection as ProgramStageSection
        ).dataElements.reduce<Record<string, unknown>>(
          (acc, cur) => ({
            ...acc,
            [(
              cur as unknown as { attributeValues: AttributeValueEntry[] }
            ).attributeValues?.find(
              (att) => att.attribute.id === FEEDBACK_ORDER
            )?.value as string]: cur,
          }),
          {}
        );

        const programRuleVariables = (buildProgramRuleVariables as any)({
          sections,
          scoresSection,
          compositeScores,
          programId,
          useCompetencyClass: programMetadata?.useCompetencyClass,
          uidPool: localUidPool,
        });

        const { programRules, programRuleActions, scoreMap } =
          buildProgramRules({
            sections,
            stageId: programStage.id,
            programId,
            compositeValues: compositeScores,
            scoresMapping,
            uidPool: localUidPool,
            useCompetencyClass: programMetadata?.useCompetencyClass,
            healthArea: programMetadata?.healthArea,
          });

        const { programIndicators, indicatorIDs, gsInd } =
          buildProgramIndicators({
            programId,
            programStage,
            scoreMap,
            uidPool: localUidPool,
            useCompetency: programMetadata?.useCompetencyClass,
            sharingSettings,
            PIAggregationType: programMetadata?.programIndicatorsAggType,
          });

        const {
          visualizations,
          maps,
          dashboards,
          eventReports,
          androidSettingsVisualizations,
        } = buildH2BaseVisualizations({
          programId,
          programShortName: programStage.program.shortName,
          gsInd,
          indicatorIDs,
          uidPool: localUidPool,
          useCompetency: programMetadata?.useCompetencyClass,
          currentDashboardId: (dashboardsDQ as any)?.data?.results
            ?.dashboards?.[0]?.id,
          userOU: pcaMetadata.useUserOrgUnit,
          ouRoot: pcaMetadata.ouRoot,
          sharingSettings,
          visualizationLevel: pcaMetadata.ouLevelTable,
          mapLevel: pcaMetadata.ouLevelMap,
          actionPlanID,
        });

        const dataElements = programStage.programStageSections.reduce(
          (acc: any[], cur) => acc.concat(cur.dataElements),
          []
        );
        const { feedbackTree, prvsMap } = buildFeedbackTree(
          dataElements,
          programRuleVariables
        );

        const hnqisProgramType =
          hnqisTypes[
            getAttributeValue(
              programStage.program.attributeValues,
              PCA_PROGRAM_TYPE_ATTRIBUTE
            ) as keyof typeof hnqisTypes
          ];

        const {
          programRules: feedbackRules,
          programRuleActions: feedbackActions,
        } = isModernHnqisProgramType(hnqisProgramType)
          ? buildFeedbackRules({
              tree: feedbackTree,
              prvsMap,
              programId,
              uidPool: localUidPool,
              legacy: !versionGTE(
                window.localStorage.getItem('SERVER_VERSION') ?? '',
                '2.43.0'
              ),
            })
          : { programRules: [], programRuleActions: [] };

        const metadata = {
          programRuleVariables,
          programRules: programRules.concat(feedbackRules),
          programRuleActions: programRuleActions.concat(feedbackActions),
          programIndicators,
          visualizations,
          maps,
          dashboards,
          eventReports,
        };

        const dataStoreResult = await getDataStore();
        const toDeleteReferences = DeepCopy(
          (dataStoreResult as any)?.results ?? {}
        );
        const sendToDataStore = (dataStoreResult as any)?.results
          ? dataStoreUpdate
          : dataStoreCreate;

        const dataStoreData = {
          programRules: mapIdArray(metadata.programRules),
          programRuleActions: mapIdArray(metadata.programRuleActions),
          programRuleVariables: mapIdArray(programRuleVariables),
          programIndicators: mapIdArray(programIndicators),
          visualizations: mapIdArray(visualizations),
          eventReports: mapIdArray(eventReports),
          maps: mapIdArray(maps),
          dashboards: mapIdArray(dashboards),
        };

        const fallbackRuleVariables = (
          prvDQ.data as any
        ).results.programRuleVariables.filter(
          (prv: any) => prv.name?.[0] === '_'
        );

        const oldIds = (key: string, fallback: unknown[]) => {
          const ids: unknown[] =
            toDeleteReferences?.[key] ?? mapIdArray(fallback);
          return ids?.length ? ids : undefined;
        };

        const oldMetadata = {
          programRules: oldIds(
            'programRules',
            (prDQ.data as any).results.programRules
          ),
          programRuleVariables: oldIds(
            'programRuleVariables',
            fallbackRuleVariables
          ),
          programIndicators: oldIds(
            'programIndicators',
            (pIndDQ.data as any).results.programIndicators
          ),
          visualizations: oldIds(
            'visualizations',
            (visualizationsDQ.data as any).results.visualizations
          ),
          eventReports: oldIds(
            'eventReports',
            (eventReportDQ.data as any).results.eventReports
          ),
          maps: oldIds('maps', (mapsDQ.data as any).results.maps),
        };

        return {
          metadata,
          androidSettingsVisualizations,
          oldMetadata,
          sendToDataStore,
          dataStoreData,
        };
      });

      // STEP 5: clear event report dimensions then delete old metadata
      await safeStep(5, async () => {
        const updateResp = await createMetadata.mutate({
          data: {
            eventReports: (eventReportDQ.data as any).results.eventReports.map(
              (er: any) => ({
                ...er,
                columnDimensions: ['pe', 'ou'],
                dataElementDimensions: [],
                programIndicatorDimensions: [],
              })
            ),
          },
        });
        if ((updateResp as any)?.status !== 'OK') {
          throw updateResp ?? new Error('Failed to update eventReports');
        }
        await deleteMetadata({ data: oldMetadata });
      });

      // STEP 6: import new metadata + persist datastore references
      await safeStep(6, async () => {
        const resp = await createMetadata.mutate({ data: metadata });
        if ((resp as any)?.status !== 'OK') {
          throw resp ?? new Error('Metadata import failed');
        }
        const dsResp = await sendToDataStore({ data: dataStoreData });
        if ((dsResp as any)?.status !== 'OK') {
          throw dsResp ?? new Error('Datastore update failed');
        }
      });

      // STEP 7: apply android settings (non-fatal, errors surface in UI)
      await safeStep(7, async () => {
        await applyAndroidSettingsAsync(
          androidSettingsVisualizations,
          localUidPool
        );
      });

      // STEP 8: stamp build version on program
      await safeStep(8, async () => {
        await updateProgramBuildVersion(programId);
      });

      finishRun();
    } catch (e) {
      finishRun(e);
    }
  };

  // ── Split-button handlers ─────────────────────────────────────────────────

  const handleClick = useCallback(() => {
    if (selectedIndex !== 0) {
      return;
    }
    if (allAuth) {
      run();
    } else {
      setShowDisclaimer(true);
    }
  }, [selectedIndex, allAuth, savedAndValidated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMenuItemClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setOpen(false);
  }, []);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleClose = useCallback((event: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (currentUser) {
      setAllAuth(
        (
          currentUser as { results: { authorities: string[] } }
        ).results.authorities.includes('ALL')
      );
    }
  }, [currentUser]);

  useEffect(() => {
    if (importerEnabled) {
      setErrorReports(undefined);
      setValidationResults(undefined);
    }
  }, [importerEnabled]);

  useEffect(() => {
    if (sections && scoresSection && !backupData) {
      storeBackupData();
    }
  }, [sections, scoresSection, backupData, storeBackupData]);

  useEffect(() => {
    if (savedAndValidated) {
      storeBackupData();
    }
  }, [savedAndValidated, storeBackupData]);

  useEffect(() => {
    const prog = (programAttributes as any)?.results?.programs?.[0];
    if (!prog) {
      return;
    }
    const av = prog.attributeValues?.find(
      (av: any) => av.attribute.id === METADATA
    );
    setProgramMetadata(av ? JSON.parse(av.value) : {});
  }, [programAttributes]);

  useEffect(() => {
    return () => setCriticalSection(undefined);
  }, []);

  useEffect(() => {
    getUIDs();
  }, [sections]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (androidSettingsUpdateError || androidSettingsSyncUpdateError) {
      updateProgramBuildVersion(programId);
    }
  }, [androidSettingsUpdateError, androidSettingsSyncUpdateError]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Version gate ──────────────────────────────────────────────────────────

  if (
    hnqisMode &&
    !metadataLoading &&
    !versionGTE((hnqis2Metadata as any)?.results?.version, H2_METADATA_VERSION)
  ) {
    return (
      <NoticeBox title="Check HNQIS Framework Metadata" error>
        <p>
          The latest PCA Metadata Package is required to access this HNQIS
          Framework Program.
        </p>
      </NoticeBox>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const createMetadataStatus = (createMetadata.data as any)?.status as
    | string
    | undefined;
  const hasValidationResults =
    validationResults &&
    (validationResults.sections.length > 0 ||
      validationResults.questions.length > 0 ||
      validationResults.scores.length > 0 ||
      validationResults.feedbacks.length > 0);
  const hasRemovedItems =
    importResults &&
    ((importResults as any).questions.removed > 0 ||
      (importResults as any).scores.removed > 0);

  return (
    <div className="cont_stage">
      <div className="sub_nav align-items-center">
        <div className="cnt_p">
          <Link to={'/'}>
            <Chip>Home</Chip>
          </Link>
          /
          <Link to={'/program/' + programId}>
            <Chip>Program: {truncateString(programStage.program.name)}</Chip>
          </Link>
          /<Chip>Stage: {truncateString(programStage.displayName)}</Chip>
        </div>
        <div className="c_srch" />
        <div style={{ color: '#444444', paddingRight: '1em' }}>
          <ButtonStrip>
            {!readOnly && (
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                startIcon={<CheckCircleOutlineIcon />}
                disabled={createMetadata.loading || !programMetadata}
                onClick={commit}
              >
                {' '}
                {saveStatus}
              </Button>
            )}
            {hnqisMode && isSectionMode && (
              <SetupSplitButton
                open={open}
                allAuth={allAuth}
                savedAndValidated={savedAndValidated}
                selectedIndex={selectedIndex}
                anchorRef={anchorRef}
                onMainClick={handleClick}
                onToggle={handleToggle}
                onClose={handleClose}
                onMenuItemClick={handleMenuItemClick}
              />
            )}
            {hnqisMode && isSectionMode && (
              <ImportDownloadButton
                disabled={exportToExcel}
                setImporterEnabled={setImporterEnabled}
                setExportToExcel={setExportToExcel}
                size="small"
              />
            )}
            <Tooltip title="Reload" arrow>
              <IconButton
                size="small"
                name="Reload"
                color="inherit"
                onClick={() => window.location.reload()}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </ButtonStrip>
        </div>
      </div>

      {hnqisMode && importerEnabled && backupData && (
        <Importer
          displayForm={setImporterEnabled}
          setImportResults={setImportResults as any}
          setValidationResults={setValidationResults as any}
          programSpecificType={
            getAttributeValue(
              programStage.program.attributeValues,
              PCA_PROGRAM_TYPE_ATTRIBUTE
            ) as any
          }
          currentStagesData={undefined as any}
          previous={
            {
              sections: [...backupData.sections],
              setSections,
              scoresSection: DeepCopy(backupData.scoresSection),
              setScoresSection,
            } as any
          }
          setSaveStatus={setSaveStatus}
          programMetadata={{ programMetadata, setProgramMetadata } as any}
          currentSectionsData={backupData.currentSectionsData as any}
          setSavedAndValidated={setSavedAndValidated}
        />
      )}

      <div
        className="title"
        style={{
          padding: '1.5em 1em 0',
          overflow: 'hidden',
          display: 'flex',
          maxWidth: '100vw',
          justifyContent: 'start',
          margin: '0',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Sections for Program Stage <strong>{programStage.displayName}</strong>
        </span>
        {readOnly && (
          <MuiChip
            style={{ marginLeft: '1em' }}
            label="Read Only"
            variant="outlined"
          />
        )}
      </div>

      {hnqisMode && exportToExcel && (
        <DataProcessor
          programType={getAttributeValue(
            programStage.program.attributeValues,
            PCA_PROGRAM_TYPE_ATTRIBUTE
          )}
          programName={programStage.program.name}
          ps={programStage}
          stageRefetch={stageRefetch}
          isLoading={setExportToExcel}
        />
      )}

      {createMetadata.loading && <ComponentCover translucent />}

      {createMetadata.error && (
        <AlertStack>
          <AlertBar critical>
            {'Error: ' + JSON.stringify((createMetadata.error as any).message)}
          </AlertBar>
        </AlertStack>
      )}

      {progressSteps === 8 && createMetadataStatus === 'OK' && (
        <AlertStack>
          <AlertBar>Process completed successfully</AlertBar>
        </AlertStack>
      )}

      {createMetadataStatus === 'ERROR' && (
        <AlertStack>
          <AlertBar critical>
            Process ended with error. Please check Errors Summary section for
            more details.
          </AlertBar>
        </AlertStack>
      )}

      {showDisclaimer && (
        <DisclaimerDialog
          onClose={() => setShowDisclaimer(false)}
          onConfirm={() => {
            setShowDisclaimer(false);
            run();
          }}
        />
      )}

      {hnqisMode && saveAndBuild && (
        <SetupProgressDialog
          saveAndBuild={saveAndBuild}
          onClose={() => {
            setSaveAndBuild(false);
            setProgressSteps(0);
          }}
          progressSteps={progressSteps}
          programSettingsError={programSettingsError}
          programName={programStage.program.name}
          deleteLoading={deleteLoading}
          deleteError={deleteError}
          createMetadataStatus={createMetadataStatus}
          androidSettings={androidSettings}
          androidSettingsError={androidSettingsError}
          programMetadata={programMetadata}
          runError={runError}
        />
      )}

      {/* ── Sections List ── */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="wrapper" style={{ overflow: 'auto' }}>
          <div className="layout_prgms_stages">
            {sections.length === 0 && !readOnly && (
              <Button
                startIcon={<AddBoxIcon />}
                variant="contained"
                style={{ margin: '8px' }}
                onClick={SectionActions.append}
              >
                Add New Section
              </Button>
            )}
            {hasRemovedItems && (
              <Removed
                removedItems={(
                  importResults as any
                ).questions.removedItems.concat(
                  (importResults as any).scores.removedItems
                )}
                key="removedSec"
              />
            )}
            {hasValidationResults && (
              <Errors
                validationResults={validationResults.sections
                  .concat(
                    validationResults.questions.concat(validationResults.scores)
                  )
                  .map((element: any) => element.errors)
                  .flat()
                  .concat(validationResults.feedbacks)}
                key="validationSec"
              />
            )}
            {!!errorReports && <ErrorReports errors={errorReports as any} />}
            {createMetadataStatus === 'ERROR' && createMetadata.data && (
              <ErrorReports
                errors={parseErrors(
                  createMetadata.data as Record<string, unknown>
                )}
              />
            )}
            {!programMetadata && (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '1em',
                }}
              >
                <CircularLoader />
              </div>
            )}
            {programMetadata && (
              <Droppable
                droppableId="dpb-sections"
                type="SECTION"
                isDropDisabled={readOnly}
              >
                {(provided: any) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="list-ml_item"
                  >
                    {sections.map((pss, idx) => (
                      <DraggableSection
                        program={programId}
                        dePrefix={programMetadata.dePrefix ?? 'XXXXXXXXXXX'}
                        stageSection={pss}
                        editStatus={
                          addedSection?.index === idx ? addedSection : undefined
                        }
                        stageDataElements={programStageDataElements}
                        DEActions={DEActions}
                        index={idx}
                        key={pss.id ?? idx}
                        SectionActions={SectionActions}
                        hnqisMode={hnqisMode}
                        isSectionMode={isSectionMode}
                        readOnly={readOnly}
                        setSaveStatus={setSaveStatus}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
            {hnqisMode && isSectionMode && (
              <>
                <CriticalCalculations stageSection={criticalSection} />
                <Scores
                  stageSection={scoresSection}
                  key={(scoresSection as ProgramStageSection)?.id ?? 'scores'}
                  program={programId}
                />
              </>
            )}
          </div>
        </div>
      </DragDropContext>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!snackParams}
        autoHideDuration={6000}
        onClose={() => setSnackParams(false)}
      >
        <Alert
          onClose={() => setSnackParams(false)}
          severity={snackParams ? snackParams.severity : undefined}
          sx={{ width: '100%' }}
        >
          {snackParams && snackParams.content}
        </Alert>
      </Snackbar>

      {savingMetadata && backupData && (
        <ValidateMetadata
          hnqisMode={hnqisMode}
          newDEQty={
            importResults
              ? (importResults as any).questions.new +
                (importResults as any).scores.new +
                (importResults as any).sections.new
              : 0
          }
          programStage={programStage}
          importedSections={sections}
          importedScores={scoresSection}
          criticalSection={criticalSection}
          removedItems={
            importResults
              ? (importResults as any).questions.removedItems.concat(
                  (importResults as any).scores.removedItems
                )
              : removedElements
          }
          setSavingMetadata={setSavingMetadata}
          setSavedAndValidated={setSavedAndValidated}
          previous={
            {
              sections: [...backupData.sections],
              setSections,
              scoresSection: DeepCopy(backupData.scoresSection),
              setScoresSection,
            } as any
          }
          setImportResults={setImportResults as any}
          importResults={importResults}
          setValidationResults={setValidationResults}
          programMetadata={programMetadata as any}
          setErrorReports={setErrorReports}
          stagesList={stagesList}
          setExportToExcel={setExportToExcel}
        />
      )}

      {showSectionManager && (
        <SectionManager
          sectionIndex={editSectionIndex}
          newSectionIndex={newSectionIndex}
          setShowSectionForm={setShowSectionManager}
          sections={sections}
          refreshSections={setSections}
          notify={pushNotification}
          setAddedSection={setAddedSection}
          hnqisMode={hnqisMode}
          setSaveStatus={setSaveStatus}
        />
      )}

      {deManager && (
        <DataElementManager
          program={programId}
          deRef={deManager}
          setDeManager={setDeManager}
          programStageDataElements={programStageDataElements}
          saveAdd={saveAdd}
          hnqisMode={hnqisMode}
          setSaveStatus={setSaveStatus}
          dePrefix={programMetadata?.dePrefix ?? 'XXXXXXXXXXX'}
        />
      )}
    </div>
  );
};

export default StageSections;
