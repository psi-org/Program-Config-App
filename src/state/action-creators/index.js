import * as programActions from  './program.js';
import * as programStageActions from  './programStage.js';

const actionCreators = {
    ...programActions,
    ...programStageActions
};

export default actionCreators;