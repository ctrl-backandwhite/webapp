import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuditFields } from '../interfaces/audit.model';

@Component({
    selector: 'app-audit-info',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    @if (data()) {
      <div class="audit-info">
        <h4 class="audit-info-title">{{ 'common.auditInfo' | translate }}</h4>
        <div class="audit-info-grid">
          @if (data()?.createdAt) {
            <div class="audit-info-item">
              <span class="audit-info-label">{{ 'common.createdAt' | translate }}:</span>
              <span class="audit-info-value">{{ data()?.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
            </div>
          }
          @if (data()?.createdBy) {
            <div class="audit-info-item">
              <span class="audit-info-label">{{ 'common.createdBy' | translate }}:</span>
              <span class="audit-info-value">{{ data()?.createdBy }}</span>
            </div>
          }
          @if (data()?.updatedAt) {
            <div class="audit-info-item">
              <span class="audit-info-label">{{ 'common.updatedAt' | translate }}:</span>
              <span class="audit-info-value">{{ data()?.updatedAt | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
            </div>
          }
          @if (data()?.updatedBy) {
            <div class="audit-info-item">
              <span class="audit-info-label">{{ 'common.updatedBy' | translate }}:</span>
              <span class="audit-info-value">{{ data()?.updatedBy }}</span>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class AuditInfoComponent {
    data = input<AuditFields | null>(null);
}
