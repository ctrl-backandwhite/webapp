import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        @if (errorMessage) {
          <div class="mb-4 text-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-error mb-2">{{ 'auth.error' | translate }}</h2>
          <p class="text-base-content/70 mb-4">{{ errorMessage }}</p>
          <button class="btn btn-primary" (click)="retryLogin()">{{ 'auth.retry' | translate }}</button>
        } @else {
          <div class="mb-4">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          <h2 class="text-2xl font-bold">{{ 'auth.completing' | translate }}</h2>
        }
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  errorMessage: string | null = null;

  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_KEY = 'auth_callback_retries';

  ngOnInit(): void {
    // Loop detection: break infinite redirect cycles
    const retries = parseInt(sessionStorage.getItem(AuthCallbackComponent.RETRY_KEY) || '0', 10);
    if (retries >= AuthCallbackComponent.MAX_RETRIES) {
      sessionStorage.removeItem(AuthCallbackComponent.RETRY_KEY);
      this.errorMessage = 'Authentication failed after multiple attempts. Please try again.';
      return;
    }
    sessionStorage.setItem(AuthCallbackComponent.RETRY_KEY, String(retries + 1));

    try {
      const code = this.extractAuthorizationCode();

      if (!this.validateState()) {
        this.errorMessage = 'Invalid authentication state. Possible CSRF attack.';
        return;
      }

      if (!code) {
        this.errorMessage = 'No authorization code received from the server.';
        return;
      }

      this.authService.exchangeCodeForToken(code)
        .then(() => {
          sessionStorage.removeItem(AuthCallbackComponent.RETRY_KEY);
          sessionStorage.removeItem('oauth_state');
          localStorage.removeItem('authInitiated');
          localStorage.removeItem('forceLogin');
          this.router.navigate(['/admin']);
        })
        .catch(() => {
          this.errorMessage = 'Failed to complete authentication. Please try again.';
        });
    } catch {
      this.errorMessage = 'An unexpected error occurred during authentication.';
    }
  }

  retryLogin(): void {
    sessionStorage.removeItem(AuthCallbackComponent.RETRY_KEY);
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => this.router.navigate(['/admin'])
    });
  }

  private extractAuthorizationCode(): string | null {
    // Prefer standard OAuth2 redirect parameters.
    const url = new URL(window.location.href);
    const queryCode = url.searchParams.get('code');
    if (queryCode) {
      return queryCode;
    }

    // Some providers return params in the hash fragment.
    const hash = url.hash.replace(/^#/, '');
    if (!hash) {
      return null;
    }

    const hashParams = new URLSearchParams(hash);
    return hashParams.get('code');
  }

  private validateState(): boolean {
    const url = new URL(window.location.href);
    const receivedState = url.searchParams.get('state')
      || new URLSearchParams(url.hash.replace(/^#/, '')).get('state');
    const expectedState = sessionStorage.getItem('oauth_state');

    if (!expectedState || !receivedState) {
      return false;
    }

    return expectedState === receivedState;
  }
}
