import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { NoticeBox } from '@dhis2/ui'
import PropTypes from "prop-types";
import React, { useState } from 'react';
import { NAMESPACE, DATASTORE_HMWI_METADATA, HMWI_METADATA_VERSION } from "../../../configs/Constants.js";
import metadataPkg from '../../../configs/HNQISMWI_Metadata_Package.json'
import { parseErrorsUL, versionGTE } from '../../../utils/Utils.js'
import ExtensionActions from "./ExtensionActions.js";
import InstallationInfo from "./InstallationInfo.js";

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const dataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_HMWI_METADATA}`,
    type: 'create',
    data: ({ data }) => data
};

const updateDataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_HMWI_METADATA}`,
    type: 'update',
    data: ({ data }) => data
};

const queryHNQISMWIMetadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_HMWI_METADATA}`
    }
};

const HMWIMetadataHandler = ({ isInstalled }) => {

    const [sending, setSending] = useState(false);
    const [error, setError] = useState(undefined);
    const [success, setSuccess] = useState(undefined);

    const { data: hnqisMWIMetadata, refetch: hnqisMWIMetadataRefetch } = useDataQuery(queryHNQISMWIMetadata);

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
        metadataMutate({ data: metadataPkg }).then(response => {
            setTimeout(setSending(false), 1000);
            if (response.status != 'OK') {
                setError(response);
            } else {
                const dsData = {
                    version: HMWI_METADATA_VERSION,
                    date: new Date()
                };

                const sendToDataStore = !hnqisMWIMetadata?.results
                    ? dataStoreCreate
                    : dataStoreUpdate;

                sendToDataStore({ data: dsData }).then(res => {
                    if (res.status != 'OK') {
                        setError(res);
                    } else {
                        setSuccess(true);
                        localStorage.setItem('hMWIReady', String(true));
                        hnqisMWIMetadataRefetch();
                    }
                });

            }
        });
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
                <h3>HNQIS MWI Metadata Details</h3>
                <div><strong>Latest Metadata Package Version: </strong>{HMWI_METADATA_VERSION}</div>
                <div>
                    <div>
                        <strong>Current Installed Version: </strong>
                        {hnqisMWIMetadata?.results?.version ?? "Not Found"}
                    </div>
                    {!hnqisMWIMetadata?.results &&
                        <div style={{ marginTop: '1em' }}>
                            <NoticeBox
                                title="Installation Required"
                                warning={true}
                            >
                                <p>The HNQIS MWI metadata package is required in order to enable HNQIS MWI features</p>
                            </NoticeBox>
                        </div>
                    }
                </div>
                {hnqisMWIMetadata?.results &&
                    <InstallationInfo
                        versionValid={versionGTE(hnqisMWIMetadata.results.version, HMWI_METADATA_VERSION)}
                        isInstalled={isInstalled}
                        installDate={hnqisMWIMetadata.results.date}
                    />
                }
            </div>
            {success &&
                <NoticeBox title="Installation Completed">
                    <p>The HNQIS MWI Metadata Package was installed successfully.</p>
                </NoticeBox>}
            {error && <NoticeBox error={true} title="Install Error">
                <p>The HNQIS MWI Metadata Package could not be installed due to the following errors:</p>
                <div style={{ marginTop: '1em' }}>{parseErrorsUL(error)}</div>
            </NoticeBox>}
            <ExtensionActions
                currentExtensionVersion={hnqisMWIMetadata?.results?.version || '0'}
                extensionVersion={HMWI_METADATA_VERSION}
                runInstall={install}
                loading={sending}
            />
        </>
    )
}

HMWIMetadataHandler.propTypes = {
    isInstalled: PropTypes.bool
};

export default HMWIMetadataHandler;