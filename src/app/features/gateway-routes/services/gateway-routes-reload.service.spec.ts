import { TestBed } from '@angular/core/testing';
import { GatewayRoutesReloadService } from './gateway-routes-reload.service';

describe('GatewayRoutesReloadService', () => {
    let service: GatewayRoutesReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [GatewayRoutesReloadService] });
        service = TestBed.inject(GatewayRoutesReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
