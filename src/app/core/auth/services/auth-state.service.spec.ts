import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';
import { TokenService } from './token.service';

describe('AuthStateService', () => {
    let service: AuthStateService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [TokenService, AuthStateService],
        });
        service = TestBed.inject(AuthStateService);
    });

    afterEach(() => localStorage.clear());

    it('should initialize as unauthenticated when no token', () => {
        expect(service.getState()).toBe('unauthenticated');
        expect(service.isAuthenticated()).toBe(false);
    });

    describe('setAuthenticating', () => {
        it('should set state to authenticating', () => {
            service.setAuthenticating();
            expect(service.getState()).toBe('authenticating');
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('setAuthenticated', () => {
        it('should set state to authenticated', () => {
            service.setAuthenticated();
            expect(service.getState()).toBe('authenticated');
            expect(service.isAuthenticated()).toBe(true);
        });
    });

    describe('setUnauthenticated', () => {
        it('should set state to unauthenticated', () => {
            service.setAuthenticated();
            service.setUnauthenticated();
            expect(service.getState()).toBe('unauthenticated');
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('setError', () => {
        it('should set state to error with message', () => {
            service.setError('Something failed');
            expect(service.getState()).toBe('error');
            expect(service.getError()).toBe('Something failed');
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('authState$', () => {
        it('should expose a readonly signal', () => {
            service.setAuthenticated();
            const ctx = service.authState$();
            expect(ctx.state).toBe('authenticated');
            expect(ctx.isAuthenticated).toBe(true);
        });
    });
});
