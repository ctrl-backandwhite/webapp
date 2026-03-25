/**
 * Base Page Object for all CRUD modules.
 * Encapsulates common patterns: data-table interaction, modals,
 * confirm dialogs, detail sidebar, row actions, and bulk actions.
 */
export abstract class BaseCrudPage {
  abstract readonly route: string;
  abstract readonly apiResource: string;

  /** Optional: override if the API base differs (e.g. gateway) */
  get apiBase(): string {
    return '**/api/v1';
  }

  // ─── Navigation ───────────────────────────────────────────

  visit(): void {
    cy.visit(this.route);
    // Wait for data-table and initial list, then expand page size to show all rows
    cy.get('app-data-table', { timeout: 15000 }).should('exist');
    cy.wait('@list');
    // Inject a large page size option so ALL rows are visible regardless of dataset size
    cy.get('app-data-table select.select-bordered').then($select => {
      const opt = document.createElement('option');
      opt.value = '200';
      opt.text = '200';
      $select[0].appendChild(opt);
    });
    cy.get('app-data-table select.select-bordered').select('200');
    cy.wait('@list');
  }

  assertLoaded(): void {
    cy.url().should('include', this.route);
    cy.get('app-data-table', { timeout: 10000 }).should('exist');
  }

  // ─── API Intercepts ──────────────────────────────────────

  interceptList(): void {
    cy.intercept('GET', `${this.apiBase}/${this.apiResource}*`).as('list');
  }

  interceptCreate(): void {
    cy.intercept('POST', `${this.apiBase}/${this.apiResource}`).as('create');
  }

  interceptUpdate(): void {
    cy.intercept('PUT', `${this.apiBase}/${this.apiResource}/*`).as('update');
  }

  interceptDelete(): void {
    cy.intercept('DELETE', `${this.apiBase}/${this.apiResource}/*`).as('delete');
  }

  interceptToggle(): void {
    cy.intercept('PATCH', `${this.apiBase}/${this.apiResource}/*/toggle`).as('toggle');
  }

  interceptBatchDelete(): void {
    cy.intercept('DELETE', `${this.apiBase}/${this.apiResource}/batch`).as('batchDelete');
  }

  interceptAll(): void {
    this.interceptList();
    this.interceptCreate();
    this.interceptUpdate();
    this.interceptDelete();
    this.interceptToggle();
    this.interceptBatchDelete();
  }

  // ─── Data Table ───────────────────────────────────────────

  getTable(): Cypress.Chainable {
    return cy.get('ag-grid-angular', { timeout: 10000 });
  }

  getRows(): Cypress.Chainable {
    return cy.get('.ag-center-cols-container .ag-row');
  }

  getRowByText(text: string): Cypress.Chainable {
    // ag-grid virtualises rows — only visible ones are in the DOM.
    // If the text isn't in the current viewport, scroll to the bottom
    // where newly-created items (highest IDs) typically reside.
    cy.get('.ag-center-cols-container').then($c => {
      if (!$c.text().includes(text)) {
        cy.get('.ag-body-viewport').scrollTo('bottom');
      }
    });
    return cy.contains('.ag-center-cols-container .ag-row', text);
  }

  getCellByText(text: string): Cypress.Chainable {
    cy.get('.ag-center-cols-container').then($c => {
      if (!$c.text().includes(text)) {
        cy.get('.ag-body-viewport').scrollTo('bottom');
      }
    });
    return cy.contains('.ag-cell', text);
  }

  assertRowVisible(text: string): void {
    this.getCellByText(text).should('exist');
  }

  assertRowMissing(text: string): void {
    this.getCellByText(text).should('not.exist');
  }

  assertTableNotEmpty(): void {
    cy.get('.ag-row', { timeout: 10000 }).should('have.length.greaterThan', 0);
  }

  assertNoRows(): void {
    cy.get('.ag-row').should('have.length', 0);
  }

  // ─── Row Selection ────────────────────────────────────────

  selectRow(text: string): void {
    this.getRowByText(text)
      .invoke('attr', 'row-id')
      .then((rowId) => {
        cy.get(`.ag-row[row-id="${rowId}"] .ag-selection-checkbox input`)
          .first()
          .click({ force: true });
      });
  }

  selectAllRows(): void {
    cy.get('.ag-header-cell .ag-checkbox-input').first().click({ force: true });
  }

  assertSelectedCount(count: number): void {
    cy.contains(`${count} seleccionados`).should('exist');
  }

  // ─── Create Button ───────────────────────────────────────

  clickCreate(): void {
    cy.get('[data-tour="tour-create"]').click();
  }

  // ─── Modal ────────────────────────────────────────────────

  assertModalOpen(titleContains: string): void {
    cy.get('.modal-open', { timeout: 5000 }).should('exist');
    cy.get('.dt-modal-title').should('contain.text', titleContains);
  }

  assertModalClosed(): void {
    cy.get('.modal-open').should('not.exist');
  }

  submitForm(): void {
    cy.get('.modal-open').find('button[type="submit"]').click();
  }

