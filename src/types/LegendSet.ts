import type { AttributeValues } from './AttributeValues';
import type { BaseMetadataObject } from './BaseMetadataObject';
import type { Legend } from './Legend';
import type { Sharing } from './Sharing';

export interface LegendSet extends BaseMetadataObject {
  id?: number;
  code?: string;
  name?: string;
  attributeValues?: AttributeValues;
  sharing?: Sharing;
  symbolizer?: string;
  legends?: Legend[];
}
