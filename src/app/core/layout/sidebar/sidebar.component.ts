import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface SidebarMenuItem {
  labelKey: string;
  route?: string[];
  icon: string;
  children?: SidebarMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  host: { '[class.collapsed]': 'isCollapsed()' },
  imports: [CommonModule, RouterLink, TranslateModule]
})
export class SidebarComponent {
  isCollapsed = signal(false);
  expandedKey = signal<string | null>(null);
  readonly menuItems: SidebarMenuItem[] = [
    {
      labelKey: 'menu.users',
      icon: 'fa-solid fa-users',
      children: [
        {
          labelKey: 'menu.usersList',
          route: ['/admin/users'],
          icon: 'fa-solid fa-user'
        },
        {
          labelKey: 'menu.roles',
          route: ['/admin/roles'],
          icon: 'fa-solid fa-user-shield'
        },
        {
          labelKey: 'menu.groups',
          route: ['/admin/groups'],
          icon: 'fa-solid fa-people-group'
        },
        {
          labelKey: 'menu.scopes',
          route: ['/admin/scopes'],
          icon: 'fa-solid fa-key'
        }
      ]
    },
    {
      labelKey: 'menu.gateway',
      icon: 'fa-solid fa-network-wired',
      children: [
        {
          labelKey: 'menu.gatewayRoutes',
          route: ['/admin/gateway'],
          icon: 'fa-solid fa-route'
        }
      ]
    },
    {
      labelKey: 'menu.applications',
      icon: 'fa-solid fa-diagram-project',
      children: [
        {
          labelKey: 'menu.scopes',
          route: ['/admin/applications/scopes'],
          icon: 'fa-solid fa-key'
        },
        {
          labelKey: 'menu.redirectUris',
          route: ['/admin/applications/redirecturis'],
          icon: 'fa-solid fa-link'
        },
        {
          labelKey: 'menu.grantTypes',
          route: ['/admin/applications/granttypes'],
          icon: 'fa-solid fa-right-to-bracket'
        },
        {
          labelKey: 'menu.oauthClients',
          route: ['/admin/applications/oauthclients'],
          icon: 'fa-solid fa-shield-halved'
        }
      ]
    }
  ];

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  toggleMenu(item: SidebarMenuItem) {
    if (!item.children?.length) {
      return;
    }

    const current = this.expandedKey();
    this.expandedKey.set(current === item.labelKey ? null : item.labelKey);
  }

  isExpanded(item: SidebarMenuItem): boolean {
    return this.expandedKey() === item.labelKey;
  }
}
