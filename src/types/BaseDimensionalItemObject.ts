import type { AggregationType } from './AggregationType';
import type { BaseNameableObject } from './BaseNameableObject';
import type { DimensionItemType } from './DimensionItemType';
import type { LegendSet } from './LegendSet';
import type { QueryModifiers } from './QueryModifiers';

export interface BaseDimensionalItemObject extends BaseNameableObject {
  dimensionItemType?: DimensionItemType;
  legendSets?: LegendSet[];
  aggregationType?: AggregationType;
  queryMods?: QueryModifiers;
}
