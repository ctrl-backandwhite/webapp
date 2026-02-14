import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { environment } from '../../../../environments/environment';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BreadcrumbsComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit {

  public code = signal('');
  private activateRoute = inject(ActivatedRoute);
  private oauth2AuthorizeUrl = environment.oauth2AuthorizeUrl;

  parameters: any = {
    client_id: environment.clientId,
    redirect_uri: environment.redirectUri,
    scope: environment.scope,
    response_type: environment.responseType,
    response_mode: environment.responseMode,
    code_chellenge_method: environment.codeChallengeMethod,
    code_challenge: environment.codeChallenge
  };

  sidebar = viewChild.required(SidebarComponent);

  onToggleSidebar() {
    this.sidebar().toggle();
  }

  ngOnInit(): void {

  }

  onLogin() {
    const httpParams = new HttpParams({ fromObject: this.parameters });
    const url = `${this.oauth2AuthorizeUrl} + ${httpParams.toString}`;
    location.href = url;
  }
}
