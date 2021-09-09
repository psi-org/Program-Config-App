import React from 'react'
// import { DataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'

// -------------------------------------------
import store from './state/store';
import {Provider} from 'react-redux';
// -------------------------------------------
// Router
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom";
// Components
// import Navbar from "./components/Navbar/Navbar";
import ProgramDetails from "./components/PRG_Details/ProgramDetails";
import ProgramList from "./components/PRG_List/ProgramList";
import ProgramStage from './components/STG_Details/ProgramStage';
// DHIS2 UI
import { Button } from '@dhis2-ui/button';

const App = () => (
    <Provider store={store}>
        
        <BrowserRouter>
            <Link to="/"><Button>Programs list</Button></Link>
            <Link to="/program"><Button>Program Details</Button></Link>
            <Link to="/programStage"><Button>Program Stage</Button></Link>
            <div className={classes.container}>
                <Switch>
                    <Route exact path='/' component={ProgramList}/>
                    <Route path='/program' component={ProgramDetails}/>
                    <Route path='/programStage' component={ProgramStage}/>
                </Switch>
            </div>
            <Redirect to='/'/>
        </BrowserRouter>
    </Provider>
)

export default App
