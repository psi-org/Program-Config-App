import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LabelIcon from '@mui/icons-material/LabelImportant';
import PercentIcon from '@mui/icons-material/Percent';
import QuizIcon from '@mui/icons-material/Quiz';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  COMPOSITIVE_SCORE_ATTRIBUTE,
  QUESTION_TYPE_ATTRIBUTE,
} from '../../../../configs/Constants';
import type { PreviewScore, PreviewSection } from '../h2Convert.types';

interface AssessmentPreviewProps {
  sectionsData?: PreviewSection[];
  scoresData?: PreviewScore[];
}

const AssessmentPreview = ({
  sectionsData,
  scoresData,
}: AssessmentPreviewProps) => {
  if (!sectionsData?.length) {
    return null;
  }

  return (
    <Box>
      <Typography sx={{ fontSize: '1.2em', mb: 0.5 }}>
        Assessment Preview
      </Typography>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        {sectionsData.map((section) => (
          <Accordion sx={{ my: 0.5 }} key={section.name}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#FFF' }} />}
              sx={{ backgroundColor: '#2c6693', color: '#FFF' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Typography>{section.name}</Typography>
                <Typography sx={{ fontSize: '0.85em' }}>
                  <em>
                    {`${section.dataElements.length} Data Element${
                      section.dataElements.length !== 1 ? 's' : ''
                    }`}
                  </em>
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#f1f1f1' }}>
              {section.dataElements.map((dataElement) => {
                const isLabel =
                  dataElement.programStageDataElement.dataElement.attributeValues.find(
                    (attributeValue) =>
                      attributeValue.attribute.id === QUESTION_TYPE_ATTRIBUTE
                  )?.value === '7';

                return (
                  <Box
                    key={`${section.name}-${dataElement.programStageDataElement.dataElement.id}`}
                    sx={{
                      display: 'flex',
                      width: '100%',
                      my: 0.5,
                      p: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    {isLabel ? (
                      <LabelIcon sx={{ mr: 0.5 }} />
                    ) : (
                      <QuizIcon sx={{ mr: 0.5 }} />
                    )}
                    <Typography>
                      {dataElement.programStageDataElement.dataElement.formName}
                      {dataElement.programStageDataElement.compulsory && (
                        <Box component="span" sx={{ color: 'red' }}>
                          {' '}
                          *
                        </Box>
                      )}
                    </Typography>
                  </Box>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}

        {!!scoresData?.length && (
          <Accordion sx={{ my: 0.5 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#FFF' }} />}
              sx={{ backgroundColor: '#03a9f4', color: '#FFF' }}
            >
              Scores
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: '#f1f1f1' }}>
              {scoresData.map((score) => {
                const compositiveScore =
                  score.dataElement.attributeValues.find(
                    (attributeValue) =>
                      attributeValue.attribute.id ===
                      COMPOSITIVE_SCORE_ATTRIBUTE
                  )?.value ?? '';
                const levels = compositiveScore.split('.').length;

                return (
                  <Box
                    key={score.dataElement.id}
                    sx={{
                      display: 'flex',
                      width: '100%',
                      my: 0.5,
                      ml: `${(levels - 1) * 2}em`,
                      p: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    <PercentIcon sx={{ mr: 0.5 }} fontSize="small" />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 14fr',
                        width: '100%',
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 500, pr: 1, textAlign: 'center' }}
                      >
                        {compositiveScore}
                      </Typography>
                      <Typography>{score.dataElement.formName}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
};

export default AssessmentPreview;
