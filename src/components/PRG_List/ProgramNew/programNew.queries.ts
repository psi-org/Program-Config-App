import type { QueryVariables } from '@dhis2/app-service-data';
import {
  DATASTORE_H2_METADATA,
  METADATA,
  NAMESPACE,
} from '../../../configs/Constants';

export const queryId = {
  results: {
    resource: 'system/id.json',
    params: { limit: 30 },
  },
};

export const queryIds = {
  results: {
    resource: 'system/id.json',
    params: (variables: QueryVariables) => ({
      limit: variables.n as number,
    }),
  },
};

export const queryProgramType = {
  results: {
    resource: 'attributes',
    params: {
      fields: ['id'],
      filter: ['code:eq:PROGRAM_TYPE'],
    },
  },
};

export const queryTEType = {
  results: {
    resource: 'trackedEntityTypes',
    params: {
      fields: [
        'id',
        'name',
        'trackedEntityTypeAttributes[trackedEntityAttribute[id]]',
      ],
      paging: false,
    },
  },
};

export const queryTEAttributes = {
  results: {
    resource: 'trackedEntityAttributes',
    params: {
      fields: ['id', 'name', 'valueType'],
      paging: false,
    },
  },
};

export const queryCatCombos = {
  results: {
    resource: 'categoryCombos',
    params: {
      fields: ['id', 'name'],
      filter: ['dataDimensionType:eq:ATTRIBUTE'],
      paging: false,
    },
  },
};

export const queryAvailablePrefix = {
  results: {
    resource: 'programs',
    params: (variables: QueryVariables) => {
      const dePrefix = variables.dePrefix as string | undefined;
      const program = variables.program as string | undefined;
      const filters = [`${METADATA}:like:"dePrefix":"${dePrefix}"`];
      if (program) {
        filters.push(`name:!eq:${program}`);
      }

      return {
        fields: ['id'],
        filters,
      };
    },
  },
};

export const metadataMutation = {
  resource: 'metadata',
  type: 'create',
  data: ({ data }: { data: unknown }) => data,
};

export const queryHNQIS2Metadata = {
  results: {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`,
  },
};

export const queryCurrentUser = {
  results: {
    resource: 'me',
    params: {
      fields: ['id', 'authorities'],
    },
  },
};
