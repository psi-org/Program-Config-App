// About/LibrariesTable.tsx
import {
  Alert,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import { DHIS2_PRIMARY_COLOR } from '../../../configs/Constants';
import { TECHNOLOGIES } from './about.constants';

const LibrariesTable = () => (
  <>
    <Typography sx={{ mb: 2 }}>
      The Program Configuration App implements the following libraries:
    </Typography>

    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="libraries table">
        <TableHead sx={{ backgroundColor: DHIS2_PRIMARY_COLOR }}>
          <TableRow>
            <TableCell align="center" sx={{ color: '#FFF' }}>
              Library
            </TableCell>
            <TableCell align="center" sx={{ color: '#FFF' }}>
              License
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {TECHNOLOGIES.map((technology, index) => (
            <TableRow
              key={technology.url}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                backgroundColor: index % 2 === 0 ? '#FFF' : '#EEE',
              }}
            >
              <TableCell component="th" scope="row" align="center">
                <Link
                  href={technology.url}
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                  color="inherit"
                >
                  {technology.name}
                </Link>
              </TableCell>

              <TableCell align="center">
                <Link
                  href={technology.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                  color="inherit"
                >
                  {technology.license}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Alert severity="info" sx={{ mt: 2 }}>
      Click on any Library or License to see more details.
    </Alert>
  </>
);

export default LibrariesTable;
