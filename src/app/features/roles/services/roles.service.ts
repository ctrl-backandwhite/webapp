import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role } from '../interfaces/role.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`);
  }

  createRole(payload: Omit<Role, 'id'>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, payload);
  }

  updateRole(id: number, payload: Omit<Role, 'id'>): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/roles/${id}`, payload);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  // Si necesitas otros endpoints, puedes construirlos así:
  // getRoleById(id: number): Observable<Role> {
  //   return this.http.get<Role>(`${this.baseUrl}/roles/${id}`);
  // }
}
