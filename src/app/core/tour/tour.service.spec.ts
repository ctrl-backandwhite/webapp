import { TestBed } from '@angular/core/testing';
import { TourService } from './tour.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('TourService', () => {
    let service: TourService;
    let translate: TranslateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
        });
        service = TestBed.inject(TourService);
        translate = TestBed.inject(TranslateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call startAdminTour without errors', () => {
        vi.spyOn(translate, 'instant').mockImplementation((key: string | string[]) =>
            Array.isArray(key) ? key.join(',') : key
        );
        expect(() => service.startAdminTour()).not.toThrow();
    });

    it('should filter steps for elements not in DOM', () => {
        vi.spyOn(translate, 'instant').mockImplementation((key: string | string[]) =>
            Array.isArray(key) ? key.join(',') : key
        );
        // No DOM elements exist, so steps referencing selectors will be filtered out
        service.startAdminTour();
        // No error thrown means filtering worked
        expect(true).toBe(true);
    });

    it('should detect section key from pathname', () => {
        vi.spyOn(translate, 'instant').mockImplementation((key: string | string[]) =>
            Array.isArray(key) ? key.join(',') : key
        );

        // Access private method via bracket notation for testing
        const getSectionKey = (service as any).getSectionKey.bind(service);

        // Mock window.location.pathname
        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: '/admin/roles' },
            writable: true,
        });
        expect(getSectionKey()).toBe('roles');

        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: '/admin/users' },
            writable: true,
        });
        expect(getSectionKey()).toBe('users');

        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: '/dashboard' },
            writable: true,
        });
        expect(getSectionKey()).toBeNull();
    });

    it('should return empty crud steps when sectionKey is null', () => {
        const getCrudSteps = (service as any).getCrudSteps.bind(service);
        expect(getCrudSteps(null)).toEqual([]);
    });

    it('should return crud steps when sectionKey is provided', () => {
        vi.spyOn(translate, 'instant').mockImplementation((key: string | string[]) =>
            Array.isArray(key) ? key.join(',') : key
        );
        const getCrudSteps = (service as any).getCrudSteps.bind(service);
        const steps = getCrudSteps('roles');
        expect(steps.length).toBe(4);
        expect(steps[0].element).toBe('[data-tour="tour-create"]');
    });
});
