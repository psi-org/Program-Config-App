window.process = {}
import './css/main.css';
import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader } from '@dhis2/ui';
import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Route, Switch } from "react-router-dom";
import classes from './App.module.css'
import LoadingPage from './components/PCA_Loading/LoadingPage.js';
import MetadataErrorPage from './components/PCA_Loading/MetadataErrorPage.js';
import MetadataUpdatePage from './components/PCA_Loading/MetadataUpdatePage.js';
import VersionErrorPage from './components/PCA_Loading/VersionErrorPage.js';
import ProgramDetails from "./components/PRG_Details/ProgramDetails.js";
import ProgramList from "./components/PRG_List/ProgramList.js";
import ProgramStage from './components/STG_Details/ProgramStage.js';
import { MIN_VERSION, MAX_VERSION, PCA_METADATA_VERSION, NAMESPACE, DATASTORE_PCA_METADATA } from './configs/Constants.js';
import store from './state/store.js';
import { checkProcessH2, checkProcessPCA } from './utils/PCALoadingUtils.js';
import { versionIsValid } from './utils/Utils.js';

const queryServerInfo = {
    results: {
        resource: 'system/info',
    }
};

export const queryPCAAvailableMetadata = {
    results: {
        resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}`
    }
};

const completenessCheck = (queryResult, checkProcess) => {
    return queryResult?.results[checkProcess.objectName]?.filter(obj => checkProcess.resultsList.includes(obj.id)).length >= checkProcess.resultsList.length;
}

const getErrorPage = (versionValid, pcaReady, pcaMetadataData) => {
    if (!versionValid) {
        return VersionErrorPage;
    }

    if (!pcaReady) {
        return LoadingPage;
    }

    if (!pcaMetadataData) {
        return MetadataErrorPage;
    }

    if (pcaMetadataData?.results?.version < PCA_METADATA_VERSION) {
        return MetadataUpdatePage;
    }

    return undefined;
}

const App = () => {

    let dataChecked = false;
    let pcaReady = false;
    let h2Ready = false;
    let errorPage = undefined;
    
    //* Checking PCA Metadata Package completeness
    const { data: pcaCheck1 } = useDataQuery(checkProcessPCA[0].queryFunction);
    const { data: pcaCheck2 } = useDataQuery(checkProcessPCA[1].queryFunction);
    const { data: pcaCheck3 } = useDataQuery(checkProcessPCA[2].queryFunction);
    const { data: pcaCheck4 } = useDataQuery(checkProcessPCA[3].queryFunction);


    //* Checking HNQIS2 Metadata Package completeness
    const { data: h2Check1 } = useDataQuery(checkProcessH2[0].queryFunction);
    const { data: h2Check2 } = useDataQuery(checkProcessH2[1].queryFunction);
    const { data: h2Check3 } = useDataQuery(checkProcessH2[2].queryFunction);
    const { data: h2Check4 } = useDataQuery(checkProcessH2[3].queryFunction);
    const { data: h2Check5 } = useDataQuery(checkProcessH2[4].queryFunction);
    const { data: h2Check6 } = useDataQuery(checkProcessH2[5].queryFunction);
    const { data: h2Check7 } = useDataQuery(checkProcessH2[6].queryFunction);

    //* Checking PCA Metadata version
    const { data: pcaMetadataData } = useDataQuery(queryPCAAvailableMetadata);

    //* All completeness checked
    if (pcaCheck1 && pcaCheck2 && pcaCheck3 && pcaCheck4 && h2Check1 && h2Check2 && h2Check3 && h2Check4 && h2Check5 && h2Check6 && h2Check7) {
        pcaReady = completenessCheck(pcaCheck1, checkProcessPCA[0])
            && completenessCheck(pcaCheck2, checkProcessPCA[1])
            && completenessCheck(pcaCheck3, checkProcessPCA[2])
            && completenessCheck(pcaCheck4, checkProcessPCA[3]);

        h2Ready = completenessCheck(h2Check1, checkProcessH2[0])
            && completenessCheck(h2Check2, checkProcessH2[1])
            && completenessCheck(h2Check3, checkProcessH2[2])
            && completenessCheck(h2Check4, checkProcessH2[3])
            && completenessCheck(h2Check5, checkProcessH2[4])
            && completenessCheck(h2Check6, checkProcessH2[5])
            && completenessCheck(h2Check7, checkProcessH2[6]);

        localStorage.setItem('h2Ready', String(h2Ready));
        dataChecked = true;
    }

    //* Checking DHIS2 Server version
    const serverInfoQuery = useDataQuery(queryServerInfo);
    const serverInfo = serverInfoQuery.data?.results;

    if (serverInfo) { window.localStorage.SERVER_VERSION = serverInfo.version }

    const versionValid = serverInfo && serverInfo.version ? versionIsValid(serverInfo.version, MIN_VERSION, MAX_VERSION) : false;

    if (!dataChecked || !serverInfo?.version) {
        return (<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <CircularLoader />
        </div>)
    }
    
    errorPage = getErrorPage(versionValid, pcaReady, pcaMetadataData);

    return (
        <>
            <Provider store={store}>
                <HashRouter>
                    <div className={classes.container}>
                        <Switch>
                            <Route exact path={"/"}
                                component={!errorPage ? ProgramList : errorPage} />
                            <Route path={'/program/:id?'}
                                component={!errorPage ? ProgramDetails : errorPage} />
                            <Route path={'/programStage/:id?'}
                                component={!errorPage ? ProgramStage : errorPage} />
                        </Switch>
                    </div>
                </HashRouter>
            </Provider>
        </>
    )

}

export default App
