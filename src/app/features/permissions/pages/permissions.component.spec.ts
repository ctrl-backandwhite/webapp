import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsComponent } from './permissions.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PermissionsComponent', () => {
    let component: PermissionsComponent;
    let fixture: ComponentFixture<PermissionsComponent>;

    beforeEach(async () => {
        localStorage.clear();
        await TestBed.configureTestingModule({
            imports: [PermissionsComponent, TranslateModule.forRoot()],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(PermissionsComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => localStorage.clear());

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start with modal closed', () => {
        expect(component.isModalOpen()).toBe(false);
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
});
