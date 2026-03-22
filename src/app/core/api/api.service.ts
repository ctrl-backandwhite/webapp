import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export abstract class ApiService<T, CreatePayload = Partial<T>, UpdatePayload = CreatePayload> {

  protected http = inject(HttpClient);
  protected baseUrl = environment.apiBaseUrl;
  protected abstract resource: string;

  protected get resourceUrl(): string {
    return `${this.baseUrl}/${this.resource}`;
  }

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.resourceUrl);
  }

  create(payload: CreatePayload): Observable<T> {
    return this.http.post<T>(this.resourceUrl, payload);
  }

  update(id: number, payload: UpdatePayload): Observable<T> {
    return this.http.put<T>(`${this.resourceUrl}/${id}`, payload);
  }

  toggle(id: number): Observable<T> {
    return this.http.patch<T>(`${this.resourceUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
