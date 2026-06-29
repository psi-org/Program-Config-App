import type { LinkableObject } from './LinkableObject';

export interface BaseLinkableObject extends LinkableObject {
  href?: string;
}
