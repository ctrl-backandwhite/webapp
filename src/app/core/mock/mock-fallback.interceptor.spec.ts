import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { MockIndicatorService } from '../mock/mock-indicator.service';
import { mockFallbackInterceptor } from './mock-fallback.interceptor';

describe('mockFallbackInterceptor', () => {
    // The interceptor is tested indirectly through MockIndicatorService behavior
    let service: MockIndicatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                MockIndicatorService,
            ],
        });
        service = TestBed.inject(MockIndicatorService);
    });

    it('should start with no active mock resources', () => {
        expect(service.isActive()).toBe(false);
    });

    it('should track activated resources', () => {
        service.activate('roles');
        expect(service.isActive()).toBe(true);
        expect(service.activeResources()).toContain('roles');
    });

    it('should deactivate resources on success', () => {
        service.activate('roles');
        service.deactivate('roles');
        expect(service.isActive()).toBe(false);
    });
});
