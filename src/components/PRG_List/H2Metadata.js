import {useState} from "react"
import {useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import { NAMESPACE, DATASTORE_H2_METADATA, H2_METADATA_VERSION, DATE_FORMAT_OPTIONS } from "../../configs/Constants";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CustomMUIDialog from './../UIElements/CustomMUIDialog'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle'
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import WarningIcon from '@mui/icons-material/Warning';
import { Button } from "@mui/material";
import {NoticeBox} from '@dhis2/ui'
import {parseErrors} from '../../configs/Utils'
import LoadingButton from '@mui/lab/LoadingButton';

import H2MetadataJSON from '../../configs/HNQIS2_Metadata_Package.json'

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const dataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}?encrypt=true`,
    type: 'create',
    data: ({ data }) => data
};

const updateDataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}?encrypt=true`,
    type: 'update',
    data: ({ data }) => data
};

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`
    }
};

const H2Metadata = (props) => {

    const [sending,setSending] = useState(false)
    const [error,setError] = useState(undefined)
    const [success,setSuccess] = useState(undefined)
    const { data: hnqis2Metadata, refetch: hnqis2MetadataRefetch } = useDataQuery(queryHNQIS2Metadata);
    const [metadataMutate] = useDataMutation(metadataMutation)
    const [dataStoreUpdate] = useDataMutation(updateDataStoreMutation)
    const [dataStoreCreate] = useDataMutation(dataStoreMutation)

    const install = () => {
        setSending(true)
        metadataMutate({ data: H2MetadataJSON }).then(response => {
            setTimeout(setSending(false),1000)
            if (response.status != 'OK')  setError(response)
            else {
                //Success
                let dsData = {
                    version:H2_METADATA_VERSION,
                    date: new Date()
                }
                let sendToDataStore = !hnqis2Metadata?.results ? dataStoreCreate : dataStoreUpdate
                sendToDataStore({data:dsData}).then(res => {
                    if(res.status!= 'OK') setError(res)
                    else {
                        setSuccess(true)
                        localStorage.setItem('h2Ready',String(true))
                        hnqis2MetadataRefetch()
                    }
                })
                
            }
        })
    }

    return (
        <CustomMUIDialog open={props.H2Modal} maxWidth='md' fullWidth={true} onClose={()=>props.setH2Modal(false)}>
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setH2Modal(false)}>
                <strong><em>HNQIS2 Status</em></strong>
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', display:'flex', flexDirection:'column', gap:'1em' }}>
                <div style={{display:'flex', flexDirection:'column', gap:'1.5em'}}>
                    <h3>HNQIS2 Metadata Details</h3>
                    <div>
                        <strong>Installed Version: </strong>{hnqis2Metadata?.results?.version ?? "Not Found"}<br/>
                        {!hnqis2Metadata?.results && <div style={{display:'flex', alignItems:'center', gap:'1em', color:"#ba000d", marginLeft:'1em'}}><WarningIcon/><em>The HNQIS2 metadata package is required in order to enable HNQIS features</em></div>}
                    </div>
                    {hnqis2Metadata?.results && <p><strong>Installed on: </strong>{new Date(hnqis2Metadata.results.date).toLocaleString("en-US",DATE_FORMAT_OPTIONS)} </p>}
                    <div><strong>Latest Version: </strong>{H2_METADATA_VERSION}</div>
                </div>
                {success &&
                <NoticeBox title="Installation Completed">
                    <p>The HNQIS2 Metadata Package was installed successfully.</p>
                </NoticeBox>}
                {error && <NoticeBox error={true} title="Install Error">
                    <p>The HNQIS2 Metadata Package could not be installed.</p>
                    <div>{parseErrors(error)}</div>
                </NoticeBox>}
            </DialogContent>
            <DialogActions style={{ padding: '1em' }}>
                <Button color={'error'} variant={'outlined'} onClick={() => props.setH2Modal(false)}>Close</Button>
                <LoadingButton onClick={install} endIcon={<InstallDesktopIcon />} loading={sending} loadingPosition="end" variant="outlined" loadingIndicator="Installing..." >
                    Install Metadata
                </LoadingButton>
            </DialogActions>
        </CustomMUIDialog>
    )
}

export default H2Metadata