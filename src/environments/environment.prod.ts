export const environment = {
  production: true,
  apiBaseUrl: 'https://mic-authservice-production.up.railway.app/api/v1',

  oauth2AuthorizeUrl: 'https://mic-authservice-production.up.railway.app/oauth2/authorize?',
  oauth2LoginUrl: 'https://mic-authservice-production.up.railway.app/login',
  clientId: 'oidc-client',
  redirectUri: 'https://webapp-production-68d2.up.railway.app/auth/callback',
  scope: 'openid',
  responseType: 'code',
  responseMode: 'query',
  code_challenge_method: 'S256',
  state: 'lkrg7m7jms',
  nonce: 'n7x4lgfhri'
};
