export const environment = {
  production: true,
  enableMockFallback: false,
  apiBaseUrl: 'https://gateway-service-des.up.railway.app/api/v1',
  gatewayApiUrl: 'https://gateway-service-des.up.railway.app/api/v1',

  oauth2AuthorizeUrl: 'https://gateway-service-des.up.railway.app/oauth2/authorize?',
  oauth2LoginUrl: 'https://gateway-service-des.up.railway.app/login',
  clientId: 'oidc-client',
  redirectUri: 'https://web-auth-des.up.railway.app/nexa-auth/auth/callback',
  scope: 'openid',
  responseType: 'code',
  responseMode: 'query',
  code_challenge_method: 'S256'
};
