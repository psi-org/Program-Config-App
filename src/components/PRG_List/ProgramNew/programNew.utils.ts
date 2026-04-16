import {
  COMPETENCY_ATTRIBUTE,
  COMPETENCY_CLASS,
  MAX_PREFIX_LENGTH,
  MAX_PROGRAM_NAME_LENGTH,
  MAX_SHORT_NAME_LENGTH,
  METADATA,
  MIN_NAME_LENGTH,
} from '../../../configs/Constants';
import type {
  H2SettingRef,
  ProgramAttributeValue,
  ProgramStage,
  ProgramTeaItem,
  ProgramTeaState,
  ProgramType,
  ProgramSection,
  ProgramTrackedEntityAttribute,
  SelectOption,
  TrackedEntityType,
  ValidationErrors,
} from './programNew.types';
export const stepsLimit: Record<ProgramType, number> = {
  '': 0,
  hnqis: 1,
  tracker: 2,
  event: 1,
};

export const cloneDeep = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const toOption = (
  value?: { id?: string | number; name?: string } | null
): SelectOption | null =>
  value?.id != null ? { id: String(value.id), label: value.name ?? '' } : null;

export const getH2Metadata = (
  ref: H2SettingRef | null | undefined
): Record<string, unknown> =>
  ref?.saveMetaData?.() ?? ref?.saveMetadata?.() ?? {};

export const hasPublicAddPermission = (authorities?: string[]): boolean =>
  Boolean(
    authorities?.some((auth) => ['F_PROGRAM_PUBLIC_ADD', 'ALL'].includes(auth))
  );

export const sanitizeSections = (
  sections: ProgramSection[],
  selectedIds: string[]
): ProgramSection[] =>
  sections.map((section) => ({
    ...section,
    trackedEntityAttributes: section.trackedEntityAttributes.filter((tea) =>
      selectedIds.includes(tea.id)
    ),
  }));

export const getUnassignedAttributes = (
  selectedIds: string[],
  available: ProgramTeaItem[],
  sections: ProgramSection[]
): ProgramTeaItem[] => {
  const usedIds = new Set(
    sections.flatMap((section) =>
      section.trackedEntityAttributes.map((tea) => tea.id)
    )
  );

  return selectedIds
    .filter((teaId) => !usedIds.has(teaId))
    .map((teaId) =>
      available.find((tea) => tea.trackedEntityAttribute.id === teaId)
    )
    .filter(Boolean) as ProgramTeaItem[];
};

export const getRequiredTetAttributeIds = (
  trackedEntityTypes: TrackedEntityType[],
  programTET: SelectOption | null
): string[] => {
  if (!programTET?.id) {
    return [];
  }

  return (
    trackedEntityTypes
      .find((tet) => tet.id === programTET.id)
      ?.trackedEntityTypeAttributes.map(
        (tea) => tea.trackedEntityAttribute.id
      ) ?? []
  );
};

export const mergeSelectedTeaIds = (
  selected: string[],
  requiredIds: string[]
): string[] => Array.from(new Set([...requiredIds, ...selected]));

export const validateProgramForm = ({
  dePrefix,
  h2Ref,
  pgrTypePCA,
  programCode,
  programName,
  programShortName,
  programTET,
}: {
  dePrefix: string;
  h2Ref: H2SettingRef | null;
  pgrTypePCA: ProgramType;
  programCode: string;
  programName: string;
  programShortName: string;
  programTET: SelectOption | null;
}): {
  basicValidated: boolean;
  hnqisValidated: boolean;
  errors: ValidationErrors;
} => {
  const errors: ValidationErrors = {};
  let basicValidated = true;

  if (!pgrTypePCA) {
    basicValidated = false;
    errors.pgrType = 'This field is required';
  }

  if (!dePrefix) {
    basicValidated = false;
    errors.prefix = 'This field is required';
  } else if (dePrefix.length > MAX_PREFIX_LENGTH) {
    basicValidated = false;
    errors.prefix = `This field cannot exceed ${MAX_PREFIX_LENGTH} characters`;
  }

  if (!programName) {
    basicValidated = false;
    errors.programName = 'This field is required';
  } else if (
    programName.length < MIN_NAME_LENGTH ||
    programName.length > MAX_PROGRAM_NAME_LENGTH
  ) {
    basicValidated = false;
    errors.programName = `This field must contain between ${MIN_NAME_LENGTH} and ${MAX_PROGRAM_NAME_LENGTH} characters`;
  }

  if (!programShortName) {
    basicValidated = false;
    errors.shortName = 'This field is required';
  } else if (programShortName.length > MAX_SHORT_NAME_LENGTH) {
    basicValidated = false;
    errors.shortName = `This field cannot exceed ${MAX_SHORT_NAME_LENGTH} characters`;
  }

  if (programCode.length > MAX_SHORT_NAME_LENGTH) {
    basicValidated = false;
    errors.code = `This field cannot exceed ${MAX_SHORT_NAME_LENGTH} characters`;
  }

  if (!programTET && pgrTypePCA !== 'event') {
    basicValidated = false;
    errors.programTET = 'This field is required';
  }

  const hnqisValidated =
    pgrTypePCA === 'hnqis' ? Boolean(h2Ref?.handleFormValidation()) : true;

  return {
    basicValidated,
    hnqisValidated,
    errors,
  };
};

