import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const isAuthEndpoint = (url: string): boolean =>
        url.includes('/oauth2/token') || url.includes('/oauth2/authorize');

    // Skip token attachment for OAuth endpoints.
    if (isAuthEndpoint(req.url)) {
        return next(req);
    }

    const token = authService.getAccessToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};
