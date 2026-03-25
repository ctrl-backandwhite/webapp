import { TestBed } from '@angular/core/testing';
import { RedirectUrisReloadService } from './redirect-uris-reload.service';

describe('RedirectUrisReloadService', () => {
    let service: RedirectUrisReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [RedirectUrisReloadService] });
        service = TestBed.inject(RedirectUrisReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
