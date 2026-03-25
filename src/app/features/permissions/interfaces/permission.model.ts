import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface Permission extends AuditFields {
    id: number;
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
}
