import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScopesComponent } from './scopes.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ScopesComponent', () => {
    let component: ScopesComponent;
    let fixture: ComponentFixture<ScopesComponent>;

    beforeEach(async () => {
        localStorage.clear();
        await TestBed.configureTestingModule({
            imports: [ScopesComponent, TranslateModule.forRoot()],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(ScopesComponent);
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
            const item = { id: 1, name: 'openid' } as any;
            component.openDelete(item);
            expect(component.isDeleteOpen()).toBe(true);
            expect(component.deleteTarget()).toEqual(item);
        });
    });

    describe('closeDelete', () => {
        it('should close delete dialog', () => {
            component.openDelete({ id: 1 } as any);
            component.closeDelete();
            expect(component.isDeleteOpen()).toBe(false);
        });
    });
});
