import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';
import type { Mutation } from '@dhis2/app-service-data';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ASSESSMENT_TET,
  COMPETENCY_ATTRIBUTE,
  COMPETENCY_CLASS,
  CRITICAL_STEPS,
  NON_CRITICAL_STEPS,
} from '../../../configs/Constants';
import {
  EventStage,
  HnqisProgramConfigs,
  Program,
  PS_ActionPlanStage,
  PS_AssessmentStage,
  PSS_CriticalSteps,
  PSS_Default,
  PSS_Scores,
} from '../../../configs/ProgramTemplate';
import { CategoryCombo } from '../../../types';
import {
  parseErrorsJoin,
  truncateString,
  isHnqisProgramType,
  getHnqisPCAType,
} from '../../../utils/Utils';
import InputModal from '../../PRG_Details/InputModal';
import CustomMUIDialog from '../../UIElements/CustomMUIDialog';
import CustomMUIDialogTitle from '../../UIElements/CustomMUIDialogTitle';
import H2Setting from '../H2Setting';
import AttributesFormStep from './components/AttributesFormStep';
import BasicSettingsStep from './components/BasicSettingsStep';
import ProgramNewStepper from './components/ProgramNewStepper';
import ProgramSettingsStep from './components/ProgramSettingsStep';
import {
  metadataMutation,
  queryAvailablePrefix,
  queryCatCombos,
  queryCurrentUser,
  queryHNQIS2Metadata,
  queryId,
  queryIds,
  queryProgramType,
  queryTEAttributes,
  queryTEType,
} from './programNew.queries';
import type {
  CurrentUserResults,
  H2SettingRef,
  MetadataMutateResponse,
  ProgramAttributeValue,
  ProgramNewProps,
  ProgramSection,
  ProgramStage,
  ProgramTeaItem,
  ProgramTeaState,
  ProgramTrackedEntityAttribute,
  QueryResults,
  SelectOption,
  SnackParams,
  TrackedEntityAttribute,
  TrackedEntityType,
  ValidationErrors,
} from './programNew.types';
import {
  buildTrackerTeaState,
  cloneDeep,
  createOrUpdateMetaData,
  getH2Metadata,
  getInitialSectionsEnabled,
  getRequiredTetAttributeIds,
  getTrackerAssignedAttributes,
  getUnassignedAttributes,
  hasPublicAddPermission,
  mergeSelectedTeaIds,
  nextUid,
  removeCompetencyAttribute,
  removeCompetencyClass,
  sanitizeSections,
  stepsLimit,
  toOption,
  updateProgramStageReference,
  validateProgramForm,
} from './programNew.utils';

