import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface RedirectUri extends AuditFields {
    id: number;
    name: string;
    value: string;
    enabled: boolean;
}

export type RedirectUriInput = Omit<RedirectUri, 'id'>;
