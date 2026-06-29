import { NoticeBox } from '@dhis2/ui';
import ConstructionIcon from '@mui/icons-material/Construction';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';
import CustomMUIDialog from '../../../UIElements/CustomMUIDialog';
import CustomMUIDialogTitle from '../../../UIElements/CustomMUIDialogTitle';

interface DisclaimerDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

const DisclaimerDialog = ({ onClose, onConfirm }: DisclaimerDialogProps) => (
  <CustomMUIDialog open={true} maxWidth="sm" fullWidth={true}>
    <CustomMUIDialogTitle id="customized-dialog-title" onClose={onClose}>
      Warning!
    </CustomMUIDialogTitle>
    <DialogContent dividers style={{ padding: '1em 2em' }}>
      <p>
        Your User does not have the authorities required by the Android Settings
        App to enable In-app Analytics for HNQIS Framework.
      </p>
      <p style={{ margin: '1em 0' }}>
        You are still able to Set Up the program, however, the Android App
        Dashboard won&apos;t be updated.
      </p>
      <NoticeBox title="Please Note">
        <p>
          To enable In-app Analytics for this Program please contact your System
          Administrator.
        </p>
      </NoticeBox>
    </DialogContent>
    <DialogActions style={{ padding: '1em' }}>
      <Button variant="outlined" color="error" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="outlined"
        color="warning"
        onClick={onConfirm}
        startIcon={<ConstructionIcon />}
      >
        Set up Anyway
      </Button>
    </DialogActions>
  </CustomMUIDialog>
);

export default DisclaimerDialog;
