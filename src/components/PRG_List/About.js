import { useDataQuery } from "@dhis2/app-runtime";
import { NAMESPACE, DATASTORE_PCA_METADATA, DATASTORE_H2_METADATA, BUILD_VERSION, BUILD_DATE, DATE_FORMAT_OPTIONS, PCA_METADATA_VERSION, H2_METADATA_VERSION } from "../../configs/Constants";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import DescriptionIcon from '@mui/icons-material/Description';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import LogoUrl from "./../../images/PCA-logo.png"

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

const About = (props) => {

    const { data: pcaMetadata, error: pcaMetadataError } = useDataQuery(queryPCAMetadata);
    const { data: hnqis2Metadata, error: hnqis2MetadataError } = useDataQuery(queryHNQIS2Metadata);

    return (
        <CustomMUIDialog open={props.aboutModal} maxWidth='md' fullWidth={true} onClose={() => props.setAboutModal(false)}>
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setAboutModal(false)}>
                About <strong><em>Program Configuration App</em></strong>
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', display: 'grid', gridTemplateColumns: '3fr 2fr' }}>
                <div style={{ width: "80%", display: 'flex', flexDirection: 'column', gap: '1em' }}>
                    <div><strong>Version</strong> : {BUILD_VERSION}</div>
                    <div><strong>Version Build date</strong> : {BUILD_DATE}</div>
                    <div><strong>DHIS2 Server version</strong> : {localStorage.getItem('SERVER_VERSION')}</div>
                    <div>
                        <span><strong>Program Configuration App metadata</strong> {!pcaMetadata?.results && <span style={{ color: 'red' }}>Not Found</span>}</span>
                        {pcaMetadata?.results && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', margin: '0.5em 0 0 1em' }}>
                                <div>
                                    <em>Version: {pcaMetadata.results.version} </em>
                                    {pcaMetadata.results.version < PCA_METADATA_VERSION
                                        ? <span style={{ color: 'red' }}>Your installed version is outdated. Latest version is: {PCA_METADATA_VERSION}</span>
                                        : <span style={{ color: 'green' }}>You are up to date!</span>
                                    }
                                </div>
                                <div><em>Installed on: {new Date(pcaMetadata.results.date).toLocaleString("en-US", DATE_FORMAT_OPTIONS)}</em></div>
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
                                <div><em>Installed on: {new Date(hnqis2Metadata.results.date).toLocaleString("en-US", DATE_FORMAT_OPTIONS)}</em></div>
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={LogoUrl} alt="Logo" style={{ maxWidth: '100%' }} />
                </div>
            </DialogContent>
            <DialogActions style={{ display: 'flex', justifyContent: 'space-between', padding: '1em' }}>
                <span><Button variant='text' target='_blank' href='https://psi.atlassian.net/wiki/spaces/PCA/overview?homepageId=37716432' startIcon={<DescriptionIcon/>}>Check the PCA documentation</Button></span>
                <Button color={'error'} variant={'outlined'} onClick={() => props.setAboutModal(false)}>Close</Button>
            </DialogActions>
        </CustomMUIDialog>
    )
}

export default About