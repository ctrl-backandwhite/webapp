import { TestBed } from '@angular/core/testing';
import { AdminLayoutComponent } from './admin-layout.component';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../auth/services/auth.service';
import { TourService } from '../../tour/tour.service';
import { MockIndicatorService } from '../../mock/mock-indicator.service';

describe('AdminLayoutComponent', () => {
    let tourServiceSpy: { startAdminTour: ReturnType<typeof vi.fn> };
    let authServiceSpy: { isAuthenticated: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        tourServiceSpy = { startAdminTour: vi.fn() };
        authServiceSpy = { isAuthenticated: vi.fn().mockReturnValue(false) };

        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [AdminLayoutComponent, TranslateModule.forRoot()],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceSpy },
                { provide: TourService, useValue: tourServiceSpy },
                MockIndicatorService,
            ],
        });
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(AdminLayoutComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should not start tour if not authenticated', () => {
        authServiceSpy.isAuthenticated.mockReturnValue(false);
        const fixture = TestBed.createComponent(AdminLayoutComponent);
        fixture.detectChanges();
        expect(tourServiceSpy.startAdminTour).not.toHaveBeenCalled();
    });

    it('should start tour once if authenticated and not seen before', () => {
        vi.useFakeTimers();
        authServiceSpy.isAuthenticated.mockReturnValue(true);
        const fixture = TestBed.createComponent(AdminLayoutComponent);
        fixture.detectChanges();
        vi.advanceTimersByTime(700);
        expect(tourServiceSpy.startAdminTour).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem('adminTourSeen')).toBe('true');
        vi.useRealTimers();
    });

    it('should not start tour if already seen', () => {
        vi.useFakeTimers();
        localStorage.setItem('adminTourSeen', 'true');
        authServiceSpy.isAuthenticated.mockReturnValue(true);
        const fixture = TestBed.createComponent(AdminLayoutComponent);
        fixture.detectChanges();
        vi.advanceTimersByTime(700);
        expect(tourServiceSpy.startAdminTour).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('should toggle sidebar', () => {
        authServiceSpy.isAuthenticated.mockReturnValue(false);
        const fixture = TestBed.createComponent(AdminLayoutComponent);
        fixture.detectChanges();
        const comp = fixture.componentInstance;
        const sidebarRef = comp.sidebar();
        const toggleSpy = vi.spyOn(sidebarRef, 'toggle');
        comp.onToggleSidebar();
        expect(toggleSpy).toHaveBeenCalled();
    });
});
