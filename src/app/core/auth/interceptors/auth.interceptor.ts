import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { catchError, throwError } from 'rxjs';

let isLoggingOut = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const tokenService = inject(TokenService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuthEndpoint = (url: string): boolean =>
        url.includes('/oauth2/token') ||
        url.includes('/oauth2/authorize') ||
        url.includes('/api/v1/auth/logout') ||
        url.includes('/api/v1/auth/revoke');

    // Skip token attachment for OAuth endpoints.
    if (isAuthEndpoint(req.url)) {
        return next(req);
    }

    const token = tokenService.getAccessToken();
    const tokenType = tokenService.getTokenType();

    if (token && !req.headers.has('Authorization')) {
        req = req.clone({
            setHeaders: {
                Authorization: `${tokenType} ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si es un error 401 (Unauthorized) y no estamos ya en proceso de logout
            if (error.status === 401 && !isLoggingOut) {
                isLoggingOut = true;

                console.warn('[AuthInterceptor] Session expired (401). Logging out...');

                // Hacer logout y redirigir
                authService.logout().subscribe({
                    next: () => {
                        window.location.href = environment.oauth2LoginUrl;
                        isLoggingOut = false;
                    },
                    error: () => {
                        window.location.href = environment.oauth2LoginUrl;
                        isLoggingOut = false;
                    }
                });
            }

            return throwError(() => error);
        })
    );
};
