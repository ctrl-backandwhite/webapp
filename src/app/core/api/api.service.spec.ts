import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

interface TestEntity {
    id: number;
    name: string;
}

@Injectable()
class TestApiService extends ApiService<TestEntity> {
    protected resource = 'test-entities';
}

describe('ApiService', () => {
    let service: TestApiService;
    let httpMock: HttpTestingController;
    const baseUrl = environment.apiBaseUrl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TestApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(TestApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should list entities', () => {
        const mockData: TestEntity[] = [{ id: 1, name: 'A' }];
        service.list().subscribe((data) => expect(data).toEqual(mockData));
        const req = httpMock.expectOne(`${baseUrl}/test-entities`);
        expect(req.request.method).toBe('GET');
        req.flush(mockData);
    });

    it('should create an entity', () => {
        const payload = { name: 'New' };
        const result: TestEntity = { id: 2, name: 'New' };
        service.create(payload).subscribe((data) => expect(data).toEqual(result));
        const req = httpMock.expectOne(`${baseUrl}/test-entities`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);
        req.flush(result);
    });

    it('should update an entity', () => {
        const payload = { name: 'Updated' };
        const result: TestEntity = { id: 1, name: 'Updated' };
        service.update(1, payload).subscribe((data) => expect(data).toEqual(result));
        const req = httpMock.expectOne(`${baseUrl}/test-entities/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(result);
    });

    it('should toggle an entity', () => {
        const result: TestEntity = { id: 1, name: 'A' };
        service.toggle(1).subscribe((data) => expect(data).toEqual(result));
        const req = httpMock.expectOne(`${baseUrl}/test-entities/1/toggle`);
        expect(req.request.method).toBe('PATCH');
        req.flush(result);
    });

    it('should delete an entity', () => {
        service.delete(1).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/test-entities/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should bulk delete entities', () => {
        const ids = [1, 2, 3];
        service.bulkDelete(ids).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/test-entities/batch`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toEqual(ids);
        req.flush(null);
    });
});
