import { Injectable } from '@angular/core';

export interface Token {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    tokenType: string;
}

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly TOKEN_EXPIRES_AT_KEY = 'token_expires_at';
    private readonly TOKEN_TYPE_KEY = 'token_type';

    setTokens(accessToken: string, refreshToken?: string, expiresIn: number = 3600, tokenType: string = 'Bearer'): void {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);

        const expiresAt = Date.now() + expiresIn * 1000;
        localStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
        localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);

        if (refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    getTokenType(): string {
        return localStorage.getItem(this.TOKEN_TYPE_KEY) || 'Bearer';
    }

    getExpiresAt(): number | null {
        const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_AT_KEY);
        return expiresAt ? parseInt(expiresAt, 10) : null;
    }

    isTokenExpired(): boolean {
        const expiresAt = this.getExpiresAt();
        if (!expiresAt) return true;
        return Date.now() > expiresAt;
    }

    hasAccessToken(): boolean {
        return !!this.getAccessToken();
    }

    clearTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRES_AT_KEY);
        localStorage.removeItem(this.TOKEN_TYPE_KEY);
    }
}
