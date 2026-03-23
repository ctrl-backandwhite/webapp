import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RedirectUrisService } from './redirect-uris.service';
import { environment } from '../../../../environments/environment';

describe('RedirectUrisService', () => {
    let service: RedirectUrisService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/redirecturis`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), RedirectUrisService],
        });
        service = TestBed.inject(RedirectUrisService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all redirect URIs', () => {
        service.list().subscribe(r => expect(r.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, uri: 'http://localhost' }]);
    });

    it('should list redirect URIs by enabled', () => {
        service.listByEnabled(false).subscribe();
        const req = httpTesting.expectOne(r => r.url === baseUrl && r.params.get('enabled') === 'false');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should create a redirect URI', () => {
        const payload = { name: 'test', value: 'http://example.com', enabled: true } as any;
        service.create(payload).subscribe();
        httpTesting.expectOne(baseUrl).flush({ id: 2, ...payload });
    });

    it('should delete a redirect URI', () => {
        service.delete(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1`).flush(null);
    });
});
