import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, UserInput } from '../interfaces/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/users`);
    }

    createUser(payload: UserInput): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/users`, payload);
    }

    updateUser(id: number, payload: UserInput): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/users/${id}`, payload);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
    }
}
