import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  LinearProgress,
  Typography,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import CustomMUIDialog from '../../../UIElements/CustomMUIDialog';

interface ConversionStatusDialogProps {
  open: boolean;
  loadingConversion: boolean;
  conversionError?: string;
  buttonDisabled: boolean;
  onClose: () => void;
}

const ConversionStatusDialog = ({
  open,
  loadingConversion,
  conversionError,
  buttonDisabled,
  onClose,
}: ConversionStatusDialogProps) => (
  <CustomMUIDialog open={open} maxWidth="sm" fullWidth>
    <DialogTitle id="conversion-status-title">Conversion Status</DialogTitle>
    <DialogContent
      dividers
      sx={{
        p: '1em 2em',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {loadingConversion && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      {conversionError && (
        <Box>
          <Typography>
            The process could not be completed, see details below:
          </Typography>
          <Box sx={{ color: '#AA0000', px: 1.5 }}>{conversionError}</Box>
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      {!loadingConversion && (
        <Button disabled={buttonDisabled} onClick={onClose} color="primary">
          Close
        </Button>
      )}
    </DialogActions>
  </CustomMUIDialog>
);

export default ConversionStatusDialog;
