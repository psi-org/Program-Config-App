import type { BaseIdentifiableObject } from './BaseIdentifiableObject';

export interface Legend extends BaseIdentifiableObject {
  startValue?: number;
  endValue?: number;
  color?: string;
}
