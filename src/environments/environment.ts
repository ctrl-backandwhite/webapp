export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:8443/api/v1',

  oauth2AuthorizeUrl: 'https://localhost:8443/oauth2/authorize?',
  oauth2LoginUrl: 'https://localhost:8443/login',
  clientId: 'oidc-client',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid',
  responseType: 'code',
  responseMode: 'query',
  code_challenge_method: 'S256',
  state: 'lkrg7m7jms',
  nonce: 'n7x4lgfhri'
};
