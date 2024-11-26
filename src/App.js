window.process = {}
import './css/main.css';
import { useDataQuery } from "@dhis2/app-runtime";
import React, { useEffect, useState } from 'react';
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
    if (pcaReady === undefined) {
        return LoadingPage;
    }

    if (!versionValid) {
        return VersionErrorPage;
    }

    if (!pcaMetadataData || !pcaReady) {
        return MetadataErrorPage;
    }

    if (pcaMetadataData?.results?.version < PCA_METADATA_VERSION) {
        return MetadataUpdatePage;
    }

    return undefined;
}

const App = () => {

    const [dataChecked, setDataChecked] = useState(false);
    const [pcaReady, setPcaReady] = useState(undefined);
    const [h2Ready, setH2Ready] = useState(undefined);
    const [renderComponent, setRenderComponent] = useState(()=>LoadingPage);

    //* DHIS2 Server version checks
    const serverInfoQuery = useDataQuery(queryServerInfo);
    const [serverInfo, setServerInfo] = useState(undefined);
    const [versionValid, setVersionValid] = useState(undefined);
    
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
    const { data: pcaMetadataData, loading: loadingPcaMetadata } = useDataQuery(queryPCAAvailableMetadata);

    //* All completeness checked
    useEffect(() => {
        if (pcaCheck1 && pcaCheck2 && pcaCheck3 && pcaCheck4 && h2Check1 && h2Check2 && h2Check3 && h2Check4 && h2Check5 && h2Check6 && h2Check7) {
            const pcaStatus = completenessCheck(pcaCheck1, checkProcessPCA[0])
                && completenessCheck(pcaCheck2, checkProcessPCA[1])
                && completenessCheck(pcaCheck3, checkProcessPCA[2])
                && completenessCheck(pcaCheck4, checkProcessPCA[3]);
            setPcaReady(pcaStatus);

            const h2Status = completenessCheck(h2Check1, checkProcessH2[0])
                && completenessCheck(h2Check2, checkProcessH2[1])
                && completenessCheck(h2Check3, checkProcessH2[2])
                && completenessCheck(h2Check4, checkProcessH2[3])
                && completenessCheck(h2Check5, checkProcessH2[4])
                && completenessCheck(h2Check6, checkProcessH2[5])
                && completenessCheck(h2Check7, checkProcessH2[6]);
            setH2Ready(h2Status);
            setDataChecked(true);
        }
    }, [pcaCheck1, pcaCheck2, pcaCheck3, pcaCheck4, h2Check1, h2Check2, h2Check3, h2Check4, h2Check5, h2Check6, h2Check7]);

    useEffect(() => {
        setServerInfo(serverInfoQuery?.data?.results);
    }, [serverInfoQuery]);

    useEffect(() => {
        if (serverInfo?.version) {
            window.localStorage.SERVER_VERSION = serverInfo.version
            setVersionValid(versionIsValid(serverInfo.version, MIN_VERSION, MAX_VERSION));
        }
    }, [serverInfo]);

    useEffect(() => {
        console.log({ loadingPcaMetadata });
        if (!dataChecked || serverInfo === undefined || loadingPcaMetadata) {
            setRenderComponent(() => LoadingPage);
        } else {
            localStorage.setItem('h2Ready', String(h2Ready));
            const errorResult = getErrorPage(versionValid, pcaReady, pcaMetadataData);
            setRenderComponent(errorResult ? () => errorResult : undefined);
        }
    }, [pcaReady, h2Ready, pcaMetadataData, versionValid, dataChecked, serverInfo, loadingPcaMetadata]);

    return (
        <>
            <Provider store={store}>
                <HashRouter>
                    <div className={classes.container}>
                        <Switch>
                            <Route exact path={"/"} component={renderComponent || ProgramList} />
                            <Route path={'/program/:id?'} component={renderComponent || ProgramDetails} />
                            <Route path={'/programStage/:id?'} component={renderComponent || ProgramStage} />
                        </Switch>
                    </div>
                </HashRouter>
            </Provider>
        </>
    )

}

export default App
