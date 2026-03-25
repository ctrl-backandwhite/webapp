import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission } from '../interfaces/permission.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class PermissionsService extends ApiService<Permission, Omit<Permission, 'id'>> {
    protected resource = 'permissions';

    listByEnabled(enabled: boolean): Observable<Permission[]> {
        return this.http.get<Permission[]>(this.resourceUrl, {
            params: { enabled: String(enabled) }
        });
    }
}
