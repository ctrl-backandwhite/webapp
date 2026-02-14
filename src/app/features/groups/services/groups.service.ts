import { Injectable } from '@angular/core';
import { Group, GroupInput } from '../interfaces/group.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class GroupsService extends ApiService<Group, GroupInput> {
    protected resource = 'groups';
}
