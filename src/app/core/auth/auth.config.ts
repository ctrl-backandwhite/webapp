import type { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
    issuer: 'https://mic-authservice-production.up.railway.app',
    redirectUri: `${window.location.origin}/auth/callback`,
    clientId: 'oidc-client',
    responseType: 'code',
    scope: 'openid profile email',
    strictDiscoveryDocumentValidation: false,
};
