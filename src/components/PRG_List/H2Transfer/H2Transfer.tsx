import {
  useDataEngine,
  useDataMutation,
  useDataQuery,
} from '@dhis2/app-runtime';
import type { Mutation } from '@dhis2/app-service-data';
import { CircularLoader, NoticeBox } from '@dhis2/ui';
import CloseIcon from '@mui/icons-material/Close';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import PanToolIcon from '@mui/icons-material/PanTool';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
import {
  DATE_FORMAT_OPTIONS,
  DHIS2_PRIMARY_COLOR,
  METADATA,
  TRANSFERRED_EVENTS_NAMESPACE,
} from '../../../configs/Constants';
import type { TrackerImportResponse } from '../../../types';
import { parseErrorsJoin } from '../../../utils/Utils';
import AlertDialogSlide from '../../UIElements/AlertDialogSlide';
import { getProgramFromResponse } from '../H2Convert/h2Convert.utils';
import FailedRecordsList from './components/FailedRecordsList';
import {
  buildAddProgramOrgUnitsMutation,
  buildDataStoreCreateMutation,
  buildDataStoreQuery,
  buildDataStoreUpdateMutation,
  metadataMutation,
  queryEventList,
  queryProgramEvent,
  queryProgramMetadata,
} from './h2Transfer.queries';
import type {
  EventListItem,
  FailedTransferRecord,
  H2ProgramMetadata,
  H2TransferProps,
  MapDataElementEntry,
  TrackerEvent,
  TransferredEventsStore,
} from './h2Transfer.types';
import { buildHnqisTEI, extractTrackerErrors } from './h2Transfer.utils';

const ORG_UNITS_PREVIEW_LIMIT = 10;

