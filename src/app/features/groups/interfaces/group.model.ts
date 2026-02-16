import { Role } from '../../roles/interfaces/role.model';
import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface Group extends AuditFields {
    id: number;
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
    roles: Role[];
}

export interface GroupInput {
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
    roleIds: number[];
}
