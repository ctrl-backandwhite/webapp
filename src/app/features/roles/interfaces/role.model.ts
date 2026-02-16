import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface Role extends AuditFields {
    id: number;
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
}
