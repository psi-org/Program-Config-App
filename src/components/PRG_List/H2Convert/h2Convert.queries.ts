export const queryProgramMetadata = {
  results: {
    resource: 'programs',
    params: ({ program }: { program?: string }) => ({
      fields: [
        'id',
        'name',
        'shortName',
        'style',
        'ignoreOverdueEvents',
        'skipOffline',
        'onlyEnrollOnce',
        'sharing',
        'maxTeiCountToReturn',
        'selectIncidentDatesInFuture',
        'selectEnrollmentDatesInFuture',
        'registration',
        'favorite',
        'useFirstStageDuringRegistration',
        'completeEventsExpiryDays',
        'withoutRegistration',
        'featureType',
        'minAttributesRequiredToSearch',
        'displayFrontPageList',
        'programType',
        'accessLevel',
        'expiryDays',
        'categoryCombo',
        'programIndicators',
        'translations',
        'attributeValues',
        'userRoles',
        'favorites',
        'programRuleVariables',
        'programTrackedEntityAttributes',
        'notificationTemplates',
        'organisationUnits',
        'programSections',
        'programStages[id,programStageDataElements[dataElement[*,attributeValues[value,attribute[id,name]]],compulsory,displayInReports,sortOrder],programStageSections[name,dataElements[id]]]',
      ],
      filter: [`id:eq:${program}`],
    }),
  },
} as const;

export const queryHealthAreas = {
  results: {
    resource: 'optionSets',
    params: {
      fields: ['options[code,name]'],
      filter: ['id:eq:y752HEwvCGi'],
    },
  },
} as const;

export const queryProgramType = {
  results: {
    resource: 'attributes',
    params: {
      fields: ['id'],
      filter: ['code:eq:PROGRAM_TYPE'],
    },
  },
} as const;

export const queryId = {
  results: {
    resource: 'system/id.json',
    params: ({ n }: { n?: number }) => ({ limit: n }),
  },
} as const;

export const queryOptions = {
  results: {
    resource: 'options',
    params: ({ optionsList }: { optionsList: string[] }) => ({
      fields: ['id', 'code'],
      paging: false,
      filter: [`id:in:[${optionsList.join(',')}]`],
    }),
  },
} as const;

export const metadataMutation = {
  resource: 'metadata?mergeMode=REPLACE',
  type: 'create',
  data: ({ data }: { data: Record<string, unknown> }) => data,
} as const;
