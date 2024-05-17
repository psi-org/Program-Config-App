import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { NoticeBox } from '@dhis2/ui'
import DescriptionIcon from '@mui/icons-material/Description';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import WarningIcon from '@mui/icons-material/Warning';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button } from "@mui/material";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import React, { useState } from "react"
import { NAMESPACE, DATASTORE_H2_METADATA, H2_METADATA_VERSION, DATE_FORMAT_OPTIONS } from "../../configs/Constants.js";
import H2MetadataJSON from '../../configs/HNQIS2_Metadata_Package.json'
import { parseErrorsUL, versionGTE } from '../../utils/Utils.js'
import CustomMUIDialog from './../UIElements/CustomMUIDialog.js'
import CustomMUIDialogTitle from './../UIElements/CustomMUIDialogTitle.js'

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

    const h2Ready = localStorage.getItem('h2Ready') === 'true';

    const [sending, setSending] = useState(false);
    const [error, setError] = useState(undefined);
    const [success, setSuccess] = useState(undefined);
    const { data: hnqis2Metadata, refetch: hnqis2MetadataRefetch } = useDataQuery(queryHNQIS2Metadata);
    const [metadataMutate] = useDataMutation(metadataMutation, {
        onError: (err) => {
            setSending(false);
            setError(err.details);
        }
    });
    const [dataStoreUpdate] = useDataMutation(updateDataStoreMutation, {
        onError: (err) => {
            setSending(false);
            setError(err.details);
        }
    });
    const [dataStoreCreate] = useDataMutation(dataStoreMutation, {
        onError: (err) => {
            setSending(false);
            setError(err.details);
        }
    });

    const install = () => {
        setSending(true);
        metadataMutate({ data: H2MetadataJSON }).then(response => {
            setTimeout(setSending(false), 1000);
            if (response.status != 'OK') {
                setError(response);
            } else {
                const dsData = {
                    version: H2_METADATA_VERSION,
                    date: new Date()
                }
                const sendToDataStore = !hnqis2Metadata?.results ? dataStoreCreate : dataStoreUpdate;
                sendToDataStore({ data: dsData }).then(res => {
                    if (res.status != 'OK') {
                        setError(res);
                    } else {
                        setSuccess(true);
                        localStorage.setItem('h2Ready', String(true));
                        hnqis2MetadataRefetch();
                    }
                })

            }
        })
    }

    return (
        <CustomMUIDialog open={props.H2Modal} maxWidth='md' fullWidth={true} onClose={() => props.setH2Modal(false)}>
            <CustomMUIDialogTitle id="customized-dialog-title" onClose={() => props.setH2Modal(false)}>
                <strong><em>HNQIS 2.0 Status</em></strong>
            </CustomMUIDialogTitle >
            <DialogContent dividers style={{ padding: '1em 2em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
                    <h3>HNQIS 2.0 Metadata Details</h3>
                    <div><strong>Latest Metadata Package Version: </strong>{H2_METADATA_VERSION}</div>
                    <div>
                        <div><strong>Current Installed Version: </strong>{hnqis2Metadata?.results?.version ?? "Not Found"}</div>
                        {!hnqis2Metadata?.results &&
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1em', color: "#ba000d", marginLeft: '1em' }}><WarningIcon /><em>The HNQIS 2.0 metadata package is required in order to enable HNQIS features</em></div>
                        }
                    </div>
                    {hnqis2Metadata?.results &&
                        <>
                            <p><strong>Installation date: </strong>{new Date(hnqis2Metadata.results.date).toLocaleString("en-US", DATE_FORMAT_OPTIONS)} </p>
                        <NoticeBox error={!h2Ready || !versionGTE(hnqis2Metadata?.results?.version, H2_METADATA_VERSION) } title="Minimum Metadata Package Status">
                            <p>{h2Ready ? (!versionGTE(hnqis2Metadata?.results?.version, H2_METADATA_VERSION) ? "The required Metadata Package is outdated, please install the newest version." : "The required Metadata Package is available.") : "The required Metadata Package is incomplete or corrupted, please reinstall it."}</p>
                            </NoticeBox>
                        </>
                    }
                </div>
                {success &&
                    <NoticeBox title="Installation Completed">
                        <p>The HNQIS 2.0 Metadata Package was installed successfully.</p>
                    </NoticeBox>}
                {error && <NoticeBox error={true} title="Install Error">
                    <p>The HNQIS 2.0 Metadata Package could not be installed due to the following errors:</p>
                    <div style={{ marginTop: '1em' }}>{parseErrorsUL(error)}</div>
                </NoticeBox>}
            </DialogContent>
            <DialogActions style={{ padding: '1em', display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <span><Button variant='text' target='_blank' href='https://psi.atlassian.net/wiki/spaces/HNQIS/overview?homepageId=36536495' startIcon={<DescriptionIcon />}>Check the HNQIS 2.0 documentation</Button></span>
                </div>
                <div>
                    <Button color={'error'} variant={'outlined'} style={{marginRight: '1em'}} onClick={() => props.setH2Modal(false)}>Close</Button>
                    <LoadingButton onClick={install} endIcon={<InstallDesktopIcon />} loading={sending} loadingPosition="end" variant="outlined" >
                        {!sending && `${hnqis2Metadata?.results?.version === H2_METADATA_VERSION?'Repair':'Install'} Metadata (v${H2_METADATA_VERSION})`}
                        {sending && `Installing...`}
                    </LoadingButton>
                </div>
            </DialogActions>
        </CustomMUIDialog>
    )
}

H2Metadata.propTypes = {
    H2Modal: PropTypes.bool,
    setH2Modal: PropTypes.func
}

export default H2Metadata