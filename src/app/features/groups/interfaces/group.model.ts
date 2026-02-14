import { Role } from '../../roles/interfaces/role.model';

export interface Group {
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
