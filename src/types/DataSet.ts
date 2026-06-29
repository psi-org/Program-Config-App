import type { BaseMetadataObject } from './BaseMetadataObject';
import type { DataSetElement } from './DataSetElement';

export interface DataSet extends BaseMetadataObject {
  id?: number;
  code?: string;
  name?: string;
  dataSetElements?: DataSetElement[];
}
