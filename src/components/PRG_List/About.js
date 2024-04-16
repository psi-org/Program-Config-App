import { useDataQuery } from "@dhis2/app-runtime";
import DescriptionIcon from '@mui/icons-material/Description';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import React from 'react';
import { NAMESPACE, DATASTORE_PCA_METADATA, DATASTORE_H2_METADATA, BUILD_VERSION, BUILD_DATE, PCA_METADATA_VERSION, H2_METADATA_VERSION, DHIS2_PRIMARY_COLOR, ABOUT_DATE_FORMAT_OPTIONS, LIGHT_BLUE_COLOR } from "../../configs/Constants.js";
import LogoUrl from "./../../images/PCA-logo.png";
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

const aboutTabStyle = { display: 'grid', gridTemplateColumns: '3fr 2fr', padding: '0' }

const technologies = [
    { name: 'React', url: 'https://react.dev/', license: 'MIT' },
    { name: 'DHIS2 App Runtime', url: 'https://developers.dhis2.org/docs/app-runtime/getting-started/', license: 'BSD-3-Clause' },
    { name: 'DHIS2 UI', url: 'https://developers.dhis2.org/docs/tutorials/ui-library/', license: 'BSD-3-Clause' },
    { name: 'Material UI', url: 'https://mui.com/', license: 'MIT' },
    { name: 'Material Icons', url: 'https://mui.com/material-ui/material-icons/', license: 'MIT' },
    { name: 'ExcelJS', url: 'https://github.com/exceljs/exceljs', license: 'MIT' },
    { name: 'Beautiful DnD', url: 'https://github.com/atlassian/react-beautiful-dnd', license: 'Apache-2.0' },
    { name: 'Semver', url: 'https://github.com/npm/node-semver', license: 'ISC' },
    { name: 'Tinycolor2', url: 'https://github.com/bgrins/TinyColor', license: 'MIT' },
    { name: 'React MD Editor', url: 'https://github.com/uiwjs/react-md-editor', license: 'MIT' }
];

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center'
}));

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
                            <div style={{ width: "90%", display: 'flex', flexDirection: 'column', gap: '1em', padding: '1em' }}>
                                <div>
                                    <strong>License</strong> : <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                                        Creative Commons BY 4.0
                                    </a>
                                </div>
                                <div><strong>PCA Version</strong> : {BUILD_VERSION}</div>
                                <div><strong>Version Build date</strong> : {BUILD_DATE}</div>
                                <div><strong>DHIS2 Server version</strong> : {localStorage.getItem('SERVER_VERSION')}</div>
                                <div>
                                    <span><strong>Program Configuration App Metadata</strong> {!pcaMetadata?.results && <span style={{ color: 'red' }}>Not Found</span>}</span>
                                    {pcaMetadata?.results && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', margin: '0.5em 0 0 1em' }}>
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', margin: '0.5em 0 0 1em' }}>
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
                                <p style={{ marginTop: '1em', width: '100%', textAlign: 'justify' }}>
                                    The Program Configuration App is financed and promoted
                                    by <a href="https://www.psi.org/" target="_blank" rel="noreferrer">Population Services International (PSI)</a> and
                                    developed in collaboration with <a href="https://www.knowtechture.com/" target="_blank" rel="noreferrer" >KnowTechTure SL</a>.
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1em', gap: '0.5em' }}>
                                <img src={LogoUrl} alt="Logo" style={{ maxWidth: '80%' }} />
                                <img src={PSILogo} alt="PSI Logo" style={{ width: '8em', maxWidth: '8em' }} />
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <p style={{ marginBottom: '1em' }}>The Program Configuration App is powered by the following technologies:</p>
                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 0 }}>
                                {technologies.map(t => {
                                    return <>
                                        <Grid item key={t.url+'n'} xs={8}>
                                            <a href={t.url} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
                                                <Item style={{ color: '#FFF', backgroundColor: DHIS2_PRIMARY_COLOR, borderRadius: '5px 0 0 5px' }}>
                                                    {t.name}
                                                </Item>
                                            </a>
                                        </Grid>
                                        <Grid item key={t.url+'l'} xs={4}>
                                            <Item style={{ color: '#FFF', backgroundColor: LIGHT_BLUE_COLOR, borderRadius: '0 5px 5px 0' }}>
                                                License: {t.license}
                                            </Item>
                                        </Grid>
                                    </>
                                })}
                            </Grid>
                        </TabPanel>
                    </TabContext>
                </Box>

            </DialogContent>
            <DialogActions style={{ display: 'flex', justifyContent: 'space-between', padding: '1em' }}>
                <span><Button variant='text' target='_blank' href='https://psi.atlassian.net/wiki/spaces/PCA/overview?homepageId=37716432' startIcon={<DescriptionIcon />}>Check the PCA documentation</Button></span>
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