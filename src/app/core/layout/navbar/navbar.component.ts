import { Component, output } from '@angular/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
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

    get userName(): string {
        return this.user.fullName;
    }

    get userEmail(): string {
        return '';
    }

    get userRole(): string {
        return this.user.role;
    }

    get userInitials(): string {
        return this.user.initials;
    }
}
