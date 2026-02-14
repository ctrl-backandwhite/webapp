import { Injectable } from '@angular/core';
import { Scope } from '../interfaces/scope.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class ScopesService extends ApiService<Scope, Omit<Scope, 'id'>> {
    protected resource = 'scopes';
}
