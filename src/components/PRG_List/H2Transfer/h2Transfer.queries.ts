export const queryProgramMetadata = {
  results: {
    resource: 'programs',
    params: ({ program }: { program?: string }) => ({
      fields: [
        'id',
        'name',
        'attributeValues',
        'programStages[id,name,programStageDataElements[compulsory,dataElement[id,attributeValues]]]',
        'organisationUnits',
      ],
      filter: [`id:eq:${program}`],
    }),
  },
} as const;

export const queryProgramEvent = {
  results: {
    resource: 'tracker/events',
    params: ({ program, eventId }: { program?: string; eventId?: string }) => ({
      event: eventId,
      program,
      fields: [
        'event',
        'program',
        'orgUnit',
        'occurredAt',
        'status',
        'completedAt',
        'storedBy',
        'dataValues[dataElement, value]',
        'notes',
      ],
    }),
  },
} as const;

export const queryEventList = {
  results: {
    resource: 'tracker/events',
    params: ({ program }: { program?: string }) => ({
      program,
      fields: ['event', 'orgUnit'],
      skipPaging: true,
      filter: [],
    }),
  },
} as const;

export const metadataMutation = {
  resource: 'tracker?async=false&skipRuleEngine=true',
  type: 'create',
  data: ({ data }: { data: Record<string, unknown> }) => data,
} as const;

export const buildDataStoreQuery = (namespace: string, programId: string) => ({
  results: {
    resource: `dataStore/${namespace}/${programId}`,
  },
});

export const buildDataStoreCreateMutation = (
  namespace: string,
  programId: string
) =>
  ({
    resource: `dataStore/${namespace}/${programId}`,
    type: 'create',
    data: ({ data }: { data: Record<string, unknown> }) => data,
  } as const);

export const buildDataStoreUpdateMutation = (
  namespace: string,
  programId: string
) =>
  ({
    resource: `dataStore/${namespace}/${programId}`,
    type: 'update',
    data: ({ data }: { data: Record<string, unknown> }) => data,
  } as const);

export const buildAddProgramOrgUnitsMutation = (programId: string) =>
  ({
    resource: `programs/${programId}/organisationUnits`,
    type: 'create',
    data: ({ additions }: { additions: Array<{ id: string }> }) => ({
      additions,
      deletions: [],
    }),
  } as const);
