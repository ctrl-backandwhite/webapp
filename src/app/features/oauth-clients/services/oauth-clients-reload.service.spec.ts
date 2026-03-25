import { TestBed } from '@angular/core/testing';
import { OauthClientsReloadService } from './oauth-clients-reload.service';

describe('OauthClientsReloadService', () => {
    let service: OauthClientsReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [OauthClientsReloadService] });
        service = TestBed.inject(OauthClientsReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
