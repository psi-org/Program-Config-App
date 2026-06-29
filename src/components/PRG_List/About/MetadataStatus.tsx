// About/MetadataStatus.tsx
import { Box, Typography } from '@mui/material';
import React from 'react';
import type { MetadataRecord } from './about.types';
import { formatAboutDate, isOutdatedVersion } from './about.utils';

interface MetadataStatusProps {
  title: string;
  metadata?: MetadataRecord;
  latestVersion: string | number;
}

const MetadataStatus = ({
  title,
  metadata,
  latestVersion,
}: MetadataStatusProps) => {
  if (!metadata) {
    return (
      <Typography component="div">
        <strong>{title}</strong>{' '}
        <Box component="span" sx={{ color: 'error.main' }}>
          Not Found
        </Box>
      </Typography>
    );
  }

  const outdated = isOutdatedVersion(metadata.version, latestVersion);

  return (
    <Box>
      <Typography component="div">
        <strong>{title}</strong>
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mt: 0.5,
          ml: 4,
        }}
      >
        <Typography component="div">
          <em>Version: {String(metadata.version)} </em>{' '}
          <Box
            component="span"
            sx={{ color: outdated ? 'error.main' : 'success.main' }}
          >
            {outdated
              ? `Your installed version is outdated. Latest version is: ${latestVersion}`
              : 'You are up to date!'}
          </Box>
        </Typography>

        <Typography component="div">
          <em>Installed on: {formatAboutDate(metadata.date)}</em>
        </Typography>
      </Box>
    </Box>
  );
};

export default MetadataStatus;
