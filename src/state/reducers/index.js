import { combineReducers } from "redux";
import program from "./program.js";
import programStage from "./programStage.js";

const reducers = combineReducers({
    program,
    programStage
});

export default reducers;