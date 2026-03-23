import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GroupsService } from './groups.service';
import { environment } from '../../../../environments/environment';

describe('GroupsService', () => {
    let service: GroupsService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/groups`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), GroupsService],
        });
        service = TestBed.inject(GroupsService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all groups', () => {
        service.list().subscribe(g => expect(g.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, name: 'Admins' }]);
    });

    it('should list groups by enabled', () => {
        service.listByEnabled(true).subscribe();
        const req = httpTesting.expectOne(r => r.url === baseUrl && r.params.get('enabled') === 'true');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should create a group', () => {
        const payload = { name: 'Users', uniqueName: 'users', description: '', enabled: true, roleIds: [], permissionIds: [] };
        service.create(payload).subscribe();
        httpTesting.expectOne(baseUrl).flush({ id: 2, ...payload });
    });

    it('should toggle a group', () => {
        service.toggle(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1/toggle`).flush({ id: 1 });
    });

    it('should bulk delete groups', () => {
        service.bulkDelete([1, 2]).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/batch`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
