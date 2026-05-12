import { NoticeBox } from '@dhis2/ui';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import CustomMUIDialog from '../../../UIElements/CustomMUIDialog';
import CustomMUIDialogTitle from '../../../UIElements/CustomMUIDialogTitle';
import type {
  NormalizedError,
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
  programMetadata: Record<string, any> | undefined;
  runError: NormalizedError | null;
}

const step1Status = (p: number, err: 1 | 2 | undefined): StepStatus => {
  if (p !== 1) return 'success';
  return err ? 'error' : 'loading';
};

const step1Text = (err: 1 | 2 | undefined) => {
  if (err === 1) return 'Global analytics settings missing.';
  if (err === 2) return 'Configured Organisation Unit Levels not found.';
  return 'Checking Program settings';
};

const androidStatus = (
  p: number,
  settings: unknown,
  error: unknown
): StepStatus => {
  if (p === 7) return 'loading';
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
    const msg =
      (error as any).httpStatus === 'Forbidden'
        ? "You don't have permissions to update the Android Settings in this server"
        : (error as any).message;
    return `${label} (Error: ${msg})`;
  }
  return label;
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
  const handleClose = () => {
    if (canClose) onClose();
  };

  const deleteStatus = (): StepStatus => {
    if (progressSteps === 5 && deleteLoading) return 'loading';
    if (progressSteps > 5 && deleteError) return 'error';
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
              status={step1Status(progressSteps, programSettingsError)}
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
          <ProgressStep status={progressSteps === 2 ? 'loading' : 'success'}>
            Checking scores
          </ProgressStep>
        )}
        {progressSteps > 2 && ok && (
          <ProgressStep status={progressSteps === 3 ? 'loading' : 'success'}>
            Reading assessment&apos;s questions
          </ProgressStep>
        )}
        {progressSteps > 3 && ok && (
          <ProgressStep status={progressSteps === 4 ? 'loading' : 'success'}>
            Building new metadata and analytics
          </ProgressStep>
        )}
        {progressSteps > 4 && ok && (
          <>
            <ProgressStep status={deleteStatus()}>
              Deleting old metadata
            </ProgressStep>
            {deleteError && (
              <NoticeBox error title="Error deleting old metadata">
                {(deleteError as any).message} (Error Type:{' '}
                {(deleteError as any).type})
              </NoticeBox>
            )}
          </>
        )}
        {progressSteps > 5 && ok && (
          <ProgressStep
            status={
              progressSteps === 6
                ? 'loading'
                : createMetadataStatus === 'ERROR'
                ? 'error'
                : 'success'
            }
          >
            Importing new metadata
          </ProgressStep>
        )}
        {progressSteps > 6 && ok && (
          <ProgressStep
            status={androidStatus(
              progressSteps,
              androidSettings,
              androidSettingsError
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
              androidSettings && !androidSettingsError ? 'success' : 'warning'
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
