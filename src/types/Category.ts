import type { BaseMetadataObject } from './BaseMetadataObject';

export interface Category extends BaseMetadataObject {
  id?: number;
  code?: string;
  name?: string;
}
