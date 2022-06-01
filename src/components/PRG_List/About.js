import {useDataQuery} from "@dhis2/app-runtime";
import { NAMESPACE, BUILD_VERSION, BUILD_DATE } from "../../configs/Constants";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'

const queryPCAMetadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/pcaMetadata`
    }
};

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/hnqis2Metadata`
    }
};

const About = (props) => {

    const { data: pcaMetadata, error: pcaMetadataError } = useDataQuery(queryPCAMetadata);
    const { data: hnqis2Metadata, error: hnqis2MetadataError } = useDataQuery(queryHNQIS2Metadata);

    return (
        <CustomMUIDialog open={props.aboutModal} maxWidth='md' fullWidth={true} onClose={()=>props.setAboutModal(false)}>
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setAboutModal(false)}>
                About <strong><em>Program Config App</em></strong>
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', display:'flex', flexDirection:'column', gap:'1em' }}>
                    <p><strong>Version</strong> : {BUILD_VERSION}</p>
                    <p><strong>Build date</strong> : {BUILD_DATE}</p>
                    <p><strong>DHIS2 Server version</strong> : {localStorage.getItem('SERVER_VERSION')}</p>
                    <p><strong>Program Config App metadata</strong> : {(pcaMetadata?.results?.version) || "Not Found"}</p>
                    <p><strong>HNQIS2 Metadata</strong> : {(hnqis2Metadata?.results?.version) || "Not Found"}</p>
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}></DialogActions>
        </CustomMUIDialog>
    )
}

export default About