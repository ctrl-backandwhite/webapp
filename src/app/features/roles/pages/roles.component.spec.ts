import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesComponent } from './roles.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('RolesComponent', () => {
    let component: RolesComponent;
    let fixture: ComponentFixture<RolesComponent>;

    beforeEach(async () => {
        localStorage.clear();

        await TestBed.configureTestingModule({
            imports: [RolesComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RolesComponent);
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

    it('should start with delete dialog closed', () => {
        expect(component.isDeleteOpen()).toBe(false);
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
        it('should set delete target and open dialog', () => {
            const role = { id: 1, name: 'Admin' } as any;
            component.openDelete(role);
            expect(component.isDeleteOpen()).toBe(true);
            expect(component.deleteTarget()).toEqual(role);
        });
    });

    describe('closeDelete', () => {
        it('should close delete dialog and reset target', () => {
            component.openDelete({ id: 1 } as any);
            component.closeDelete();
            expect(component.isDeleteOpen()).toBe(false);
        });
    });

    describe('openDetail', () => {
        it('should set detail role and open sidebar', () => {
            const role = { id: 1, name: 'Admin' } as any;
            component.openDetail(role);
            expect(component.isDetailOpen()).toBe(true);
            expect(component.detailRole()).toEqual(role);
        });
    });

    describe('closeDetail', () => {
        it('should close the detail sidebar', () => {
            component.openDetail({ id: 1 } as any);
            component.closeDetail();
            expect(component.isDetailOpen()).toBe(false);
        });
    });

    it('should have a reactive form with required fields', () => {
        expect(component.roleForm).toBeDefined();
        expect(component.roleForm.get('name')).toBeTruthy();
        expect(component.roleForm.get('uniqueName')).toBeTruthy();
    });
});
