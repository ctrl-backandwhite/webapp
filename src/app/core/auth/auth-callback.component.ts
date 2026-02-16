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
        <div class="mb-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <h2 class="text-2xl font-bold">{{ 'auth.completing' | translate }}</h2>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    try {
      const code = this.extractAuthorizationCode();

      if (!code) {
        console.error('[AuthCallback] No authorization code found');
        this.router.navigate(['/admin']);
        return;
      }

      this.authService.exchangeCodeForToken(code)
        .then(() => {
          localStorage.removeItem('authInitiated');
          localStorage.removeItem('forceLogin');
          console.log('[AuthCallback] Successfully authenticated');
          this.router.navigate(['/admin']);
        })
        .catch((error) => {
          console.error('[AuthCallback] Token exchange failed:', error);
          this.router.navigate(['/admin']);
        });
    } catch (error) {
      console.error('[AuthCallback] Error:', error);
      this.router.navigate(['/admin']);
    }
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
}