const H2Transfer = ({
  programConfig,
  setTransferH2Program,
  setNotification,
  doSearch,
}: H2TransferProps) => {
  const queryDataStore = buildDataStoreQuery(
    TRANSFERRED_EVENTS_NAMESPACE,
    programConfig.id
  );
  const dsCreateMutation = buildDataStoreCreateMutation(
    TRANSFERRED_EVENTS_NAMESPACE,
    programConfig.id
  );
  const dsUpdateMutation = buildDataStoreUpdateMutation(
    TRANSFERRED_EVENTS_NAMESPACE,
    programConfig.id
  );

  const { loading: dsLoading, data: dsData } = useDataQuery(queryDataStore);
  const dsCreateDM = useDataMutation(dsCreateMutation, {
    onError: (err: any) => {
      setNotification({
        message: parseErrorsJoin(err.details, '\n'),
        severity: 'error',
      });
      setTransferH2Program(undefined);
    },
  });
  const dsUpdateDM = useDataMutation(dsUpdateMutation as unknown as Mutation, {
    onError: (err: any) => {
      setNotification({
        message: parseErrorsJoin(err.details, '\n'),
        severity: 'error',
      });
      setTransferH2Program(undefined);
    },
  });

  const dsCreateRequest = { mutate: dsCreateDM[0] };
  const dsUpdateRequest = { mutate: dsUpdateDM[0] };

  const engine = useDataEngine();

  const [h2Program, setH2Program] = useState<H2ProgramMetadata | undefined>(
    undefined
  );

  const [loading, setLoading] = useState(true);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [failedRecords, setFailedRecords] = useState<FailedTransferRecord[]>(
    []
  );
  const [requestsData, setRequestsData] = useState<EventListItem[] | undefined>(
    undefined
  );
  const [failedData, setFailedData] = useState<EventListItem[] | undefined>(
    undefined
  );

  const [progressValue, setProgressValue] = useState(0);
  const cancelTransfer = useRef(false);

  const [confirmAddOrgUnitsOpen, setConfirmAddOrgUnitsOpen] = useState(false);
  const [addingOrgUnits, setAddingOrgUnits] = useState(false);

  const { data: programData, error: programDataError } = useDataQuery(
    queryEventList,
    {
      variables: { program: programConfig.id },
    }
  );

  const { refetch: getEvent } = useDataQuery(queryProgramEvent, {
    variables: { program: undefined, eventId: undefined },
    lazy: true,
  });

  const { refetch: getH2Program } = useDataQuery(queryProgramMetadata, {
    lazy: true,
    variables: {},
  });

  useEffect(() => {
    if (programData && !dsLoading) {
      const metadata = JSON.parse(
        programConfig.attributeValues.find((av) => av.attribute.id === METADATA)
          ?.value || '{}'
      );
      getH2Program({
        program: metadata.upgradedProgram,
      }).then(async (data) => {
        const h2ProgramData = getProgramFromResponse(data) as
          | H2ProgramMetadata
          | undefined;
        if (h2ProgramData) {
          const dataStoreResults = (
            dsData as { results?: TransferredEventsStore } | undefined
          )?.results;
          if (!dataStoreResults) {
            await dsCreateRequest.mutate({ data: {} });
          }
          setH2Program(h2ProgramData);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programData, dsLoading]);

  useEffect(() => {
    if (h2Program) {
      const events =
        (programData as { results?: { events?: EventListItem[] } } | undefined)
          ?.results?.events ?? [];
      const dataStoreResults =
        (dsData as { results?: TransferredEventsStore } | undefined)?.results ??
        {};
      const convertEvents = events.filter(
        (event) => !dataStoreResults[event.event]
      );

      const result = convertEvents.reduce<{
        valid: EventListItem[];
        invalid: EventListItem[];
      }>(
        (res, event) => {
          res[
            h2Program.organisationUnits
              .map((ou) => ou.id)
              .includes(event.orgUnit)
              ? 'valid'
              : 'invalid'
          ].push(event);
          return res;
        },
        { valid: [], invalid: [] }
      );

      setRequestsData(result.valid);
      setFailedData(result.invalid);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h2Program]);

  const hideForm = () => {
    setTransferH2Program(undefined);
  };

  const submission = async () => {
    if (!h2Program || !requestsData) {
      return;
    }

    cancelTransfer.current = false;

    const metadataH2 = JSON.parse(
      h2Program.attributeValues.find((av) => av.attribute.id === METADATA)
        ?.value || '{}'
    );

    let assessmentStageId = '';
    let actionPlanStageId = '';
    let assessmentStageDataElements: H2ProgramMetadata['programStages'][number]['programStageDataElements'] =
      [];

    const mapDataElements = h2Program.programStages.reduce<
      Record<string, MapDataElementEntry>
    >((programDataElements, stage) => {
      if (stage.name.toLowerCase().includes('assessment')) {
        assessmentStageId = stage.id;
        assessmentStageDataElements = stage.programStageDataElements;
      } else {
        actionPlanStageId = stage.id;
      }
      const stageDataElements = stage.programStageDataElements.reduce<
        Record<string, MapDataElementEntry>
      >((acu, de) => {
        const deMetadata = JSON.parse(
          de.dataElement.attributeValues.find(
            (att) => att.attribute.id === METADATA
          )?.value || '{}'
        );
        acu[de.dataElement.id] = {
          metadata: deMetadata,
          critical: deMetadata.isCritical === 'Yes',
        };
        return acu;
      }, {});
      return { ...programDataElements, ...stageDataElements };
    }, {});

    const competencyMap: Record<string, string> = {
      C: 'competent',
      CNI: 'improvement',
      NC: 'notcompetent',
    };

    const actionPlanControlDEs = [
      'H1_ACTION1',
      'H1_RESPONSIBLE1',
      'H1_DUE_DATE1',
      'H1_COMPLETION_DATE1',
      'H1_ACTION2',
      'H1_RESPONSIBLE2',
      'H1_DUE_DATE2',
      'H1_COMPLETION_DATE2',
      'H1_ACTION3',
      'H1_RESPONSIBLE3',
      'H1_DUE_DATE3',
      'H1_COMPLETION_DATE3',
      'H1_ACTION_PLAN_OLD',
      'H1_ACTION1_OLD',
      'H1_ACTION2_OLD',
    ];

    const obj: TransferredEventsStore =
      (dsData as { results?: TransferredEventsStore } | undefined)?.results ??
      {};

    setProgressValue(0);
    setFailedRecords([]);
    setLoadingConversion(true);

    const failed: FailedTransferRecord[] = [];

    for (const [index, eventReq] of requestsData.entries()) {
      if (cancelTransfer.current) {
        break;
      }

      const eventFetch = await getEvent({
        program: programConfig.id,
        eventId: eventReq.event,
      });

      const event = (eventFetch as { results?: { events?: TrackerEvent[] } })
        .results?.events?.[0];

      if (!event) {
        failed.push({
          event: eventReq.event,
          reason: 'Event not found in server.',
          errors: [],
        });
        setFailedRecords([...failed]);
        setProgressValue(index + 1);
        continue;
      }

      const hnqisTEI = buildHnqisTEI({
        event,
        metadataH2,
        mapDataElements,
        competencyMap,
        actionPlanControlDEs,
        assessmentStageId,
        actionPlanStageId,
        assessmentStageDataElements,
        h2ProgramId: h2Program.id,
      });

      try {
        const storedData = (await engine.mutate(metadataMutation, {
          variables: { data: { trackedEntities: [hnqisTEI] } },
        })) as unknown as TrackerImportResponse;

        if (storedData.status === 'OK') {
          const trackedEntityReport =
            storedData.bundleReport?.typeReportMap?.TRACKED_ENTITY
              ?.objectReports?.[0];
          const enrollmentReport =
            storedData.bundleReport?.typeReportMap?.ENROLLMENT
              ?.objectReports?.[0];

          obj[eventReq.event] = {
            transferDate: new Date().toLocaleString(
              'en-US',
              DATE_FORMAT_OPTIONS
            ),
            trackedEntityInstance: trackedEntityReport?.uid,
            enrollment: enrollmentReport?.uid,
            originEvent: eventReq.event,
          };
          await dsUpdateRequest.mutate({ data: obj });
        } else {
          failed.push({
            event: eventReq.event,
            reason: 'Failed to convert Assessment to Modern HNQIS.',
            errors: extractTrackerErrors(storedData),
          });
          setFailedRecords([...failed]);
        }
      } catch (err) {
        failed.push({
          event: eventReq.event,
          reason: 'Failed to convert Assessment to Modern HNQIS.',
          errors: extractTrackerErrors(err),
        });
        setFailedRecords([...failed]);
      }

      setProgressValue(index + 1);
    }

    setLoadingConversion(false);

    if (cancelTransfer.current) {
      setNotification({
        message: 'Data transfer interrupted by user',
        severity: 'warning',
      });
      return;
    }

    if (failed.length > 0) {
      setNotification({
        message: `HNQIS 1.X Program Data transferred to Modern HNQIS. ${
          failed.length
        } of ${requestsData.length} assessment${
          failed.length === 1 ? '' : 's'
        } could not be transferred, see the panel for details.`,
        severity: 'warning',
      });
    } else {
      doSearch(programConfig.name);
      setNotification({
        message: 'HNQIS 1.X Program Data transferred to Modern HNQIS',
        severity: 'success',
      });
      setTransferH2Program(undefined);
    }
  };

  const canClose = !loadingConversion;
  const hasRun = progressValue > 0 || failedRecords.length > 0;
  const percentage =
    requestsData && requestsData.length > 0
      ? (progressValue / requestsData.length) * 100
      : 0;

  const missingOrgUnits = (failedData ?? [])
    .map((ev) => ev.orgUnit)
    .filter((item, i, ar) => ar.indexOf(item) === i);
  const visibleMissingOrgUnits = missingOrgUnits.slice(
    0,
    ORG_UNITS_PREVIEW_LIMIT
  );
  const hiddenMissingOrgUnitsCount =
    missingOrgUnits.length - visibleMissingOrgUnits.length;

  const copyMissingOrgUnits = () => {
    navigator.clipboard
      .writeText(missingOrgUnits.join(','))
      .then(() => {
        setNotification({
          message: 'Organisation Unit IDs copied to clipboard',
          severity: 'success',
        });
      })
      .catch(() => {
        setNotification({
          message: 'Could not copy Organisation Unit IDs',
          severity: 'error',
        });
      });
  };

  const addMissingOrgUnitsToProgram = async () => {
    if (!h2Program || missingOrgUnits.length === 0) {
      return;
    }

    setAddingOrgUnits(true);

    const updatedOrgUnits = [
      ...h2Program.organisationUnits,
      ...missingOrgUnits.map((id) => ({ id })),
    ];

    try {
      await engine.mutate(
        buildAddProgramOrgUnitsMutation(h2Program.id) as unknown as Mutation,
        {
          variables: {
            additions: missingOrgUnits.map((id) => ({ id })),
          },
        }
      );
      setH2Program({ ...h2Program, organisationUnits: updatedOrgUnits });
      setNotification({
        message: `${missingOrgUnits.length} Organisation Unit${
          missingOrgUnits.length === 1 ? '' : 's'
        } added to ${h2Program.name}`,
        severity: 'success',
      });
    } catch (err) {
      const error = err as { details?: unknown };
      setNotification({
        message: parseErrorsJoin(error.details ?? error, '\n'),
        severity: 'error',
      });
    } finally {
      setAddingOrgUnits(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={() => {
        if (canClose) {
          hideForm();
        }
      }}
      transitionDuration={{ enter: 150, exit: 100 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '50vw' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: DHIS2_PRIMARY_COLOR,
          color: 'primary.contrastText',
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
          Transfer all HNQIS 1.X Data to Modern HNQIS
        </Typography>
        <IconButton
          onClick={canClose ? hideForm : undefined}
          disabled={!canClose}
          size="small"
          sx={{
            color: 'primary.contrastText',
            '&.Mui-disabled': { color: 'primary.contrastText', opacity: 0.38 },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {loading && !programDataError && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularLoader />
            <Typography sx={{ fontSize: '1.1em', mt: 0.5 }}>
              Fetching and Preparing Data
            </Typography>
          </Box>
        )}

        {programDataError && (
          <NoticeBox error title="An error has occurred">
            <p>
              {programDataError.details?.message ?? programDataError.message}
            </p>
          </NoticeBox>
        )}

        {!loading && h2Program && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Card sx={{ maxWidth: '30%' }} variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  Current Program
                </Typography>
                <Typography variant="body2">{programConfig.name}</Typography>
              </CardContent>
            </Card>
            <DoubleArrowIcon className="progress-animation" />
            <Card sx={{ maxWidth: '25%' }} variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  Transfer Data
                </Typography>
                <Typography variant="body2">
                  {(requestsData?.length ?? 0) + ' Assessments'}
                </Typography>
              </CardContent>
            </Card>
            <DoubleArrowIcon className="progress-animation" />
            <Card sx={{ maxWidth: '30%' }} variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  New Program
                </Typography>
                <Typography variant="body2">{h2Program.name}</Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {failedData && failedData.length > 0 && (
          <NoticeBox
            error
            title="The target Program lacks some Organisation Units from the transfer data"
          >
            <p>
              A total of{' '}
              <strong>
                {failedData.length} Assessment
                {failedData.length > 1 ? 's were' : ' was'} ignored
              </strong>{' '}
              because the Program <strong>{h2Program?.name}</strong> has not
              been assigned to the following Organisation Units:{' '}
              {visibleMissingOrgUnits.join(', ')}
              {hiddenMissingOrgUnitsCount > 0
                ? ` ... (${hiddenMissingOrgUnitsCount} more)`
                : ''}
              .
            </p>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Button onClick={copyMissingOrgUnits} size="small" variant="text">
                Copy Org Units list
              </Button>
              <Button
                onClick={() => setConfirmAddOrgUnitsOpen(true)}
                size="small"
                variant="text"
                color="error"
                disabled={addingOrgUnits}
              >
                {addingOrgUnits
                  ? 'Adding Org Units…'
                  : 'Add Org Units to Program'}
              </Button>
            </Box>
          </NoticeBox>
        )}

        <AlertDialogSlide
          open={confirmAddOrgUnitsOpen}
          title={`Add ${missingOrgUnits.length} Organisation Unit${
            missingOrgUnits.length === 1 ? '' : 's'
          } to ${h2Program?.name ?? 'the target Program'}?`}
          content={`This will update the target Program's configuration in DHIS2, assigning it to the Organisation Unit${
            missingOrgUnits.length === 1 ? '' : 's'
          } listed above. This changes the live Program metadata and cannot be undone from here.`}
          primaryText="Yes, add them"
          secondaryText="Cancel"
          color="error"
          actions={{
            primary: () => {
              setConfirmAddOrgUnitsOpen(false);
              void addMissingOrgUnitsToProgram();
            },
            secondary: () => setConfirmAddOrgUnitsOpen(false),
          }}
        />

        {loadingConversion && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" component="div" color="inherit">
              {`Transferring Assessment ${progressValue} of ${
                requestsData?.length ?? 0
              }`}
            </Typography>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 0.5,
              }}
            >
              <CircularProgress size={20} />
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={percentage} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {`${Math.round(percentage)}%`}
              </Typography>
            </Box>
          </Box>
        )}

        {!loadingConversion && hasRun && (
          <Typography variant="body2">
            {`${progressValue} of ${requestsData?.length ?? 0} assessment${
              requestsData?.length === 1 ? '' : 's'
            } processed, ${failedRecords.length} failed.`}
          </Typography>
        )}

        <FailedRecordsList failedRecords={failedRecords} />
      </Box>

      <Divider />
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          flexShrink: 0,
        }}
      >
        {!loadingConversion && !hasRun && (
          <>
            <Button onClick={hideForm} color="error">
              Cancel
            </Button>
            <Button
              onClick={() => {
                void submission();
              }}
              variant="outlined"
              disabled={!h2Program || requestsData?.length === 0}
              startIcon={<MoveDownIcon />}
            >
              Begin Data Transfer
            </Button>
          </>
        )}
        {loadingConversion && (
          <Button
            onClick={() => {
              cancelTransfer.current = true;
            }}
            color="error"
            variant="contained"
            startIcon={<PanToolIcon />}
            disabled={cancelTransfer.current}
          >
            Stop
          </Button>
        )}
        {!loadingConversion && hasRun && (
          <Button onClick={hideForm} variant="contained" color="primary">
            Close
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default H2Transfer;
