import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuardService } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { PKCEService } from '../services/pkce.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthGuardService', () => {
    let guard: AuthGuardService;
    let authService: AuthService;
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/admin' } as RouterStateSnapshot;

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthGuardService,
                AuthService,
                PKCEService,
            ],
        });

        guard = TestBed.inject(AuthGuardService);
        authService = TestBed.inject(AuthService);
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should allow navigation when user is authenticated', async () => {
        vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
        const result = await guard.canActivate(mockRoute, mockState);
        expect(result).toBe(true);
    });

    it('should redirect to authorization URL when not authenticated', async () => {
        vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);

        // Mock window.location to prevent actual navigation
        const originalLocation = window.location;
        const mockLocation = { ...originalLocation, href: '' } as unknown as Location;
        Object.defineProperty(mockLocation, 'href', { set: () => { }, get: () => '', configurable: true });
        Object.defineProperty(window, 'location', { value: mockLocation, writable: true, configurable: true });

        // The guard will try to redirect, but canActivate returns false
        const result = await guard.canActivate(mockRoute, mockState);
        expect(result).toBe(false);

        Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true });
    });
});
