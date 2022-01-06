import { combineReducers } from "redux";

import program from "./program";
import programStage from "./programStage";

const reducers = combineReducers({
    program,
    programStage
});

export default reducers;