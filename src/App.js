window.process = {}
import React from 'react'

import classes from './App.module.css'
import { useDataQuery } from "@dhis2/app-runtime";
import { MIN_VERSION, MAX_VERSION, PCA_ATTRIBUTES, PCA_OPTIONS, PCA_USER_ROLES, PCA_OPTION_SETS } from './configs/Constants';
import { versionIsValid } from './configs/Utils';

/**
 * STORE [w/Redux]
 */
import store from './state/store';
import {Provider} from 'react-redux';

/**
 * Routing
 */
import { BrowserRouter, HashRouter, Link, Redirect, Route, Switch } from "react-router-dom";

/**
 * COMPONENTS
 */
import ProgramDetails from "./components/PRG_Details/ProgramDetails";
import ProgramList from "./components/PRG_List/ProgramList";
import ProgramStage from './components/STG_Details/ProgramStage';
import VersionErrorPage from './components/PCA_Loading/VersionErrorPage';
import MetadataErrorPage from './components/PCA_Loading/MetadataErrorPage';
import LoadingPage from './components/PCA_Loading/LoadingPage';

/**
 * CSS
 */
import './css/main.css';

const queryServerInfo = {
    results: {
        resource: 'system/info',
    }
};

const queryAvailableMetadata = {
    results: {
        resource: 'metadata',
        params: {
            fields: ['id'],
            filter: ['id:in:[TOcCuCN2CLm,Ip3IqzzqgLN,Jz4YKD15lnK,QR0HHcQri91,v9XPATv6G3N,yB5tFAAN7bI,haUflNqP85K,QbYqOgwk5fJ]']
        }
    }
};

const App = () => {
    const serverInfoQuery = useDataQuery(queryServerInfo);
    const serverInfo = serverInfoQuery.data?.results;

    const availableMetadataQuery = useDataQuery(queryAvailableMetadata);
    const availableMetadata = availableMetadataQuery.data?.results;

    if(serverInfo) window.localStorage.SERVER_VERSION = serverInfo.version

    const versionValid = serverInfo?versionIsValid(serverInfo.version, MIN_VERSION, MAX_VERSION):true

    const pcaReady = availableMetadata?
        availableMetadata.attributes.filter(att => PCA_ATTRIBUTES.includes(att.id)).length >= PCA_ATTRIBUTES.length &&
        availableMetadata.optionSets.filter(os => PCA_OPTION_SETS.includes(os.id)).length >= PCA_OPTION_SETS.length &&
        availableMetadata.userRoles.filter(role => PCA_USER_ROLES.includes(role.id)).length >= PCA_USER_ROLES.length &&
        availableMetadata.options.filter(opt => PCA_OPTIONS.includes(opt.id)).length >= PCA_OPTIONS.length
        : undefined;
    
    const errorPage = !versionValid
        ?VersionErrorPage
        :(pcaReady===undefined
            ?LoadingPage
            :(!pcaReady?MetadataErrorPage:undefined))

    return (
    <>
        <Provider store={store}>
            <HashRouter>
                <div className={classes.container}>
                    <Switch>
                        <Route exact path={"/"} 
                            component={!errorPage?ProgramList:errorPage}/>

                        <Route path={'/program/:id?'}
                            component={!errorPage?ProgramDetails:errorPage}/>

                        <Route path={'/programStage/:id?'} 
                            component={!errorPage?ProgramStage:errorPage}/>
                    </Switch>
                </div>
                
            </HashRouter>
        </Provider>
    </>
    )

}

export default App
