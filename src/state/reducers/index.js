import { combineReducers } from "redux";

import program from "./program";
import programStages from "./programStages";

const reducers = combineReducers({
    program,
    programStages
});

export default reducers;