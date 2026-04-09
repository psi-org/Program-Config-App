import type { BaseMetadataObject } from './BaseMetadataObject';

export interface FileResource extends BaseMetadataObject {
  id?: number;
  name?: string;
}
