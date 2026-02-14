import { Injectable, signal } from '@angular/core';
import { TokenService } from './token.service';

export type AuthState = 'unauthenticated' | 'authenticating' | 'authenticated' | 'error';

export interface AuthContext {
    state: AuthState;
    error?: string;
    isAuthenticated: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthStateService {
    private authStateSignal = signal<AuthContext>({
        state: 'unauthenticated',
        isAuthenticated: false
    });

    readonly authState$ = this.authStateSignal.asReadonly();

    constructor(private tokenService: TokenService) {
        this.initializeAuthState();
    }

    private initializeAuthState(): void {
        if (this.tokenService.hasAccessToken() && !this.tokenService.isTokenExpired()) {
            this.setAuthenticated();
        } else {
            this.setUnauthenticated();
        }
    }

    setAuthenticating(): void {
        this.authStateSignal.set({
            state: 'authenticating',
            isAuthenticated: false
        });
    }

    setAuthenticated(): void {
        this.authStateSignal.set({
            state: 'authenticated',
            isAuthenticated: true
        });
    }

    setUnauthenticated(): void {
        this.authStateSignal.set({
            state: 'unauthenticated',
            isAuthenticated: false
        });
    }

    setError(error: string): void {
        this.authStateSignal.set({
            state: 'error',
            error,
            isAuthenticated: false
        });
    }

    isAuthenticated(): boolean {
        return this.authState$().isAuthenticated;
    }

    getState(): AuthState {
        return this.authState$().state;
    }

    getError(): string | undefined {
        return this.authState$().error;
    }
}
