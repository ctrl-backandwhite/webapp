import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    templateUrl: './auth-callback.component.html'
})
export class AuthCallbackComponent implements OnInit {
    private auth = inject(AuthService);

    ngOnInit() {
        void this.auth.handleLoginCallback();
    }
}
