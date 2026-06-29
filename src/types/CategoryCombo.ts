import type { BaseMetadataObject } from './BaseMetadataObject';
import type { Category } from './Category';
import type { CategoryOptionCombo } from './CategoryOptionCombo';
import type { DataDimensionType } from './DataDimensionType';
import type { Sharing } from './Sharing';

export interface CategoryCombo extends BaseMetadataObject {
  id?: string;
  code?: string;
  name?: string;
  categories?: Category[];
  optionCombos?: CategoryOptionCombo[];
  dataDimensionType?: DataDimensionType;
  skipTotal?: boolean;
  sharing?: Sharing;
}
