import {
  COMPOSITIVE_SCORE_ATTRIBUTE,
  DE_TYPE_ATTRIBUTE,
  HEADER_ATTRIBUTE,
  QUESTION_PARENT_OPTIONS_ATTRIBUTE,
} from '../../../configs/Constants';
import type {
  AttributeValue,
  PreviewDataElement,
  PreviewScore,
  PreviewSection,
  SelectOption,
} from './h2Convert.types';

export const buildMetadataMap = (
  attributeValues: AttributeValue[] = []
): Record<string, string> =>
  attributeValues.reduce<Record<string, string>>((metadata, attributeValue) => {
    metadata[attributeValue.attribute.id] = attributeValue.value;
    return metadata;
  }, {});

export const buildHealthAreaOptions = (
  options: Array<{ code: string; name: string }> = []
): SelectOption[] =>
  options.map((option) => ({ label: option.name, value: option.code }));

export const getProgramFromResponse = (programData: any): any | undefined =>
  programData?.results?.programs?.[0];

export const sortCompositeScore = (left: string, right: string): number => {
  const leftParts = left.split('.');
  const rightParts = right.split('.');
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = leftParts[index];
    const rightPart = rightParts[index];

    if (leftPart === undefined && rightPart !== undefined) {
      return -1;
    }

    if (leftPart !== undefined && rightPart === undefined) {
      return 1;
    }

    const leftNumber = Number.parseInt(leftPart ?? '0', 10);
    const rightNumber = Number.parseInt(rightPart ?? '0', 10);

    if (leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }
  }

  return 0;
};

export const buildPreviewState = (
  program: any
): {
  currentChecklistOptions: string[];
  sectionsData: PreviewSection[];
  scoresData: PreviewScore[];
} => {
  const optionsList: string[] = [];
  const firstStage = program?.programStages?.[0];
  const stageSections = firstStage?.programStageSections ?? [];
  const stageDataElements = firstStage?.programStageDataElements ?? [];

  let dataElementsList: PreviewDataElement[] = [];

  stageSections.forEach((section: any) => {
    dataElementsList = dataElementsList.concat(
      (section.dataElements ?? []).map((dataElementRef: any) => {
        const programStageDataElement = stageDataElements.find(
          (psde: any) => psde.dataElement.id === dataElementRef.id
        );

        const metadata = buildMetadataMap(
          programStageDataElement?.dataElement?.attributeValues ?? []
        );
        const parentOptions = metadata[QUESTION_PARENT_OPTIONS_ATTRIBUTE];
        const firstParentOptionId = parentOptions?.split(',')?.[0];

        if (firstParentOptionId && !optionsList.includes(firstParentOptionId)) {
          optionsList.push(firstParentOptionId);
        }

        return {
          tabName: section.name,
          programStageDataElement,
          metadata,
        };
      })
    );
  });

  const sectionsData = dataElementsList.reduce<PreviewSection[]>(
    (accumulator, current) => {
      const header =
        current.programStageDataElement?.dataElement?.attributeValues?.find(
          (attributeValue: AttributeValue) =>
            attributeValue.attribute.id === HEADER_ATTRIBUTE
        )?.value;

      const sectionName = `${current.tabName} - ${header}`;
      const existingSectionIndex = accumulator.findIndex(
        (section) => section.name === sectionName
      );

      if (existingSectionIndex === -1) {
        accumulator.push({ name: sectionName, dataElements: [current] });
      } else {
        accumulator[existingSectionIndex].dataElements.push(current);
      }

      return accumulator;
    },
    []
  );

  const scoresData = (firstStage?.programStageDataElements ?? [])
    .map((programStageDataElement: any) => ({
      dataElement: programStageDataElement.dataElement,
      metadata: buildMetadataMap(
        programStageDataElement.dataElement.attributeValues ?? []
      ),
    }))
    .filter(
      (score: PreviewScore) =>
        score.metadata[DE_TYPE_ATTRIBUTE] === '93' &&
        score.metadata[COMPOSITIVE_SCORE_ATTRIBUTE] !== '0'
    )
    .sort((left: PreviewScore, right: PreviewScore) =>
      sortCompositeScore(
        left.metadata[COMPOSITIVE_SCORE_ATTRIBUTE] ?? '0',
        right.metadata[COMPOSITIVE_SCORE_ATTRIBUTE] ?? '0'
      )
    );

  return {
    currentChecklistOptions: optionsList,
    sectionsData,
    scoresData,
  };
};
