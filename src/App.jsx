window.process = {};

import './css/main.css';
import { useDataEngine, useDataQuery } from '@dhis2/app-runtime';
import { CircularLoader } from '@dhis2/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Route, Switch } from 'react-router-dom';
import classes from './App.module.css';
import LoadingPage from './components/PCA_Loading/LoadingPage.jsx';
import MetadataErrorPage from './components/PCA_Loading/MetadataErrorPage.jsx';
import MetadataUpdatePage from './components/PCA_Loading/MetadataUpdatePage.jsx';
import VersionErrorPage from './components/PCA_Loading/VersionErrorPage.jsx';
import ProgramDetails from './components/PRG_Details/ProgramDetails.jsx';
import ProgramList from './components/PRG_List/ProgramList.jsx';
import ProgramStage from './components/STG_Details/ProgramStage.jsx';
import { MIN_VERSION, MAX_VERSION, PCA_METADATA_VERSION, NAMESPACE, DATASTORE_PCA_METADATA } from './configs/Constants.jsx';
import store from './state/store.js';
import { checkProcessH2, checkProcessPCA } from './utils/PCALoadingUtils.js';
import { versionIsValid } from './utils/Utils.jsx';

const queryServerInfo = {
    results: { resource: 'system/info' },
};

const queryPCAAvailableMetadata = {
    results: { resource: `dataStore/${NAMESPACE}/${DATASTORE_PCA_METADATA}` },
};

const toInnerQuery = (q) => (q?.results && typeof q.results === 'object' ? q.results : q);

const buildMultiQuery = (processList, prefix) => {
    const query = {};
    processList.forEach((proc, i) => {
        const raw = typeof proc.queryFunction === 'function' ? proc.queryFunction() : proc.queryFunction;
        const inner = toInnerQuery(raw);
        if (inner) {
            query[`${prefix}${i}`] = inner;
        }
    })
    return query;
};

const isComplete = (dataForStep, proc) => {
    const list = dataForStep?.[proc.objectName];
    if (!Array.isArray(list)) { return false; }
    const presentIds = new Set(list.map((o) => o.id));
    return proc.resultsList.every((id) => presentIds.has(id));
};

const CenteredLoader = () => (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <CircularLoader />
    </div>
);

const App = () => {
    const engine = useDataEngine();

    const pcaChecksQuery = useMemo(() => buildMultiQuery(checkProcessPCA, 'pca'), []);
    const h2ChecksQuery = useMemo(() => buildMultiQuery(checkProcessH2, 'h2'), []);

    const { data: pcaChecksData, loading: pcaChecksLoading, error: pcaChecksError } =
        useDataQuery(pcaChecksQuery);

    const { data: h2ChecksData, loading: h2ChecksLoading, error: h2ChecksError } =
        useDataQuery(h2ChecksQuery);

    const serverInfoQuery = useDataQuery(queryServerInfo);
    const serverInfo = serverInfoQuery.data?.results;

    const [pcaMetaState, setPcaMetaState] = useState({
        loading: true,
        data: null,
        error: null,
        missing: false,
    });

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setPcaMetaState({ loading: true, data: null, error: null, missing: false });

            try {
                const res = await engine.query(queryPCAAvailableMetadata);
                if (cancelled) { return; };
                setPcaMetaState({ loading: false, data: res?.results ?? null, error: null, missing: false });
            } catch (e) {
                if (cancelled) { return; }

                const status =
                    e?.details?.httpStatusCode ??
                    e?.details?.response?.status ??
                    e?.response?.status ??
                    e?.httpStatusCode;

                const missing = status === 404;
                setPcaMetaState({ loading: false, data: null, error: e, missing });
            }
        }

        run();
        return () => {
            cancelled = true;
        }
    }, [engine]);

    useEffect(() => {
        if (serverInfo?.version) {
            window.localStorage.SERVER_VERSION = serverInfo.version;
        }
    }, [serverInfo?.version]);

    const pcaReady = useMemo(() => {
        if (pcaChecksLoading) {
            return undefined;
        }
        if (pcaChecksError || !pcaChecksData) {
            return false;
        }

        return checkProcessPCA.every((proc, i) => isComplete(pcaChecksData[`pca${i}`], proc));
    }, [pcaChecksLoading, pcaChecksError, pcaChecksData]);

    const h2Ready = useMemo(() => {
        if (h2ChecksLoading) {
            return undefined;
        }
        if (h2ChecksError || !h2ChecksData) {
            return false;
        }

        return checkProcessH2.every((proc, i) => isComplete(h2ChecksData[`h2${i}`], proc));
    }, [h2ChecksLoading, h2ChecksError, h2ChecksData]);

    useEffect(() => {
        if (typeof h2Ready === 'boolean') {
            localStorage.setItem('h2Ready', String(h2Ready));
        }
    }, [h2Ready]);

    const GateComponent = useMemo(() => {
        if (serverInfoQuery.loading || pcaMetaState.loading || pcaReady === undefined) {
            return LoadingPage;
        }

        const versionValid =
            serverInfo?.version && versionIsValid(serverInfo.version, MIN_VERSION, MAX_VERSION);

        if (!versionValid) {
            return VersionErrorPage;
        }
        if (pcaReady === false) {
            return MetadataErrorPage;
        }


        if (pcaMetaState.missing) {
            return MetadataUpdatePage;
        }

        const availableVersion = pcaMetaState.data?.version;
        const needsUpdate =
            pcaMetaState.error ||
            availableVersion < PCA_METADATA_VERSION;

        if (needsUpdate) {
            return MetadataUpdatePage;
        }

        return null;
    }, [
        serverInfoQuery.loading,
        serverInfo?.version,
        pcaMetaState.loading,
        pcaMetaState.data,
        pcaMetaState.error,
        pcaMetaState.missing,
        pcaReady,
    ]);

    if (pcaChecksLoading || h2ChecksLoading || serverInfoQuery.loading) {
        return (<CenteredLoader />);
    }

    const RootComponent = GateComponent ?? ProgramList;
    const ProgramComponent = GateComponent ?? ProgramDetails;
    const StageComponent = GateComponent ?? ProgramStage;

    return (
        <Provider store={store}>
            <HashRouter>
                <div className={classes.container}>
                    <Switch>
                        <Route exact path="/" component={RootComponent} />
                        <Route path="/program/:id?" component={ProgramComponent} />
                        <Route path="/programStage/:id?" component={StageComponent} />
                    </Switch>
                </div>
            </HashRouter>
        </Provider>
    )
};

export default App;
