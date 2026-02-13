import { Component, output } from '@angular/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    toggleSidebar = output<void>();

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }
}
