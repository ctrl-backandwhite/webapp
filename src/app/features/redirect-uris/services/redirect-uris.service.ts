import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { RedirectUri, RedirectUriInput } from '../interfaces/redirect-uri.model';

@Injectable({ providedIn: 'root' })
export class RedirectUrisService extends ApiService<RedirectUri, RedirectUriInput> {
    protected resource = 'redirecturis';

    listByEnabled(enabled: boolean): Observable<RedirectUri[]> {
        return this.http.get<RedirectUri[]>(`${this.baseUrl}/${this.resource}`, {
            params: { enabled: String(enabled) },
        });
    }
}
