import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';
import { catchError, from, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const isAuthEndpoint = (url: string): boolean =>
    url.includes('/oauth2/token') ||
    url.includes('/oauth2/authorize') ||
    url.includes('/api/v1/auth/logout') ||
    url.includes('/api/v1/auth/revoke');

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
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return from(authService.refreshToken()).pipe(
          switchMap((tokenResponse) => {
            isRefreshing = false;
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `${tokenResponse.token_type} ${tokenResponse.access_token}`
              }
            });
            return next(retryReq);
          }),
          catchError(() => {
            isRefreshing = false;
            authService.logout().subscribe({
              next: () => { window.location.href = environment.oauth2LoginUrl; },
              error: () => { window.location.href = environment.oauth2LoginUrl; }
            });
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
