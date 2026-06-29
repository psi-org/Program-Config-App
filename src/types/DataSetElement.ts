import type { CategoryCombo } from './CategoryCombo';
import type { DataElement } from './DataElement';
import type { DataSet } from './DataSet';

export interface DataSetElement {
  id?: number;
  dataSet?: DataSet;
  dataElement?: DataElement;
  categoryCombo?: CategoryCombo;
}
