export const environment = {
  production: false,
  enableMockFallback: true,
  apiBaseUrl: 'http://localhost:6001/api/v1',
  gatewayApiUrl: 'http://localhost:9000/api/v1',

  oauth2AuthorizeUrl: 'http://localhost:6001/oauth2/authorize?',
  oauth2LoginUrl: 'http://localhost:6001/login',
  clientId: 'oidc-client',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid',
  responseType: 'code',
  responseMode: 'query',
  code_challenge_method: 'S256',
  state: 'lkrg7m7jms',
  nonce: 'n7x4lgfhri'
};
