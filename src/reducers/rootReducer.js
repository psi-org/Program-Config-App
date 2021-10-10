const initState = {
    value: 0,
    itemList: [
        { id: '1', title: 'james is testing' },
        { id: '2', title: 'poll is testing' },
    ]
}

const rootReducer = (state = initState, action) => 
{
    switch (action.type) 
    {
        case 'valInc':
            console.log( 'valInc requested' );
            return { value: state.value + 1 };
        case 'valDec':
            return { value: state.value - 1 };
        case 'itemAdd':
            return state;
        default:
            return state;
    }

    /*
    const postState = postsReducer(state.post, action);
    const {hasPostReallyBeenAdded} = postState;
    const commentState  = commentsReducer(state.comments, action, hasPostReallyBeenAdded);
    return { post : postState, comments : commentState };
    */
}

export default rootReducer;