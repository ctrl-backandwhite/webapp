import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OauthClientsService } from './oauth-clients.service';
import { environment } from '../../../../environments/environment';

describe('OauthClientsService', () => {
    let service: OauthClientsService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/oauthclients`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), OauthClientsService],
        });
        service = TestBed.inject(OauthClientsService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all oauth clients', () => {
        service.list().subscribe(c => expect(c.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, clientId: 'app' }]);
    });

    it('should create an oauth client', () => {
        const payload = { clientId: 'new-app' };
        service.create(payload as any).subscribe();
        httpTesting.expectOne(baseUrl).flush({ id: 2, ...payload });
    });

    it('should update an oauth client', () => {
        service.update(1, { clientId: 'updated' } as any).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 1 });
    });

    it('should toggle an oauth client', () => {
        service.toggle(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1/toggle`).flush({ id: 1 });
    });

    it('should delete an oauth client', () => {
        service.delete(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1`).flush(null);
    });

    it('should bulk delete oauth clients', () => {
        service.bulkDelete([1, 2]).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/batch`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
