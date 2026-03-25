import { TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TokenService } from '../../auth/services/token.service';

function makeJwt(payload: Record<string, unknown>): string {
    const encoded = btoa(JSON.stringify(payload));
    return `header.${encoded}.signature`;
}

describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let tokenService: TokenService;

    beforeEach(async () => {
        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [NavbarComponent, TranslateModule.forRoot()],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        tokenService = TestBed.inject(TokenService);
        const fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => localStorage.clear());

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default user info', () => {
        expect(component.user.fullName).toBeDefined();
        expect(component.user.initials).toBeDefined();
    });

    describe('userName signal', () => {
        it('should return default name when no token', () => {
            expect(component.userName()).toBeDefined();
            expect(component.userName().length).toBeGreaterThan(0);
        });

        it('should extract name from firstName + lastName claims', () => {
            localStorage.setItem('access_token', makeJwt({ firstName: 'John', lastName: 'Doe' }));
            tokenService = TestBed.inject(TokenService);
            // Re-create component to pick up new token
            const fixture2 = TestBed.createComponent(NavbarComponent);
            const comp2 = fixture2.componentInstance;
            fixture2.detectChanges();
            expect(comp2.userName()).toBe('John Doe');
        });
    });

    describe('userInitials signal', () => {
        it('should return initials from userName', () => {
            const initials = component.userInitials();
            expect(initials).toBeDefined();
            expect(initials.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('onChangeLanguage', () => {
        it('should save language to localStorage', () => {
            component.onChangeLanguage('en');
            expect(localStorage.getItem('lang')).toBe('en');
        });

        it('should update TranslateService', () => {
            const translate = TestBed.inject(TranslateService);
            const spy = vi.spyOn(translate, 'use');
            component.onChangeLanguage('es');
            expect(spy).toHaveBeenCalledWith('es');
        });
    });
});
