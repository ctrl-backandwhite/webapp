import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    templateUrl: './sidebar.component.html',
    host: {
        '[class.collapsed]': 'isCollapsed()'
    }
})
export class SidebarComponent {
    isCollapsed = signal(false);

    toggle() {
        this.isCollapsed.set(!this.isCollapsed());
    }
}
