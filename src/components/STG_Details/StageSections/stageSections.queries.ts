type QueryVariables = Record<string, unknown>;
import { DATASTORE_H2_METADATA, NAMESPACE } from '../../../configs/Constants';
import { getProgramQuery } from '../../../utils/Utils';
import type { PcaDataElement } from '../../../types/pca';
import type { ProgramRule, ProgramRuleVariable } from '../../../types';

// ── Typed query result shapes ─────────────────────────────────────────────────
// These mirror the DHIS2 API responses for each query defined below.
// Cast `useDataQuery(...).data` to the appropriate type to avoid `as any`.

export interface QueryDataPCA {
  results: {
    programs: Array<{
      attributeValues: PcaDataElement['attributeValues'];
      sharing: Record<string, unknown>;
      programStages: Array<{ id: string }>;
    }>;
  };
}

export interface QueryDataOULevels {
  results: {
    organisationUnitLevels: Array<{
      id: string;
      level: number;
      offlineLevels?: number;
    }>;
  };
}

export interface QueryDataIds {
  results: { codes: string[] };
}

export interface QueryDataProgramRules {
  results: {
    programRules: Pick<
      ProgramRule,
      'id' | 'name' | 'condition' | 'programRuleActions'
    >[];
  };
}

export interface QueryDataProgramRuleVariables {
  results: {
    programRuleVariables: Pick<ProgramRuleVariable, 'id' | 'name'>[];
  };
}

export interface QueryDataProgramIndicators {
  results: { programIndicators: Array<{ id: string; name: string }> };
}

export interface QueryDataVisualizations {
  results: { visualizations: Array<{ id: string; name: string }> };
}

export interface QueryDataMaps {
  results: { maps: Array<{ id: string; name: string }> };
}

export interface QueryDataEventReports {
  results: {
    eventReports: Array<Record<string, unknown>>;
  };
}

export interface QueryDataDashboards {
  results: { dashboards: Array<{ id: string; name: string }> };
}

export interface QueryDataAndroidSettings {
  results: Record<string, unknown> | null;
}

export interface QueryDataDataStore {
  results: Record<string, Array<{ id: string }>> | null;
}

export interface QueryDataHNQIS2Metadata {
  results: { version?: string } | null;
}

export const createMutation = {
  resource: 'metadata',
  type: 'create' as const,
  data: ({ data }: { data: unknown }) => data,
};

export const deleteMetadataMutation = {
  resource: 'metadata',
  type: 'create' as const,
  data: ({ data }: { data: unknown }) => data,
  params: { importStrategy: 'DELETE' },
};

export const queryIds = {
  results: {
    resource: 'system/id.json',
    params: (variables: QueryVariables) => ({
      limit: variables.n as number,
    }),
  },
};

export const queryPR = {
  results: {
    resource: 'programRules',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'name', 'condition', 'programRuleActions'],
      pageSize: 1000,
      filter: [
        `program.id:eq:${variables.programId as string}`,
        'description:eq:_Scripted',
      ],
    }),
  },
};

export const queryPRV = {
  results: {
    resource: 'programRuleVariables',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'name'],
      pageSize: 2000,
      filter: [
        `program.id:eq:${variables.programId as string}`,
        'name:$like:_',
      ],
    }),
  },
};

export const queryPIndicators = {
  results: {
    resource: 'programIndicators',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'name'],
      filter: [
        `program.id:eq:${variables.programId as string}`,
        'description:eq:_H2Analytics',
      ],
    }),
  },
};

export const queryMaps = {
  results: {
    resource: 'maps',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'name'],
      filter: [`code:like:${variables.programId as string}_Scripted`],
    }),
  },
};

export const queryVisualizations = {
  results: {
    resource: 'visualizations',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'name'],
      filter: [`code:like:${variables.programId as string}_Scripted`],
    }),
  },
};

export const queryEventReport = {
  results: {
    resource: 'eventReports',
    params: (variables: QueryVariables) => ({
      fields: ['*'],
      filter: [`code:like:${variables.programId as string}_Scripted`],
    }),
  },
};

export const updateAndroidSettingsAnalytics = {
  resource: `dataStore/ANDROID_SETTINGS_APP/analytics`,
  type: 'update' as const,
  data: ({ data }: { data: unknown }) => data,
};

export const queryAndroidSettingsAnalytics = {
  results: { resource: `dataStore/ANDROID_SETTINGS_APP/analytics` },
};

export const updateAndroidSettingsSynchronization = {
  resource: `dataStore/ANDROID_SETTINGS_APP/synchronization`,
  type: 'update' as const,
  data: ({ data }: { data: unknown }) => data,
};

export const queryAndroidSettingsSynchronization = {
  results: { resource: `dataStore/ANDROID_SETTINGS_APP/synchronization` },
};

export const queryDashboards = {
  results: {
    resource: 'dashboards',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'name'],
      filter: [`code:like:${variables.programId as string}`],
    }),
  },
};

export const queryPCAMetadata = {
  results: {
    resource: 'programs',
    params: (variables: QueryVariables) => ({
      fields: ['attributeValues', 'sharing', 'programStages'],
      filter: [`id:eq:${variables.programId as string}`],
    }),
  },
};

export const queryOrganizationsUnit = {
  results: {
    resource: 'organisationUnitLevels',
    params: (variables: QueryVariables) => ({
      fields: ['id', 'level', 'offlineLevels'],
      filter: [`id:in:[${(variables.ouLevel as string[]).join(',')}]`],
    }),
  },
};

export const queryProgramSettings = {
  results: {
    resource: 'programs',
    id: (variables: QueryVariables) => variables.programId as string,
    params: { fields: getProgramQuery(false) },
  },
};

export const queryCurrentUser = {
  results: {
    resource: 'me',
    params: { fields: ['id', 'authorities'] },
  },
};

export const queryHNQIS2Metadata = {
  results: {
    resource: `dataStore/${NAMESPACE}/${DATASTORE_H2_METADATA}`,
  },
};
