import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService, TokenResponse } from './auth.service';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';
import { PKCEService } from './pkce.service';
import { RoleService } from './role.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpTesting: HttpTestingController;
    let tokenService: TokenService;
    let authStateService: AuthStateService;
    let pkceService: PKCEService;
    let roleService: RoleService;

    const mockTokenResponse: TokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
    };

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                TokenService,
                AuthStateService,
                PKCEService,
                RoleService,
                AuthService,
            ],
        });

        service = TestBed.inject(AuthService);
        httpTesting = TestBed.inject(HttpTestingController);
        tokenService = TestBed.inject(TokenService);
        authStateService = TestBed.inject(AuthStateService);
        pkceService = TestBed.inject(PKCEService);
        roleService = TestBed.inject(RoleService);
    });

    afterEach(() => {
        httpTesting.verify();
        localStorage.clear();
        sessionStorage.clear();
    });

    describe('isAuthenticated', () => {
        it('should return false when no access token', () => {
            expect(service.isAuthenticated()).toBe(false);
        });

        it('should return true when token exists and is not expired', () => {
            tokenService.setTokens('token', undefined, 3600, 'Bearer');
            expect(service.isAuthenticated()).toBe(true);
        });

        it('should return false when token is expired', () => {
            tokenService.setTokens('token', undefined, -1, 'Bearer');
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('getAccessToken', () => {
        it('should return null when no token', () => {
            expect(service.getAccessToken()).toBeNull();
        });

        it('should return the access token', () => {
            tokenService.setTokens('my-token', undefined, 3600, 'Bearer');
            expect(service.getAccessToken()).toBe('my-token');
        });
    });

    describe('isTokenExpired', () => {
        it('should return true when no token', () => {
            expect(service.isTokenExpired()).toBe(true);
        });
    });

    describe('exchangeCodeForToken', () => {
        it('should throw when no PKCE verifier is stored', async () => {
            await expect(service.exchangeCodeForToken('auth-code')).rejects.toThrow('PKCE verifier not found');
        });

        it('should exchange code and store tokens', async () => {
            sessionStorage.setItem('pkce_verifier', 'test-verifier');

            const promise = service.exchangeCodeForToken('auth-code');

            const req = httpTesting.expectOne(r => r.url.includes('/oauth2/token'));
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toContain('grant_type=authorization_code');
            expect(req.request.body).toContain('code=auth-code');
            expect(req.request.body).toContain('code_verifier=test-verifier');
            req.flush(mockTokenResponse);

            const result = await promise;
            expect(result.access_token).toBe('mock-access-token');
            expect(tokenService.getAccessToken()).toBe('mock-access-token');
            expect(pkceService.getStoredVerifier()).toBeNull();
        });

        it('should set error state on failure', async () => {
            sessionStorage.setItem('pkce_verifier', 'test-verifier');

            const promise = service.exchangeCodeForToken('bad-code');

            const req = httpTesting.expectOne(r => r.url.includes('/oauth2/token'));
            req.flush('error', { status: 400, statusText: 'Bad Request' });

            await expect(promise).rejects.toThrow();
        });
    });

    describe('refreshToken', () => {
        it('should throw when no refresh token is available', async () => {
            await expect(service.refreshToken()).rejects.toThrow('No refresh token available');
        });

        it('should refresh and update stored tokens', async () => {
            tokenService.setTokens('old-access', 'old-refresh', 3600, 'Bearer');

            const promise = service.refreshToken();

            const req = httpTesting.expectOne(r => r.url.includes('/oauth2/token'));
            expect(req.request.body).toContain('grant_type=refresh_token');
            expect(req.request.body).toContain('refresh_token=old-refresh');
            req.flush(mockTokenResponse);

            const result = await promise;
            expect(result.access_token).toBe('mock-access-token');
            expect(tokenService.getAccessToken()).toBe('mock-access-token');
        });
    });

    describe('logout', () => {
        it('should POST to logout endpoint and clear local auth', () => {
            tokenService.setTokens('token', 'refresh', 3600, 'Bearer');

            service.logout().subscribe();

            const req = httpTesting.expectOne(r => r.url.includes('/auth/logout'));
            expect(req.request.method).toBe('POST');
            req.flush('OK');

            expect(tokenService.getAccessToken()).toBeNull();
        });

        it('should clean up local auth even on error', () => {
            tokenService.setTokens('token', 'refresh', 3600, 'Bearer');

            service.logout().subscribe();

            const req = httpTesting.expectOne(r => r.url.includes('/auth/logout'));
            req.flush('error', { status: 500, statusText: 'Server Error' });

            expect(tokenService.getAccessToken()).toBeNull();
        });
    });

    describe('revokeToken', () => {
        it('should POST to revoke endpoint with token param', () => {
            service.revokeToken('my-token').subscribe();

            const req = httpTesting.expectOne(r => r.url.includes('/auth/revoke'));
            expect(req.request.method).toBe('POST');
            expect(req.request.params.get('token')).toBe('my-token');
            expect(req.request.params.get('tokenTypeHint')).toBe('access_token');
            req.flush('OK');
        });

        it('should not throw on error', () => {
            const errorSpy = vi.fn();
            service.revokeToken('bad-token').subscribe({
                error: errorSpy,
            });

            const req = httpTesting.expectOne(r => r.url.includes('/auth/revoke'));
            req.flush('error', { status: 400, statusText: 'Bad Request' });
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });
});
