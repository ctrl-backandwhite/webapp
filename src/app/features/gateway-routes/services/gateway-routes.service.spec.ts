import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GatewayRoutesService } from './gateway-routes.service';
import { environment } from '../../../../environments/environment';

describe('GatewayRoutesService', () => {
    let service: GatewayRoutesService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.gatewayApiUrl}/gateway/routes`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), GatewayRoutesService],
        });
        service = TestBed.inject(GatewayRoutesService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all routes', () => {
        service.list().subscribe(r => expect(r.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 'r1', uri: 'http://svc' }]);
    });

    it('should find a route by id', () => {
        service.findById('r1').subscribe(r => expect(r.id).toBe('r1'));
        httpTesting.expectOne(`${baseUrl}/r1`).flush({ id: 'r1' });
    });

    it('should create a route', () => {
        const payload = { id: 'r2', uri: 'http://svc2', predicates: [], filters: [] };
        service.create(payload as any).subscribe();
        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        req.flush({ ...payload });
    });

    it('should update a route', () => {
        service.update('r1', { uri: 'http://updated' } as any).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/r1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 'r1' });
    });

    it('should delete a route', () => {
        service.delete('r1').subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/r1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should toggle a route', () => {
        service.toggle('r1').subscribe();
        httpTesting.expectOne(`${baseUrl}/r1/toggle`).flush({ id: 'r1' });
    });

    it('should refresh routes', () => {
        service.refresh().subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/refresh`);
        expect(req.request.method).toBe('POST');
        req.flush(null);
    });

    it('should bulk import routes', () => {
        const routes = [{ id: 'r3', uri: 'http://svc3' }];
        service.bulkImport(routes as any).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/bulk`);
        expect(req.request.method).toBe('POST');
        req.flush({ imported: 1 });
    });

    it('should bulk delete routes', () => {
        service.bulkDelete(['r1', 'r2']).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/bulk`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ deleted: 2 });
    });
});
