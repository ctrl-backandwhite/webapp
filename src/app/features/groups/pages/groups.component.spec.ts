import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsComponent } from './groups.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GroupsComponent', () => {
    let component: GroupsComponent;
    let fixture: ComponentFixture<GroupsComponent>;

    beforeEach(async () => {
        localStorage.clear();
        await TestBed.configureTestingModule({
            imports: [GroupsComponent, TranslateModule.forRoot()],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();

        fixture = TestBed.createComponent(GroupsComponent);
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

    describe('openDelete', () => {
        it('should open delete dialog', () => {
            const group = { id: 1, name: 'Admins' } as any;
            component.openDelete(group);
            expect(component.isDeleteOpen()).toBe(true);
            expect(component.deleteTarget()).toEqual(group);
        });
    });
});
