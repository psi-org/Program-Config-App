import type { BaseMetadataObject } from './BaseMetadataObject';

export interface Option extends BaseMetadataObject {
  id?: number;
  code?: string;
  name?: string;
  sortOrder?: number;
}
