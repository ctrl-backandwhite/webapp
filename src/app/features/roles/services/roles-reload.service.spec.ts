import { TestBed } from '@angular/core/testing';
import { RolesReloadService } from './roles-reload.service';

describe('RolesReloadService', () => {
    let service: RolesReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [RolesReloadService] });
        service = TestBed.inject(RolesReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });

    it('should emit multiple times', () => {
        let count = 0;
        service.reload$.subscribe(() => count++);
        service.triggerReload();
        service.triggerReload();
        expect(count).toBe(2);
    });
});
