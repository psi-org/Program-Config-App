import LoadingButton from "@mui/lab/LoadingButton";
import { NoticeBox } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { useState } from "react";
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import metadataPackage from './pcaMetadataPackage.json'
import {NAMESPACE,PCA_METADATA_VERSION,DATASTORE_PCA_METADATA} from '../../configs/Constants'
import { parseErrorsUL } from "../../utils/Utils";

const metadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ data }) => data
};

const queryDataStore = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}`
    }
};

const dataStoreMutation = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}?encrypt=true`,
    type: 'create',
    data: ({ data }) => data
};

const dataStoreMutationUpdate = {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}?encrypt=true`,
    type: 'update',
    data: ({ data }) => data
};

const MetadataErrorPage = () => {

    let metadataDM = useDataMutation(metadataMutation, {
        onError: (err) => {
            setSentData(false);
            setError(err.details)
        }
    });
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };

    const { data: pcaMetadataData } = useDataQuery(queryDataStore);

    const [dataStoreCreate] = useDataMutation(dataStoreMutation, {
        onError: (err) => {
            setSentData(false);
            setError(err.details)
        }
    });
    const [dataStoreUpdate] = useDataMutation(dataStoreMutationUpdate, {
        onError: (err) => {
            setSentData(false);
            setError(err.details)
        }
    });
    


    const [error, setError] = useState(false)
    const [sentData, setSentData] = useState(false)

    function installMetadata() {
        setSentData(true)
        metadataRequest.mutate({ data: metadataPackage }).then(response => {
            if (response.status != 'OK') {
                setError(response)
            } else {
                //Success
                let dsData = {
                    version:PCA_METADATA_VERSION,
                    date: new Date()
                }
                let sendToDataStore = !pcaMetadataData?.results ? dataStoreCreate : dataStoreUpdate
                sendToDataStore({data:dsData}).then(res => {
                    if(res.status!= 'OK') setError(res)
                    else window.location.reload()
                })
                
            }
        })
        
    }

    return (
        <div>
            <div className="sub_nav">
                <div className="cnt_p"></div>
                <div className="c_srch"></div>
                <div className="c_btns"></div>
            </div>
            <div className="wrapper">
                <div style={{width: '500px', margin: 'auto', display: 'flex', flexDirection:'column', paddingTop: '1em'}}>
                    {!error && <NoticeBox title="Missing Required Metadata">
                        <p>The server lacks the necessary Metadata package needed to work correctly.</p>
                    </NoticeBox>}

                    {!error && <LoadingButton
                        variant="contained"
                        loading={sentData}
                        style={{width: '100%', marginTop: '1em'}}
                        startIcon={<InstallDesktopIcon />}
                        onClick={() => installMetadata()}>
                        Install necessary metadata
                    </LoadingButton>}

                    {error &&
                    <NoticeBox error={true} title="Install Error">
                        <p>The Metadata Package could not be installed.</p>
                        <br/>{parseErrorsUL(error)}
                    </NoticeBox>}
                </div>
            </div>
        </div>
    );
}

export default MetadataErrorPage;

