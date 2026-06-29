import type { Access } from './Access';
import type { IsoDateString } from './IsoDateString';
import type { User } from './User';

export interface BaseMetadataObject {
  uid?: string;
  created?: IsoDateString;
  lastUpdated?: IsoDateString;
  lastUpdatedBy?: User;
  createdBy?: User;
  href?: string;
  access?: Access;
}
