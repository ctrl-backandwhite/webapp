import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
    @Input() open = false;
    @Input() title = 'Confirmar';
    @Input() message = '';
    @Input() confirmLabel = 'Eliminar';
    @Input() cancelLabel = 'Cancelar';
    @Input() busy = false;
    @Input() error = '';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

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
