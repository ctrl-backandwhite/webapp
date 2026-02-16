import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface Scope extends AuditFields {
    id: number;
    name: string;
    uniqueName: string;
    description: string;
    enabled: boolean;
}
