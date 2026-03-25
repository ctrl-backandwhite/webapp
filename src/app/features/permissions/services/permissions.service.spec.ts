import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PermissionsService } from './permissions.service';
import { environment } from '../../../../environments/environment';

describe('PermissionsService', () => {
    let service: PermissionsService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/permissions`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), PermissionsService],
        });
        service = TestBed.inject(PermissionsService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all permissions', () => {
        service.list().subscribe(p => expect(p.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, name: 'READ' }]);
    });

    it('should list permissions by enabled', () => {
        service.listByEnabled(true).subscribe();
        const req = httpTesting.expectOne(r => r.url === baseUrl && r.params.get('enabled') === 'true');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should create a permission', () => {
        const payload = { name: 'WRITE', uniqueName: 'write', description: '', enabled: true };
        service.create(payload).subscribe();
        httpTesting.expectOne(baseUrl).flush({ id: 2, ...payload });
    });

    it('should delete a permission', () => {
        service.delete(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1`).flush(null);
    });
});
