import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import React from 'react';
import {
  H2_METADATA_VERSION,
  HNQIS_VERSIONS,
  MAX_PREFIX_LENGTH,
  MAX_PROGRAM_NAME_LENGTH,
  MAX_SHORT_NAME_LENGTH,
} from '../../../../configs/Constants';
import { isHnqisProgramType } from '../../../../utils/Utils';
import StyleManager from '../../../UIElements/StyleManager';
import type { BasicSettingsStepProps, ProgramType } from '../programNew.types';

const UnavailableIndicator: React.FC = () => (
  <>
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: 8,
      }}
    >
      [Unavailable] <RemoveCircleOutlineIcon />
    </span>
  </>
);

const BasicSettingsStep: React.FC<BasicSettingsStepProps> = ({
  dePrefix,
  h2Enabled,
  hnqisMetadataVersion,
  lockedProgramType,
  onChangeCode,
  onChangeDePrefix,
  onChangeProgramName,
  onChangeProgramShortName,
  onChangeProgramType,
  onProgramTETChange,
  pgrTypePCA,
  programCode,
  programColor,
  programIcon,
  programName,
  programShortName,
  programTET,
  setProgramColor,
  setProgramIcon,
  trackedEntityTypes,
  validationErrors,
}) => {
  const hnqisUnavailable =
    !h2Enabled ||
    Number(hnqisMetadataVersion ?? 0) < Number(H2_METADATA_VERSION);

  const lockedHnqisIndex = lockedProgramType
    ? HNQIS_VERSIONS.indexOf(lockedProgramType)
    : -1;
  const isHnqisUpgradeMode = lockedHnqisIndex >= 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <FormControl
          sx={{ maxWidth: '30%' }}
          error={validationErrors.pgrType !== undefined}
          style={{ marginTop: '1rem' }}
        >
          <InputLabel id="label-prgType">Program Type (*)</InputLabel>
          <Select
            labelId="label-prgType"
            id="prgTypePCA"
            value={pgrTypePCA}
            disabled={lockedProgramType !== undefined && !isHnqisUpgradeMode}
            onChange={(event: SelectChangeEvent) =>
              onChangeProgramType(event.target.value as ProgramType)
            }
            label="Program Type (*)"
          >
            <MenuItem value="" disabled={isHnqisUpgradeMode}>
              <em>None</em>
            </MenuItem>
            <MenuItem value="tracker" disabled={isHnqisUpgradeMode}>
              Tracker Program
            </MenuItem>
            <MenuItem value="event" disabled={isHnqisUpgradeMode}>
              Event Program
            </MenuItem>
            <MenuItem
              disabled={
                hnqisUnavailable ||
                (isHnqisUpgradeMode &&
                  HNQIS_VERSIONS.indexOf('hnqis2') < lockedHnqisIndex)
              }
              value="hnqis2"
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                HNQIS 2.0 {hnqisUnavailable && <UnavailableIndicator />}
              </span>
            </MenuItem>
            <MenuItem
              disabled={
                hnqisUnavailable ||
                (isHnqisUpgradeMode &&
                  HNQIS_VERSIONS.indexOf('hnqis3') < lockedHnqisIndex)
              }
              value="hnqis3"
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                HNQIS 3.0 {hnqisUnavailable && <UnavailableIndicator />}
              </span>
            </MenuItem>
          </Select>
          <FormHelperText>{validationErrors.pgrType}</FormHelperText>
        </FormControl>

        <FormControl sx={{ minWidth: '65%' }}>
          <TextField
            error={validationErrors.prefix !== undefined}
            helperText={
              validationErrors.prefix ||
              "Please Note: The Prefix will be applied to the Data Elements ONLY during the 'Validate & Save' process"
            }
            margin="normal"
            id="prefix"
            label="Program Data Element Prefix (*)"
            type="text"
            fullWidth
            variant="standard"
            autoComplete="off"
            inputProps={{ maxLength: MAX_PREFIX_LENGTH }}
            value={dePrefix}
            onChange={(event) => onChangeDePrefix(event.target.value)}
          />
        </FormControl>

        <TextField
          error={validationErrors.programName !== undefined}
          helperText={validationErrors.programName}
          margin="normal"
          id="name"
          label="Program Name (*)"
          type="text"
          fullWidth
          variant="standard"
          autoComplete="off"
          inputProps={{ maxLength: MAX_PROGRAM_NAME_LENGTH }}
          value={programName}
          onChange={(event) => onChangeProgramName(event.target.value)}
        />

        <TextField
          error={validationErrors.shortName !== undefined}
          helperText={validationErrors.shortName}
          margin="normal"
          id="shortName"
          label="Program Short Name (*)"
          type="text"
          sx={{ width: '100%' }}
          variant="standard"
          autoComplete="off"
          inputProps={{ maxLength: MAX_SHORT_NAME_LENGTH }}
          value={programShortName}
          onChange={(event) => onChangeProgramShortName(event.target.value)}
        />

        <TextField
          error={validationErrors.code !== undefined}
          helperText={validationErrors.code}
          margin="normal"
          id="code"
          label="Program Code"
          type="text"
          sx={{ width: '100%' }}
          variant="standard"
          autoComplete="off"
          inputProps={{ maxLength: MAX_SHORT_NAME_LENGTH }}
          value={programCode}
          onChange={(event) => onChangeCode(event.target.value)}
        />

        {pgrTypePCA && pgrTypePCA !== 'event' && (
          <Autocomplete
            id="tetSelect"
            disabled={pgrTypePCA !== 'tracker'}
            options={trackedEntityTypes.map((tet) => ({
              label: tet.name,
              id: tet.id,
            }))}
            sx={{ width: '100%' }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={validationErrors.programTET !== undefined}
                label="Tracked Entity Type (*)"
                margin="normal"
                variant="standard"
                helperText={validationErrors.programTET}
              />
            )}
            value={programTET}
            onChange={(_event, value) => onProgramTETChange(value)}
            getOptionLabel={(option) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        )}

        <StyleManager
          icon={programIcon}
          setIcon={setProgramIcon}
          color={programColor}
          setColor={setProgramColor}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
            width: '100%',
            minHeight: '5em',
            marginTop: '1em',
          }}
        />
      </div>
    </div>
  );
};

export default BasicSettingsStep;
