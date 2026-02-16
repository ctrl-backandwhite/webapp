import { Component, inject, output, computed, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { TokenService } from '../../auth/services/token.service';
import { TourService } from '../../tour/tour.service';
import { environment } from '../../../../environments/environment';

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

    // Signals para el estado del usuario
    private authState = signal(this.tokenService.getAccessTokenPayload());
    userName = computed(() => this.computeUserName());
    userInitials = computed(() => this.computeUserInitials());

    user = {
        initials: 'AD',
        fullName: 'Andrea Domínguez',
        position: 'Gerente de Producto',
        role: 'Administrador'
    };

    constructor() {
        // Cuando cambien los tokens, actualizar el signal de estado
        effect(() => {
            this.authState.set(this.tokenService.getAccessTokenPayload());
        });
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    onLogout(): void {
        console.log('[Navbar] Logout button clicked');
        this.authService.logout().then(() => {
            console.log('[Navbar] Logout completed, redirecting to login form');
            window.location.href = environment.oauth2LoginUrl;
        }).catch((error) => {
            console.error('[Navbar] Logout error:', error);
            // Incluso si hay error, redirigir al login
            window.location.href = environment.oauth2LoginUrl;
        });
    }

    onStartTour(): void {
        this.tourService.startAdminTour();
    }

    onChangeLanguage(locale: 'es' | 'en'): void {
        localStorage.setItem('lang', locale);
        this.translate.use(locale);
    }

    private computeUserName(): string {
        const payload = this.authState();
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

    private computeUserInitials(): string {
        const payload = this.authState();
        const initials = this.getStringClaim(payload, ['initials']);
        if (initials) {
            return initials.toUpperCase();
        }

        const name = this.computeUserName().trim();
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
