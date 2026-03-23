import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RolesService } from './roles.service';
import { environment } from '../../../../environments/environment';

describe('RolesService', () => {
    let service: RolesService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/roles`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), RolesService],
        });
        service = TestBed.inject(RolesService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all roles', () => {
        service.list().subscribe(roles => {
            expect(roles.length).toBe(1);
        });
        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, name: 'Admin' }]);
    });

    it('should list roles by enabled status', () => {
        service.listByEnabled(true).subscribe(roles => {
            expect(roles.length).toBe(1);
        });
        const req = httpTesting.expectOne(r => r.url === baseUrl && r.params.get('enabled') === 'true');
        expect(req.request.method).toBe('GET');
        req.flush([{ id: 1, name: 'Admin', enabled: true }]);
    });

    it('should create a role', () => {
        const payload = { name: 'New', uniqueName: 'new', description: '', enabled: true, permissionIds: [] };
        service.create(payload).subscribe(role => {
            expect(role.id).toBe(1);
        });
        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);
        req.flush({ id: 1, ...payload });
    });

    it('should update a role', () => {
        const payload = { name: 'Updated', uniqueName: 'upd', description: '', enabled: true, permissionIds: [] };
        service.update(1, payload).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 1, ...payload });
    });

    it('should toggle a role', () => {
        service.toggle(1).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/1/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ id: 1, enabled: false });
    });

    it('should delete a role', () => {
        service.delete(1).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should bulk delete roles', () => {
        service.bulkDelete([1, 2]).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/batch`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toEqual([1, 2]);
        req.flush(null);
    });
});
