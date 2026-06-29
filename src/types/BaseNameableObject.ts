import type { BaseIdentifiableObject } from './BaseIdentifiableObject';
import type { NameableObject } from './NameableObject';

export interface BaseNameableObject
  extends BaseIdentifiableObject,
    NameableObject {
  shortName?: string;
  description?: string;
  formName?: string;
}
