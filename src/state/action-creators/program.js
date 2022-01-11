export const getProgram = (programId) => {
    return (dispatch) => {
        dispatch({
            type: 'GET_PROGRAM',
            payload: programId
        })
    }
}

export const setProgram = (programId) => {
    return (dispatch) => {
        dispatch({
            type: 'SET_PROGRAM',
            payload: programId
        })
    }
}