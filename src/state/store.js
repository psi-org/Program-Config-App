import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";
import  reducers from './reducers';

const composedEnhancer = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
);

const store = createStore(reducers,{},composedEnhancer);

export default store;