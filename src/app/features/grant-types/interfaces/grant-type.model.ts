import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface GrantType extends AuditFields {
    id: number;
    value: string;
    enabled: boolean;
}

export type GrantTypeInput = Omit<GrantType, 'id'>;
