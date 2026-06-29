// About/About.tsx
import { useDataQuery } from '@dhis2/app-runtime';
import DescriptionIcon from '@mui/icons-material/Description';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  Link,
  Tab,
  Typography,
} from '@mui/material';
import React, { useState, type SyntheticEvent } from 'react';
import {
  BUILD_DATE,
  H2_METADATA_VERSION,
  MAX_VERSION,
  MIN_VERSION,
  PCA_METADATA_VERSION,
} from '../../../configs/Constants';
import BAOLogo from '../../../images/bao-logo.svg';
import PATHLogo from '../../../images/path-logo.svg';
import PSILogo from '../../../images/PSI-logo.png';
import CustomMUIDialog from '../../UIElements/CustomMUIDialog';
import CustomMUIDialogTitle from '../../UIElements/CustomMUIDialogTitle';
import {
  ABOUT_TABS,
  queryHNQIS2Metadata,
  queryPCAMetadata,
} from './about.constants';
import type {
  AboutProps,
  AboutTabValue,
  MetadataQueryResponse,
} from './about.types';
import LibrariesTable from './LibrariesTable';
import MetadataStatus from './MetadataStatus';

const styles = {
  tabsHeader: {
    borderBottom: 1,
    borderColor: 'divider',
    mb: 2,
  },
  buildGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '3fr 4fr' },
    p: 0,
  },
  infoColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    p: 2,
  },
  nestedInfo: {
    pl: 4,
  },
  sponsorColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    px: 4,
    py: 2,
  },
  sponsorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'space-between',
    p: 2,
  },
} as const;

const About = ({ aboutModal, setAboutModal }: AboutProps) => {
  const { data: pcaMetadata } =
    useDataQuery<MetadataQueryResponse>(queryPCAMetadata);
  const { data: hnqis2Metadata } =
    useDataQuery<MetadataQueryResponse>(queryHNQIS2Metadata);

  const [tabValue, setTabValue] = useState<AboutTabValue>(ABOUT_TABS.BUILD);

  const closeDialog = () => setAboutModal(false);

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue as AboutTabValue);
  };

  return (
    <CustomMUIDialog
      open={aboutModal}
      maxWidth="md"
      fullWidth
      onClose={closeDialog}
    >
      <CustomMUIDialogTitle id="about-dialog-title" onClose={closeDialog}>
        About{' '}
        <strong>
          <em>Program Configuration App</em>
        </strong>
      </CustomMUIDialogTitle>

      <DialogContent dividers>
        <Box sx={{ width: '100%' }}>
          <TabContext value={tabValue}>
            <Box sx={styles.tabsHeader}>
              <TabList onChange={handleTabChange} centered variant="fullWidth">
                <Tab label="Build Information" value={ABOUT_TABS.BUILD} />
                <Tab label="Libraries" value={ABOUT_TABS.LIBRARIES} />
              </TabList>
            </Box>

            <TabPanel value={ABOUT_TABS.BUILD} sx={styles.buildGrid}>
              <Box sx={styles.infoColumn}>
                <Typography component="div">
                  <strong>App version</strong>:{' '}
                  {String(import.meta.env.DHIS2_APP_VERSION ?? 'Unknown')}
                </Typography>

                <Typography component="div" sx={styles.nestedInfo}>
                  <strong>Released on</strong>: {BUILD_DATE}
                </Typography>

                <Typography component="div">
                  <strong>License</strong>:{' '}
                  <Link
                    href="https://creativecommons.org/licenses/by/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Creative Commons BY 4.0
                  </Link>
                </Typography>

                <Typography component="div">
                  <Link
                    href="https://github.com/psi-org/Program-Config-App"
                    target="_blank"
                    rel="noreferrer"
                  >
                    See source code on GitHub
                  </Link>
                </Typography>

                <MetadataStatus
                  title="Program Configuration App Metadata"
                  metadata={pcaMetadata?.results}
                  latestVersion={PCA_METADATA_VERSION}
                />

                <MetadataStatus
                  title="HNQIS Framework Metadata"
                  metadata={hnqis2Metadata?.results}
                  latestVersion={H2_METADATA_VERSION}
                />

                <Typography component="div">
                  <strong>DHIS2 Server version</strong>:{' '}
                  {localStorage.getItem('SERVER_VERSION') ?? 'Unknown'}
                </Typography>
              </Box>

              <Box sx={styles.sponsorColumn}>
                <Box
                  component="img"
                  src={BAOLogo}
                  alt="BAO Logo"
                  sx={{ width: '15em', maxWidth: '15em' }}
                />

                <Box sx={styles.sponsorRow}>
                  <Box
                    component="img"
                    src={PATHLogo}
                    alt="PATH Logo"
                    sx={{ width: '9em', maxWidth: '9em' }}
                  />
                  <Box
                    component="img"
                    src={PSILogo}
                    alt="PSI Logo"
                    sx={{ width: '6em', maxWidth: '6em' }}
                  />
                </Box>

                <Typography
                  sx={{
                    mt: 2,
                    width: '100%',
                    fontWeight: 'bold',
                    textAlign: 'justify',
                  }}
                >
                  The Program Configuration App is developed and maintained by{' '}
                  <Link
                    href="https://www.baosystems.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    BAO Systems
                  </Link>{' '}
                  under the sponsorship of{' '}
                  <Link
                    href="https://www.path.org/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    PATH
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://www.psi.org/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Population Services International (PSI)
                  </Link>
                  .
                </Typography>

                <Alert severity="info" sx={{ mt: 2, textAlign: 'justify' }}>
                  This version of the PCA is officially compatible with DHIS2
                  versions between {MIN_VERSION.replace('.x', '')} and{' '}
                  {MAX_VERSION.replace('.x', '')}.
                </Alert>
              </Box>
            </TabPanel>

            <TabPanel value={ABOUT_TABS.LIBRARIES}>
              <LibrariesTable />
            </TabPanel>
          </TabContext>
        </Box>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button
          variant="text"
          target="_blank"
          href="https://psi.atlassian.net/wiki/spaces/PCA/overview?homepageId=37716432"
          startIcon={<DescriptionIcon />}
        >
          PCA documentation
        </Button>

        <Button color="primary" variant="outlined" onClick={closeDialog}>
          Close
        </Button>
      </DialogActions>
    </CustomMUIDialog>
  );
};

export default About;
