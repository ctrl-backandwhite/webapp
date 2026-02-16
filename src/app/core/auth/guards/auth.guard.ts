import { Injectable, inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PKCEService } from '../services/pkce.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService {
    constructor(
        private authService: AuthService,
        private pkceService: PKCEService
    ) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (this.authService.isAuthenticated()) {
            return true;
        }

        const authUrl = await this.buildAuthorizeUrl();
        window.location.href = authUrl;
        return false;
    }

    private async buildAuthorizeUrl(): Promise<string> {
        const state = this.generateRandomString(32);
        const nonce = this.generateRandomString(32);
        const pkce = await this.pkceService.generateChallengeAsync();
        const forceLogin = localStorage.getItem('forceLogin') === '1';

        const authUrl = new URL(environment.oauth2AuthorizeUrl.replace('?', ''));
        authUrl.searchParams.append('response_type', environment.responseType);
        authUrl.searchParams.append('client_id', environment.clientId);
        authUrl.searchParams.append('redirect_uri', environment.redirectUri);
        authUrl.searchParams.append('scope', environment.scope);
        authUrl.searchParams.append('response_mode', environment.responseMode);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('nonce', nonce);
        authUrl.searchParams.append('code_challenge', pkce.challenge);
        authUrl.searchParams.append('code_challenge_method', environment.code_challenge_method);
        if (forceLogin) {
            authUrl.searchParams.append('prompt', 'login');
        }

        return authUrl.toString();
    }

    private generateRandomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authGuard = inject(AuthGuardService);
    return authGuard.canActivate(route, state);
};
