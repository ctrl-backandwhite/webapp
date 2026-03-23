import { TestBed } from '@angular/core/testing';
import { AuthCallbackComponent } from './auth-callback.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthCallbackComponent', () => {
    let component: AuthCallbackComponent;

    beforeEach(async () => {
        sessionStorage.clear();
        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [AuthCallbackComponent, TranslateModule.forRoot()],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(AuthCallbackComponent);
        component = fixture.componentInstance;
        // Don't call detectChanges yet — ngOnInit will run
    });

    afterEach(() => {
        sessionStorage.clear();
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show error after max retries', () => {
        sessionStorage.setItem('auth_callback_retries', '3');
        component.ngOnInit();
        expect(component.errorMessage).toContain('multiple attempts');
    });

    it('should show error when no authorization code', () => {
        // No code in URL → errorMessage should be set
        component.ngOnInit();
        expect(component.errorMessage).not.toBeNull();
    });

    it('should increment retry counter on init', () => {
        component.ngOnInit();
        const retries = parseInt(sessionStorage.getItem('auth_callback_retries') || '0');
        expect(retries).toBeGreaterThanOrEqual(1);
    });

    describe('retryLogin', () => {
        it('should clear retry counter', () => {
            sessionStorage.setItem('auth_callback_retries', '2');
            component.retryLogin();
            expect(sessionStorage.getItem('auth_callback_retries')).toBeNull();
        });
    });
});
