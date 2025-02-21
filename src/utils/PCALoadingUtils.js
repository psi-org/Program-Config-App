import {
    H2_REQUIRED,
    HMWI_REQUIRED,
    PCA_ATTRIBUTES,
    PCA_OPTIONS,
    PCA_OPTION_SETS,
    PCA_USER_ROLES
} from "../configs/Constants.js";

const queryPCAAttributes = {
    results: {
        resource: 'attributes',
        params: {
            fields: ['id'],
            filter: [`id:in:[${PCA_ATTRIBUTES.join(',')}]`]
        }
    }
};

const queryPCAOptionSets = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['id'],
            filter: [`id:in:[${PCA_OPTION_SETS.join(',')}]`]
        }
    }
};

const queryPCAOptions = {
    results: {
        resource: 'options',
        params: {
            fields: ['id'],
            filter: [`id:in:[${PCA_OPTIONS.join(',')}]`]
        }
    }
};

const queryPCAUserRoles = {
    results: {
        resource: 'userRoles',
        params: {
            fields: ['id'],
            filter: [`id:in:[${PCA_USER_ROLES.join(',')}]`]
        }
    }
};

const queryRequiredDataElements = {
    results: {
        resource: 'dataElements',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.dataElements.join(',')}]`]
        })
    }
};

const queryRequiredOptionSets = {
    results: {
        resource: 'optionSets',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.optionSets.join(',')}]`]
        })
    }
};

const queryRequiredOptions = {
    results: {
        resource: 'options',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.options.join(',')}]`]
        })
    }
};

const queryRequiredTrackedEntityTypes = {
    results: {
        resource: 'trackedEntityTypes',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.trackedEntityTypes.join(',')}]`]
        })
    }
};

const queryRequiredTrackedEntityAttributes = {
    results: {
        resource: 'trackedEntityAttributes',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.trackedEntityAttributes.join(',')}]`]
        })
    }
};

const queryRequiredAttributes = {
    results: {
        resource: 'attributes',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.attributes.join(',')}]`]
        })
    }
};

const queryRequiredLegendSets = {
    results: {
        resource: 'legendSets',
        params: ({packageRequired}) => ({
            fields: ['id'],
            filter: [`id:in:[${packageRequired.legendSets.join(',')}]`]
        })
    }
};

export const completenessCheck = (queryResult, checkProcess) => {
    return queryResult?.results[checkProcess.objectName]?.filter(obj => checkProcess.resultsList.includes(obj.id)).length >= checkProcess.resultsList.length;
}

export const checkProcessPCA = [
    { queryFunction: queryPCAAttributes, resultsList: PCA_ATTRIBUTES, objectName: 'attributes' },
    { queryFunction: queryPCAOptionSets, resultsList: PCA_OPTION_SETS, objectName: 'optionSets' },
    { queryFunction: queryPCAOptions, resultsList: PCA_OPTIONS, objectName: 'options' },
    { queryFunction: queryPCAUserRoles, resultsList: PCA_USER_ROLES, objectName: 'userRoles' }
];

export const checkProcessH2 = [
    { queryFunction: queryRequiredDataElements, resultsList: H2_REQUIRED.dataElements, objectName: 'dataElements' },
    { queryFunction: queryRequiredOptionSets, resultsList: H2_REQUIRED.optionSets, objectName: 'optionSets' },
    { queryFunction: queryRequiredOptions, resultsList: H2_REQUIRED.options, objectName: 'options' },
    { queryFunction: queryRequiredTrackedEntityTypes, resultsList: H2_REQUIRED.trackedEntityTypes, objectName: 'trackedEntityTypes' },
    { queryFunction: queryRequiredTrackedEntityAttributes, resultsList: H2_REQUIRED.trackedEntityAttributes, objectName: 'trackedEntityAttributes' },
    { queryFunction: queryRequiredAttributes, resultsList: H2_REQUIRED.attributes, objectName: 'attributes' },
    { queryFunction: queryRequiredLegendSets, resultsList: H2_REQUIRED.legendSets, objectName: 'legendSets' }
];

export const checkProcessHMWI = [
    { queryFunction: queryRequiredOptionSets, resultsList: HMWI_REQUIRED.optionSets, objectName: 'optionSets' },
    { queryFunction: queryRequiredOptions, resultsList: HMWI_REQUIRED.options, objectName: 'options' },
    { queryFunction: queryRequiredTrackedEntityTypes, resultsList: HMWI_REQUIRED.trackedEntityTypes, objectName: 'trackedEntityTypes' },
    { queryFunction: queryRequiredTrackedEntityAttributes, resultsList: HMWI_REQUIRED.trackedEntityAttributes, objectName: 'trackedEntityAttributes' },
    { queryFunction: queryRequiredAttributes, resultsList: HMWI_REQUIRED.attributes, objectName: 'attributes' },
    { queryFunction: queryRequiredLegendSets, resultsList: HMWI_REQUIRED.legendSets, objectName: 'legendSets' }
];