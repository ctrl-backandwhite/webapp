import { Injectable } from '@angular/core';
import { Role } from '../interfaces/role.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class RolesService extends ApiService<Role, Omit<Role, 'id'>> {
  protected resource = 'roles';
}
