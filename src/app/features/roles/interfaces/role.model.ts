import { Permission } from '../../permissions/interfaces/permission.model';
import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface Role extends AuditFields {
    id: number;
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
    permissions: Permission[];
}

export interface RoleInput {
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
    permissionIds: number[];
}
