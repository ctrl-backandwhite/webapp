import { Injectable } from '@angular/core';
import { User, UserInput } from '../interfaces/user.model';
import { ApiService } from '../../../core/api/api.service';

@Injectable({ providedIn: 'root' })
export class UsersService extends ApiService<User, UserInput> {
  protected resource = 'users';
}
