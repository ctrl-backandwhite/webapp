import { Component, output } from '@angular/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    toggleSidebar = output<void>();

    // Mock user data
    user = {
        initials: 'AD',
        fullName: 'Andrea Domínguez',
        position: 'Gerente de Producto',
        role: 'Administrador'
    };

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }
}
