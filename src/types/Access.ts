import type { AccessData } from './AccessData';

export interface Access {
  manage?: boolean;
  write?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  data?: AccessData;
}
