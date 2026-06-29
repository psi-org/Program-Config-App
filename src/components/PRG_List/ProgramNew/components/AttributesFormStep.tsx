import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React from 'react';
import AttributesEditor from '../../../TEAEditor/AttributesEditor';
import type { AttributesFormStepProps } from '../programNew.types';

const AttributesFormStep: React.FC<AttributesFormStepProps> = ({
  assignedAttributes,
  attributesFormSections,
  createPublicObjects,
  onAddNewSection,
  onToggleUseSections,
  programTEAs,
  setAssignedAttributes,
  setAttributesFormSections,
  setProgramTEAs,
  useSections,
}) => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        margin: `1rem 0${!createPublicObjects ? ' 0 0' : ''}`,
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        control={
          <Switch
            disabled={!createPublicObjects}
            checked={useSections}
            onChange={(event) => onToggleUseSections(event.target.checked)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        label="Use Form Sections"
      />

      <div>
        {useSections && (
          <Button
            disabled={!createPublicObjects}
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={onAddNewSection}
          >
            Add new section
          </Button>
        )}
      </div>
    </div>

    {!createPublicObjects && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1em',
          color: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <InfoIcon />
        <label style={{ marginLeft: '0.5em' }}>
          TEA Sections are considered Public Objects. Currently, your User does
          not have permission to create Public Objects.
        </label>
      </div>
    )}

    <AttributesEditor
      useSections={useSections}
      teaOptions={programTEAs}
      setTeaOptions={setProgramTEAs}
      attributesFormSections={attributesFormSections}
      setAttributesFormSections={setAttributesFormSections}
      assignedAttributes={assignedAttributes}
      setAssignedAttributes={setAssignedAttributes}
    />
  </div>
);

export default AttributesFormStep;