export const createOrUpdateMetaData = ({
  attributeValues,
  dePrefix,
  h2Ref,
  programType,
}: {
  attributeValues: ProgramAttributeValue[];
  dePrefix: string;
  h2Ref: H2SettingRef | null;
  programType: ProgramType;
}): void => {
  const metaDataEntry = attributeValues.find(
    (item) => item.attribute.id === METADATA
  );

  if (metaDataEntry) {
    let value = JSON.parse(metaDataEntry.value || '{}') as Record<
      string,
      unknown
    >;

    if (programType === 'hnqis') {
      const h1Program = value.h1Program;
      value = getH2Metadata(h2Ref);
      value.h1Program = h1Program;
    }

    value.dePrefix = dePrefix;
    value.saveVersion = import.meta.env.DHIS2_APP_VERSION;
    metaDataEntry.value = JSON.stringify(value);
    return;
  }

  const value = programType === 'hnqis' ? getH2Metadata(h2Ref) : {};
  const payload = {
    ...value,
    saveVersion: import.meta.env.DHIS2_APP_VERSION,
    dePrefix,
  };

  attributeValues.push({
    attribute: { id: METADATA },
    value: JSON.stringify(payload),
  });
};

export const removeCompetencyAttribute = (
  programTrackedEntityAttributes: ProgramTrackedEntityAttribute[]
): ProgramTrackedEntityAttribute[] =>
  programTrackedEntityAttributes.filter(
    (attr) => attr.trackedEntityAttribute.id !== COMPETENCY_ATTRIBUTE
  );

export const removeCompetencyClass = <T extends { id: string }>(
  dataElements: T[]
): T[] => dataElements.filter((de) => de.id !== COMPETENCY_CLASS);

export const buildTrackerTeaState = ({
  data,
  trackedEntityAttributes,
}: {
  data?: {
    programTrackedEntityAttributes?: ProgramTrackedEntityAttribute[];
    trackedEntityType?: TrackedEntityType;
    programSections?: ProgramSection[];
  };
  trackedEntityAttributes: Array<{
    id: string;
    name?: string;
    valueType?: string;
  }>;
}): ProgramTeaState => {
  const existingTEAs =
    data?.programTrackedEntityAttributes?.map((tea) => ({
      trackedEntityAttribute: tea.trackedEntityAttribute,
      valueType: tea.valueType,
      allowFutureDate: tea.allowFutureDate,
      displayInList: tea.displayInList,
      mandatory: tea.mandatory,
      searchable: tea.searchable,
      renderType: tea.renderType,
    })) ?? [];

  const availableTEAs = trackedEntityAttributes
    .filter(
      (tea) =>
        !existingTEAs
          .map((existingTea) => existingTea.trackedEntityAttribute.id)
          .includes(tea.id)
    )
    .map((tea) => ({
      trackedEntityAttribute: { id: tea.id, name: tea.name },
      valueType: tea.valueType,
      allowFutureDate: false,
      displayInList: false,
      mandatory: false,
      searchable: false,
    }));

  let selected = existingTEAs.map((tea) => tea.trackedEntityAttribute.id);

  if (data?.trackedEntityType?.trackedEntityTypeAttributes) {
    selected = mergeSelectedTeaIds(
      selected,
      data.trackedEntityType.trackedEntityTypeAttributes.map(
        (item) => item.trackedEntityAttribute.id
      )
    );
  }

  return {
    available: [...availableTEAs, ...existingTEAs],
    selected,
  };
};

export const getTrackerAssignedAttributes = ({
  data,
  teaState,
}: {
  data?: { programSections?: ProgramSection[] };
  teaState: ProgramTeaState;
}): ProgramTeaItem[] => {
  const sectionTeaIds = new Set(
    data?.programSections?.flatMap((section) =>
      section.trackedEntityAttributes.map((tea) => tea.id)
    ) ?? []
  );

  return teaState.selected
    .filter((teaId) => !sectionTeaIds.has(teaId))
    .map((teaId) =>
      teaState.available.find((tea) => tea.trackedEntityAttribute.id === teaId)
    )
    .filter(Boolean) as ProgramTeaItem[];
};

export const getInitialSectionsEnabled = (data?: {
  programSections?: ProgramSection[];
}): boolean => Boolean(data?.programSections?.length);

export const nextUid = (pool: string[]): string => {
  const uid = pool.shift();
  if (!uid) {
    throw new Error('UID pool exhausted');
  }
  return uid;
};

export const updateProgramStageReference = (
  stages: ProgramStage[]
): Array<{ id: string }> => stages.map((stage) => ({ id: stage.id }));
