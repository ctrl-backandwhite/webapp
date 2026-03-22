import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MOCK_REGISTRY } from './mock-data';
import { MockIndicatorService } from './mock-indicator.service';

/** Known resource keys in order of longest first (so "gateway/routes" matches before "gateway") */
const RESOURCE_KEYS = Object.keys(MOCK_REGISTRY).sort((a, b) => b.length - a.length);

interface ParsedApi {
    resource: string;
    id?: string;
    action?: string;
}

/**
 * Parse an absolute URL into resource / id / action.
 * Examples:
 *   .../api/v1/roles             → { resource: 'roles' }
 *   .../api/v1/roles/5           → { resource: 'roles', id: '5' }
 *   .../api/v1/gateway/routes    → { resource: 'gateway/routes' }
 *   .../api/v1/gateway/routes/x/toggle → { resource: 'gateway/routes', id: 'x', action: 'toggle' }
 */
function parseApiUrl(url: string): ParsedApi | null {
    const idx = url.indexOf('/api/v1/');
    if (idx === -1) return null;

    const path = url.substring(idx + '/api/v1/'.length); // e.g. "roles" or "gateway/routes/x/toggle"

    for (const resource of RESOURCE_KEYS) {
        if (path === resource) {
            return { resource };
        }
        if (path.startsWith(resource + '/')) {
            const rest = path.slice(resource.length + 1);
            const parts = rest.split('/');
            return {
                resource,
                id: parts[0] || undefined,
                action: parts[1] || undefined,
            };
        }
    }

    return null;
}

/**
 * Mock-fallback interceptor.
 *
 * When a backend call fails (network error, 5xx, etc.) and the URL matches
 * a known API resource, the interceptor returns mock data instead of
 * propagating the error.
 *
 * Every mock object carries `_mock: true` so the UI can identify it.
 * The MockIndicatorService is notified so a global banner can be displayed.
 *
 * Controlled by `environment.enableMockFallback`.
 */
export const mockFallbackInterceptor: HttpInterceptorFn = (req, next) => {
    if (!(environment as any).enableMockFallback) {
        return next(req);
    }

    const parsed = parseApiUrl(req.url);

    // Not an API call we can mock → pass through untouched
    if (!parsed) {
        return next(req);
    }

    const mockIndicator = inject(MockIndicatorService);

    return next(req).pipe(
        // On success → deactivate mock for this resource (backend is back)
        tap(() => mockIndicator.deactivate(parsed.resource)),

        catchError((error: HttpErrorResponse) => {
            const items = MOCK_REGISTRY[parsed.resource];

            if (!items || items.length === 0) {
                return throwError(() => error);
            }

            console.warn(
                `[MockFallback] Backend unavailable for "${parsed.resource}" (${error.status}). Returning mock data.`
            );

            mockIndicator.activate(parsed.resource);

            const body = buildMockBody(req.method, parsed, items, req.body);

            return of(new HttpResponse({ status: 200, body }));
        })
    );
};

/**
 * Build a mock response body based on HTTP method and parsed URL.
 */
function buildMockBody(
    method: string,
    parsed: ParsedApi,
    items: readonly any[],
    requestBody: any
): any {
    switch (method) {
        case 'GET':
            if (parsed.id) {
                // GET /resource/:id → single item
                const found = items.find((i: any) => String(i.id) === parsed.id);
                return found ? { ...found, _mock: true } : { ...items[0], _mock: true };
            }
            // GET /resource → list
            return items.map((i: any) => ({ ...i, _mock: true }));

        case 'POST':
            // POST /resource/refresh or similar actions without body
            if (parsed.action === 'refresh' || !requestBody) {
                return null;
            }
            return { ...requestBody, id: Date.now(), _mock: true };

        case 'PUT':
            return { ...requestBody, _mock: true };

        case 'PATCH':
            // PATCH /resource/:id/toggle
            if (parsed.action === 'toggle') {
                const target = items.find((i: any) => String(i.id) === parsed.id) ?? items[0];
                return { ...target, enabled: !(target as any).enabled, _mock: true };
            }
            return { ...(requestBody ?? items[0]), _mock: true };

        case 'DELETE':
            return null;

        default:
            return null;
    }
}
