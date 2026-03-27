import { Role } from '../../roles/interfaces/role.model';
import { Group } from '../../groups/interfaces/group.model';
import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface User extends AuditFields {
  id: number;
  name: string;
  lastName: string;
  nickName: string;
  email: string;
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  roles: Role[];
  groups: Group[];
}

export interface UserInput {
  name: string;
  lastName: string;
  nickName: string;
  email: string;
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  roleIds: number[];
  groupIds: number[];
  password?: string;
  confirmPassword?: string;
}
