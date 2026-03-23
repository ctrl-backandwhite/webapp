import { TestBed } from '@angular/core/testing';
import { MockIndicatorService } from './mock-indicator.service';

describe('MockIndicatorService', () => {
    let service: MockIndicatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockIndicatorService],
        });
        service = TestBed.inject(MockIndicatorService);
    });

    it('should start with no active resources', () => {
        expect(service.isActive()).toBe(false);
        expect(service.activeResources()).toEqual([]);
    });

    describe('activate', () => {
        it('should mark a resource as active', () => {
            service.activate('users');
            expect(service.isActive()).toBe(true);
            expect(service.activeResources()).toContain('users');
        });

        it('should support activating multiple resources', () => {
            service.activate('users');
            service.activate('roles');
            expect(service.activeResources()).toContain('users');
            expect(service.activeResources()).toContain('roles');
        });

        it('should not duplicate resources', () => {
            service.activate('users');
            service.activate('users');
            expect(service.activeResources().length).toBe(1);
        });
    });

    describe('deactivate', () => {
        it('should remove a resource from active set', () => {
            service.activate('users');
            service.deactivate('users');
            expect(service.isActive()).toBe(false);
            expect(service.activeResources()).not.toContain('users');
        });

        it('should not fail when deactivating non-existent resource', () => {
            expect(() => service.deactivate('nonexistent')).not.toThrow();
        });
    });

    describe('reset', () => {
        it('should clear all active resources', () => {
            service.activate('users');
            service.activate('roles');
            service.activate('scopes');
            service.reset();
            expect(service.isActive()).toBe(false);
            expect(service.activeResources()).toEqual([]);
        });
    });

    describe('isActive', () => {
        it('should return true when at least one resource is active', () => {
            service.activate('users');
            expect(service.isActive()).toBe(true);
        });

        it('should return false after all resources are deactivated', () => {
            service.activate('users');
            service.deactivate('users');
            expect(service.isActive()).toBe(false);
        });
    });
});
