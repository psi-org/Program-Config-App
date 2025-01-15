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
import { MIN_VERSION, MAX_VERSION, PCA_METADATA_VERSION, NAMESPACE, DATASTORE_PCA_METADATA, H2_REQUIRED, HMWI_REQUIRED } from './configs/Constants.js';
import store from './state/store.js';
import { checkProcessH2, checkProcessHMWI, checkProcessPCA, completenessCheck } from './utils/PCALoadingUtils.js';
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
    const [hMWIReady, setHMWIReady] = useState(undefined);
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
    const { data: h2Check1 } = useDataQuery(checkProcessH2[0].queryFunction, { variables: { packageRequired: H2_REQUIRED } });
    const { data: h2Check2 } = useDataQuery(checkProcessH2[1].queryFunction, { variables: { packageRequired: H2_REQUIRED } });
    const { data: h2Check3 } = useDataQuery(checkProcessH2[2].queryFunction, { variables: { packageRequired: H2_REQUIRED } });
    const { data: h2Check4 } = useDataQuery(checkProcessH2[3].queryFunction, { variables: { packageRequired: H2_REQUIRED } });
    const { data: h2Check5 } = useDataQuery(checkProcessH2[4].queryFunction, { variables: { packageRequired: H2_REQUIRED } });
    const { data: h2Check6 } = useDataQuery(checkProcessH2[5].queryFunction, { variables: { packageRequired: H2_REQUIRED } });
    const { data: h2Check7 } = useDataQuery(checkProcessH2[6].queryFunction, { variables: { packageRequired: H2_REQUIRED } });

    //* Checking HNQISMWI Metadata Package completeness
    const { data: hMWICheck1 } = useDataQuery(checkProcessHMWI[0].queryFunction, { variables: { packageRequired: HMWI_REQUIRED } });
    const { data: hMWICheck2 } = useDataQuery(checkProcessHMWI[1].queryFunction, { variables: { packageRequired: HMWI_REQUIRED } });
    const { data: hMWICheck3 } = useDataQuery(checkProcessHMWI[2].queryFunction, { variables: { packageRequired: HMWI_REQUIRED } });
    const { data: hMWICheck4 } = useDataQuery(checkProcessHMWI[3].queryFunction, { variables: { packageRequired: HMWI_REQUIRED } });
    const { data: hMWICheck5 } = useDataQuery(checkProcessHMWI[4].queryFunction, { variables: { packageRequired: HMWI_REQUIRED } });
    const { data: hMWICheck6 } = useDataQuery(checkProcessHMWI[5].queryFunction, { variables: { packageRequired: HMWI_REQUIRED } });

    //* Checking PCA Metadata version
    const { data: pcaMetadataData, loading: loadingPcaMetadata } = useDataQuery(queryPCAAvailableMetadata);

    //* All completeness checked
    useEffect(() => {
        if (pcaCheck1 && pcaCheck2 && pcaCheck3 && pcaCheck4) {
            const pcaChecks = [pcaCheck1, pcaCheck2, pcaCheck3, pcaCheck4];

            let pcaStatus = true;
            for (let i = 0; i < pcaChecks.length; i++) {
                pcaStatus = pcaStatus && completenessCheck(pcaChecks[i], checkProcessPCA[i]);
            }
            setPcaReady(pcaStatus);
        }
    }, [pcaCheck1, pcaCheck2, pcaCheck3, pcaCheck4]);

    useEffect(() => {
        if ( h2Check1 && h2Check2 && h2Check3 && h2Check4 && h2Check5 && h2Check6 && h2Check7) {
            const h2Checks = [h2Check1, h2Check2, h2Check3, h2Check4, h2Check5, h2Check6, h2Check7];

            let h2Status = true;
            for (let i = 0; i < h2Checks.length; i++) {
                h2Status = h2Status && completenessCheck(h2Checks[i], checkProcessH2[i]);
            }
            setH2Ready(h2Status);
        }
    }, [h2Check1, h2Check2, h2Check3, h2Check4, h2Check5, h2Check6, h2Check7]);

    useEffect(() => {
        if (hMWICheck1 && hMWICheck2 && hMWICheck3 && hMWICheck4 && hMWICheck5 && hMWICheck6) {
            const hMWIChecks = [hMWICheck1, hMWICheck2, hMWICheck3, hMWICheck4, hMWICheck5, hMWICheck6];

            let hMWIStatus = true;
            for (let i = 0; i < hMWIChecks.length; i++) {
                hMWIStatus = hMWIStatus && completenessCheck(hMWIChecks[i], checkProcessHMWI[i]);
            }
            setHMWIReady(hMWIStatus);
        }
    }, [hMWICheck1, hMWICheck2, hMWICheck3, hMWICheck4, hMWICheck5, hMWICheck6]);

    useEffect(() => {
        if (pcaReady !== undefined && h2Ready !== undefined && hMWIReady !== undefined) {
            localStorage.setItem('h2Ready', String(h2Ready));
            localStorage.setItem('hMWIReady', String(hMWIReady))
            setDataChecked(true);
        }
    }, [pcaReady, h2Ready, hMWIReady]);

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
        if (!dataChecked || serverInfo === undefined || loadingPcaMetadata) {
            setRenderComponent(() => LoadingPage);
        } else {
            const errorResult = getErrorPage(versionValid, pcaReady, pcaMetadataData);
            setRenderComponent(errorResult ? () => errorResult : undefined);
        }
    }, [pcaReady, pcaMetadataData, versionValid, dataChecked, serverInfo, loadingPcaMetadata]);

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
