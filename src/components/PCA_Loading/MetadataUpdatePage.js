import LoadingButton from "@mui/lab/LoadingButton";
import { NoticeBox } from "@dhis2/ui";
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { useState } from "react";
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import metadataPackage from './pcaMetadataPackage.json'
import {NAMESPACE,PCA_METADATA_VERSION,DATASTORE_PCA_METADATA} from '../../configs/Constants'
import { parseErrorsUL } from "../../configs/Utils";

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

    let metadataDM = useDataMutation(metadataMutation);
    const metadataRequest = {
        mutate: metadataDM[0],
        loading: metadataDM[1].loading,
        error: metadataDM[1].error,
        data: metadataDM[1].data,
        called: metadataDM[1].called
    };

    const { data: pcaMetadataData } = useDataQuery(queryDataStore);

    const [dataStoreUpdate] = useDataMutation(dataStoreMutationUpdate)
    


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
                dataStoreUpdate({data:dsData}).then(res => {
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
                    {!error && <NoticeBox title="Outdated Metadata Package">
                        <p>A new version of the PCA Metadata Package has been released. Please update it before proceeding.</p>
                    </NoticeBox>}

                    {!error && <LoadingButton
                        variant="contained"
                        loading={sentData}
                        style={{width: '100%', marginTop: '1em'}}
                        startIcon={<InstallDesktopIcon />}
                        onClick={() => installMetadata()}>
                        Update PCA metadata
                    </LoadingButton>}

                    {error &&
                    <NoticeBox error={true} title="Install Error">
                        <p>The Metadata Package could not be updated.</p>
                        {parseErrorsULrrorsUL(error)}
                    </NoticeBox>}
                </div>
            </div>
        </div>
    );
}

export default MetadataErrorPage;

