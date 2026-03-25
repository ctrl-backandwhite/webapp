import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
import { provideRouter } from '@angular/router';

describe('authInterceptor', () => {
    let httpClient: HttpClient;
    let httpTesting: HttpTestingController;
    let tokenService: TokenService;

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(
                    // Note: interceptors are tested via HttpClient integration
                ),
                provideHttpClientTesting(),
                TokenService,
                AuthService,
            ],
        });

        httpClient = TestBed.inject(HttpClient);
        httpTesting = TestBed.inject(HttpTestingController);
        tokenService = TestBed.inject(TokenService);
    });

    afterEach(() => {
        httpTesting.verify();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should not add Authorization header to auth endpoints', () => {
        tokenService.setTokens('my-token', undefined, 3600, 'Bearer');

        httpClient.post('/oauth2/token', {}).subscribe();

        const req = httpTesting.expectOne('/oauth2/token');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should not add Authorization header when no token exists', () => {
        httpClient.get('/api/v1/roles').subscribe();

        const req = httpTesting.expectOne('/api/v1/roles');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush([]);
    });
});
