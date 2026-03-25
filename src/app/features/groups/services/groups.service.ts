import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Group, GroupInput } from '../interfaces/group.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class GroupsService extends ApiService<Group, GroupInput> {
    protected resource = 'groups';

    listByEnabled(enabled: boolean): Observable<Group[]> {
        return this.http.get<Group[]>(this.resourceUrl, {
            params: { enabled: String(enabled) }
        });
    }
}
