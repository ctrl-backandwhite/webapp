import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { GrantType, GrantTypeInput } from '../interfaces/grant-type.model';

@Injectable({ providedIn: 'root' })
export class GrantTypesService extends ApiService<GrantType, GrantTypeInput> {
  protected resource = 'granttypes';

  listByEnabled(enabled: boolean): Observable<GrantType[]> {
    return this.http.get<GrantType[]>(`${this.baseUrl}/${this.resource}`, {
      params: { enabled: String(enabled) },
    });
  }
}
