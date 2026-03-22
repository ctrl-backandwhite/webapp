import { Component, inject, OnInit, viewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { AuthService } from '../../auth/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { TourService } from '../../tour/tour.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BreadcrumbsComponent, TranslateModule],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private tourService = inject(TourService);

  sidebar = viewChild.required(SidebarComponent);

  onToggleSidebar(): void {
    this.sidebar().toggle();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      console.log('[AdminLayout] User is authenticated');
      this.startTourOnce();
      return;
    }
    // The authGuard already handles redirect to the auth server,
    // so no duplicate authorization logic is needed here.
    console.warn('[AdminLayout] User is not authenticated — guard should have redirected');
  }

  private startTourOnce(): void {
    const storageKey = 'adminTourSeen';
    if (localStorage.getItem(storageKey)) {
      return;
    }

    setTimeout(() => {
      this.tourService.startAdminTour();
      localStorage.setItem(storageKey, 'true');
    }, 600);
  }
}
