import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GatewayRoute, GatewayRouteInput, BulkImportResult } from '../interfaces/gateway-route.model';

@Injectable({ providedIn: 'root' })
export class GatewayRoutesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.gatewayApiUrl}/gateway/routes`;

  list(): Observable<GatewayRoute[]> {
    return this.http.get<GatewayRoute[]>(this.baseUrl);
  }

  findById(id: string): Observable<GatewayRoute> {
    return this.http.get<GatewayRoute>(`${this.baseUrl}/${id}`);
  }

  create(payload: GatewayRouteInput): Observable<GatewayRoute> {
    return this.http.post<GatewayRoute>(this.baseUrl, payload);
  }

  update(id: string, payload: GatewayRouteInput): Observable<GatewayRoute> {
    return this.http.put<GatewayRoute>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggle(id: string): Observable<GatewayRoute> {
    return this.http.patch<GatewayRoute>(`${this.baseUrl}/${id}/toggle`, {});
  }

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/refresh`, {});
  }

  bulkImport(routes: GatewayRouteInput[]): Observable<BulkImportResult> {
    return this.http.post<BulkImportResult>(`${this.baseUrl}/bulk`, routes);
  }
}
