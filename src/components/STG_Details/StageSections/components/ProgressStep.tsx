import {
  CircularLoader,
  IconCheckmarkCircle24,
  IconCross24,
  IconWarning24,
} from '@dhis2/ui';
import React from 'react';

export type StepStatus = 'loading' | 'success' | 'error' | 'warning';

const ICONS: Record<StepStatus, React.ReactNode> = {
  loading: <CircularLoader small />,
  success: <IconCheckmarkCircle24 color="#00b894" />,
  error: <IconCross24 color="#d63031" />,
  warning: <IconWarning24 color="#ffbb00" />,
};

interface ProgressStepProps {
  status: StepStatus;
  children: React.ReactNode;
}

const ProgressStep = ({ status, children }: ProgressStepProps) => (
  <div className="progressItem">
    {ICONS[status]}
    <p style={{ maxWidth: '90%' }}>{children}</p>
  </div>
);

export default ProgressStep;
