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

  private static readonly EXCHANGE_KEY = 'auth_exchange_in_progress';

  ngOnInit(): void {
    // Evita que dos instancias o re-renders simultáneos intercambien el mismo code
    if (sessionStorage.getItem(AuthCallbackComponent.EXCHANGE_KEY) === '1') {
      return;
    }
    sessionStorage.setItem(AuthCallbackComponent.EXCHANGE_KEY, '1');

    try {
      // Extrae code y state ANTES de limpiar la URL
      const { code, state } = this.extractCallbackParams();

      // Limpia la URL inmediatamente para que si el componente se re-renderiza
      // no encuentre el code en la URL (los codes OAuth2 son de un solo uso)
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!this.validateState(state)) {
        sessionStorage.removeItem(AuthCallbackComponent.EXCHANGE_KEY);
        this.errorMessage = 'Invalid authentication state. Possible CSRF attack.';
        return;
      }

      if (!code) {
        sessionStorage.removeItem(AuthCallbackComponent.EXCHANGE_KEY);
        this.errorMessage = 'No authorization code received from the server.';
        return;
      }

      this.authService.exchangeCodeForToken(code)
        .then(() => {
          sessionStorage.removeItem(AuthCallbackComponent.EXCHANGE_KEY);
          sessionStorage.removeItem('oauth_state');
          localStorage.removeItem('authInitiated');
          localStorage.removeItem('forceLogin');
          this.router.navigate(['/admin']);
        })
        .catch(() => {
          sessionStorage.removeItem(AuthCallbackComponent.EXCHANGE_KEY);
          this.errorMessage = 'Failed to complete authentication. Please try again.';
        });
    } catch {
      sessionStorage.removeItem(AuthCallbackComponent.EXCHANGE_KEY);
      this.errorMessage = 'An unexpected error occurred during authentication.';
    }
  }

  retryLogin(): void {
    sessionStorage.removeItem(AuthCallbackComponent.EXCHANGE_KEY);
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => this.router.navigate(['/admin'])
    });
  }

  private extractCallbackParams(): { code: string | null; state: string | null } {
    const url = new URL(window.location.href);

    // Query params (response_mode=query)
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (code || state) {
      return { code, state };
    }

    // Hash fragment fallback (response_mode=fragment)
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
    return {
      code: hashParams.get('code'),
      state: hashParams.get('state'),
    };
  }

  private validateState(receivedState: string | null): boolean {
    const expectedState = sessionStorage.getItem('oauth_state');
    if (!expectedState || !receivedState) {
      return false;
    }
    return expectedState === receivedState;
  }
}
