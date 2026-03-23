import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, RoleInput } from '../interfaces/role.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class RolesService extends ApiService<Role, RoleInput> {
  protected resource = 'roles';

  listByEnabled(enabled: boolean): Observable<Role[]> {
    return this.http.get<Role[]>(this.resourceUrl, {
      params: { enabled: String(enabled) }
    });
  }
}
