import { RolesPage } from '../../pages/roles.page';

describe('Roles', () => {
  const page = new RolesPage();
  const uniqueId = () => `CYPRESS_${Date.now()}`;

  beforeEach(() => {
    cy.login();
    page.interceptAll();
  });

  // ─── Listing ──────────────────────────────────────────────

  it('loads the roles page and displays the data table', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();
  });

  // ─── Create ───────────────────────────────────────────────

  it('opens and closes the create role modal', () => {
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

  it('creates a new role', () => {
    const suffix = uniqueId();
    const roleName = `Role ${suffix}`;
    const roleUniqueName = `ROLE_${suffix}`;

    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillRoleForm({
      name: roleName,
      uniqueName: roleUniqueName,
      description: 'Created by Cypress',
      enabled: true,
    });
    page.submitForm();

    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(roleName);
  });

  // ─── CRUD lifecycle ───────────────────────────────────────

  it('creates, edits, and deletes a role', () => {
    const suffix = uniqueId();
    const roleName = `Role ${suffix}`;
    const roleUniqueName = `ROLE_${suffix}`;
    const updatedDescription = `Updated ${suffix}`;

    page.visit();
    page.assertLoaded();

    // Create
    page.openCreateModal();
    page.fillRoleForm({
      name: roleName,
      uniqueName: roleUniqueName,
      description: 'Role created by Cypress',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(roleName);

    // Edit
    page.clickEdit(roleName);
    page.assertModalOpen('Editar rol');
    page.fillRoleForm({ description: updatedDescription });
    page.submitForm();
    cy.wait('@update');
    cy.wait('@list');
    page.assertRowVisible(roleName);

    // Delete
    page.clickDelete(roleName);
    page.assertConfirmDialogOpen('Eliminar rol');
    page.confirmAction();
    cy.wait('@delete');
    cy.wait('@list');
    page.assertRowMissing(roleName);
  });

  // ─── Clone ────────────────────────────────────────────────

  it('clones a role and creates a copy', () => {
    const suffix = uniqueId();
    const roleName = `RoleClone ${suffix}`;
    const roleUniqueName = `ROLE_CLONE_${suffix}`;

    page.visit();
    page.assertLoaded();

    // Create original
    page.openCreateModal();
    page.fillRoleForm({
      name: roleName,
      uniqueName: roleUniqueName,
      description: 'Original',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(roleName);

    // Clone
    page.clickClone(roleName);
    page.assertModalOpen('Crear rol');
    const cloneName = `RoleCloned ${suffix}`;
    const cloneUniqueName = `ROLE_CLONED_${suffix}`;
    page.fillRoleForm({ name: cloneName, uniqueName: cloneUniqueName });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(cloneName);

    // Cleanup
    page.clickDelete(cloneName);
    page.confirmAction();
    cy.wait('@delete');
    page.clickDelete(roleName);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Toggle ───────────────────────────────────────────────

  it('toggles a role enabled/disabled', () => {
    const suffix = uniqueId();
    const roleName = `RoleToggle ${suffix}`;
    const roleUniqueName = `ROLE_TOGGLE_${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillRoleForm({
      name: roleName,
      uniqueName: roleUniqueName,
      description: 'Toggle test',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Toggle off
    page.clickToggle(roleName);
    cy.wait('@toggle');
    cy.wait('@list');

    // Toggle on
    page.clickToggle(roleName);
    cy.wait('@toggle');
    cy.wait('@list');

    // Cleanup
    page.clickDelete(roleName);
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

  it('bulk deletes multiple roles', () => {
    const suffix = uniqueId();
    const role1 = `BulkRole1 ${suffix}`;
    const role2 = `BulkRole2 ${suffix}`;

    page.visit();
    page.assertLoaded();

    // Create two roles
    page.openCreateModal();
    page.fillRoleForm({ name: role1, uniqueName: `BULK_ROLE_1_${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.openCreateModal();
    page.fillRoleForm({ name: role2, uniqueName: `BULK_ROLE_2_${suffix}`, enabled: true });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    // Select and bulk delete
    page.selectRow(role1);
    page.selectRow(role2);
    page.clickBulkDelete();
    page.assertConfirmDialogOpen('Eliminar roles seleccionados');
    page.confirmAction();
    cy.wait('@batchDelete');
    cy.wait('@list');
    page.assertRowMissing(role1);
    page.assertRowMissing(role2);
  });

  // ─── Cancel actions ───────────────────────────────────────

  it('cancels delete dialog without deleting', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();

    page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((firstCellText) => {
      const text = firstCellText.trim();
      page.clickDelete(text);
      page.assertConfirmDialogOpen('Eliminar rol');
      page.cancelConfirmDialog();
      page.assertRowVisible(text);
    });
  });
});
