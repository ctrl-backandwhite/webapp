import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';
import { PKCEService } from './pkce.service';

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly authStateService = inject(AuthStateService);
  private readonly pkceService = inject(PKCEService);

  private readonly tokenEndpoint = environment.apiBaseUrl.replace('/api/v1', '') + '/oauth2/token';

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const codeVerifier = this.pkceService.getStoredVerifier();

    if (!codeVerifier) {
      throw new Error('PKCE verifier not found');
    }

    try {
      const body = new URLSearchParams();
      body.set('grant_type', 'authorization_code');
      body.set('client_id', environment.clientId);
      body.set('code', code);
      body.set('redirect_uri', environment.redirectUri);
      body.set('code_verifier', codeVerifier);

      const response = await this.http.post<TokenResponse>(
        this.tokenEndpoint,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ).toPromise();

      if (!response) {
        throw new Error('No token response received');
      }

      this.tokenService.setTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.token_type
      );

      this.pkceService.clearVerifier();
      this.authStateService.setAuthenticated();

      console.log('[Auth] Token exchange successful');
      return response;
    } catch (error) {
      console.error('[Auth] Token exchange failed:', error);
      this.authStateService.setError('Token exchange failed');
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const body = new URLSearchParams();
      body.set('grant_type', 'refresh_token');
      body.set('client_id', environment.clientId);
      body.set('refresh_token', refreshToken);

      const response = await this.http.post<TokenResponse>(
        this.tokenEndpoint,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ).toPromise();

      if (!response) {
        throw new Error('No token response received');
      }

      this.tokenService.setTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.token_type
      );

      console.log('[Auth] Token refreshed successfully');
      return response;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Check if user has valid access token
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasAccessToken() && !this.tokenService.isTokenExpired();
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    return this.tokenService.isTokenExpired();
  }

  /**
   * Logout and clear all auth data
   */
  logout(): void {
    this.tokenService.clearTokens();
    this.pkceService.clearVerifier();
    this.authStateService.setUnauthenticated();
    localStorage.removeItem('authInitiated');
    console.log('[Auth] User logged out');
  }
}
