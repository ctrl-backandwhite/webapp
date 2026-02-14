import { Component, inject, OnInit, viewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { AuthService } from '../../auth/services/auth.service';
import { PKCEService } from '../../auth/services/pkce.service';
import { OAuth2ConfigService } from '../../auth/services/oauth2-config.service';
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
  private pkceService = inject(PKCEService);
  private oauth2ConfigService = inject(OAuth2ConfigService);
  private router = inject(Router);
  private tourService = inject(TourService);

  sidebar = viewChild.required(SidebarComponent);

  onToggleSidebar(): void {
    this.sidebar().toggle();
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      console.log('[AdminLayout] User is authenticated');
      this.startTourOnce();
      return;
    }

    // Check if authorization has already been initiated
    const hasInitiatedAuth = localStorage.getItem('authInitiated');
    if (hasInitiatedAuth) {
      console.log('[AdminLayout] Authorization already initiated');
      return;
    }

    // Initiate OAuth2 authorization
    this.initiateAuthorization();
  }

  private async initiateAuthorization(): Promise<void> {
    try {
      const { challenge } = await this.pkceService.generateChallengeAsync();
      const authUrl = this.oauth2ConfigService.buildAuthorizationUrl(challenge);

      localStorage.setItem('authInitiated', 'true');
      window.location.href = authUrl;
    } catch (error) {
      console.error('[AdminLayout] Failed to initiate authorization:', error);
      this.router.navigate(['/']);
    }
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
