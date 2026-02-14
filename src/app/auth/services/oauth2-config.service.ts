import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';

export interface OAuth2Config {
  clientId: string;
  redirectUri: string;
  authorizationEndpoint: string;
  scope: string;
  responseType: string;
  responseMode: string;
  codeChallengeMethod: string;
}

@Injectable({
  providedIn: 'root'
})
export class OAuth2ConfigService {
  private config: OAuth2Config = {
    clientId: environment.clientId,
    redirectUri: environment.redirectUri,
    authorizationEndpoint: environment.oauth2AuthorizeUrl.replace('?', ''),
    scope: environment.scope,
    responseType: environment.responseType,
    responseMode: environment.responseMode,
    codeChallengeMethod: environment.code_challenge_method
  };

  getConfig(): OAuth2Config {
    return { ...this.config };
  }

  /**
   * Build authorization URL with PKCE parameters
   */
  buildAuthorizationUrl(codeChallenge: string): string {
    const params = new HttpParams({
      fromObject: {
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scope,
        response_type: this.config.responseType,
        response_mode: this.config.responseMode,
        code_challenge_method: this.config.codeChallengeMethod,
        code_challenge: codeChallenge
      }
    });

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }
}
