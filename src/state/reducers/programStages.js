const reducer = (state=[],action) => {
    switch(action.type){
        case 'ADD_STAGE':
            // fetch(action.payload)
            return {};
        default:
            return state;
    }
}

export default reducer;