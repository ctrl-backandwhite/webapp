import { TestBed } from '@angular/core/testing';
import { PermissionsReloadService } from './permissions-reload.service';

describe('PermissionsReloadService', () => {
    let service: PermissionsReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [PermissionsReloadService] });
        service = TestBed.inject(PermissionsReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
