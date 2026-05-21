import { NoticeBox } from '@dhis2/ui';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import type {
  DhisApiError,
  MetadataImportResponse,
} from '../../../../types/pca';
import CustomMUIDialog from '../../../UIElements/CustomMUIDialog';
import CustomMUIDialogTitle from '../../../UIElements/CustomMUIDialogTitle';
import type {
  NormalizedError,
  ResolvedPcaMetadata,
  SaveAndBuildState,
} from '../stageSections.types';
import ProgressStep from './ProgressStep';
import type { StepStatus } from './ProgressStep';

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
    const err = error as Partial<DhisApiError>;
    const msg =
      err.httpStatus === 'Forbidden'
        ? "You don't have permissions to update the Android Settings in this server"
        : err.message;
    return `${label} (Error: ${msg})`;
  }
  return label;
};

/**
 * Extracts a human-readable message from a delete error, which may be either
 * a body-level MetadataImportResponse (HTTP 200 with status ERROR/WARNING) or
 * a DhisApiError thrown for non-200 responses.
 */
const formatDeleteError = (err: unknown): string => {
  const resp = err as Partial<MetadataImportResponse>;
  if (resp?.typeReports?.length) {
    const messages = resp.typeReports
      .flatMap((tr) =>
        (tr.objectReports ?? []).flatMap((or) =>
          (or.errorReports ?? []).map((er) => er.message)
        )
      )
      .filter(Boolean)
      .slice(0, 5);
    return messages.length
      ? `${resp.status}: ${messages.join('; ')}`
      : `Import returned status: ${resp.status}`;
  }
  const apiErr = err as Partial<DhisApiError>;
  if (apiErr?.message) {
    return [apiErr.httpStatus, apiErr.message].filter(Boolean).join(': ');
  }
  return 'Unknown deletion error';
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
  const handleClose = () => {
    if (canClose) onClose();
  };

  // Returns 'error' instead of 'loading' when the run has finished with a failure,
  // so the step that was active at the time of failure shows an X rather than a spinner.
  const activeStepStatus = (stepNo: number): StepStatus => {
    if (progressSteps !== stepNo) return 'success';
    return runFailed ? 'error' : 'loading';
  };

  const deleteStatus = (): StepStatus => {
    if (progressSteps === 5 && deleteLoading) return 'loading';
    if (progressSteps > 5 && deleteError) return 'warning';
    if (progressSteps === 5 && runFailed) return 'error';
    return 'success';
  };

  const ok = !programSettingsError;

  return (
    <CustomMUIDialog open={true} maxWidth="sm" fullWidth={true}>
      <CustomMUIDialogTitle id="customized-dialog-title" onClose={handleClose}>
        Setting Up Program
      </CustomMUIDialogTitle>
      <DialogContent dividers style={{ padding: '1em 2em' }}>
        {progressSteps > 0 && (
          <>
            <ProgressStep
              status={step1Status(
                progressSteps,
                programSettingsError,
                runFailed
              )}
            >
              {step1Text(programSettingsError)}
            </ProgressStep>
            {programSettingsError === 1 && (
              <NoticeBox title="Please do the following:">
                <ol>
                  <li>Go to the Programs List</li>
                  <li>Search for program: {programName}</li>
                  <li>Open Program Menu</li>
                  <li>
                    Click Edit Program and check that the current program
                    settings are complete
                  </li>
                </ol>
              </NoticeBox>
            )}
            {programSettingsError === 2 && (
              <NoticeBox title="Please do the following:">
                <ol>
                  <li>Go to the Programs List</li>
                  <li>Search for program: {programName}</li>
                  <li>Open Program Menu</li>
                  <li>
                    Click Edit Program and make sure that the Organisation Unit
                    Levels are valid.
                  </li>
                </ol>
              </NoticeBox>
            )}
          </>
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
          <>
            <ProgressStep status={deleteStatus()}>
              Deleting old metadata
            </ProgressStep>
            {deleteError && (
              <NoticeBox
                warning
                title="Warning: could not delete old metadata (import will still proceed)"
              >
                {formatDeleteError(deleteError)}
              </NoticeBox>
            )}
          </>
        )}
        {progressSteps > 5 && ok && (
          <ProgressStep status={activeStepStatus(6)}>
            Importing new metadata
          </ProgressStep>
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
        {runError && (
          <NoticeBox error title="Setup failed">
            {runError.message}
          </NoticeBox>
        )}
      </DialogContent>
      <DialogActions style={{ padding: '1em' }}>
        <Button variant="outlined" disabled={!canClose} onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </CustomMUIDialog>
  );
};

export default SetupProgressDialog;
