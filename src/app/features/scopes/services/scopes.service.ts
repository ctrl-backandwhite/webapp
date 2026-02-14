import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Scope } from '../interfaces/scope.model';

@Injectable({ providedIn: 'root' })
export class ScopesService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    getScopes(): Observable<Scope[]> {
        return this.http.get<Scope[]>(`${this.baseUrl}/scopes`);
    }

    createScope(payload: Omit<Scope, 'id'>): Observable<Scope> {
        return this.http.post<Scope>(`${this.baseUrl}/scopes`, payload);
    }

    updateScope(id: number, payload: Omit<Scope, 'id'>): Observable<Scope> {
        return this.http.put<Scope>(`${this.baseUrl}/scopes/${id}`, payload);
    }

    deleteScope(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/scopes/${id}`);
    }
}
