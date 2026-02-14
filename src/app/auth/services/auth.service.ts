import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';
import { PKCEService } from './pkce.service';
import { firstValueFrom } from 'rxjs';

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

  // Exchange authorization code for tokens using PKCE.
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const codeVerifier = this.pkceService.getStoredVerifier();

    if (!codeVerifier) {
      throw new Error('PKCE verifier not found');
    }

    try {
      const response = await this.requestToken({
        grant_type: 'authorization_code',
        client_id: environment.clientId,
        code,
        redirect_uri: environment.redirectUri,
        code_verifier: codeVerifier,
      });

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

  // Refresh access token using the stored refresh token.
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.requestToken({
        grant_type: 'refresh_token',
        client_id: environment.clientId,
        refresh_token: refreshToken,
      });

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

  isAuthenticated(): boolean {
    return this.tokenService.hasAccessToken() && !this.tokenService.isTokenExpired();
  }

  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  isTokenExpired(): boolean {
    return this.tokenService.isTokenExpired();
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.pkceService.clearVerifier();
    this.authStateService.setUnauthenticated();
    localStorage.removeItem('authInitiated');
    console.log('[Auth] User logged out');
  }

  private async requestToken(params: Record<string, string>): Promise<TokenResponse> {
    const body = new URLSearchParams(params);

    const response = await firstValueFrom(
      this.http.post<TokenResponse>(this.tokenEndpoint, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    );

    if (!response) {
      throw new Error('No token response received');
    }

    return response;
  }
}
