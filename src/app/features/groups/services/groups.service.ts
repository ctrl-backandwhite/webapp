import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Group, GroupInput } from '../interfaces/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    getGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.baseUrl}/groups`);
    }

    createGroup(payload: GroupInput): Observable<Group> {
        return this.http.post<Group>(`${this.baseUrl}/groups`, payload);
    }

    updateGroup(id: number, payload: GroupInput): Observable<Group> {
        return this.http.put<Group>(`${this.baseUrl}/groups/${id}`, payload);
    }

    deleteGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/groups/${id}`);
    }
}
