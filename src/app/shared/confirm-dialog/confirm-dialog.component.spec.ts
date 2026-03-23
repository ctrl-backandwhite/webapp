import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmDialogComponent, TranslateModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default open to false', () => {
        expect(component.open).toBe(false);
    });

    it('should default busy to false', () => {
        expect(component.busy).toBe(false);
    });

    describe('onConfirm', () => {
        it('should emit confirm when not busy', () => {
            const spy = vi.spyOn(component.confirm, 'emit');
            component.busy = false;
            component.onConfirm();
            expect(spy).toHaveBeenCalled();
        });

        it('should not emit confirm when busy', () => {
            const spy = vi.spyOn(component.confirm, 'emit');
            component.busy = true;
            component.onConfirm();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('onCancel', () => {
        it('should emit cancel when not busy', () => {
            const spy = vi.spyOn(component.cancel, 'emit');
            component.busy = false;
            component.onCancel();
            expect(spy).toHaveBeenCalled();
        });

        it('should not emit cancel when busy', () => {
            const spy = vi.spyOn(component.cancel, 'emit');
            component.busy = true;
            component.onCancel();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('should apply default labels on init', () => {
        // After ngOnInit, labels should have translate-fallback values (keys as fallback)
        expect(component.title).toBeDefined();
        expect(component.confirmLabel).toBeDefined();
        expect(component.cancelLabel).toBeDefined();
        expect(component.busyLabel).toBeDefined();
    });
});
