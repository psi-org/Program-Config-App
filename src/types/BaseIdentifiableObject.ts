import type { Access } from './Access';
import type { AttributeValues } from './AttributeValues';
import type { BaseLinkableObject } from './BaseLinkableObject';
import type { IsoDateString } from './IsoDateString';
import type { Sharing } from './Sharing';
import type { Translation } from './Translation';
import type { User } from './User';

export interface BaseIdentifiableObject extends BaseLinkableObject {
  id?: string;
  code?: string;
  name?: string;
  created?: IsoDateString;
  lastUpdated?: IsoDateString;
  attributeValues?: AttributeValues;
  translations?: Translation[];
  createdBy?: User;
  access?: Access;
  favorites?: string[];
  lastUpdatedBy?: User;
  sharing?: Sharing;
}
