import type { UserAccess } from './UserAccess';
import type { UserGroupAccess } from './UserGroupAccess';

export interface Sharing {
  owner?: string;
  publicAccess?: string;
  users?: Record<string, UserAccess>;
  userGroups?: Record<string, UserGroupAccess>;
}
