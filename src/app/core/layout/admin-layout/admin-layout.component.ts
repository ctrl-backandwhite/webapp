import { Component, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BreadcrumbsComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  sidebar = viewChild.required(SidebarComponent);

  onToggleSidebar() {
    this.sidebar().toggle();
  }
}
