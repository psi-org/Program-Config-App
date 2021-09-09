import * as programActions from  './program';
import * as programStageActions from  './programStage';

const actionCreators = {
    ...programActions,
    ...programStageActions
};

export default actionCreators;