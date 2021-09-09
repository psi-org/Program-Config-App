const reducer = (state=null,action) => {
    switch(action.type){
        case 'GET_PROGRAM_STAGE':
            return {};
        case 'SET_PROGRAM_STAGE':
            return action.payload;
        case 'ADD_STAGE':
            // fetch(action.payload)
            return {};
        default:
            return state;
    }
}

export default reducer;