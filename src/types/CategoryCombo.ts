import type { BaseMetadataObject } from './BaseMetadataObject';
import type { Category } from './Category';
import type { CategoryOptionCombo } from './CategoryOptionCombo';
import type { DataDimensionType } from './DataDimensionType';
import type { Sharing } from './Sharing';

export interface CategoryCombo extends BaseMetadataObject {
  id?: number;
  code?: string;
  name?: string;
  categories?: Category[];
  optionCombos?: CategoryOptionCombo[];
  dataDimensionType?: DataDimensionType;
  skipTotal?: boolean;
  sharing?: Sharing;
}
