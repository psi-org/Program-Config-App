import type { BaseDimensionalItemObject } from './BaseDimensionalItemObject';
import type { CategoryCombo } from './CategoryCombo';
import type { DataElementDomain } from './DataElementDomain';
import type { DataElementGroup } from './DataElementGroup';
import type { DataSetElement } from './DataSetElement';
import type { ObjectStyle } from './ObjectStyle';
import type { OptionSet } from './OptionSet';
import type { ValueType } from './ValueType';
import type { ValueTypeOptions } from './ValueTypeOptions';

export interface DataElement extends BaseDimensionalItemObject {
  valueType?: ValueType;
  valueTypeOptions?: ValueTypeOptions;
  domainType?: DataElementDomain;
  categoryCombo?: CategoryCombo;
  url?: string;
  groups?: DataElementGroup[];
  dataSetElements?: DataSetElement[];
  aggregationLevels?: number[];
  zeroIsSignificant?: boolean;
  optionSet?: OptionSet;
  commentOptionSet?: OptionSet;
  style?: ObjectStyle;
  fieldMask?: string;
}
