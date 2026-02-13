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

  // Si necesitas otros endpoints, puedes construirlos así:
  // getRoleById(id: number): Observable<Role> {
  //   return this.http.get<Role>(`${this.baseUrl}/roles/${id}`);
  // }
}
