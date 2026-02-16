import { Injectable, inject, signal, computed } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly tokenService = inject(TokenService);

    // Signal que se actualiza cuando cambia el token
    private rolesSignal = signal<string[]>([]);

    constructor() {
        this.updateRoles();
    }

    updateRoles(): void {
        const payload = this.tokenService.getAccessTokenPayload();
        const roles = this.extractRoles(payload);
        this.rolesSignal.set(roles);
    }

    private extractRoles(payload: Record<string, unknown> | null): string[] {
        if (!payload) {
            return [];
        }

        // Intentar extraer roles de diferentes ubicaciones posibles en el JWT
        const rolesFromClaim = payload['roles'];
        const rolesFromAuthorities = payload['authorities'];
        const rolesFromScope = payload['scope'];

        if (Array.isArray(rolesFromClaim)) {
            return rolesFromClaim
                .map(r => {
                    // Si es un string, usarlo directamente
                    if (typeof r === 'string') {
                        return r.toUpperCase();
                    }
                    // Si es un objeto con uniqueName (formato Spring Security)
                    if (typeof r === 'object' && r !== null && 'uniqueName' in r) {
                        return String((r as any).uniqueName).toUpperCase();
                    }
                    return null;
                })
                .filter((r): r is string => r !== null);
        }

        if (Array.isArray(rolesFromAuthorities)) {
            return rolesFromAuthorities
                .map(r => {
                    if (typeof r === 'string') {
                        return r.toUpperCase();
                    }
                    if (typeof r === 'object' && r !== null && 'uniqueName' in r) {
                        return String((r as any).uniqueName).toUpperCase();
                    }
                    return null;
                })
                .filter((r): r is string => r !== null);
        }

        if (typeof rolesFromScope === 'string') {
            return rolesFromScope.split(' ').map(r => r.toUpperCase());
        }

        return [];
    }

    hasRole(role: string): boolean {
        const roles = this.rolesSignal();
        return roles.includes(role.toUpperCase());
    }

    hasAnyRole(roles: string[]): boolean {
        const userRoles = this.rolesSignal();
        return roles.some(role => userRoles.includes(role.toUpperCase()));
    }

    hasAllRoles(roles: string[]): boolean {
        const userRoles = this.rolesSignal();
        return roles.every(role => userRoles.includes(role.toUpperCase()));
    }

    isAdmin(): boolean {
        return this.hasRole('ADMIN') || this.hasRole('ADMINISTRATOR') || this.hasRole('ROLE_ADMIN');
    }

    getRoles(): string[] {
        return [...this.rolesSignal()];
    }
}
