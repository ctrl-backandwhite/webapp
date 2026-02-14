import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
    private http = inject(HttpClient);
    private tokenEndpoint = environment.apiBaseUrl.replace('/api/v1', '') + '/oauth2/token';

    constructor() {
        console.log('🔐 AuthService initialized');
        console.log('  Token Endpoint:', this.tokenEndpoint);
    }

    async exchangeCodeForToken(code: string): Promise<TokenResponse> {
        const codeVerifier = localStorage.getItem('pkce_verifier');

        if (!codeVerifier) {
            throw new Error('Code verifier not found. PKCE validation will fail.');
        }

        const body = new URLSearchParams();
        body.set('grant_type', 'authorization_code');
        body.set('client_id', environment.clientId);
        body.set('code', code);
        body.set('redirect_uri', environment.redirectUri);
        body.set('code_verifier', codeVerifier);

        console.log('🔄 Token Exchange Request:');
        console.log('  Endpoint:', this.tokenEndpoint);
        console.log('  Client ID:', environment.clientId);
        console.log('  Redirect URI:', environment.redirectUri);
        console.log('  Code:', code.substring(0, 30) + '...');

        try {
            const response = await this.http.post<TokenResponse>(
                this.tokenEndpoint,
                body.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            ).toPromise();

            if (response) {
                // Store tokens in localStorage
                localStorage.setItem('access_token', response.access_token);
                if (response.refresh_token) {
                    localStorage.setItem('refresh_token', response.refresh_token);
                    console.log('✅ Refresh Token almacenado');
                } else {
                    console.warn('⚠️  El servidor no devolvió refresh_token');
                    console.log('  Response completa:', response);
                }
                localStorage.setItem('token_expires_at', (Date.now() + response.expires_in * 1000).toString());

                console.log('✅ Token Exchange Successful');
                console.log('  Access Token:', response.access_token.substring(0, 30) + '...');
                console.log('  Refresh Token:', response.refresh_token?.substring(0, 30) + '...' || 'Not provided');
                console.log('  Token Type:', response.token_type);
                console.log('  Expires in:', response.expires_in, 'seconds');
                console.log('  Response keys:', Object.keys(response));

                return response;
            }

            throw new Error('No token response received');
        } catch (error: any) {
            console.error('❌ Token Exchange Failed');
            console.error('  Error:', error?.message);
            console.error('  Status:', error?.status);
            console.error('  Error Details:', error?.error);
            throw error;
        }
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    isTokenExpired(): boolean {
        const expiresAt = localStorage.getItem('token_expires_at');
        if (!expiresAt) return true;
        return Date.now() > parseInt(expiresAt);
    }

    async refreshAccessToken(): Promise<TokenResponse> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const body = new URLSearchParams();
        body.set('grant_type', 'refresh_token');
        body.set('client_id', environment.clientId);
        body.set('refresh_token', refreshToken);

        try {
            const response = await this.http.post<TokenResponse>(
                this.tokenEndpoint,
                body.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            ).toPromise();

            if (response) {
                // Update stored tokens
                localStorage.setItem('access_token', response.access_token);
                if (response.refresh_token) {
                    localStorage.setItem('refresh_token', response.refresh_token);
                }
                localStorage.setItem('token_expires_at', (Date.now() + response.expires_in * 1000).toString());

                console.log('Token refreshed successfully');
                return response;
            }

            throw new Error('No token response received');
        } catch (error) {
            console.error('Failed to refresh token:', error);
            this.logout();
            throw error;
        }
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('pkce_verifier');
        localStorage.removeItem('authInitiated');
    }
}
