import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ScopesService } from './scopes.service';
import { environment } from '../../../../environments/environment';

describe('ScopesService', () => {
    let service: ScopesService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/scopes`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), ScopesService],
        });
        service = TestBed.inject(ScopesService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all scopes', () => {
        service.list().subscribe(s => expect(s.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, name: 'openid' }]);
    });

    it('should list scopes by enabled', () => {
        service.listByEnabled(false).subscribe();
        const req = httpTesting.expectOne(r => r.url === baseUrl && r.params.get('enabled') === 'false');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should create a scope', () => {
        const payload = { name: 'profile', uniqueName: 'profile', description: '', enabled: true };
        service.create(payload).subscribe();
        const req = httpTesting.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        req.flush({ id: 2, ...payload });
    });

    it('should toggle a scope', () => {
        service.toggle(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1/toggle`).flush({ id: 1 });
    });

    it('should delete a scope', () => {
        service.delete(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1`).flush(null);
    });
});
