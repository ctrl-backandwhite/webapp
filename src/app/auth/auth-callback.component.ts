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
    // Method 1: Look for hidden input with name="code"
    const codeInput = document.querySelector('input[name="code"]') as HTMLInputElement;
    if (codeInput && codeInput.value) {
      return codeInput.value;
    }

    // Method 2: Search in entire HTML
    const htmlContent = document.documentElement.innerHTML;
    const codeMatch = htmlContent.match(/name="code"\s+value="([^"]+)"/);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1];
    }

    // Method 3: Try to find code in body text
    const bodyText = document.body.innerText;
    const bodyCodeMatch = bodyText.match(/code[=:\s]+([a-zA-Z0-9\-._~]+)/i);
    if (bodyCodeMatch && bodyCodeMatch[1]) {
      return bodyCodeMatch[1];
    }

    // Method 4: Check URL query params
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
  }
}
