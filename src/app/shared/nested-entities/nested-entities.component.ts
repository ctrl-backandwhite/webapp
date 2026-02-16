import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuditFields } from '../interfaces/audit.model';

export interface NestedEntityWithAudit extends AuditFields {
    id: number;
    name?: string;
    value?: string;
    uniqueName?: string;
}

@Component({
    selector: 'app-nested-entities',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    @if (entities() && entities().length > 0) {
      <div class="nested-entities">
        <h4 class="nested-entities-title">{{ title() }}</h4>
        <div class="nested-entities-list">
          @for (entity of entities(); track entity.id) {
            <details class="nested-entity-item">
              <summary class="nested-entity-summary">
                <i class="fa-solid fa-chevron-right nested-entity-icon"></i>
                <span class="nested-entity-name">{{ getEntityDisplay(entity) }}</span>
              </summary>
              <div class="nested-entity-details">
                @if (entity.createdAt) {
                  <div class="nested-entity-field">
                    <span class="nested-entity-label">{{ 'common.createdAt' | translate }}:</span>
                    <span class="nested-entity-value">{{ entity.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
                  </div>
                }
                @if (entity.createdBy) {
                  <div class="nested-entity-field">
                    <span class="nested-entity-label">{{ 'common.createdBy' | translate }}:</span>
                    <span class="nested-entity-value">{{ entity.createdBy }}</span>
                  </div>
                }
                @if (entity.updatedAt) {
                  <div class="nested-entity-field">
                    <span class="nested-entity-label">{{ 'common.updatedAt' | translate }}:</span>
                    <span class="nested-entity-value">{{ entity.updatedAt | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
                  </div>
                }
                @if (entity.updatedBy) {
                  <div class="nested-entity-field">
                    <span class="nested-entity-label">{{ 'common.updatedBy' | translate }}:</span>
                    <span class="nested-entity-value">{{ entity.updatedBy }}</span>
                  </div>
                }
              </div>
            </details>
          }
        </div>
      </div>
    }
  `,
})
export class NestedEntitiesComponent {
    title = input.required<string>();
    entities = input<NestedEntityWithAudit[]>([]);

    getEntityDisplay(entity: NestedEntityWithAudit): string {
        return entity.name || entity.value || entity.uniqueName || `ID: ${entity.id}`;
    }
}