const ProgramNew: React.FC<ProgramNewProps> = (props) => {
  const h2Ready = localStorage.getItem('h2Ready') === 'true';

  const { data: hnqis2Metadata } =
    useDataQuery<QueryResults<{ version?: string | number }>>(
      queryHNQIS2Metadata
    );
  const { data: currentUser } =
    useDataQuery<QueryResults<CurrentUserResults>>(queryCurrentUser);

  const metadataDM = useDataMutation(metadataMutation as Mutation, {
    onError: (err: { details?: unknown }) => {
      props.setNotification({
        message: parseErrorsJoin(err.details, '\\n'),
        severity: 'error',
      });
      props.setShowProgramForm(false);
    },
  });

  const metadataRequest = {
    mutate: metadataDM[0] as (payload: {
      data: unknown;
    }) => Promise<MetadataMutateResponse>,
    loading: metadataDM[1].loading,
    error: metadataDM[1].error,
    data: metadataDM[1].data,
    called: metadataDM[1].called,
  };

  const prgTypeQuery =
    useDataQuery<QueryResults<{ attributes?: Array<{ id: string }> }>>(
      queryProgramType
    );
  const prgTypeId = prgTypeQuery.data?.results?.attributes?.[0]?.id;

  const idsQuery = useDataQuery<QueryResults<{ codes?: string[] }>>(queryId);
  const uidPool = useMemo(
    () => [...(idsQuery.data?.results?.codes ?? [])],
    [idsQuery.data]
  );

  const teTypeQuery =
    useDataQuery<QueryResults<{ trackedEntityTypes?: TrackedEntityType[] }>>(
      queryTEType
    );
  const trackedEntityTypes =
    teTypeQuery.data?.results?.trackedEntityTypes ?? [];

  const { refetch: findTEAttributes } = useDataQuery<
    QueryResults<{ trackedEntityAttributes?: TrackedEntityAttribute[] }>
  >(queryTEAttributes, { lazy: true });

  const { refetch: findCategoryCombos } = useDataQuery<
    QueryResults<{ categoryCombos?: CategoryCombo[] }>
  >(queryCatCombos, { lazy: true });

  const { refetch: checkForExistingPrefix } = useDataQuery<
    QueryResults<{ programs?: Array<{ id: string }> }>
  >(queryAvailablePrefix, {
    lazy: true,
    variables: { dePrefix: undefined, program: undefined },
  });

  const { refetch: getIds } = useDataQuery<QueryResults<{ codes?: string[] }>>(
    queryIds,
    {
      lazy: true,
    }
  );

  const h2SettingsRef = useRef<H2SettingRef | null>(null);

  const [createPublicObjects, setCreatePublicObjects] = useState(false);
  const [programBackup, setProgramBackup] = useState(
    props.data ? cloneDeep(props.data) : undefined
  );

  const [programId, setProgramId] = useState<string | undefined>(
    props.data?.id
  );
  const [assessmentId, setAssessmentId] = useState<string | undefined>();
  const [actionPlanId, setActionPlanId] = useState<string | undefined>();
  const [defaultSectionId, setDefaultSectionId] = useState<
    string | undefined
  >();
  const [stepsSectionId, setStepsSectionId] = useState<string | undefined>();
  const [scoresSectionId, setScoresSectionId] = useState<string | undefined>();

  const [programIcon, setProgramIcon] = useState(props.data?.style?.icon ?? '');
  const [programColor, setProgramColor] = useState<string | undefined>(
    props.data?.style?.color
  );
  const [pgrTypePCA, setPgrTypePCA] = useState(props.programType ?? '');
  const [programTET, setProgramTET] = useState<SelectOption | null>(
    toOption(props.data?.trackedEntityType)
  );

  const [dePrefix, setDePrefix] = useState(props.pcaMetadata?.dePrefix ?? '');
  const [programName, setProgramName] = useState(props.data?.name ?? '');
  const [programShortName, setProgramShortName] = useState(
    props.data?.shortName ?? ''
  );
  const [programCode, setProgramCode] = useState(props.data?.code ?? '');
  const [sentForm, setSentForm] = useState(false);

  const [programTEAs, setProgramTEAs] = useState<ProgramTeaState>({
    available: [],
    selected: [],
  });

  const [programCategoryCombos, setProgramCategoryCombos] = useState<
    CategoryCombo[]
  >([{ name: 'default', id: '' }]);

  const [categoryCombo, setCategoryCombo] = useState<SelectOption | null>(
    toOption(props.data?.categoryCombo)
  );

  const [validationStrategy, setValidationStrategy] = useState(
    props.data?.programStages?.[0]?.validationStrategy ?? 'ON_UPDATE_AND_INSERT'
  );

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [buttonDisabled, setButtonDisabled] = useState(!props.data);

  const [activeStep, setActiveStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [basicValidated, setBasicValidated] = useState(true);
  const [hnqisValidated, setHnqisValidated] = useState(true);

  const [snackParams, setSnackParams] = useState<SnackParams | false>(false);

  const [useSections, setUseSections] = useState(
    getInitialSectionsEnabled(props.data)
  );
  const [attributesFormSections, setAttributesFormSections] = useState<
    ProgramSection[]
  >(props.data?.programSections ?? []);
  const [assignedAttributes, setAssignedAttributes] = useState<
    ProgramTeaItem[]
  >([]);

  const [inputModalOpened, setInputModalOpened] = useState(false);

  useEffect(() => {
    if (uidPool.length === 30 && !props.data) {
      const workingPool = [...uidPool];
      setProgramId(nextUid(workingPool));
      setAssessmentId(nextUid(workingPool));
      setActionPlanId(nextUid(workingPool));
      setDefaultSectionId(nextUid(workingPool));
      setStepsSectionId(nextUid(workingPool));
      setScoresSectionId(nextUid(workingPool));
    }
  }, [props.data, uidPool]);

  useEffect(() => {
    setCreatePublicObjects(
      hasPublicAddPermission(currentUser?.results?.authorities)
    );
  }, [currentUser]);

  useEffect(() => {
    if (props.data) {
      setProgramBackup(cloneDeep(props.data));
    }
  }, [props.data]);

  const pushNotification = (
    content: string,
    severity: SnackParams['severity'] = 'success'
  ) => {
    setSnackParams({ content, severity });
  };

  const changeStep = (step: number) => {
    setPreviousStep(activeStep);
    setActiveStep(step);
  };

  const updateAssignedAttributes = (
    nextTeaState: ProgramTeaState,
    nextSections: ProgramSection[] = attributesFormSections
  ) => {
    const sanitizedSections = sanitizeSections(
      nextSections,
      nextTeaState.selected
    );
    setAttributesFormSections(sanitizedSections);
    setAssignedAttributes(
      getUnassignedAttributes(
        nextTeaState.selected,
        nextTeaState.available,
        sanitizedSections
      )
    );
  };

  const fetchTrackerMetadata = async () => {
    const data = (await findTEAttributes()) as QueryResults<{
      trackedEntityAttributes?: TrackedEntityAttribute[];
    }>;
    const trackedEntityAttributes = data?.results?.trackedEntityAttributes;

    if (!trackedEntityAttributes) {
      return;
    }

    const teaState = buildTrackerTeaState({
      data: props.data,
      trackedEntityAttributes,
    });

    setProgramTEAs(teaState);
    setAssignedAttributes(
      props.data
        ? getTrackerAssignedAttributes({ data: props.data, teaState })
        : getUnassignedAttributes(
            teaState.selected,
            teaState.available,
            attributesFormSections
          )
    );

    setAttributesFormSections((currentSections) =>
      sanitizeSections(currentSections, teaState.selected)
    );
  };

  useEffect(() => {
    if (pgrTypePCA !== 'tracker' && pgrTypePCA !== 'event') {
      return;
    }

    if (pgrTypePCA === 'tracker') {
      void fetchTrackerMetadata();
    }

    void findCategoryCombos().then((ccData) => {
      const comboData = ccData as QueryResults<{
        categoryCombos?: CategoryCombo[];
      }>;
      if (comboData?.results?.categoryCombos) {
        setProgramCategoryCombos([
          { name: 'default', id: '' },
          ...comboData.results.categoryCombos,
        ]);
      }
    });
  }, [findCategoryCombos, pgrTypePCA]);

  const handleProgramTypeChange = (value: typeof pgrTypePCA) => {
    setValidationErrors((current) => ({
      ...current,
      pgrType: undefined,
      programTET: undefined,
    }));

    setPgrTypePCA(value);

    if (isHnqisProgramType(value)) {
      setButtonDisabled(false);
      const hnqisTET = trackedEntityTypes.find(
        (tet) => tet.id === ASSESSMENT_TET
      );
      setProgramTET(
        hnqisTET ? { label: hnqisTET.name, id: hnqisTET.id } : null
      );
      return;
    }

    setProgramTET(null);

    if (value === 'event') {
      setButtonDisabled(false);
      return;
    }

    if (value === 'tracker') {
      setButtonDisabled(false);
      void fetchTrackerMetadata();
      return;
    }

    setButtonDisabled(true);
  };

  const handleProgramTETChange = (value: SelectOption | null) => {
    const requiredIds = getRequiredTetAttributeIds(trackedEntityTypes, value);
    const nextSelected = value
      ? mergeSelectedTeaIds(
          programTEAs.selected.filter(
            (teaId) =>
              !getRequiredTetAttributeIds(
                trackedEntityTypes,
                programTET
              ).includes(teaId)
          ),
          requiredIds
        )
      : programTEAs.selected;

    const nextTeaState: ProgramTeaState = {
      ...programTEAs,
      selected: nextSelected,
    };

    setProgramTET(value);
    setProgramTEAs(nextTeaState);
    setValidationErrors((current) => ({
      ...current,
      programTET: undefined,
    }));
    updateAssignedAttributes(nextTeaState);
  };

  const handleChangeTEAs = ({ selected }: { selected: string[] }) => {
    const requiredIds = getRequiredTetAttributeIds(
      trackedEntityTypes,
      programTET
    );
    const missingRequired = requiredIds.some((id) => !selected.includes(id));
    const nextSelected = missingRequired
      ? mergeSelectedTeaIds(selected, requiredIds)
      : selected;

    if (missingRequired) {
      pushNotification(
        'You must include all Tracked Entity Type attributes',
        'error'
      );
    }

    const nextTeaState: ProgramTeaState = {
      ...programTEAs,
      selected: nextSelected,
    };

    setProgramTEAs(nextTeaState);
    updateAssignedAttributes(nextTeaState);
  };

  const hideForm = () => {
    if (props.data && programBackup) {
      props.data.programSections = programBackup.programSections;
      props.data.programTrackedEntityAttributes =
        programBackup.programTrackedEntityAttributes;
    }
    props.setShowProgramForm(false);
  };

  const onAddNewSection = async (name: string) => {
    const results = (await getIds({ n: 1 })) as QueryResults<{
      codes?: string[];
    }>;
    const id = results.results?.codes?.[0];

    if (!id) {
      return;
    }

    setAttributesFormSections((current) => [
      ...current,
      {
        id,
        name,
        trackedEntityAttributes: [],
      },
    ]);
  };

  const formDataIsValid = () => {
    const validation = validateProgramForm({
      dePrefix,
      h2Ref: h2SettingsRef.current,
      pgrTypePCA,
      programCode,
      programName,
      programShortName,
      programTET,
    });

    setBasicValidated(validation.basicValidated);
    setHnqisValidated(validation.hnqisValidated);
    setValidationErrors(validation.errors);

    return validation.basicValidated && validation.hnqisValidated;
  };

  const submission = async () => {
    setSentForm(true);
    props.setNotification(undefined);

    if (!formDataIsValid()) {
      setSentForm(false);
      return;
    }

    const useCompetency = isHnqisProgramType(pgrTypePCA)
      ? getH2Metadata(h2SettingsRef.current).useCompetencyClass === 'Yes'
      : undefined;

    const prefixResult = (await checkForExistingPrefix({
      dePrefix,
      program: props.data?.name,
    })) as QueryResults<{ programs?: Array<{ id: string }> }>;

    if ((prefixResult.results?.programs?.length ?? 0) > 0) {
      setValidationErrors((current) => ({
        ...current,
        prefix: 'The specified Data Element Prefix is already in use',
      }));
      setBasicValidated(false);
      setSentForm(false);
      return;
    }

    if (metadataRequest.called) {
      return;
    }

    const uidWorkingPool = [...uidPool];
    const prgrm: any = props.data ? cloneDeep(props.data) : cloneDeep(Program);
    let programStages: ProgramStage[] | undefined;
    let programStageSections: Array<Record<string, unknown>> | undefined;
    let programSections: ProgramSection[] = [];

    prgrm.name = programName;
    prgrm.shortName = programShortName;
    prgrm.code = programCode;
    prgrm.id = programId ?? nextUid(uidWorkingPool);

    const style: Record<string, string> = {};
    if (programIcon) {
      style.icon = programIcon;
    }
    if (programColor) {
      style.color = programColor;
    }
    prgrm.style = Object.keys(style).length ? style : undefined;

    if (isHnqisProgramType(pgrTypePCA)) {
      let assessmentStage: any;
      let actionPlanStage: any;
      let criticalSteps: any;
      let defaultSection: any;
      let scores: any;
      let excludedStageDEs: any[] = [];

      if (!props.data) {
        Object.assign(prgrm, HnqisProgramConfigs);
        prgrm.attributeValues.push({
          value: getHnqisPCAType(pgrTypePCA),
          attribute: { id: prgTypeId ?? '' },
        });
        prgrm.programStages.push({ id: assessmentId });
        prgrm.programStages.push({ id: actionPlanId });

        assessmentStage = cloneDeep(PS_AssessmentStage);
        assessmentStage.id = assessmentId;
        assessmentStage.name = `Assessment [${prgrm.id}]`;
        assessmentStage.programStageSections.push({ id: defaultSectionId });
        assessmentStage.programStageSections.push({ id: stepsSectionId });
        assessmentStage.programStageSections.push({ id: scoresSectionId });
        assessmentStage.program = { id: prgrm.id };

        actionPlanStage = cloneDeep(PS_ActionPlanStage);
        actionPlanStage.id = actionPlanId;
        actionPlanStage.name = `Action Plan [${prgrm.id}]`;
        actionPlanStage.program = { id: prgrm.id };
        actionPlanStage.programStageDataElements =
          actionPlanStage.programStageDataElements.map(
            (psde: Record<string, unknown>) => ({
              ...psde,
              programStage: { id: actionPlanId },
            })
          );

        defaultSection = cloneDeep(PSS_Default);
        defaultSection.id = defaultSectionId;
        defaultSection.programStage = { id: assessmentId ?? '' };

        criticalSteps = cloneDeep(PSS_CriticalSteps);
        criticalSteps.id = stepsSectionId;
        criticalSteps.programStage = { id: assessmentId ?? '' };

        scores = cloneDeep(PSS_Scores);
        scores.id = scoresSectionId;
        scores.programStage = { id: assessmentId ?? '' };
      } else {
        assessmentStage = prgrm.programStages.find((stage: ProgramStage) =>
          stage.name?.toLowerCase().includes('assessment')
        );

        const exclusionsDEs = [
          CRITICAL_STEPS,
          NON_CRITICAL_STEPS,
          COMPETENCY_CLASS,
        ];
        excludedStageDEs =
          assessmentStage?.programStageDataElements?.filter(
            (elem: any) => !exclusionsDEs.includes(elem.dataElement.id)
          ) ?? [];
      }

      prgrm.programTrackedEntityAttributes = cloneDeep(
        HnqisProgramConfigs.programTrackedEntityAttributes
      );

      if (!useCompetency) {
        prgrm.programTrackedEntityAttributes = removeCompetencyAttribute(
          prgrm.programTrackedEntityAttributes
        );

        if (props.data) {
          criticalSteps = prgrm.programStages
            .flatMap((stage: ProgramStage) => stage.programStageSections ?? [])
            .find(
              (section: any) =>
                section.dataElements?.some(
                  (de: any) => de.id === CRITICAL_STEPS
                ) || section.name === 'Critical Steps Calculations'
            );
        }

        prgrm.programStages = updateProgramStageReference(prgrm.programStages);

        if (criticalSteps) {
          criticalSteps.dataElements = [
            { id: CRITICAL_STEPS },
            { id: NON_CRITICAL_STEPS },
            { id: COMPETENCY_CLASS },
          ];
          criticalSteps.dataElements = removeCompetencyClass(
            criticalSteps.dataElements
          );
        }
      } else if (props.data) {
        criticalSteps = prgrm.programStages
          .flatMap((stage: ProgramStage) => stage.programStageSections ?? [])
          .find((section: any) =>
            section.dataElements?.some((de: any) => de.id === CRITICAL_STEPS)
          );

        if (!criticalSteps) {
          criticalSteps = prgrm.programStages
            .flatMap((stage: ProgramStage) => stage.programStageSections ?? [])
            .find(
              (section: any) => section.name === 'Critical Steps Calculations'
            );
        }

        if (criticalSteps) {
          criticalSteps.dataElements = [
            { id: CRITICAL_STEPS },
            { id: NON_CRITICAL_STEPS },
            { id: COMPETENCY_CLASS },
          ];
        }

        prgrm.programTrackedEntityAttributes =
          prgrm.programTrackedEntityAttributes.filter(
            (ptea: ProgramTrackedEntityAttribute) =>
              ptea.trackedEntityAttribute.id !== COMPETENCY_ATTRIBUTE
          );

        prgrm.programTrackedEntityAttributes.push({
          trackedEntityAttribute: { id: 'ulU9KKgSLYe' },
          mandatory: false,
          valueType: 'TEXT',
          searchable: false,
          displayInList: false,
          sortOrder: 5,
        });
      }

      createOrUpdateMetaData({
        attributeValues: prgrm.attributeValues as ProgramAttributeValue[],
        dePrefix,
        h2Ref: h2SettingsRef.current,
        programType: pgrTypePCA,
      });

      if (
        assessmentStage &&
        (assessmentStage.programStageDataElements?.length === 0 || props.data)
      ) {
        assessmentStage.programStageDataElements = [
          ...excludedStageDEs,
          ...((criticalSteps?.dataElements ?? []).map(
            (de: any, index: number) => ({
              sortOrder: index + excludedStageDEs.length,
              compulsory: false,
              displayInReports: false,
              programStage: { id: assessmentStage.id },
              dataElement: de,
            })
          ) as any[]),
        ];
      }

      if (!props.data) {
        programStages = [assessmentStage, actionPlanStage].filter(Boolean);
        programStageSections = [defaultSection, criticalSteps, scores].filter(
          Boolean
        );
      } else {
        programStageSections = criticalSteps ? [criticalSteps] : undefined;
        programStages = assessmentStage ? [assessmentStage] : undefined;
      }
    } else {
      if (pgrTypePCA === 'tracker') {
        prgrm.trackedEntityType = programTET
          ? { id: programTET.id }
          : undefined;
        prgrm.programTrackedEntityAttributes = programTEAs.selected
          .map((teaId, index) => {
            const tea = programTEAs.available.find(
              (availableTea) => availableTea.trackedEntityAttribute.id === teaId
            );
            return tea ? { ...tea, sortOrder: index } : undefined;
          })
          .filter(Boolean);

        if (useSections) {
          programSections = attributesFormSections.map((section, index) => ({
            ...section,
            sortOrder: index,
            program: { id: prgrm.id },
          }));
        }

        prgrm.programSections = programSections.map((section) => ({
          id: section.id,
        }));
      }

      if (pgrTypePCA === 'event') {
        prgrm.withoutRegistration = true;
        prgrm.programType = 'WITHOUT_REGISTRATION';

        const editStage = (
          props.data?.programStages?.[0]
            ? cloneDeep(props.data.programStages[0])
            : cloneDeep(EventStage)
        ) as ProgramStage;

        if (!props.data) {
          editStage.id = nextUid(uidWorkingPool);
        }

        editStage.name = prgrm.name;
        editStage.validationStrategy = validationStrategy;
        editStage.program = { id: prgrm.id };
        prgrm.programStages = [{ id: editStage.id }];
        programStages = [editStage];
      }

      prgrm.attributeValues = prgrm.attributeValues ?? [];
      prgrm.categoryCombo =
        categoryCombo && categoryCombo.id
          ? { id: categoryCombo.id }
          : undefined;

      createOrUpdateMetaData({
        attributeValues: prgrm.attributeValues,
        dePrefix,
        h2Ref: h2SettingsRef.current,
        programType: pgrTypePCA,
      });
    }

    const metadata = {
      programs: [prgrm],
      programStages,
      programStageSections,
      programSections,
    };

    const response = await metadataRequest.mutate({ data: metadata });

    if (response.status !== 'OK') {
      props.setNotification({
        message: parseErrorsJoin(response, '\\n'),
        severity: 'error',
      });
      props.setShowProgramForm(false);
      return;
    }

    props.setNotification({
      message: `Program ${prgrm.name} ${
        !props.data ? 'created' : 'updated'
      } successfully`,
      severity: 'success',
    });
    props.setShowProgramForm(false);
    props.programsRefetch();
    props.doSearch(prgrm.name);
  };

  return (
    <>
      <CustomMUIDialog open maxWidth="lg" fullWidth>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={Boolean(snackParams)}
          autoHideDuration={4000}
          onClose={() => setSnackParams(false)}
        >
          <Alert
            onClose={() => setSnackParams(false)}
            severity={snackParams ? snackParams.severity : 'success'}
            sx={{ width: '100%' }}
          >
            {snackParams ? snackParams.content : ''}
          </Alert>
        </Snackbar>

        <CustomMUIDialogTitle id="customized-dialog-title" onClose={hideForm}>
          {props.data
            ? `Edit Program - ${truncateString(props.data.name)}`
            : 'Create New Program'}
        </CustomMUIDialogTitle>

        <DialogContent
          dividers
          style={{
            padding: '1em 2em',
            height: '65vh',
            maxHeight: '65vh',
            overflowX: 'hidden',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <ProgramNewStepper
              activeStep={activeStep}
              basicValidated={basicValidated}
              hnqisValidated={hnqisValidated}
              onStepChange={changeStep}
              pgrTypePCA={pgrTypePCA}
            />
          </div>

          <div className="stepperContent">
            <Slide
              in={activeStep === 0}
              direction={activeStep > previousStep ? 'left' : 'right'}
            >
              <div style={{ display: activeStep === 0 ? 'inherit' : 'none' }}>
                <BasicSettingsStep
                  dePrefix={dePrefix}
                  h2Enabled={h2Ready}
                  hnqisMetadataVersion={hnqis2Metadata?.results?.version}
                  lockedProgramType={props.programType}
                  onChangeCode={setProgramCode}
                  onChangeDePrefix={setDePrefix}
                  onChangeProgramName={setProgramName}
                  onChangeProgramShortName={setProgramShortName}
                  onChangeProgramType={handleProgramTypeChange}
                  onProgramTETChange={handleProgramTETChange}
                  pgrTypePCA={pgrTypePCA}
                  programCode={programCode}
                  programColor={programColor}
                  programIcon={programIcon}
                  programName={programName}
                  programShortName={programShortName}
                  programTET={programTET}
                  setProgramColor={setProgramColor}
                  setProgramIcon={setProgramIcon}
                  trackedEntityTypes={trackedEntityTypes}
                  validationErrors={validationErrors}
                />
              </div>
            </Slide>

            <Slide
              in={isHnqisProgramType(pgrTypePCA) && activeStep === 1}
              direction={activeStep > previousStep ? 'left' : 'right'}
            >
              <div
                style={{
                  display:
                    isHnqisProgramType(pgrTypePCA) && activeStep === 1
                      ? 'inherit'
                      : 'none',
                }}
              >
                <H2Setting
                  pcaMetadata={props.pcaMetadata}
                  ref={h2SettingsRef}
                />
              </div>
            </Slide>

            <Slide
              in={
                (pgrTypePCA === 'tracker' || pgrTypePCA === 'event') &&
                activeStep === 1
              }
              direction={activeStep > previousStep ? 'left' : 'right'}
            >
              <div
                style={{
                  display:
                    (pgrTypePCA === 'tracker' || pgrTypePCA === 'event') &&
                    activeStep === 1
                      ? 'inherit'
                      : 'none',
                }}
              >
                <ProgramSettingsStep
                  categoryCombo={categoryCombo}
                  onCategoryComboChange={setCategoryCombo}
                  onChangeTEAs={handleChangeTEAs}
                  onValidationStrategyChange={setValidationStrategy}
                  pgrTypePCA={pgrTypePCA}
                  programCategoryCombos={programCategoryCombos}
                  programTEAs={programTEAs}
                  validationErrors={validationErrors}
                  validationStrategy={validationStrategy}
                />
              </div>
            </Slide>

            {programTEAs.available.length > 0 && (
              <Slide
                in={pgrTypePCA === 'tracker' && activeStep === 2}
                direction={activeStep > previousStep ? 'left' : 'right'}
              >
                <div
                  style={{
                    display:
                      pgrTypePCA === 'tracker' && activeStep === 2
                        ? 'inherit'
                        : 'none',
                  }}
                >
                  <AttributesFormStep
                    assignedAttributes={assignedAttributes}
                    attributesFormSections={attributesFormSections}
                    createPublicObjects={createPublicObjects}
                    onAddNewSection={() => setInputModalOpened(true)}
                    onToggleUseSections={setUseSections}
                    programTEAs={programTEAs}
                    setAssignedAttributes={setAssignedAttributes}
                    setAttributesFormSections={setAttributesFormSections}
                    setProgramTEAs={setProgramTEAs}
                    useSections={useSections}
                  />
                </div>
              </Slide>
            )}
          </div>
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
          <Button onClick={hideForm} color="error">
            Close
          </Button>

          {props.readOnly && (
            <Tooltip
              title="You don't have access to edit this Program"
              placement="top"
              arrow
            >
              <span>
                <Button variant="outlined" disabled startIcon={<SendIcon />}>
                  Submit
                </Button>
              </span>
            </Tooltip>
          )}

          {activeStep < stepsLimit[pgrTypePCA] && (
            <Button
              onClick={() => setActiveStep(activeStep + 1)}
              variant="outlined"
              startIcon={<ArrowForwardIcon />}
            >
              Next Step
            </Button>
          )}

          {!props.readOnly && activeStep === stepsLimit[pgrTypePCA] && (
            <LoadingButton
              onClick={submission}
              disabled={buttonDisabled}
              loading={sentForm}
              variant="outlined"
              loadingPosition="start"
              startIcon={<SendIcon />}
            >
              Submit
            </LoadingButton>
          )}
        </DialogActions>
      </CustomMUIDialog>

      {inputModalOpened && (
        <InputModal
          opened={inputModalOpened}
          title="Form Section Name"
          label="Name"
          value=""
          onClose={() => setInputModalOpened(false)}
          onConfirm={(value: string) => {
            void onAddNewSection(value);
            setInputModalOpened(false);
          }}
        />
      )}
    </>
  );
};

export default ProgramNew;
