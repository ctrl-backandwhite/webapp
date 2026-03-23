import { TestBed } from '@angular/core/testing';
import { ScopesReloadService } from './scopes-reload.service';

describe('ScopesReloadService', () => {
    let service: ScopesReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [ScopesReloadService] });
        service = TestBed.inject(ScopesReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
