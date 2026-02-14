import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-detail-sidebar',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './detail-sidebar.component.html'
})
export class DetailSidebarComponent {
    @Input() open = false;
    @Input() title = '';
    @Input() subtitle = '';
    @Input() showFooter = false;

    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
