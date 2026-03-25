import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Scope } from '../interfaces/scope.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class ScopesService extends ApiService<Scope, Omit<Scope, 'id'>> {
    protected resource = 'scopes';

    listByEnabled(enabled: boolean): Observable<Scope[]> {
        return this.http.get<Scope[]>(this.resourceUrl, {
            params: { enabled: String(enabled) }
        });
    }
}
