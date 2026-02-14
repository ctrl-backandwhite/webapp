import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    if (auth.hasValidToken()) {
        return true;
    }
    auth.login(state.url);
    return false;
};
