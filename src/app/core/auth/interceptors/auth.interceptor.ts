import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const tokenService = inject(TokenService);
    const isAuthEndpoint = (url: string): boolean =>
        url.includes('/oauth2/token') || url.includes('/oauth2/authorize');

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

    return next(req);
};
