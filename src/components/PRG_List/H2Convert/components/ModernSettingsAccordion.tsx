import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import React from 'react';
import H2Setting from '../../H2Setting';
import type { H2SettingRef } from '../h2Convert.types';

interface ModernSettingsAccordionProps {
  errorBadge: boolean;
  h2SettingsRef: React.RefObject<H2SettingRef | null>;
  setButtonDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModernSettingsAccordion = ({
  errorBadge,
  h2SettingsRef,
  setButtonDisabled,
}: ModernSettingsAccordionProps) => {
  const summaryStyle = errorBadge
    ? { backgroundColor: '#d32f2f', color: '#FFF' }
    : { backgroundColor: '#757575', color: '#FFF' };

  return (
    <Accordion sx={{ my: 3 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
        sx={summaryStyle}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '80%' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography>Modern HNQIS Settings</Typography>
          </Box>
          <Typography sx={{ mr: 1 }}>
            {errorBadge ? 'Errors Found' : ''}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: '#f1f1f1' }}>
        <H2Setting ref={h2SettingsRef} setButtonDisabled={setButtonDisabled} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ModernSettingsAccordion;
