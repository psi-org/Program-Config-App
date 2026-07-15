import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import type { FailedTransferRecord } from '../h2Transfer.types';

interface FailedRecordAccordionProps {
  record: FailedTransferRecord;
  expanded: boolean;
  onChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const FailedRecordAccordion = ({
  record,
  expanded,
  onChange,
}: FailedRecordAccordionProps) => (
  <Accordion
    disableGutters
    expanded={expanded}
    onChange={onChange}
    sx={{
      border: '1px solid #fca5a5',
      borderRadius: '2px !important',
      '&:before': { display: 'none' },
      boxShadow: 'none',
    }}
  >
    <AccordionSummary
      expandIcon={
        <ExpandMoreIcon sx={{ color: '#c62828', fontSize: '1.5rem' }} />
      }
      sx={{
        backgroundColor: '#fef2f2',
        minHeight: 40,
        '& .MuiAccordionSummary-content': {
          my: 0.75,
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      }}
    >
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color: '#c62828', wordBreak: 'break-all' }}
      >
        Assessment {record.event}
      </Typography>
      <Box
        component="span"
        sx={{
          px: 0.75,
          py: 0.1,
          borderRadius: '10px',
          backgroundColor: '#c62828',
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 700,
        }}
      >
        {record.errors.length || 1}
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ backgroundColor: '#fff', p: 1.5 }}>
      {record.errors.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 600, width: '1%', whiteSpace: 'nowrap' }}
              >
                Code
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
              <TableCell
                sx={{ fontWeight: 600, width: '1%', whiteSpace: 'nowrap' }}
              >
                Data Element / UID
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {record.errors.map((error, index) => (
              <TableRow key={index}>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  {error.errorCode ? (
                    <Chip
                      label={error.errorCode}
                      size="small"
                      sx={{
                        backgroundColor: '#fee2e2',
                        color: '#c62828',
                        fontWeight: 600,
                      }}
                    />
                  ) : null}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  <Typography variant="body2">{error.message}</Typography>
                </TableCell>
                <TableCell
                  sx={{ verticalAlign: 'top', wordBreak: 'break-all' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {error.uid ?? '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {record.reason}
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
);

interface FailedRecordsListProps {
  failedRecords: FailedTransferRecord[];
}

const FailedRecordsList = ({ failedRecords }: FailedRecordsListProps) => {
  const [expandedEvent, setExpandedEvent] = useState<string | false>(false);

  if (failedRecords.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
      <Typography variant="subtitle2">
        Failed Records ({failedRecords.length})
      </Typography>
      {failedRecords.map((record) => (
        <FailedRecordAccordion
          key={record.event}
          record={record}
          expanded={expandedEvent === record.event}
          onChange={(_event, isExpanded) => {
            setExpandedEvent(isExpanded ? record.event : false);
          }}
        />
      ))}
    </Box>
  );
};

export default FailedRecordsList;
