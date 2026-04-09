import type { BaseDimensionalItemObject } from './BaseDimensionalItemObject';
import type { DataElement } from './DataElement';
import type { DataElementGroupSet } from './DataElementGroupSet';

export interface DataElementGroup extends BaseDimensionalItemObject {
  members?: DataElement[];
  groupSets?: DataElementGroupSet[];
}
