import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';
import { CircularLoader } from '@dhis2/ui';
import UpgradeIcon from '@mui/icons-material/SwitchAccessShortcutAdd';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import {
  COMPETENCY_CLASS,
  COMPOSITIVE_SCORE_ATTRIBUTE,
  FEEDBACK_ORDER,
  FEEDBACK_TEXT,
  H1_QUESTION_HIDE_GROUP,
  H1_QUESTION_HIDE_TYPE,
  LEGEND_YES_NO,
  METADATA,
  QUESTION_ORDER_ATTRIBUTE,
  QUESTION_PARENT_ATTRIBUTE,
  QUESTION_PARENT_OPTIONS_ATTRIBUTE,
  QUESTION_TYPE_ATTRIBUTE,
  SCORE_DEN_ATTRIBUTE,
  SCORE_NUM_ATTRIBUTE,
} from '../../../configs/Constants';
import {
  HnqisProgramConfigs,
  Program,
  PS_ActionPlanStage,
  PS_AssessmentStage,
  PSS_CriticalSteps,
  PSS_Scores,
} from '../../../configs/ProgramTemplate';
import {
  DeepCopy,
  padValue,
  parseErrorsJoin,
  parseErrorsUL,
} from '../../../utils/Utils';
import AlertDialogSlide from '../../UIElements/AlertDialogSlide';
import CustomMUIDialog from '../../UIElements/CustomMUIDialog';
import CustomMUIDialogTitle from '../../UIElements/CustomMUIDialogTitle';
import AssessmentPreview from './components/AssessmentPreview';
import ConversionStatusDialog from './components/ConversionStatusDialog';
import ModernSettingsAccordion from './components/ModernSettingsAccordion';
import {
  metadataMutation,
  queryHealthAreas,
  queryId,
  queryOptions,
  queryProgramMetadata,
  queryProgramType,
} from './h2Convert.queries';
import type {
  H2ConvertProps,
  H2SettingRef,
  PreviewScore,
  PreviewSection,
} from './h2Convert.types';
import {
  buildHealthAreaOptions,
  buildPreviewState,
  getProgramFromResponse,
} from './h2Convert.utils';

const HNQIS_VERSIONS: Record<
  string,
  { name: string; shortName: string; tag: string }
> = {
  HNQIS2: {
    name: 'HNQIS2',
    shortName: 'H2',
    tag: '[HNQIS2]',
  },
  HNQIS3: {
    name: 'HNQIS3',
    shortName: 'H3',
    tag: '[HNQIS3]',
  },
};

