import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthHttpInterceptorService {
  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    // Skip token attachment for auth endpoints
    if (this.isAuthEndpoint(req.url)) {
      return next(req);
    }

    // Add authorization header
    req = this.attachTokenToRequest(req);

    return next(req).pipe(
      catchError((error) => {
        // Handle token expiration
        if (error.status === 401 && this.authService.isAuthenticated()) {
          return this.handleTokenExpiration(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private attachTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getAccessToken();

    if (!token) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handleTokenExpiration(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    return this.authService.refreshToken()
      .then(() => {
        // Retry request with new token
        const retryReq = this.attachTokenToRequest(req);
        return next(retryReq).toPromise();
      })
      .catch((error: unknown) => {
        // Refresh failed, logout
        this.authService.logout();
        return Promise.reject(error);
      }) as any;
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/oauth2/token') || url.includes('/oauth2/authorize');
  }
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const isAuthEndpoint = (url: string): boolean => {
    return url.includes('/oauth2/token') || url.includes('/oauth2/authorize');
  };

  // Skip token attachment for auth endpoints
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
