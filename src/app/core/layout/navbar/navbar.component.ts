import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { TokenService } from '../../auth/services/token.service';
import { TourService } from '../../tour/tour.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    private readonly tokenService = inject(TokenService);
    private readonly router = inject(Router);
    private readonly translate = inject(TranslateService);
    private readonly tourService = inject(TourService);
    toggleSidebar = output<void>();
    user = {
        initials: 'AD',
        fullName: 'Andrea Domínguez',
        position: 'Gerente de Producto',
        role: 'Administrador'
    };

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    onStartTour(): void {
        this.tourService.startAdminTour();
    }

    constructor() {
        const saved = localStorage.getItem('lang') ?? 'es';
        this.translate.setDefaultLang('es');
        this.translate.use(saved);
    }

    onChangeLanguage(locale: 'es' | 'en'): void {
        localStorage.setItem('lang', locale);
        this.translate.use(locale);
    }

    get userName(): string {
        const payload = this.tokenService.getAccessTokenPayload();
        const firstName = this.getStringClaim(payload, ['firstName', 'first_name', 'given_name']);
        const lastName = this.getStringClaim(payload, ['lastName', 'last_name', 'family_name']);
        const name = this.getStringClaim(payload, ['name', 'full_name']);
        const preferredUsername = this.getStringClaim(payload, ['preferred_username', 'username']);
        const email = this.getStringClaim(payload, ['email']);

        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        if (fullName) {
            return fullName;
        }

        if (name) {
            return name;
        }

        return preferredUsername || email || this.user.fullName;
    }

    get userEmail(): string {
        return '';
    }

    get userInitials(): string {
        const payload = this.tokenService.getAccessTokenPayload();
        const initials = this.getStringClaim(payload, ['initials']);
        if (initials) {
            return initials.toUpperCase();
        }

        const name = this.userName.trim();
        if (!name) {
            return this.user.initials;
        }

        const parts = name.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] ?? '';
        const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
        return `${first}${last}`.toUpperCase() || this.user.initials;
    }

    private getStringClaim(payload: Record<string, unknown> | null, keys: string[]): string {
        if (!payload) {
            return '';
        }

        for (const key of keys) {
            const value = payload[key];
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }

        return '';
    }

}
