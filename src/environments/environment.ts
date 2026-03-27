export const environment = {
  production: false,
  enableMockFallback: true,
  apiBaseUrl: 'http://localhost:9000/api/v1',
  gatewayApiUrl: 'http://localhost:9000/api/v1',

  oauth2AuthorizeUrl: 'http://localhost:9000/oauth2/authorize?',
  oauth2LoginUrl: 'http://localhost:9000/login',
  clientId: 'oidc-client',
  redirectUri: 'http://localhost:9000/nexa-auth/auth/callback',
  scope: 'openid',
  responseType: 'code',
  responseMode: 'query',
  code_challenge_method: 'S256'
};
