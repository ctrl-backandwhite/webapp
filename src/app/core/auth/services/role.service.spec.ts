import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { TokenService } from './token.service';

function makeJwt(payload: Record<string, unknown>): string {
    const encoded = btoa(JSON.stringify(payload));
    return `header.${encoded}.signature`;
}

describe('RoleService', () => {
    let service: RoleService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [TokenService, RoleService],
        });
        service = TestBed.inject(RoleService);
    });

    afterEach(() => localStorage.clear());

    it('should return empty roles when no token', () => {
        expect(service.getRoles()).toEqual([]);
    });

    describe('extractRoles from JWT claims', () => {
        it('should extract roles from roles[] claim (strings)', () => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_ADMIN', 'ROLE_USER'] }));
            service.updateRoles();
            expect(service.getRoles()).toEqual(['ROLE_ADMIN', 'ROLE_USER']);
        });

        it('should extract roles from roles[] claim (objects with uniqueName)', () => {
            localStorage.setItem('access_token', makeJwt({
                roles: [{ uniqueName: 'admin' }, { uniqueName: 'user' }]
            }));
            service.updateRoles();
            expect(service.getRoles()).toEqual(['ADMIN', 'USER']);
        });

        it('should extract roles from authorities[] claim', () => {
            localStorage.setItem('access_token', makeJwt({ authorities: ['ROLE_ADMIN'] }));
            service.updateRoles();
            expect(service.getRoles()).toEqual(['ROLE_ADMIN']);
        });

        it('should extract roles from scope string claim', () => {
            localStorage.setItem('access_token', makeJwt({ scope: 'openid profile admin' }));
            service.updateRoles();
            expect(service.getRoles()).toEqual(['OPENID', 'PROFILE', 'ADMIN']);
        });

        it('should return empty array when no role claims found', () => {
            localStorage.setItem('access_token', makeJwt({ sub: 'user1' }));
            service.updateRoles();
            expect(service.getRoles()).toEqual([]);
        });
    });

    describe('hasRole', () => {
        beforeEach(() => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_ADMIN', 'ROLE_USER'] }));
            service.updateRoles();
        });

        it('should return true for existing role', () => {
            expect(service.hasRole('ROLE_ADMIN')).toBe(true);
        });

        it('should be case-insensitive', () => {
            expect(service.hasRole('role_admin')).toBe(true);
        });

        it('should return false for non-existing role', () => {
            expect(service.hasRole('ROLE_MANAGER')).toBe(false);
        });
    });

    describe('hasAnyRole', () => {
        beforeEach(() => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_ADMIN'] }));
            service.updateRoles();
        });

        it('should return true when at least one matches', () => {
            expect(service.hasAnyRole(['ROLE_USER', 'ROLE_ADMIN'])).toBe(true);
        });

        it('should return false when none match', () => {
            expect(service.hasAnyRole(['ROLE_USER', 'ROLE_MANAGER'])).toBe(false);
        });
    });

    describe('hasAllRoles', () => {
        beforeEach(() => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_ADMIN', 'ROLE_USER'] }));
            service.updateRoles();
        });

        it('should return true when all match', () => {
            expect(service.hasAllRoles(['ROLE_ADMIN', 'ROLE_USER'])).toBe(true);
        });

        it('should return false when not all match', () => {
            expect(service.hasAllRoles(['ROLE_ADMIN', 'ROLE_MANAGER'])).toBe(false);
        });
    });

    describe('isAdmin', () => {
        it('should return true for ROLE_ADMIN', () => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_ADMIN'] }));
            service.updateRoles();
            expect(service.isAdmin()).toBe(true);
        });

        it('should return true for ADMIN', () => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ADMIN'] }));
            service.updateRoles();
            expect(service.isAdmin()).toBe(true);
        });

        it('should return true for ADMINISTRATOR', () => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ADMINISTRATOR'] }));
            service.updateRoles();
            expect(service.isAdmin()).toBe(true);
        });

        it('should return false for non-admin', () => {
            localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_USER'] }));
            service.updateRoles();
            expect(service.isAdmin()).toBe(false);
        });
    });
});
