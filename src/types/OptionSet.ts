import type { AttributeValues } from './AttributeValues';
import type { BaseMetadataObject } from './BaseMetadataObject';
import type { Option } from './Option';
import type { Sharing } from './Sharing';
import type { ValueType } from './ValueType';

export interface OptionSet extends BaseMetadataObject {
  id?: number;
  code?: string;
  valueType?: ValueType;
  version?: number;
  name?: string;
  description?: string;
  options?: Option[];
  attributeValues?: AttributeValues;
  sharing?: Sharing;
}
