import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { environment } from '../../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BreadcrumbsComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit {

  public code = signal('');
  private authService = inject(AuthService);
  private oauth2AuthorizeUrl = environment.oauth2AuthorizeUrl;
  private codeVerifier: string = '';

  parameters: any = {
    client_id: environment.clientId,
    redirect_uri: environment.redirectUri,
    scope: environment.scope,
    response_type: environment.responseType,
    response_mode: environment.responseMode,
    code_challenge_method: environment.code_challenge_method,
    code_challenge: ''
  };

  sidebar = viewChild.required(SidebarComponent);

  onToggleSidebar() {
    this.sidebar().toggle();
  }

  private generateCodeVerifier(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
    let verifier = '';
    const length = 128;
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      verifier += characters[randomValues[i] % characters.length];
    }
    return verifier;
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashString = String.fromCharCode.apply(null, hashArray);
    const base64url = btoa(hashString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64url;
  }

  ngOnInit(): void {
    // Check if user has valid access token
    const accessToken = this.authService.getAccessToken();
    const hasInitiatedAuth = localStorage.getItem('authInitiated');

    if (accessToken && !this.authService.isTokenExpired()) {
      // User is authenticated
      console.log('User has valid access token');
      return;
    }

    // Only initiate authorization if not already done and no token exists
    if (!hasInitiatedAuth && !accessToken) {
      this.onLogin();
    }
  }

  async onLogin() {
    // Generate PKCE parameters dynamically
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    // Store code_verifier in localStorage for later use in token exchange
    localStorage.setItem('pkce_verifier', this.codeVerifier);

    // Update parameters with dynamic code_challenge
    this.parameters.code_challenge = codeChallenge;

    const httpParams = new HttpParams({ fromObject: this.parameters });
    const url = this.oauth2AuthorizeUrl + httpParams.toString();
    // Mark that authorization has been initiated
    localStorage.setItem('authInitiated', 'true');
    location.href = url;
  }
}
