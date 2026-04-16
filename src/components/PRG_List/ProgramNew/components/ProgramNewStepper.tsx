import { Step, StepLabel, Stepper } from '@mui/material';
import React from 'react';
import type { ProgramNewStepperProps } from '../programNew.types';

const clickableStepSx = { cursor: 'pointer' } as const;

const ProgramNewStepper: React.FC<ProgramNewStepperProps> = ({
  activeStep,
  basicValidated,
  hnqisValidated,
  onStepChange,
  pgrTypePCA,
}) => (
  <Stepper alternativeLabel nonLinear activeStep={activeStep}>
    <Step sx={clickableStepSx}>
      <StepLabel error={!basicValidated} onClick={() => onStepChange(0)}>
        Basic Settings
      </StepLabel>
    </Step>

    {pgrTypePCA === 'hnqis' && (
      <Step sx={clickableStepSx}>
        <StepLabel error={!hnqisValidated} onClick={() => onStepChange(1)}>
          HNQIS2 Settings
        </StepLabel>
      </Step>
    )}

    {(pgrTypePCA === 'tracker' || pgrTypePCA === 'event') && (
      <Step sx={clickableStepSx}>
        <StepLabel onClick={() => onStepChange(1)}>
          {pgrTypePCA === 'tracker' ? 'Tracker' : 'Event'} Program Settings
        </StepLabel>
      </Step>
    )}

    {pgrTypePCA === 'tracker' && (
      <Step sx={clickableStepSx}>
        <StepLabel onClick={() => onStepChange(2)}>
          Tracked Entity Attributes Form
        </StepLabel>
      </Step>
    )}
  </Stepper>
);

export default ProgramNewStepper;
