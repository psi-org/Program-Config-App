import type { Access } from './Access';
import type { AttributeValues } from './AttributeValues';
import type { IsoDateString } from './IsoDateString';
import type { LinkableObject } from './LinkableObject';
import type { PrimaryKeyObject } from './PrimaryKeyObject';
import type { Sharing } from './Sharing';
import type { Translation } from './Translation';
import type { User } from './User';

export interface IdentifiableObject extends PrimaryKeyObject, LinkableObject {
  uid?: string;
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
