import { Role } from '../../features/roles/interfaces/role.model';
import { Scope } from '../../features/scopes/interfaces/scope.model';
import { User } from '../../features/users/interfaces/user.model';
import { Group } from '../../features/groups/interfaces/group.model';
import { OAuthClient } from '../../features/oauth-clients/interfaces/oauth-client.model';
import { RedirectUri } from '../../features/redirect-uris/interfaces/redirect-uri.model';
import { GrantType } from '../../features/grant-types/interfaces/grant-type.model';
import { GatewayRoute } from '../../features/gateway-routes/interfaces/gateway-route.model';

const MOCK_TIMESTAMP = '2025-01-01T00:00:00';
const MOCK_AUDIT = { createdAt: MOCK_TIMESTAMP, updatedAt: MOCK_TIMESTAMP, createdBy: 'mock', updatedBy: 'mock' };

// ── Roles ────────────────────────────────────────────────────────
const MOCK_ROLES: (Role & { _mock: true })[] = [
    { id: 1, name: 'Admin', uniqueName: 'ROLE_ADMIN', description: 'Administrator role', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 2, name: 'User', uniqueName: 'ROLE_USER', description: 'Standard user role', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 3, name: 'Manager', uniqueName: 'ROLE_MANAGER', description: 'Manager role', enabled: false, ...MOCK_AUDIT, _mock: true },
];

// ── Scopes ───────────────────────────────────────────────────────
const MOCK_SCOPES: (Scope & { _mock: true })[] = [
    { id: 1, name: 'OpenID', uniqueName: 'openid', description: 'OpenID Connect scope', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 2, name: 'Profile', uniqueName: 'profile', description: 'User profile information', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 3, name: 'Email', uniqueName: 'email', description: 'User email address', enabled: true, ...MOCK_AUDIT, _mock: true },
];

// ── Users ────────────────────────────────────────────────────────
const MOCK_USERS: (User & { _mock: true })[] = [
    {
        id: 1, name: 'John', lastName: 'Doe', nickName: 'jdoe', email: 'john@mock.test',
        enabled: true, accountNonExpired: true, accountNonLocked: true, credentialsNonExpired: true,
        scopes: MOCK_SCOPES.map(s => ({ ...s })), roles: [MOCK_ROLES[0]], groups: [],
        ...MOCK_AUDIT, _mock: true,
    },
    {
        id: 2, name: 'Jane', lastName: 'Smith', nickName: 'jsmith', email: 'jane@mock.test',
        enabled: true, accountNonExpired: true, accountNonLocked: true, credentialsNonExpired: true,
        scopes: [MOCK_SCOPES[0]], roles: [MOCK_ROLES[1]], groups: [],
        ...MOCK_AUDIT, _mock: true,
    },
];

// ── Groups ───────────────────────────────────────────────────────
const MOCK_GROUPS: (Group & { _mock: true })[] = [
    { id: 1, name: 'Administrators', uniqueName: 'GRP_ADMINS', description: 'Admin group', enabled: true, roles: [MOCK_ROLES[0]], ...MOCK_AUDIT, _mock: true },
    { id: 2, name: 'Editors', uniqueName: 'GRP_EDITORS', description: 'Editor group', enabled: true, roles: [MOCK_ROLES[1]], ...MOCK_AUDIT, _mock: true },
];

// ── Redirect URIs ────────────────────────────────────────────────
const MOCK_REDIRECT_URIS: (RedirectUri & { _mock: true })[] = [
    { id: 1, name: 'Local Callback', value: 'http://localhost:4200/auth/callback', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 2, name: 'Production Callback', value: 'https://app.example.com/auth/callback', enabled: true, ...MOCK_AUDIT, _mock: true },
];

// ── Grant Types ──────────────────────────────────────────────────
const MOCK_GRANT_TYPES: (GrantType & { _mock: true })[] = [
    { id: 1, value: 'authorization_code', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 2, value: 'client_credentials', enabled: true, ...MOCK_AUDIT, _mock: true },
    { id: 3, value: 'refresh_token', enabled: true, ...MOCK_AUDIT, _mock: true },
];

// ── OAuth Clients ────────────────────────────────────────────────
const MOCK_OAUTH_CLIENTS: (OAuthClient & { _mock: true })[] = [
    {
        id: 1, clientId: 'mock-oidc-client', clientSecret: '********',
        scopes: MOCK_SCOPES.map(s => ({ ...s })),
        redirectUris: MOCK_REDIRECT_URIS.map(r => ({ ...r })),
        grantTypes: MOCK_GRANT_TYPES.map(g => ({ ...g })),
        ...MOCK_AUDIT, _mock: true,
    },
];

// ── Gateway Routes ───────────────────────────────────────────────
const MOCK_GATEWAY_ROUTES: (GatewayRoute & { _mock: true })[] = [
    {
        id: 'mock-auth-service', uri: 'http://localhost:9001',
        predicates: ['Path=/api/v1/auth/**'], filters: [],
        order: 1, enabled: true,
        createdAt: MOCK_TIMESTAMP, updatedAt: MOCK_TIMESTAMP, _mock: true,
    },
    {
        id: 'mock-notification-service', uri: 'http://localhost:9002',
        predicates: ['Path=/api/v1/notifications/**'], filters: ['StripPrefix=2'],
        order: 2, enabled: false,
        createdAt: MOCK_TIMESTAMP, updatedAt: MOCK_TIMESTAMP, _mock: true,
    },
];

// ── Registry (keyed by URL resource segment) ─────────────────────
export const MOCK_REGISTRY: Record<string, readonly any[]> = {
    'roles': MOCK_ROLES,
    'scopes': MOCK_SCOPES,
    'users': MOCK_USERS,
    'groups': MOCK_GROUPS,
    'oauthclients': MOCK_OAUTH_CLIENTS,
    'redirecturis': MOCK_REDIRECT_URIS,
    'granttypes': MOCK_GRANT_TYPES,
    'gateway/routes': MOCK_GATEWAY_ROUTES,
};
