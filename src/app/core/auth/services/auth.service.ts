import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';
import { PKCEService } from './pkce.service';
import { RoleService } from './role.service';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

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
  private readonly roleService = inject(RoleService);

  private readonly tokenEndpoint = environment.apiBaseUrl.replace('/api/v1', '') + '/oauth2/token';
  private readonly logoutEndpoint = `${environment.apiBaseUrl}/auth/logout`;
  private readonly revokeEndpoint = `${environment.apiBaseUrl}/auth/revoke`;

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
      this.roleService.updateRoles();

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
      this.logout().subscribe();
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

  logout(): Observable<void> {
    console.log('[Auth] Starting logout process...');

    return this.http.post(
      `${environment.apiBaseUrl}/auth/logout`,
      null,
      {
        withCredentials: true,
        responseType: 'text'
      }
    ).pipe(
      map(() => void 0),
      tap(() => {
        console.log('[Auth] Logout response received');
        this.cleanupLocalAuth();
        console.log('[Auth] User logged out successfully');
      }),
      catchError((error) => {
        console.warn('[Auth] Server logout failed (will continue with local cleanup):', error);
        this.cleanupLocalAuth();
        return of(void 0);
      })
    );
  }

  revokeToken(token: string): Observable<void> {
    const params = new HttpParams()
      .set('token', token)
      .set('tokenTypeHint', 'access_token');

    return this.http.post(this.revokeEndpoint, null, {
      params,
      withCredentials: true,
      responseType: 'text'
    }).pipe(
      map(() => void 0),
      tap(() => {
        console.log('[Auth] Token revoked successfully');
      }),
      catchError((error) => {
        console.warn('[Auth] Token revocation failed:', error);
        return of(void 0);
      })
    );
  }

  private cleanupLocalAuth(): void {
    console.log('[Auth] Clearing tokens and session storage...');

    // Limpiar solo los tokens, mantener otros valores para debugging
    this.tokenService.clearTokens();
    this.pkceService.clearVerifier();
    localStorage.removeItem('authInitiated');
    localStorage.setItem('forceLogin', '1');
    sessionStorage.clear();

    this.authStateService.setUnauthenticated();

    console.log('[Auth] Local cleanup complete');
    console.log('[Auth] localStorage keys remaining:', Object.keys(localStorage));
    console.log('[Auth] Current forceLogin flag:', localStorage.getItem('forceLogin'));
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
