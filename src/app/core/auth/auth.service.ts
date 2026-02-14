import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private oauthService = inject(OAuthService);
    private router = inject(Router);

    init(): Promise<void> {
        this.oauthService.configure(authConfig);
        this.oauthService.setStorage(localStorage);
        return this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => undefined);
    }

    hasValidToken(): boolean {
        return this.oauthService.hasValidAccessToken();
    }

    login(targetUrl?: string) {
        const state = targetUrl || '/admin';
        this.oauthService.initCodeFlow(state);
    }

    handleLoginCallback(): Promise<void> {
        return this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
            const target = this.oauthService.state || '/admin';
            this.router.navigateByUrl(target);
        });
    }

    logout() {
        this.oauthService.logOut();
    }
}
