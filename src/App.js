window.process = {}
import React from 'react'
import { useEffect } from "react";

import { DataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import { useDataQuery } from "@dhis2/app-runtime";

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

/**
 * CSS
 */
import './css/main.css';

const queryServerInfo = {
    results: {
        resource: 'system/info',
    }
};

const App = () => {
    const serverInfoQuery = useDataQuery(queryServerInfo);
    const serverInfo = serverInfoQuery.data?.results;
    if(serverInfo) window.localStorage.SERVER_VERSION = serverInfo.version

    return (
    <>
        <Provider store={store}>
            <HashRouter>
                <div className={classes.container}>
                    <Switch>
                        <Route exact path={"/"} component={ProgramList}/>
                        <Route path={'/program/:id?'} component={ProgramDetails}/>
                        <Route path={'/programStage/:id?'} component={ProgramStage}/>
                    </Switch>
                </div>
                
            </HashRouter>
        </Provider>
    </>
    )
}

export default App
