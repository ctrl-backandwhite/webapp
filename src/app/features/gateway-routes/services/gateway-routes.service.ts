import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GatewayRoute, GatewayRouteInput } from '../interfaces/gateway-route.model';

const MOCK_ROUTES: GatewayRoute[] = [
  {
    id: 'mock-auth-service',
    uri: 'http://localhost:9001',
    predicates: ['Path=/api/v1/auth/**'],
    filters: [],
    order: 1,
    enabled: true,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  },
  {
    id: 'mock-notification-service',
    uri: 'http://localhost:9002',
    predicates: ['Path=/api/v1/notifications/**'],
    filters: ['StripPrefix=2'],
    order: 2,
    enabled: false,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  },
];

@Injectable({ providedIn: 'root' })
export class GatewayRoutesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.gatewayApiUrl}/gateway/routes`;

  list(): Observable<GatewayRoute[]> {
    return this.http.get<GatewayRoute[]>(this.baseUrl).pipe(
      catchError(() => of(MOCK_ROUTES))
    );
  }

  findById(id: string): Observable<GatewayRoute> {
    return this.http.get<GatewayRoute>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => of(MOCK_ROUTES.find(r => r.id === id) ?? MOCK_ROUTES[0]))
    );
  }

  create(payload: GatewayRouteInput): Observable<GatewayRoute> {
    return this.http.post<GatewayRoute>(this.baseUrl, payload).pipe(
      catchError(() => of({
        ...payload,
        filters: payload.filters ?? [],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    );
  }

  update(id: string, payload: GatewayRouteInput): Observable<GatewayRoute> {
    return this.http.put<GatewayRoute>(`${this.baseUrl}/${id}`, payload).pipe(
      catchError(() => of({
        ...payload,
        filters: payload.filters ?? [],
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => of(undefined as unknown as void))
    );
  }

  toggle(id: string): Observable<GatewayRoute> {
    return this.http.patch<GatewayRoute>(`${this.baseUrl}/${id}/toggle`, {}).pipe(
      catchError(() => {
        const route = MOCK_ROUTES.find(r => r.id === id) ?? MOCK_ROUTES[0];
        return of({ ...route, enabled: !route.enabled });
      })
    );
  }

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/refresh`, {}).pipe(
      catchError(() => of(undefined as unknown as void))
    );
  }
}
