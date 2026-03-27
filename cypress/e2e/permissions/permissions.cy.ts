import { PermissionsPage } from '../../pages/permissions.page';

describe('Permissions (Permisos)', () => {
  const page = new PermissionsPage();
  const uniqueId = () => `CYPRESS_${Date.now()}`;

  beforeEach(() => {
    cy.login();
  });

  // ─── Listing ──────────────────────────────────────────────

  it('loads the permissions page and displays the data table', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();
  });

  // ─── Create ───────────────────────────────────────────────

  it('opens and closes the create permission modal', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.cancelModal();
    page.assertModalClosed();
  });

  it('validates required fields on create', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.clearInput('name');
    page.clearInput('uniqueName');
    page.assertSubmitDisabled();
    page.cancelModal();
  });

  it('creates a new permission', () => {
    const suffix = uniqueId();
    const name = `Permission ${suffix}`;
    const uniqueName = `PERM_${suffix}`;

    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillPermissionForm({
      name,
      uniqueName,
      description: 'Created by Cypress',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(name);
  });

  // ─── CRUD lifecycle ───────────────────────────────────────

  it('creates, edits, and deletes a permission', () => {
    const suffix = uniqueId();
    const name = `Perm ${suffix}`;
    const uniqueName = `PERM_${suffix}`;

    page.visit();
    page.assertLoaded();

    // Create
    page.openCreateModal();
    page.fillPermissionForm({ name, uniqueName, description: 'Original', enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(name);

    // Edit
    page.clickEdit(name);
    page.assertModalOpen('Editar permiso');
    page.fillPermissionForm({ description: `Updated ${suffix}` });
    page.submitForm();
    cy.wait('@update');
    cy.wait('@list');
    page.assertRowVisible(name);

    // Delete
    page.clickDelete(name);
    page.assertConfirmDialogOpen('Eliminar permiso');
    page.confirmAction();
    cy.wait('@delete');
    cy.wait('@list');
    page.assertRowMissing(name);
  });

  // ─── Clone ────────────────────────────────────────────────

  it('clones a permission', () => {
    const suffix = uniqueId();
    const name = `PermClone ${suffix}`;
    const uniqueName = `PERM_CLONE_${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillPermissionForm({ name, uniqueName, description: 'Original', enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.clickClone(name);
    page.assertModalOpen('Crear permiso');
    const cloneName = `PermCloned ${suffix}`;
    const cloneUnique = `PERM_CLONED_${suffix}`;
    page.fillPermissionForm({ name: cloneName, uniqueName: cloneUnique });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(cloneName);

    // Cleanup
    page.clickDelete(cloneName);
    page.confirmAction();
    cy.wait('@delete');
    page.clickDelete(name);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Toggle ───────────────────────────────────────────────

  it('toggles a permission enabled/disabled', () => {
    const suffix = uniqueId();
    const name = `PermToggle ${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillPermissionForm({ name, uniqueName: `PERM_TGL_${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.clickToggle(name);
    cy.wait('@toggle');
    cy.wait('@list');

    // Cleanup
    page.clickDelete(name);
    page.confirmAction();
    cy.wait('@delete');
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

  it('bulk deletes multiple permissions', () => {
    const suffix = uniqueId();
    const perm1 = `BulkPerm1 ${suffix}`;
    const perm2 = `BulkPerm2 ${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillPermissionForm({ name: perm1, uniqueName: `BULK_P1_${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.openCreateModal();
    page.fillPermissionForm({ name: perm2, uniqueName: `BULK_P2_${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.selectRow(perm1);
    page.selectRow(perm2);
    page.clickBulkDelete();
    page.assertConfirmDialogOpen('Eliminar permisos seleccionados');
    page.confirmAction();
    cy.wait('@batchDelete');
    cy.wait('@list');
    page.assertRowMissing(perm1);
    page.assertRowMissing(perm2);
  });

  // ─── Cancel ───────────────────────────────────────────────

  it('cancels delete dialog without deleting', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();

    page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
      const name = text.trim();
      page.clickDelete(name);
      page.assertConfirmDialogOpen('Eliminar permiso');
      page.cancelConfirmDialog();
      page.assertRowVisible(name);
    });
  });

  // ─── Unique name auto-uppercase ───────────────────────────

  it('auto-uppercases the uniqueName field', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillInput('uniqueName', 'test_permission');
    cy.get('.modal-open [formcontrolname="uniqueName"]').should('have.value', 'TEST_PERMISSION');
    page.cancelModal();
  });
});
