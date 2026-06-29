import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';
import { DHIS2_PRIMARY_COLOR } from '../../../../configs/Constants';
import { parseErrorsSaveMetadata } from '../../../../utils/Utils';
import type {
  NormalizedError,
  ResolvedPcaMetadata,
  SaveAndBuildState,
} from '../stageSections.types';
import ProgressStep from './ProgressStep';
import type { StepStatus } from './ProgressStep';

interface ParsedError {
  type: string;
  uid: string;
  errorCode: string;
  message: string;
}

interface SetupProgressDialogProps {
  saveAndBuild: SaveAndBuildState;
  onClose: () => void;
  progressSteps: number;
  programSettingsError: 1 | 2 | undefined;
  programName: string;
  deleteLoading: boolean;
  deleteError: unknown;
  createMetadataStatus: string | undefined;
  androidSettings: unknown;
  androidSettingsError: unknown;
  programMetadata: Partial<ResolvedPcaMetadata> | undefined;
  runError: NormalizedError | null;
}

const resolvePayload = (raw: unknown): unknown | null => {
  const resp = raw as Record<string, unknown>;
  if (!resp) {
    return null;
  }

  // Shape 1 — direct typeReports
  if (Array.isArray(resp.typeReports) && resp.typeReports.length > 0) {
    return raw;
  }
  // Shape 2 — { response: { typeReports } }
  const nested = resp.response as Record<string, unknown> | undefined;
  if (
    Array.isArray(nested?.typeReports) &&
    (nested!.typeReports as unknown[]).length > 0
  ) {
    return raw;
  }
  // Shape 3 — FetchError: body is in .details
  const details = resp.details as Record<string, unknown> | undefined;
  if (details) {
    if (
      Array.isArray(details.typeReports) &&
      (details.typeReports as unknown[]).length > 0
    ) {
      return details;
    }
    const detailsNested = details.response as
      | Record<string, unknown>
      | undefined;
    if (
      Array.isArray(detailsNested?.typeReports) &&
      (detailsNested!.typeReports as unknown[]).length > 0
    ) {
      return details;
    }
  }
  return null;
};

const safeParseErrors = (raw: unknown): ParsedError[] => {
  try {
    const payload = resolvePayload(raw);
    if (!payload) {
      return [];
    }
    return (parseErrorsSaveMetadata(payload) as ParsedError[]) ?? [];
  } catch {
    return [];
  }
};

const formatFallbackError = (err: unknown): string => {
  const e = err as { httpStatus?: string; message?: string; status?: string };
  if (e?.message) {
    return [e.httpStatus, e.message].filter(Boolean).join(': ');
  }
  if (e?.status) {
    return `Import returned status: ${e.status}`;
  }
  return 'An unknown error occurred.';
};

const step1Status = (
  p: number,
  err: 1 | 2 | undefined,
  runFailed: boolean
): StepStatus => {
  if (p !== 1) return 'success';
  if (err) return 'error';
  return runFailed ? 'error' : 'loading';
};

const step1Text = (err: 1 | 2 | undefined) => {
  if (err === 1) return 'Global analytics settings missing.';
  if (err === 2) return 'Configured Organisation Unit Levels not found.';
  return 'Checking Program settings';
};

const androidStatus = (
  p: number,
  settings: unknown,
  error: unknown,
  runFailed: boolean
): StepStatus => {
  if (p === 7) return runFailed ? 'error' : 'loading';
  if (!settings) return 'warning';
  return error ? 'error' : 'success';
};

const androidText = (
  settings: unknown,
  error: unknown,
  createAnalytics: string | undefined
) => {
  const label =
    createAnalytics === 'Yes'
      ? 'Enabling in-app analytics'
      : 'Applying Android Settings';
  if (!settings) return `${label} (Android Settings app not enabled)`;
  if (error) {
    const err = error as { httpStatus?: string; message?: string };
    const msg =
      err.httpStatus === 'Forbidden'
        ? "You don't have permissions to update the Android Settings in this server"
        : err.message;
    return `${label} (Error: ${msg})`;
  }
  return label;
};

interface ErrorAccordionProps {
  title: string;
  severity: 'error' | 'warning';
  errors: ParsedError[];
  fallback: string;
  defaultExpanded?: boolean;
}

