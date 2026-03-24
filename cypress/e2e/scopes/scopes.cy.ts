import { ScopesPage } from '../../pages/scopes.page';

describe('Scopes (Ámbitos)', () => {
  const page = new ScopesPage();
  const uniqueId = () => `CYPRESS_${Date.now()}`;

  beforeEach(() => {
    cy.login();
    page.interceptAll();
  });

  // ─── Listing ──────────────────────────────────────────────

  it('loads the scopes page and displays the data table', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();
  });

  // ─── Create ───────────────────────────────────────────────

  it('opens and closes the create scope modal', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.cancelModal();
    page.assertModalClosed();
  });

  it('creates a new scope with dropdown selection', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillScopeForm({
      name: 'Read',
      description: `Scope created by Cypress ${uniqueId()}`,
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible('Read');
  });

  // ─── Auto-generated uniqueName ────────────────────────────

  it('auto-generates uniqueName from dropdown selection', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillScopeForm({ name: 'Write', description: 'Auto-gen uniqueName test', enabled: true });
    page.submitForm();
    cy.wait('@create').its('request.body').should('have.property', 'uniqueName', 'SCOPE_WRITE');
    cy.wait('@list');
    // Cleanup
    page.clickDelete('Write');
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Edit ─────────────────────────────────────────────────

  it('edits a scope description', () => {
    const suffix = uniqueId();

    page.visit();
    page.assertLoaded();

    // Create scope
    page.openCreateModal();
    page.fillScopeForm({ name: 'Edit', description: `Original ${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Edit
    page.clickEdit('Edit');
    page.assertModalOpen('Editar ámbito');
    page.fillScopeForm({ description: `Updated ${suffix}` });
    page.submitForm();
    cy.wait('@update');
    cy.wait('@list');

    // Cleanup
    page.clickDelete('Edit');
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Clone ────────────────────────────────────────────────

  it('clones a scope', () => {
    page.visit();
    page.assertLoaded();

    // Create
    page.openCreateModal();
    page.fillScopeForm({ name: 'Delete', description: 'Clone source', enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Clone
    page.clickClone('Delete');
    page.assertModalOpen('Crear ámbito');
    page.fillScopeForm({ name: 'Read' });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Cleanup
    page.clickDelete('Delete');
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Toggle ───────────────────────────────────────────────

  it('toggles a scope enabled/disabled', () => {
    page.visit();
    page.assertLoaded();

    // Create
    page.openCreateModal();
    page.fillScopeForm({ name: 'Write', description: 'Toggle test', enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Toggle
    page.clickToggle('Write');
    cy.wait('@toggle');
    cy.wait('@list');

    // Cleanup
    page.clickDelete('Write');
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Delete ───────────────────────────────────────────────

  it('deletes a scope with confirmation', () => {
    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillScopeForm({ name: 'Read', description: 'To be deleted', enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.clickDelete('Read');
    page.assertConfirmDialogOpen('Eliminar ámbito');
    page.confirmAction();
    cy.wait('@delete');
    cy.wait('@list');
  });

  it('cancels delete without removing the scope', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();

    page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
      const name = text.trim();
      page.clickDelete(name);
      page.assertConfirmDialogOpen('Eliminar ámbito');
      page.cancelConfirmDialog();
      page.assertRowVisible(name);
    });
  });

  // ─── Detail Sidebar ──────────────────────────────────────

  it('opens the detail sidebar on row click', () => {
    page.visit();
    page.assertLoaded();
    page.getRows().first().click();
    page.assertSidebarOpen();
    page.assertSidebarContains('Detalle');
    page.closeSidebar();
    page.assertSidebarClosed();
  });

  // ─── Bulk Delete ──────────────────────────────────────────

  it('bulk deletes multiple scopes', () => {
    const suffix = uniqueId();

    page.visit();
    page.assertLoaded();

    // Create two scopes
    page.openCreateModal();
    page.fillScopeForm({ name: 'Read', description: `Bulk 1 ${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.openCreateModal();
    page.fillScopeForm({ name: 'Write', description: `Bulk 2 ${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Select and bulk delete
    page.selectRow('Read');
    page.selectRow('Write');
    page.clickBulkDelete();
    page.assertConfirmDialogOpen('Eliminar ámbitos seleccionados');
    page.confirmAction();
    cy.wait('@batchDelete');
    cy.wait('@list');
  });
});
