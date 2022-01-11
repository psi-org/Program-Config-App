import { applyMiddleware, compose, createStore } from "redux";
import  reducers from './reducers';
import thunk from "redux-thunk";

const composedEnhancer = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
);

const store = createStore(reducers,{},composedEnhancer);

export default store;