import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RedirectUrisReloadService {
    private reloadSubject = new Subject<void>();
    reload$ = this.reloadSubject.asObservable();

    triggerReload() {
        this.reloadSubject.next();
    }
}
