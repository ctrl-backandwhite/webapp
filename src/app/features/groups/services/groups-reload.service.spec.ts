import { TestBed } from '@angular/core/testing';
import { GroupsReloadService } from './groups-reload.service';

describe('GroupsReloadService', () => {
    let service: GroupsReloadService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [GroupsReloadService] });
        service = TestBed.inject(GroupsReloadService);
    });

    it('should emit on triggerReload', () => {
        let emitted = false;
        service.reload$.subscribe(() => (emitted = true));
        service.triggerReload();
        expect(emitted).toBe(true);
    });
});
