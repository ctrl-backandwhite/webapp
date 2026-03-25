import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditInfoComponent } from './audit-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
    template: `<app-audit-info [data]="auditData" />`,
    standalone: true,
    imports: [AuditInfoComponent],
})
class TestHostComponent {
    auditData: any = null;
}

describe('AuditInfoComponent', () => {
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

    it('should not render when data is null', () => {
        expect(fixture.nativeElement.querySelector('.audit-info')).toBeNull();
    });

    it('should render when data is provided', () => {
        const fix = TestBed.createComponent(TestHostComponent);
        fix.componentInstance.auditData = {
            createdAt: '2024-01-01T00:00:00Z',
            createdBy: 'admin',
        };
        fix.detectChanges();
        expect(fix.nativeElement.querySelector('.audit-info')).not.toBeNull();
    });
});