const ErrorAccordion = ({
  title,
  severity,
  errors,
  fallback,
  defaultExpanded = false,
}: ErrorAccordionProps) => {
  const isError = severity === 'error';
  const bgColor = isError ? '#fef2f2' : '#fffbeb';
  const borderColor = isError ? '#fca5a5' : '#fcd34d';
  const textColor = isError ? '#c62828' : '#e65100';

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: '2px !important',
        '&:before': { display: 'none' },
        boxShadow: 'none',
      }}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon sx={{ color: textColor, fontSize: '1.5rem' }} />
        }
        sx={{
          backgroundColor: bgColor,
          minHeight: 40,
          borderRadius: 'inherit',
          '& .MuiAccordionSummary-content': {
            my: 0.75,
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: textColor,
            fontSize: '1rem',
          }}
        >
          {title}
        </Typography>
        {errors.length > 0 && (
          <Box
            component="span"
            sx={{
              px: 0.75,
              py: 0.1,
              borderRadius: '10px',
              backgroundColor: isError ? '#c62828' : '#e65100',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {errors.length}
          </Box>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {errors.length > 0 ? (
          <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
            <Table
              size="small"
              stickyHeader
              sx={{ tableLayout: 'fixed', width: '100%' }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 0.5,
                      backgroundColor: bgColor,
                      width: '25%',
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 0.5,
                      backgroundColor: bgColor,
                      width: '25%',
                    }}
                  >
                    UID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 0.5,
                      backgroundColor: bgColor,
                      width: '50%',
                    }}
                  >
                    Message
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errors.map((e, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.9rem', py: 0.5 }}>
                      {e.type}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.9rem',
                        py: 0.5,
                        wordBreak: 'break-all',
                      }}
                    >
                      {e.uid}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem', py: 0.5 }}>
                      {e.message}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{ p: 1.5, color: 'text.secondary', fontSize: '0.82rem' }}
          >
            {fallback}
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const SetupProgressDialog = ({
  saveAndBuild,
  onClose,
  progressSteps,
  programSettingsError,
  programName,
  deleteLoading,
  deleteError,
  createMetadataStatus,
  androidSettings,
  androidSettingsError,
  programMetadata,
  runError,
}: SetupProgressDialogProps) => {
  const canClose =
    saveAndBuild === 'Completed' || createMetadataStatus === 'ERROR';
  const runFailed = saveAndBuild === 'Completed' && !!runError;

  const activeStepStatus = (stepNo: number): StepStatus => {
    if (progressSteps !== stepNo) return 'success';
    return runFailed ? 'error' : 'loading';
  };

  const deleteStatus = (): StepStatus => {
    if (progressSteps === 5 && deleteLoading) {
      return 'loading';
    }
    if (progressSteps > 5 && deleteError) {
      return 'warning';
    }
    if (progressSteps === 5 && runFailed) {
      return 'error';
    }
    return 'success';
  };

  const ok = !programSettingsError;
  const deleteErrors = safeParseErrors(deleteError);
  const runErrors = safeParseErrors(runError?.raw);

  return (
    <Drawer
      anchor="right"
      open={true}
      onClose={() => {
        if (canClose) {
          onClose();
        }
      }}
      transitionDuration={{ enter: 150, exit: 100 }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '33vw' },
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
          Setting Up Program
        </Typography>
        <IconButton
          onClick={canClose ? onClose : undefined}
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
          gap: 0.25,
        }}
      >
        {progressSteps > 0 && (
          <ProgressStep
            status={step1Status(progressSteps, programSettingsError, runFailed)}
          >
            {step1Text(programSettingsError)}
          </ProgressStep>
        )}

        {programSettingsError && (
          <Alert
            severity="error"
            sx={{ mt: 0.5, mb: 0.5, fontSize: '0.82rem' }}
          >
            <AlertTitle sx={{ fontSize: '0.85rem' }}>
              Please do the following:
            </AlertTitle>
            <ol style={{ margin: '4px 0', paddingLeft: '1.2em' }}>
              <li>Go to the Programs List</li>
              <li>
                Search for program: <strong>{programName}</strong>
              </li>
              <li>Open Program Menu</li>
              <li>
                {programSettingsError === 1
                  ? 'Click Edit Program and check that the current program settings are complete'
                  : 'Click Edit Program and make sure that the Organisation Unit Levels are valid.'}
              </li>
            </ol>
          </Alert>
        )}

        {progressSteps > 1 && ok && (
          <ProgressStep status={activeStepStatus(2)}>
            Checking scores
          </ProgressStep>
        )}
        {progressSteps > 2 && ok && (
          <ProgressStep status={activeStepStatus(3)}>
            Reading assessment&apos;s questions
          </ProgressStep>
        )}
        {progressSteps > 3 && ok && (
          <ProgressStep status={activeStepStatus(4)}>
            Building new metadata and analytics
          </ProgressStep>
        )}
        {progressSteps > 4 && ok && (
          <ProgressStep status={deleteStatus()}>
            Deleting old metadata
          </ProgressStep>
        )}
        {progressSteps > 4 && ok && !!deleteError && (
          <ErrorAccordion
            title="Details"
            severity="warning"
            errors={deleteErrors}
            fallback={formatFallbackError(deleteError)}
          />
        )}
        {progressSteps > 5 && ok && (
          <ProgressStep status={activeStepStatus(6)}>
            Importing new metadata
          </ProgressStep>
        )}
        {progressSteps > 5 && ok && !!runError && (
          <ErrorAccordion
            title="Import Report"
            severity="error"
            errors={runErrors}
            fallback={runError.message}
          />
        )}
        {progressSteps > 6 && ok && (
          <ProgressStep
            status={androidStatus(
              progressSteps,
              androidSettings,
              androidSettingsError,
              runFailed
            )}
          >
            {androidText(
              androidSettings,
              androidSettingsError,
              programMetadata?.createAndroidAnalytics
            )}
          </ProgressStep>
        )}
        {progressSteps > 7 && ok && (
          <ProgressStep
            status={
              runFailed
                ? 'error'
                : androidSettings && !androidSettingsError
                ? 'success'
                : 'warning'
            }
          >
            Done!
          </ProgressStep>
        )}
      </Box>

      {/* Footer */}
      <Divider />
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
      >
        <Button variant="contained" disabled={!canClose} onClick={onClose}>
          Done
        </Button>
      </Box>
    </Drawer>
  );
};

export default SetupProgressDialog;
