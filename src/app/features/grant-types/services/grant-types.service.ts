import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { GrantType, GrantTypeInput } from '../interfaces/grant-type.model';

@Injectable({ providedIn: 'root' })
export class GrantTypesService extends ApiService<GrantType, GrantTypeInput> {
  protected resource = 'granttypes';
}
