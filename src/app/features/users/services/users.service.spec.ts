import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsersService } from './users.service';
import { environment } from '../../../../environments/environment';

describe('UsersService', () => {
    let service: UsersService;
    let httpTesting: HttpTestingController;
    const baseUrl = `${environment.apiBaseUrl}/users`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), UsersService],
        });
        service = TestBed.inject(UsersService);
        httpTesting = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpTesting.verify());

    it('should list all users', () => {
        service.list().subscribe(u => expect(u.length).toBe(1));
        httpTesting.expectOne(baseUrl).flush([{ id: 1, username: 'admin' }]);
    });

    it('should create a user', () => {
        const payload = { username: 'new', email: 'new@test.com', password: 'pass' };
        service.create(payload as any).subscribe();
        httpTesting.expectOne(baseUrl).flush({ id: 2, ...payload });
    });

    it('should update a user', () => {
        service.update(1, { username: 'updated' } as any).subscribe();
        const req = httpTesting.expectOne(`${baseUrl}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush({ id: 1 });
    });

    it('should toggle a user', () => {
        service.toggle(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1/toggle`).flush({ id: 1 });
    });

    it('should delete a user', () => {
        service.delete(1).subscribe();
        httpTesting.expectOne(`${baseUrl}/1`).flush(null);
    });
});
