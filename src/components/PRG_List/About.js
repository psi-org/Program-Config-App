import { useDataQuery } from "@dhis2/app-runtime";
import DescriptionIcon from '@mui/icons-material/Description';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import React from 'react';
import { NAMESPACE, DATASTORE_PCA_METADATA, DATASTORE_H2_METADATA, BUILD_VERSION, BUILD_DATE, PCA_METADATA_VERSION, H2_METADATA_VERSION, DHIS2_PRIMARY_COLOR, ABOUT_DATE_FORMAT_OPTIONS, MIN_VERSION, MAX_VERSION } from "../../configs/Constants.js";
import PSILogo from "./../../images/PSI-logo.png";
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js';
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js';

const queryPCAMetadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}`
    }
};

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`
    }
};

const aboutTabStyle = { display: 'grid', gridTemplateColumns: '3fr 4fr', padding: '0' }

const technologies = [
    { name: 'React', url: 'https://react.dev/', license: 'MIT', licenseUrl: 'https://opensource.org/license/mit' },
    { name: 'DHIS2 App Runtime', url: 'https://developers.dhis2.org/docs/app-runtime/getting-started/', license: 'BSD-3-Clause', licenseUrl: 'https://opensource.org/license/bsd-3-clause' },
    { name: 'DHIS2 UI', url: 'https://developers.dhis2.org/docs/tutorials/ui-library/', license: 'BSD-3-Clause', licenseUrl: 'https://opensource.org/license/bsd-3-clause' },
    { name: 'Material UI', url: 'https://mui.com/', license: 'MIT', licenseUrl: 'https://opensource.org/license/mit' },
    { name: 'Material Icons', url: 'https://mui.com/material-ui/material-icons/', license: 'MIT', licenseUrl: 'https://opensource.org/license/mit' },
    { name: 'ExcelJS', url: 'https://github.com/exceljs/exceljs', license: 'MIT', licenseUrl: 'https://opensource.org/license/mit' },
    { name: 'Beautiful DnD', url: 'https://github.com/atlassian/react-beautiful-dnd', license: 'Apache-2.0', licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0' },
    { name: 'Semver', url: 'https://github.com/npm/node-semver', license: 'ISC', licenseUrl: 'https://www.isc.org/licenses/' },
    { name: 'Tinycolor2', url: 'https://github.com/bgrins/TinyColor', license: 'MIT', licenseUrl: 'https://opensource.org/license/mit' },
    { name: 'React MD Editor', url: 'https://github.com/uiwjs/react-md-editor', license: 'MIT', licenseUrl: 'https://opensource.org/license/mit' }
];

const About = (props) => {

    const { data: pcaMetadata } = useDataQuery(queryPCAMetadata);
    const { data: hnqis2Metadata } = useDataQuery(queryHNQIS2Metadata);

    const [tabValue, setTabValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <CustomMUIDialog open={props.aboutModal} maxWidth='md' fullWidth={true} onClose={() => props.setAboutModal(false)}>
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setAboutModal(false)}>
                About <strong><em>Program Configuration App</em></strong>
            </CustomMUIDialogTitle >
            <DialogContent dividers>
                <Box sx={{ width: '100%' }}>
                    <TabContext value={tabValue}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '1em' }}>
                            <TabList onChange={handleChange} centered variant="fullWidth">
                                <Tab label="Build Information" value="1" />
                                <Tab label="Libraries" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1" style={aboutTabStyle}>
                            <div style={{ width: "100%", display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em' }}>
                                <div><strong>App version</strong>: {BUILD_VERSION}</div>
                                <div style={{ paddingLeft: '2em' }}><strong>Released on</strong>: {BUILD_DATE}</div>
                                <div>
                                    <strong>License</strong>: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                                        Creative Commons BY 4.0
                                    </a>
                                </div>
                                <div>
                                    <a href="https://github.com/psi-org/Program-Config-App" target="_blank" rel="noreferrer">
                                        See source code on GitHub
                                    </a>
                                </div>
                                <div>
                                    <span><strong>Program Configuration App Metadata</strong> {!pcaMetadata?.results && <span style={{ color: 'red' }}>Not Found</span>}</span>
                                    {pcaMetadata?.results && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', margin: '0.5em 0 0 2em' }}>
                                            <div>
                                                <em>Version: {pcaMetadata.results.version} </em>
                                                {pcaMetadata.results.version < PCA_METADATA_VERSION
                                                    ? <span style={{ color: 'red' }}>Your installed version is outdated. Latest version is: {PCA_METADATA_VERSION}</span>
                                                    : <span style={{ color: 'green' }}>You are up to date!</span>
                                                }
                                            </div>
                                            <div><em>Installed on: {new Date(pcaMetadata.results.date).toLocaleString("en-US", ABOUT_DATE_FORMAT_OPTIONS)}</em></div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span><strong>HNQIS 2.0 Metadata</strong> {!hnqis2Metadata?.results && <span style={{ color: 'red' }}>Not Found</span>}</span>
                                    {hnqis2Metadata?.results && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', margin: '0.5em 0 0 2em' }}>
                                            <div>
                                                <em>Version: {hnqis2Metadata.results.version} </em>
                                                {hnqis2Metadata.results.version < H2_METADATA_VERSION
                                                    ? <span style={{ color: 'red' }}>Your installed version is outdated. Latest version is: {H2_METADATA_VERSION}</span>
                                                    : <span style={{ color: 'green' }}>You are up to date!</span>
                                                }
                                            </div>
                                            <div><em>Installed on: {new Date(hnqis2Metadata.results.date).toLocaleString("en-US", ABOUT_DATE_FORMAT_OPTIONS)}</em></div>
                                        </div>
                                    )}
                                </div>
                                <div><strong>DHIS2 Server version</strong>: {localStorage.getItem('SERVER_VERSION')}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1em 4em', gap: '0.5em' }}>
                                <img src={PSILogo} alt="PSI Logo" style={{ width: '10em', maxWidth: '10em' }} />
                                <p style={{ marginTop: '1em', width: '100%', textAlign: 'justify', fontWeight: 'bold' }}>
                                    The Program Configuration App is developed
                                    by <a href="https://www.psi.org/" target="_blank" rel="noreferrer">Population Services International (PSI)</a> in collaboration with <a href="https://www.knowtechture.com/" target="_blank" rel="noreferrer" >KnowTechTure SL</a>.
                                </p>
                                <Alert severity="info" sx={{ marginTop: '1em', textAlign: 'justify' }}>
                                    This version of the PCA is compatible with DHIS2 versions between {MIN_VERSION.replace(".x", "")} and {MAX_VERSION.replace(".x", "")}.
                                </Alert>
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <p style={{ marginBottom: '1em' }}>
                                The Program Configuration App implements the following libraries:
                            </p>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead style={{ backgroundColor: DHIS2_PRIMARY_COLOR }}>
                                        <TableRow>
                                            <TableCell align="center" style={{ color: '#FFF' }}>Library</TableCell>
                                            <TableCell align="center" style={{ color: '#FFF' }}>License</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {technologies.sort((a, b) => {
                                            if (a.name > b.name) {
                                                return 1;
                                            } else {
                                                return -1
                                            }
                                        }).map((t, i) => {
                                            return <TableRow key={t.url} sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: (i%2==0)?"#FFF":"#EEE" }}>
                                                <TableCell component="th" scope="row" align="center">
                                                    <a href={t.url} style={{ textDecoration: 'none', color: '#000' }} target="_blank" rel="noreferrer">
                                                        {t.name}
                                                    </a>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <a href={t.licenseUrl} style={{ textDecoration: 'none', color: '#000' }} target="_blank" rel="noreferrer">
                                                        {t.license}
                                                    </a>
                                                </TableCell>
                                            </TableRow>
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Alert severity="info" sx={{marginTop: '1em'}}>Click on any Library or License to see more details.</Alert>
                        </TabPanel>
                    </TabContext>
                </Box>

            </DialogContent>
            <DialogActions style={{ display: 'flex', justifyContent: 'space-between', padding: '1em' }}>
                <span><Button variant='text' target='_blank' href='https://psi.atlassian.net/wiki/spaces/PCA/overview?homepageId=37716432' startIcon={<DescriptionIcon />}>PCA documentation</Button></span>
                <Button color={'error'} variant={'outlined'} onClick={() => props.setAboutModal(false)}>Close</Button>
            </DialogActions>
        </CustomMUIDialog>
    )
}

About.propTypes = {
    aboutModal: PropTypes.bool,
    setAboutModal: PropTypes.func
}

export default About