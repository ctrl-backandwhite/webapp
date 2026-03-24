import { BaseCrudPage } from './base-crud.page';

export class GatewayRoutesPage extends BaseCrudPage {
  readonly route = '/admin/gateway';
  readonly apiResource = 'gateway/routes';

  override get apiBase(): string {
    return '**/api/v1';
  }

  /** Gateway routes uses /bulk instead of /batch for batch delete */
  override interceptBatchDelete(): void {
    cy.intercept('DELETE', `${this.apiBase}/${this.apiResource}/bulk`).as('batchDelete');
  }

  override clickCreate(): void {
    cy.get('app-data-table [data-tour="tour-create"]').scrollIntoView().should('be.visible').click();
  }

  openCreateModal(): void {
    this.clickCreate();
    this.assertModalOpen('Crear ruta');
  }

  openEditModal(id: string): void {
    this.clickEdit(id);
    this.assertModalOpen('Editar ruta');
  }

  openDeleteDialog(id: string): void {
    this.clickDelete(id);
    this.assertConfirmDialogOpen('Eliminar ruta');
  }

  fillRouteForm(data: {
    id?: string;
    uri?: string;
    order?: number;
    rateLimitReplenishRate?: number;
    rateLimitBurstCapacity?: number;
    rateLimitRequestedTokens?: number;
  }): void {
    if (data.id !== undefined) {
      this.fillInput('id', data.id);
    }
    if (data.uri !== undefined) {
      this.fillInput('uri', data.uri);
    }
    if (data.order !== undefined) {
      cy.get('.modal-open [formcontrolname="order"]').clear().type(String(data.order));
    }
    if (data.rateLimitReplenishRate !== undefined) {
      cy.get('.modal-open [formcontrolname="rateLimitReplenishRate"]').clear().type(String(data.rateLimitReplenishRate));
    }
    if (data.rateLimitBurstCapacity !== undefined) {
      cy.get('.modal-open [formcontrolname="rateLimitBurstCapacity"]').clear().type(String(data.rateLimitBurstCapacity));
    }
    if (data.rateLimitRequestedTokens !== undefined) {
      cy.get('.modal-open [formcontrolname="rateLimitRequestedTokens"]').clear().type(String(data.rateLimitRequestedTokens));
    }
  }

  addPredicate(value: string): void {
    // Predicates use FormArray with [formControl] (no formcontrolname attribute).
    // resetForm() already adds one empty input, so just fill it.
    cy.get('.modal-open').contains('button', 'Agregar predicado')
      .closest('.dt-field-full')
      .find('input.dt-input')
      .last()
      .clear()
      .type(value);
  }

  addFilter(value: string): void {
    // Filters use FormArray (no formcontrolname attribute). No default input exists, so click 'add' first.
    cy.get('.modal-open').contains('button', 'Agregar filtro').click();
    cy.get('.modal-open').contains('button', 'Agregar filtro')
      .closest('.dt-field-full')
      .find('input.dt-input')
      .last()
      .clear()
      .type(value);
  }

  removePredicate(index: number): void {
    cy.get('.modal-open').contains('button', 'Agregar predicado')
      .closest('.dt-field-full')
      .find('.btn-circle')
      .eq(index)
      .click();
  }

  removeFilter(index: number): void {
    cy.get('.modal-open').contains('button', 'Agregar filtro')
      .closest('.dt-field-full')
      .find('.btn-circle')
      .eq(index)
      .click();
  }

  // ─── Gateway-specific actions ─────────────────────────────

  clickRefreshGateway(): void {
    cy.get('app-data-table').find('[title="Refrescar gateway"]').click();
  }

  interceptRefresh(): void {
    cy.intercept('POST', `${this.apiBase}/${this.apiResource}/refresh`).as('refresh');
  }

  // ─── Bulk Import ──────────────────────────────────────────

  clickBulkImport(): void {
    cy.get('app-data-table').find('[title="Importar JSON"]').click();
  }

  openBulkImportModal(): void {
    this.clickBulkImport();
    cy.get('.modal-open', { timeout: 5000 }).should('exist');
    cy.contains('Importación masiva').should('exist');
  }

  fillBulkImportJson(json: string): void {
    cy.get('.modal-open textarea').clear({ force: true }).type(json, { parseSpecialCharSequences: false, force: true });
  }

  clickLoadTemplate(): void {
    cy.get('.modal-open').contains('button', 'Cargar plantilla').click();
  }

  submitBulkImport(): void {
    cy.get('.modal-open').contains('button', 'Importar').click();
  }

  interceptBulkImport(): void {
    cy.intercept('POST', `${this.apiBase}/${this.apiResource}/bulk`).as('bulkImport');
  }

  // ─── Detail sidebar specifics ─────────────────────────────

  assertPredicateInDetail(predicate: string): void {
    cy.get('.dt-sidebar-open').should('contain.text', predicate);
  }

  assertFilterInDetail(filter: string): void {
    cy.get('.dt-sidebar-open').should('contain.text', filter);
  }

  assertRateLimitInDetail(): void {
    cy.get('.dt-sidebar-open').should('contain.text', 'Límite de tasa');
  }
}
