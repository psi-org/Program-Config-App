import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader, NoticeBox } from '@dhis2/ui'
import React, { useState } from 'react';
import { NAMESPACE, DATASTORE_H2_METADATA, H2_METADATA_VERSION } from "../../../configs/Constants.js";
import metadataPkg from '../../../configs/HNQIS2_Metadata_Package.json'
import { parseErrorsUL, versionGTE } from '../../../utils/Utils.js'
import ExtensionActions from "./ExtensionActions.js";
import InstallationInfo from "./InstallationInfo.js";

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const dataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`,
    type: 'create',
    data: ({ data }) => data
};

const updateDataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`,
    type: 'update',
    data: ({ data }) => data
};

const queryHNQIS2Metadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`
    }
};

const H2MetadataHandler = () => {

    const [isInstalled, setIsInstalled] = useState(localStorage.getItem('h2Ready') === 'true');

    const [sending, setSending] = useState(false);
    const [error, setError] = useState(undefined);
    const [success, setSuccess] = useState(undefined);

    const { data: hnqis2Metadata, loading, refetch: hnqis2MetadataRefetch } = useDataQuery(queryHNQIS2Metadata);

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
                    version: H2_METADATA_VERSION,
                    date: new Date()
                };

                const sendToDataStore = !hnqis2Metadata?.results
                    ? dataStoreCreate
                    : dataStoreUpdate;

                sendToDataStore({ data: dsData }).then(res => {
                    if (res.status != 'OK') {
                        setError(res);
                    } else {
                        setSuccess(true);
                        localStorage.setItem('h2Ready', String(true));
                        setIsInstalled(true);
                        hnqis2MetadataRefetch();
                    }
                });

            }
        });
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
                <h3>HNQIS 2.0 Metadata Details</h3>
                <div>
                    <strong>Latest Metadata Package Version: </strong>{H2_METADATA_VERSION}</div>
                <div>
                    <div>
                        <strong>Current Installed Version: </strong>
                        {hnqis2Metadata?.results?.version ?? "Not Found"}
                    </div>
                    {!loading && !hnqis2Metadata?.results &&
                        <div style={{ marginTop: '1em' }}>
                            <NoticeBox
                                title="Installation Required"
                                warning={true}
                            >
                                <p>The HNQIS 2.0 metadata package is required in order to enable HNQIS features</p>
                            </NoticeBox>
                        </div>
                    }
                    {loading &&
                        <div style={{ marginTop: '1em', display: 'flex', justifyContent: 'center' }}>
                            <CircularLoader small />
                        </div>
                    }
                </div>
                {hnqis2Metadata?.results &&
                    <InstallationInfo
                        versionValid={versionGTE(hnqis2Metadata.results.version, H2_METADATA_VERSION)}
                        isInstalled={isInstalled}
                        installDate={hnqis2Metadata.results.date}
                    />
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
            <ExtensionActions
                currentExtensionVersion={hnqis2Metadata?.results?.version || '0'}
                extensionVersion={H2_METADATA_VERSION}
                runInstall={install}
                loading={sending}
                docsUrl='https://psi.atlassian.net/wiki/spaces/HNQIS/overview?homepageId=36536495'
            />
        </>
    )
}

export default H2MetadataHandler;