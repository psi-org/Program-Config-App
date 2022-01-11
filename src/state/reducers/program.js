const reducer = (state=null,action) => {
    switch(action.type){
        case 'GET_PROGRAM':
            // fetch(action.payload)
            return {};
        case 'SET_PROGRAM':
            return action.payload;
        default:
            return state;
    }
}

export default reducer;