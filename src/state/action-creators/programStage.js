export const getProgramStage = (programStageId) => {
    return (dispatch) => {
        dispatch({
            type: 'GET_PROGRAM_STAGE',
            payload: programStageId
        })
    }
}

export const setProgramStage = (programStageId) => {
    return (dispatch) => {
        dispatch({
            type: 'SET_PROGRAM_STAGE',
            payload: programStageId
        })
    }
}