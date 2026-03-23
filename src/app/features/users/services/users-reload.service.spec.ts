import { TestBed } from '@angular/core/testing';
import { UsersReloadService } from './users-reload.service';

describe('UsersReloadService', () => {
    let service: UsersReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [UsersReloadService] });
        service = TestBed.inject(UsersReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
