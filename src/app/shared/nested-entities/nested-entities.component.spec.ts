import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NestedEntitiesComponent, NestedEntityWithAudit } from './nested-entities.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    template: `<app-nested-entities [title]="title" [entities]="entities" />`,
    standalone: true,
    imports: [NestedEntitiesComponent],
})
class TestHostComponent {
    title = 'Permissions';
    entities: NestedEntityWithAudit[] = [];
}

describe('NestedEntitiesComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, TranslateModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(fixture.nativeElement).toBeTruthy();
    });

    it('should not render when entities is empty', () => {
        expect(fixture.nativeElement.querySelector('.nested-entities')).toBeNull();
    });

    it('should render entities when provided', () => {
        const fix = TestBed.createComponent(TestHostComponent);
        fix.componentInstance.entities = [{ id: 1, name: 'READ' }];
        fix.detectChanges();
        expect(fix.nativeElement.querySelector('.nested-entities')).not.toBeNull();
        expect(fix.nativeElement.textContent).toContain('READ');
    });

    describe('getEntityDisplay', () => {
        let component: NestedEntitiesComponent;

        beforeEach(() => {
            // Access the child component instance
            component = fixture.debugElement.children[0].componentInstance as NestedEntitiesComponent;
        });

        it('should return name if present', () => {
            expect(component.getEntityDisplay({ id: 1, name: 'Test' })).toBe('Test');
        });

        it('should return value if name is missing', () => {
            expect(component.getEntityDisplay({ id: 1, value: 'val' })).toBe('val');
        });

        it('should return uniqueName if name and value are missing', () => {
            expect(component.getEntityDisplay({ id: 1, uniqueName: 'uname' })).toBe('uname');
        });

        it('should return ID fallback', () => {
            expect(component.getEntityDisplay({ id: 42 })).toBe('ID: 42');
        });
    });
});
