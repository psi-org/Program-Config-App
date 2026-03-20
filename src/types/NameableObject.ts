import type { IdentifiableObject } from './IdentifiableObject';

export interface NameableObject extends IdentifiableObject {
  shortName?: string;
  description?: string;
  formName?: string;
}