  cancelModal(): void {
    cy.get('.modal-open').find('button.btn-ghost').contains('Cancelar').click();
  }

  closeModalBackdrop(): void {
    cy.get('.modal-backdrop').click({ force: true });
  }

  // ─── Confirm Dialog ───────────────────────────────────────

  assertConfirmDialogOpen(titleContains: string): void {
    cy.get('app-confirm-dialog .modal-open', { timeout: 5000 }).should('exist');
    cy.get('app-confirm-dialog').should('contain.text', titleContains);
  }

  confirmAction(): void {
    cy.get('app-confirm-dialog .modal-open').find('.dt-btn-outline-danger').click();
  }

  cancelConfirmDialog(): void {
    cy.get('app-confirm-dialog .modal-open').find('.dt-btn-outline').click();
  }

  // ─── Row Actions ──────────────────────────────────────────

  clickRowAction(rowText: string, actionId: string): void {
    this.getRowByText(rowText)
      .invoke('attr', 'row-id')
      .then((rowId) => {
        cy.get(`.ag-pinned-right-cols-container .ag-row[row-id="${rowId}"]`)
          .find(`[data-tour="tour-action-${actionId}"]`)
          .click({ force: true });
      });
  }

  clickDetail(rowText: string): void {
    this.clickRowAction(rowText, 'detail');
  }

  clickEdit(rowText: string): void {
    this.clickRowAction(rowText, 'edit');
  }

  clickDelete(rowText: string): void {
    this.clickRowAction(rowText, 'delete');
  }

  clickToggle(rowText: string): void {
    this.clickRowAction(rowText, 'toggle');
  }

  clickClone(rowText: string): void {
    this.clickRowAction(rowText, 'clone');
  }

  // ─── Bulk Actions ─────────────────────────────────────────

  clickBulkDelete(): void {
    cy.get('app-data-table').contains('button', 'Eliminar seleccionados').click();
  }

  // ─── Detail Sidebar ───────────────────────────────────────

  assertSidebarOpen(): void {
    cy.get('.dt-sidebar-open', { timeout: 5000 }).should('exist');
  }

  assertSidebarClosed(): void {
    cy.get('.dt-sidebar-open').should('not.exist');
  }

  closeSidebar(): void {
    cy.get('.dt-sidebar-open').find('button[aria-label]').first().click();
  }

  assertSidebarContains(text: string): void {
    cy.get('.dt-sidebar-open').should('contain.text', text);
  }

  // ─── Pagination ───────────────────────────────────────────

  getPageInfo(): Cypress.Chainable {
    return cy.get('app-data-table').contains(/\d+ de \d+/);
  }

  clickNextPage(): void {
    cy.get('app-data-table').contains('button', 'Siguiente').click();
  }

  clickPreviousPage(): void {
    cy.get('app-data-table').contains('button', 'Anterior').click();
  }

  changePageSize(size: number): void {
    cy.get('app-data-table select.select-bordered').select(String(size));
  }

  // ─── CSV Export ───────────────────────────────────────────

  clickExportCsv(): void {
    cy.get('app-data-table').find('[title="Exportar CSV"]').click();
  }

  // ─── Column Filtering ─────────────────────────────────────

  openColumnFilter(headerText: string): void {
    cy.contains('.ag-header-cell', headerText).find('.ag-header-cell-menu-button').click({ force: true });
  }

  // ─── Form helpers ─────────────────────────────────────────

  fillInput(formControlName: string, value: string): void {
    cy.get(`.modal-open [formcontrolname="${formControlName}"]`).clear().type(value);
  }

  fillTextarea(formControlName: string, value: string): void {
    cy.get(`.modal-open textarea[formcontrolname="${formControlName}"]`).clear().type(value);
  }

  fillSelect(formControlName: string, value: string): void {
    cy.get(`.modal-open select[formcontrolname="${formControlName}"]`).select(value);
  }

  setToggle(formControlName: string, checked: boolean): void {
    cy.get(`.modal-open [formcontrolname="${formControlName}"]`).then(($el) => {
      const isChecked = ($el[0] as HTMLInputElement).checked;
      if (checked !== isChecked) {
        cy.wrap($el).click({ force: true });
      }
    });
  }

  clearInput(formControlName: string): void {
    cy.get(`.modal-open [formcontrolname="${formControlName}"]`).clear();
  }

  assertFormFieldRequired(formControlName: string): void {
    cy.get(`.modal-open [formcontrolname="${formControlName}"]`).should('have.class', 'ng-invalid');
  }

  assertSubmitDisabled(): void {
    // App uses 'click submit → markAllAsTouched → show errors' pattern
    cy.get('.modal-open button[type="submit"]').click();
    cy.get('.modal-open .dt-error', { timeout: 5000 }).should('have.length.greaterThan', 0);
    cy.get('.modal-open').should('exist');
  }

  assertSubmitEnabled(): void {
    cy.get('.modal-open .dt-error').should('not.exist');
    cy.get('.modal-open button[type="submit"]').should('not.be.disabled');
  }
}
