import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GatewayRoutesComponent } from './gateway-routes.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GatewayRoutesComponent', () => {
    let component: GatewayRoutesComponent;
    let fixture: ComponentFixture<GatewayRoutesComponent>;

    beforeEach(async () => {
        localStorage.clear();
        await TestBed.configureTestingModule({
            imports: [GatewayRoutesComponent, TranslateModule.forRoot()],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(GatewayRoutesComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => localStorage.clear());

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start with modal closed', () => {
        expect(component.isModalOpen()).toBe(false);
    });

    it('should start with detail sidebar closed', () => {
        expect(component.isDetailOpen()).toBe(false);
    });

    describe('openCreate', () => {
        it('should open modal in create mode', () => {
            component.openCreate();
            expect(component.isModalOpen()).toBe(true);
            expect(component.isEditMode()).toBe(false);
        });
    });

    describe('closeModal', () => {
        it('should close the modal', () => {
            component.openCreate();
            component.closeModal();
            expect(component.isModalOpen()).toBe(false);
        });
    });

    describe('openDelete', () => {
        it('should set target and open dialog', () => {
            const route = { id: 'r1', uri: 'http://svc' } as any;
            component.openDelete(route);
            expect(component.isDeleteOpen()).toBe(true);
            expect(component.deleteTarget()).toEqual(route);
        });
    });

    describe('closeDelete', () => {
        it('should close delete dialog', () => {
            component.openDelete({ id: 'r1' } as any);
            component.closeDelete();
            expect(component.isDeleteOpen()).toBe(false);
        });
    });

    describe('openDetail', () => {
        it('should set detail route and open sidebar', () => {
            const route = { id: 'r1', uri: 'http://svc' } as any;
            component.openDetail(route);
            expect(component.isDetailOpen()).toBe(true);
            expect(component.detailRoute()).toEqual(route);
        });
    });

    describe('closeDetail', () => {
        it('should close the detail sidebar', () => {
            component.openDetail({ id: 'r1' } as any);
            component.closeDetail();
            expect(component.isDetailOpen()).toBe(false);
        });
    });
});