const H2Convert = ({
  program,
  setConversionH2ProgramId,
  setNotification,
  doSearch,
}: H2ConvertProps) => {
  const h2SettingsRef = useRef<H2SettingRef | null>(null);

  const [hnqisVersion, setHnqisVersion] = useState('HNQIS3');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [conversionError, setConversionError] = useState<string | undefined>(
    undefined
  );
  const [errorBadge, setErrorBadge] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [healthAreaOptions, setHealthAreaOptions] = useState<
    Array<{ label: string; value: string }> | undefined
  >(undefined);
  const [sectionsData, setSectionsData] = useState<
    PreviewSection[] | undefined
  >(undefined);
  const [scoresData, setScoresData] = useState<PreviewScore[] | undefined>(
    undefined
  );
  const [currentChecklistOptions, setCurrentChecklistOptions] = useState<
    string[] | undefined
  >(undefined);

  const [mutateMetadata] = useDataMutation(metadataMutation, {
    onError: (error: any) => {
      setNotification({
        message: parseErrorsJoin(error.details, '\n'),
        severity: 'error',
      });
      setConversionH2ProgramId(undefined);
    },
  });

  const { data: programData } = useDataQuery(queryProgramMetadata, {
    variables: { program },
  });
  const { data: healthAreasQuery } = useDataQuery(queryHealthAreas);

  const { refetch: getIds } = useDataQuery(queryId, {
    lazy: true,
    variables: { n: undefined },
  });
  const { refetch: getProgramTypeAttribute } = useDataQuery(queryProgramType, {
    lazy: true,
  });
  const { refetch: getChecklistOptions } = useDataQuery(queryOptions, {
    lazy: true,
    variables: { optionsList: undefined },
  });

  const programDetails = getProgramFromResponse(programData);

  useEffect(() => {
    if (programData && healthAreasQuery) {
      const options = healthAreasQuery?.results?.optionSets?.[0]?.options ?? [];
      setHealthAreaOptions(buildHealthAreaOptions(options));
    }
  }, [healthAreasQuery, programData]);

  useEffect(() => {
    if (healthAreaOptions) {
      setLoading(false);
    }
  }, [healthAreaOptions]);

  useEffect(() => {
    if (!programDetails) {
      return;
    }

    const previewState = buildPreviewState(programDetails);
    setCurrentChecklistOptions(previewState.currentChecklistOptions);
    setSectionsData(previewState.sectionsData);
    setScoresData(previewState.scoresData);
  }, [programDetails]);

  const hideForm = () => {
    setConversionH2ProgramId(undefined);
  };

  const submission = () => {
    const isValid = h2SettingsRef.current?.handleFormValidation() ?? false;
    setErrorBadge(!isValid);

    if (isValid) {
      setConfirmationOpen(true);
    }
  };

  const convertProgram = async () => {
    setLoadingConversion(true);
    setStatusModalOpen(true);
    setConversionError(undefined);

    const sections = DeepCopy(sectionsData ?? []);
    const scores = DeepCopy(scoresData ?? []);

    let compositiveScoreOrder = '';
    let questionFeedbackOrder = 1;
    let labelsQuantity = 0;
    let programStageDataElementSortOrder = 1;
    const originalLabelIds: string[] = [];

    const optionsResult = await getChecklistOptions({
      optionsList: currentChecklistOptions ?? [],
    });
    const optionsMap = optionsResult?.results?.options ?? [];

    const programDataElements: any[] = [];
    const programStageDataElements: any[] = [];
    const questionHideGroups: Record<string, string> = {};

    sections.forEach((section: PreviewSection) => {
      section.dataElements.forEach((dataElementEntry) => {
        const hideGroup = dataElementEntry.metadata[H1_QUESTION_HIDE_GROUP];
        const hideType = dataElementEntry.metadata[H1_QUESTION_HIDE_TYPE];

        if (hideGroup && hideType === 'PARENT') {
          questionHideGroups[hideGroup] =
            dataElementEntry.programStageDataElement.dataElement.id;
        }
      });
    });

    let newSections = sections.map((section, sectionIndex) => {
      section.dataElements = section.dataElements
        .sort(
          (left, right) =>
            Number.parseInt(
              left.metadata[QUESTION_ORDER_ATTRIBUTE] ?? '0',
              10
            ) -
            Number.parseInt(right.metadata[QUESTION_ORDER_ATTRIBUTE] ?? '0', 10)
        )
        .filter((dataElementEntry) => {
          const formName =
            dataElementEntry.programStageDataElement.dataElement.formName ?? '';
          return formName.toLowerCase().replaceAll(' ', '') !== 'endoftab';
        })
        .map((dataElementEntry, dataElementIndex) => {
          const programStageDataElement = DeepCopy(
            dataElementEntry.programStageDataElement
          );
          programStageDataElement.sortOrder = programStageDataElementSortOrder;
          programStageDataElement.dataElement = {
            id: dataElementEntry.programStageDataElement.dataElement.id,
          };
          programStageDataElements.push(programStageDataElement);
          programStageDataElementSortOrder += 1;

          const dataElement =
            dataElementEntry.programStageDataElement.dataElement;

          if (
            [
              'NUMBER',
              'INTEGER',
              'INTEGER_POSITIVE',
              'INTEGER_ZERO_OR_POSITIVE',
            ].includes(dataElement.valueType ?? '')
          ) {
            dataElement.aggregationType = 'SUM';
          }

          if (dataElementEntry.metadata[COMPOSITIVE_SCORE_ATTRIBUTE]) {
            if (
              dataElementEntry.metadata[COMPOSITIVE_SCORE_ATTRIBUTE] !==
              compositiveScoreOrder
            ) {
              compositiveScoreOrder =
                dataElementEntry.metadata[COMPOSITIVE_SCORE_ATTRIBUTE];
              questionFeedbackOrder = 1;
            }

            const feedbackOrder = `${compositiveScoreOrder}.${questionFeedbackOrder++}`;
            const feedbackOrderIndex = dataElement.attributeValues.findIndex(
              (attributeValue) => attributeValue.attribute.id === FEEDBACK_ORDER
            );
            const feedbackOrderAttribute = {
              attribute: { id: FEEDBACK_ORDER },
              value: feedbackOrder,
            };

            if (feedbackOrderIndex > -1) {
              dataElement.attributeValues[feedbackOrderIndex] =
                feedbackOrderAttribute;
            } else {
              dataElement.attributeValues.push(feedbackOrderAttribute);
            }
          }

          if (dataElement.description) {
            const feedbackTextIndex = dataElement.attributeValues.findIndex(
              (attributeValue) => attributeValue.attribute.id === FEEDBACK_TEXT
            );
            const feedbackTextAttribute = {
              attribute: { id: FEEDBACK_TEXT },
              value: dataElement.description,
            };

            if (feedbackTextIndex > -1) {
              dataElement.attributeValues[feedbackTextIndex] =
                feedbackTextAttribute;
            } else {
              dataElement.attributeValues.push(feedbackTextAttribute);
            }

            dataElement.description = undefined;
            dataElement.displayDescription = undefined;
          }

          let parentQuestion =
            dataElementEntry.metadata[QUESTION_PARENT_ATTRIBUTE];
          let parentValue = optionsMap.find(
            (option: { id: string; code: string }) =>
              option.id ===
              dataElementEntry.metadata[
                QUESTION_PARENT_OPTIONS_ATTRIBUTE
              ]?.split(',')?.[0]
          )?.code;

          const hideGroup = dataElementEntry.metadata[H1_QUESTION_HIDE_GROUP];
          const hideType = dataElementEntry.metadata[H1_QUESTION_HIDE_TYPE];
          if (!parentQuestion && hideGroup && hideType === 'CHILD') {
            parentQuestion = questionHideGroups[hideGroup];
            parentValue = '1';
          }

          const pcaMetadata: Record<string, unknown> = {
            elemType: 'question',
            isCompulsory: programStageDataElement.compulsory ? 'Yes' : 'No',
            isCritical: programStageDataElement.compulsory ? 'Yes' : 'No',
            varName: `_S${padValue(sectionIndex + 1, '00')}Q${padValue(
              dataElementIndex + 1,
              '000'
            )}`,
            parentQuestion,
            parentValue: Number.parseFloat(parentValue ?? '') || parentValue,
            scoreNum:
              Number.parseFloat(
                dataElementEntry.metadata[SCORE_NUM_ATTRIBUTE] ?? ''
              ) || undefined,
            scoreDen:
              Number.parseFloat(
                dataElementEntry.metadata[SCORE_DEN_ATTRIBUTE] ?? ''
              ) || undefined,
          };

          if (dataElementEntry.metadata[QUESTION_TYPE_ATTRIBUTE] === '7') {
            pcaMetadata.elemType = 'label';
            pcaMetadata.labelFormName = `${dataElement.formName ?? ''}`;
            dataElement.name = `${(dataElement.name ?? '').slice(0, 225)} [${
              HNQIS_VERSIONS[hnqisVersion].shortName
            }]`;
            dataElement.shortName = `${(dataElement.shortName ?? '').slice(
              0,
              45
            )} [${HNQIS_VERSIONS[hnqisVersion].shortName}]`;
            dataElement.code = `${(dataElement.code ?? '').slice(0, 45)} [${
              HNQIS_VERSIONS[hnqisVersion].shortName
            }]`;
            dataElement.formName = '   ';
            originalLabelIds.push(dataElement.id);
            dataElement.valueType = 'LONG_TEXT';
            dataElement.aggregationType = 'NONE';
            labelsQuantity += 1;
          }

          if (pcaMetadata.scoreNum && pcaMetadata.scoreDen) {
            dataElement.legendSets = [{ id: LEGEND_YES_NO }];
          }

          const metadataIndex = dataElement.attributeValues.findIndex(
            (attributeValue) => attributeValue.attribute.id === METADATA
          );
          const metadataAttribute = {
            attribute: { id: METADATA },
            value: JSON.stringify(pcaMetadata),
          };

          if (metadataIndex > -1) {
            dataElement.attributeValues[metadataIndex] = metadataAttribute;
          } else {
            dataElement.attributeValues.push(metadataAttribute);
          }

          programDataElements.push(dataElement);
          return { id: dataElement.id };
        });

      section.sortOrder = (sectionIndex + 1) * 10;
      section.programStage = { id: 'STAGE ID' };
      return section;
    });

    const newScores = scores.map((score) => {
      const dataElement = DeepCopy(score.dataElement);
      dataElement.aggregationType = 'AVERAGE';

      const feedbackOrderIndex = dataElement.attributeValues.findIndex(
        (attributeValue) => attributeValue.attribute.id === FEEDBACK_ORDER
      );
      const feedbackOrderAttribute = {
        attribute: { id: FEEDBACK_ORDER },
        value: score.metadata[COMPOSITIVE_SCORE_ATTRIBUTE],
      };

      if (feedbackOrderIndex > -1) {
        dataElement.attributeValues[feedbackOrderIndex] =
          feedbackOrderAttribute;
      } else {
        dataElement.attributeValues.push(feedbackOrderAttribute);
      }

      const metadataAttribute = {
        attribute: { id: METADATA },
        value: JSON.stringify({
          isCompulsory: 'No',
          isCritical: 'No',
          elemType: 'score',
        }),
      };
      const metadataIndex = dataElement.attributeValues.findIndex(
        (attributeValue) => attributeValue.attribute.id === METADATA
      );

      if (metadataIndex > -1) {
        dataElement.attributeValues[metadataIndex] = metadataAttribute;
      } else {
        dataElement.attributeValues.push(metadataAttribute);
      }

      programStageDataElements.push({
        displayInReports: false,
        compulsory: false,
        sortOrder: programStageDataElementSortOrder,
        dataElement: { id: dataElement.id },
        programStage: { id: 'X' },
      });
      programStageDataElementSortOrder += 1;

      programDataElements.push(dataElement);
      return { id: score.dataElement.id };
    });

    const newIds = await getIds({
      n: 20 + labelsQuantity + newSections.length,
    });
    const uidPool = newIds?.results?.codes
      ? [...newIds.results.codes]
      : undefined;

    const programTypeData = await getProgramTypeAttribute();
    const programTypeId = programTypeData?.results?.attributes?.[0]?.id;

    if (!uidPool || !programTypeId || !programDetails) {
      setConversionError('Error while fetching Metadata from the server');
      setLoadingConversion(false);
      return;
    }

    const programId = uidPool.shift() as string;
    const assessmentId = uidPool.shift() as string;
    const actionPlanId = uidPool.shift() as string;
    const stepsSectionId = uidPool.shift() as string;
    const scoresSectionId = uidPool.shift() as string;

    const convertedProgram = DeepCopy(Program);
    Object.assign(convertedProgram, HnqisProgramConfigs);
    convertedProgram.attributeValues = [];
    convertedProgram.attributeValues.push({
      value: HNQIS_VERSIONS[hnqisVersion].name,
      attribute: { id: programTypeId },
    });

    const pcaMetadata = h2SettingsRef.current?.saveMetaData() ?? {};
    const useCompetency = pcaMetadata?.useCompetencyClass === 'Yes';
    pcaMetadata.h1Program = programDetails.id;
    pcaMetadata.dePrefix = `${(programDetails.shortName ?? '').slice(0, 22)} ${
      HNQIS_VERSIONS[hnqisVersion].shortName
    }`;
    convertedProgram.attributeValues.push({
      value: JSON.stringify(pcaMetadata),
      attribute: { id: METADATA },
    });

    convertedProgram.id = programId;
    convertedProgram.name = `${HNQIS_VERSIONS[hnqisVersion].tag} ${(
      programDetails.name ?? ''
    ).slice(0, 221)}`;
    convertedProgram.shortName = `${HNQIS_VERSIONS[hnqisVersion].tag} ${(
      programDetails.shortName ?? ''
    ).slice(0, 41)}`;
    convertedProgram.code = programDetails.code
      ? `${HNQIS_VERSIONS[hnqisVersion].tag} ${String(
          programDetails.code
        ).slice(0, 41)}`
      : undefined;
    convertedProgram.style = programDetails.style;
    convertedProgram.programStages.push({ id: assessmentId });
    convertedProgram.programStages.push({ id: actionPlanId });
    convertedProgram.organisationUnits = programDetails.organisationUnits;
    convertedProgram.sharing = programDetails.sharing;

    const assessmentStage = DeepCopy(PS_AssessmentStage);
    assessmentStage.sharing = programDetails.sharing;
    assessmentStage.id = assessmentId;
    assessmentStage.name = `Assessment [${programId}]`;
    assessmentStage.program.id = programId;

    newSections = newSections.map((section) => {
      section.programStage = { id: assessmentId };
      section.id = uidPool.shift() as string;
      assessmentStage.programStageSections.push({ id: section.id });
      return section;
    });

    assessmentStage.programStageSections.push({ id: stepsSectionId });
    assessmentStage.programStageSections.push({ id: scoresSectionId });

    const actionPlanStage = DeepCopy(PS_ActionPlanStage);
    actionPlanStage.name = `Action Plan [${programId}]`;
    actionPlanStage.id = actionPlanId;
    actionPlanStage.program.id = programId;
    actionPlanStage.sharing = programDetails.sharing;

    const criticalSteps = DeepCopy(PSS_CriticalSteps);
    criticalSteps.id = stepsSectionId;
    criticalSteps.programStage.id = assessmentId;
    criticalSteps.sortOrder = (newSections.length + 1) * 10;

    const scoresSection = DeepCopy(PSS_Scores);
    scoresSection.id = scoresSectionId;
    scoresSection.programStage.id = assessmentId;
    scoresSection.sortOrder = criticalSteps.sortOrder + 10;
    scoresSection.dataElements = newScores;

    if (!useCompetency) {
      const competencyIndex = criticalSteps.dataElements.findIndex(
        (dataElement: { id: string }) => {
          return dataElement.id === COMPETENCY_CLASS;
        }
      );
      if (competencyIndex > -1) {
        criticalSteps.dataElements.splice(competencyIndex, 1);
      }
    }

    assessmentStage.programStageDataElements = programStageDataElements.map(
      (programStageDataElement) => {
        programStageDataElement.programStage = { id: assessmentId };
        return programStageDataElement;
      }
    );

    actionPlanStage.programStageDataElements =
      actionPlanStage.programStageDataElements.map(
        (programStageDataElement) => {
          programStageDataElement.programStage = { id: actionPlanId };
          return programStageDataElement;
        }
      );

    assessmentStage.programStageDataElements =
      assessmentStage.programStageDataElements.concat(
        criticalSteps.dataElements.map(
          (dataElement: { id: string }, index: number) => ({
            sortOrder:
              index + assessmentStage.programStageDataElements.length + 1,
            compulsory: false,
            displayInReports: false,
            programStage: { id: assessmentStage.id },
            dataElement,
          })
        )
      );

    const programStages = [assessmentStage, actionPlanStage];
    const programStageSections = newSections.concat(
      criticalSteps,
      scoresSection
    );

    const legacyMetadataAttribute = {
      attribute: { id: METADATA },
      value: JSON.stringify({
        h2Reworked: 'Yes',
        upgradedProgram: convertedProgram.id,
      }),
    };

    const legacyMetadataIndex = programDetails.attributeValues.findIndex(
      (attributeValue: { attribute: { id: string } }) =>
        attributeValue.attribute.id === METADATA
    );
    if (legacyMetadataIndex > -1) {
      programDetails.attributeValues[legacyMetadataIndex] =
        legacyMetadataAttribute;
    } else {
      programDetails.attributeValues.push(legacyMetadataAttribute);
    }

    programDetails.programStages.forEach((programStage: any) => {
      delete programStage.programStageDataElements;
      delete programStage.programStageSections;
    });

    const labelIdMapping: Record<string, string> = {};
    originalLabelIds.forEach((id) => {
      const newId = uidPool.shift();
      if (newId) {
        labelIdMapping[id] = newId;
      }
    });

    programStages.forEach((programStage) => {
      programStage.programStageDataElements.forEach(
        (programStageDataElement: any) => {
          programStageDataElement.dataElement.id =
            labelIdMapping[programStageDataElement.dataElement.id] ??
            programStageDataElement.dataElement.id;
        }
      );
    });

    programStageSections.forEach((programStageSection: any) => {
      programStageSection.dataElements.forEach((dataElement: any) => {
        dataElement.id = labelIdMapping[dataElement.id] ?? dataElement.id;
      });
    });

    programDataElements.forEach((dataElement: any) => {
      dataElement.id = labelIdMapping[dataElement.id] ?? dataElement.id;
    });

    const resultMetadata = {
      programs: [convertedProgram, programDetails],
      programStages,
      programStageSections,
      dataElements: programDataElements,
    };

    const response = await mutateMetadata({ data: resultMetadata });
    if (response.status === 'OK') {
      doSearch(programDetails.name);
      setNotification({
        message: `The HNQIS 1.X Program has been converted to ${HNQIS_VERSIONS[hnqisVersion].name} successfully, access it to apply changes and finish the setup.`,
        severity: 'success',
      });
      setConversionH2ProgramId(undefined);
    } else {
      setConversionError(parseErrorsUL(response));
    }

    setLoadingConversion(false);
  };

  return (
    <>
      <CustomMUIDialog open maxWidth="md" fullWidth>
        <CustomMUIDialogTitle id="h2-convert-dialog-title" onClose={hideForm}>
          Convert HNQIS 1.X Program to {HNQIS_VERSIONS[hnqisVersion].name}
        </CustomMUIDialogTitle>

        <DialogContent
          dividers
          style={{
            padding: '1em 2em',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularLoader />
              <Typography sx={{ fontSize: '1.1em', mt: 0.5 }}>
                Preparing Metadata
              </Typography>
            </Box>
          )}

          {!loading && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5em',
                }}
              >
                <Typography sx={{ mt: 0.5 }}>
                  <strong>Selected Program: </strong>
                  {programDetails?.name}
                </Typography>

                <FormControl variant="standard">
                  <InputLabel id="hnqis-version-label">
                    HNQIS Version
                  </InputLabel>
                  <Select
                    labelId="hnqis-version-label"
                    id="hnqis-version-select"
                    value={hnqisVersion}
                    label="HNQIS Version"
                    onChange={(event) => setHnqisVersion(event.target.value)}
                  >
                    {Object.entries(HNQIS_VERSIONS).map(([key, version]) => (
                      <MenuItem key={key} value={key}>
                        {version.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <ModernSettingsAccordion
                errorBadge={errorBadge}
                h2SettingsRef={h2SettingsRef}
                setButtonDisabled={setButtonDisabled}
              />
            </>
          )}

          <AssessmentPreview
            sectionsData={sectionsData}
            scoresData={scoresData}
          />
        </DialogContent>

        <DialogActions style={{ padding: '1em' }}>
          <Button onClick={hideForm} color="error">
            Cancel
          </Button>
          {!loading && (
            <Button
              onClick={submission}
              variant="outlined"
              disabled={!programData?.results}
              startIcon={<UpgradeIcon />}
            >
              Convert to {HNQIS_VERSIONS[hnqisVersion].name}
            </Button>
          )}
        </DialogActions>
      </CustomMUIDialog>

      <AlertDialogSlide
        open={confirmationOpen}
        title={`Are you sure you want to convert this program to ${HNQIS_VERSIONS[hnqisVersion].name}?`}
        content="A new program will be created re-using as many Data Elements as possible and assigning the same Organisation Units and Sharing Settings as the original. The program will not be available for conversion again after the process ends."
        primaryText="Yes, continue"
        secondaryText="Cancel"
        color="success"
        actions={{
          primary: () => {
            setConfirmationOpen(false);
            void convertProgram();
          },
          secondary: () => {
            setConfirmationOpen(false);
          },
        }}
      />

      <ConversionStatusDialog
        open={statusModalOpen}
        loadingConversion={loadingConversion}
        conversionError={conversionError}
        buttonDisabled={buttonDisabled}
        onClose={() => {
          setConversionError(undefined);
          setStatusModalOpen(false);
        }}
      />
    </>
  );
};

export default H2Convert;
