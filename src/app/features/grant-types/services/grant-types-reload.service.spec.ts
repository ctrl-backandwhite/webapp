import { TestBed } from '@angular/core/testing';
import { GrantTypesReloadService } from './grant-types-reload.service';

describe('GrantTypesReloadService', () => {
    let service: GrantTypesReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [GrantTypesReloadService] });
        service = TestBed.inject(GrantTypesReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
