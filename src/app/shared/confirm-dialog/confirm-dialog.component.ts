import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
    private readonly translate = inject(TranslateService);
    private langSub?: Subscription;

    @Input() open = false;
    @Input() title = '';
    @Input() message = '';
    @Input() confirmLabel = '';
    @Input() cancelLabel = '';
    @Input() busyLabel = '';
    @Input() busy = false;
    @Input() error = '';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    ngOnInit(): void {
        this.applyDefaults();
        this.langSub = this.translate.onLangChange.subscribe(() => this.applyDefaults());
    }

    ngOnDestroy(): void {
        this.langSub?.unsubscribe();
    }

    private applyDefaults(): void {
        if (!this.title) {
            this.title = this.translate.instant('confirm.title');
        }
        if (!this.confirmLabel) {
            this.confirmLabel = this.translate.instant('confirm.delete');
        }
        if (!this.cancelLabel) {
            this.cancelLabel = this.translate.instant('common.cancel');
        }
        if (!this.busyLabel) {
            this.busyLabel = this.translate.instant('confirm.deleting');
        }
    }

    onCancel() {
        if (!this.busy) {
            this.cancel.emit();
        }
    }

    onConfirm() {
        if (!this.busy) {
            this.confirm.emit();
        }
    }
}
