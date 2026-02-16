import { Scope } from '../../scopes/interfaces/scope.model';
import { RedirectUri } from '../../redirect-uris/interfaces/redirect-uri.model';
import { GrantType } from '../../grant-types/interfaces/grant-type.model';
import { AuditFields } from '../../../shared/interfaces/audit.model';

export interface OAuthClient extends AuditFields {
    id: number;
    clientId: string;
    clientSecret: string;
    scopes: Scope[];
    redirectUris: RedirectUri[];
    grantTypes: GrantType[];
}

export interface OAuthClientInput {
    clientId: string;
    clientSecret?: string;
    scopeIds: number[];
    redirectUriIds: number[];
    grantTypeIds: number[];
}
