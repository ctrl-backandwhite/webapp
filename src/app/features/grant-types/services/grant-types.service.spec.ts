import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GrantTypesService } from './grant-types.service';
import { environment } from '../../../../environments/environment';

describe('GrantTypesService', () => {
    let service: GrantTypesService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/granttypes`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), GrantTypesService],
        });
        service = TestBed.inject(GrantTypesService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all grant types', () => {
        service.list().subscribe(g => expect(g.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, name: 'authorization_code' }]);
    });

    it('should list grant types by enabled', () => {
        service.listByEnabled(true).subscribe();
        const req = httpTesting.expectOne(r => r.url === baseUrl && r.params.get('enabled') === 'true');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should create a grant type', () => {
        const payload = { value: 'client_credentials', enabled: true } as any;
        service.create(payload).subscribe();
        httpTesting.expectOne(baseUrl).flush({ id: 2, ...payload });
    });

    it('should delete a grant type', () => {
        service.delete(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1`).flush(null);
    });
});
