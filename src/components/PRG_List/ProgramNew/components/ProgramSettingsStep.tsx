import { Transfer } from '@dhis2/ui';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React from 'react';
import type { ProgramSettingsStepProps } from '../programNew.types';

const ProgramSettingsStep: React.FC<ProgramSettingsStepProps> = ({
  categoryCombo,
  onCategoryComboChange,
  onChangeTEAs,
  onValidationStrategyChange,
  pgrTypePCA,
  programCategoryCombos,
  programTEAs,
  validationErrors,
  validationStrategy,
}) => (
  <div>
    <FormControl
      sx={{ minWidth: '100%' }}
      error={validationErrors.categoryCombo !== undefined}
    >
      <Autocomplete
        id="ccSelect"
        disabled={pgrTypePCA !== 'tracker' && pgrTypePCA !== 'event'}
        options={programCategoryCombos.map((combo) => ({
          label: combo.name,
          id: combo.id,
        }))}
        sx={{ width: '100%' }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={validationErrors.categoryCombo !== undefined}
            label="Category Combination"
            variant="standard"
            margin="dense"
            helperText={validationErrors.categoryCombo}
          />
        )}
        value={categoryCombo}
        onChange={(_event, value) => onCategoryComboChange(value)}
        getOptionLabel={(option) => option.label || ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </FormControl>

    {pgrTypePCA === 'event' && (
      <FormControl variant="standard" sx={{ width: '100%', marginTop: '1em' }}>
        <InputLabel id="label-validationStrat">
          Validation Strategy (*)
        </InputLabel>
        <Select
          labelId="label-validationStrat"
          id="validationStrat"
          value={validationStrategy}
          disabled={pgrTypePCA !== 'event'}
          onChange={(event: SelectChangeEvent) =>
            onValidationStrategyChange(event.target.value)
          }
          label="Validation Strategy (*)"
          variant="standard"
        >
          <MenuItem value="ON_COMPLETE">On Complete</MenuItem>
          <MenuItem value="ON_UPDATE_AND_INSERT">On update and insert</MenuItem>
        </Select>
      </FormControl>
    )}

    {pgrTypePCA === 'tracker' && (
      <div
        style={{
          marginTop: '1.5em',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <FormLabel
          style={{
            display: 'inline-block',
            marginBottom: '8px',
          }}
        >
          Program Tracked Entity Attributes
        </FormLabel>

        <Transfer
          filterable
          onChange={onChangeTEAs}
          options={programTEAs.available.map((tea) => ({
            label: tea.trackedEntityAttribute.name ?? '',
            value: tea.trackedEntityAttribute.id,
          }))}
          selected={programTEAs.selected}
          optionsWidth="48%"
          selectedWidth="48%"
        />
      </div>
    )}
  </div>
);

export default ProgramSettingsStep;
