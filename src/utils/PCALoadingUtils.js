import { H2_REQUIRED, PCA_ATTRIBUTES, PCA_OPTIONS, PCA_OPTION_SETS, PCA_USER_ROLES } from "../configs/Constants.js";

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

const queryH2DataElements = {
    results: {
        resource: 'dataElements',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.dataElements.join(',')}]`]
        }
    }
};

const queryH2OptionSets = {
    results: {
        resource: 'optionSets',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.optionSets.join(',')}]`]
        }
    }
};

const queryH2Options = {
    results: {
        resource: 'options',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.options.join(',')}]`]
        }
    }
};

const queryH2TrackedEntityTypes = {
    results: {
        resource: 'trackedEntityTypes',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.trackedEntityTypes.join(',')}]`]
        }
    }
};

const queryH2TrackedEntityAttributes = {
    results: {
        resource: 'trackedEntityAttributes',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.trackedEntityAttributes.join(',')}]`]
        }
    }
};

const queryH2Attributes = {
    results: {
        resource: 'attributes',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.attributes.join(',')}]`]
        }
    }
};

const queryH2LegendSets = {
    results: {
        resource: 'legendSets',
        params: {
            fields: ['id'],
            filter: [`id:in:[${H2_REQUIRED.legendSets.join(',')}]`]
        }
    }
};

export const checkProcessPCA = [
    { queryFunction: queryPCAAttributes, resultsList: PCA_ATTRIBUTES, objectName: 'attributes' },
    { queryFunction: queryPCAOptionSets, resultsList: PCA_OPTION_SETS, objectName: 'optionSets' },
    { queryFunction: queryPCAOptions, resultsList: PCA_OPTIONS, objectName: 'options' },
    { queryFunction: queryPCAUserRoles, resultsList: PCA_USER_ROLES, objectName: 'userRoles' }
];

export const checkProcessH2 = [
    { queryFunction: queryH2DataElements, resultsList: H2_REQUIRED.dataElements, objectName: 'dataElements' },
    { queryFunction: queryH2OptionSets, resultsList: H2_REQUIRED.optionSets, objectName: 'optionSets' },
    { queryFunction: queryH2Options, resultsList: H2_REQUIRED.options, objectName: 'options' },
    { queryFunction: queryH2TrackedEntityTypes, resultsList: H2_REQUIRED.trackedEntityTypes, objectName: 'trackedEntityTypes' },
    { queryFunction: queryH2TrackedEntityAttributes, resultsList: H2_REQUIRED.trackedEntityAttributes, objectName: 'trackedEntityAttributes' },
    { queryFunction: queryH2Attributes, resultsList: H2_REQUIRED.attributes, objectName: 'attributes' },
    { queryFunction: queryH2LegendSets, resultsList: H2_REQUIRED.legendSets, objectName: 'legendSets' }
]