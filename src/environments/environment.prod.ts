export const environment = {
  production: true,
  enableMockFallback: false,
  apiBaseUrl: 'https://nx036.com/api/v1',
  gatewayApiUrl: 'https://nx036.com/api/v1',

  oauth2AuthorizeUrl: 'https://nx036.com/oauth2/authorize?',
  oauth2LoginUrl: 'https://nx036.com/login',
  clientId: 'oidc-client',
  redirectUri: 'https://nx036.com/nexa-auth/auth/callback',
  scope: 'openid',
  responseType: 'code',
  responseMode: 'query',
  code_challenge_method: 'S256'
};
