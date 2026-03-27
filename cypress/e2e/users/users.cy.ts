import { UsersPage } from '../../pages/users.page';

describe('Users (Usuarios)', () => {
  const page = new UsersPage();
  const uniqueId = () => `CYPRESS_${Date.now()}`;

  beforeEach(() => {
    cy.login();
  });

  // ─── Listing ──────────────────────────────────────────────

  it('loads the users page and displays the data table', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();
  });

  // ─── Create ───────────────────────────────────────────────

  it('opens and closes the create user modal', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.assertPasswordFieldsVisible();
    page.cancelModal();
    page.assertModalClosed();
  });

  it('validates required fields on create', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.clearInput('name');
    page.assertSubmitDisabled();
    page.cancelModal();
  });

  it('creates a new user with all fields', () => {
    const suffix = uniqueId();
    const name = `User ${suffix}`;

    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillUserForm({
      name,
      lastName: `Last ${suffix}`,
      nickName: `nick_${suffix}`,
      email: `cypress_${suffix}@test.com`,
      password: 'Cypress@123',
      confirmPassword: 'Cypress@123',
      enabled: true,
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(name);

    // Cleanup
    page.clickDelete(name);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Password validation ─────────────────────────────────

  it('shows password match indicator when passwords match', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillUserForm({
      name: 'Test',
      lastName: 'User',
      nickName: 'testuser',
      email: 'test@test.com',
      password: 'Match@123',
      confirmPassword: 'Match@123',
    });
    page.assertPasswordMatch();
    page.cancelModal();
  });

  it('shows password mismatch indicator', () => {
    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillUserForm({
      password: 'Pass@123',
      confirmPassword: 'Different@456',
    });
    page.assertPasswordMismatch();
    page.cancelModal();
  });

  // ─── Edit (password fields hidden) ────────────────────────

  it('hides password fields in edit mode', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();

    page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
      const name = text.trim();
      page.clickEdit(name);
      page.assertModalOpen('Editar usuario');
      page.assertPasswordFieldsHidden();
      page.cancelModal();
    });
  });

  // ─── CRUD lifecycle ───────────────────────────────────────

  it('creates, edits, and deletes a user', () => {
    const suffix = uniqueId();
    const name = `CypUser ${suffix}`;

    page.visit();
    page.assertLoaded();

    // Create
    page.openCreateModal();
    page.fillUserForm({
      name,
      lastName: `Last ${suffix}`,
      nickName: `nick_${suffix}`,
      email: `cy_${suffix}@test.com`,
      password: 'Test@12345',
      confirmPassword: 'Test@12345',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(name);

    // Edit
    page.clickEdit(name);
    page.assertModalOpen('Editar usuario');
    page.fillUserForm({ lastName: `Updated ${suffix}` });
    page.submitForm();
    cy.wait('@update');
    cy.wait('@list');
    page.assertRowVisible(name);

    // Delete
    page.clickDelete(name);
    page.assertConfirmDialogOpen('Eliminar usuario');
    page.confirmAction();
    cy.wait('@delete');
    cy.wait('@list');
    page.assertRowMissing(name);
  });

  // ─── Clone ────────────────────────────────────────────────

  it('clones a user', () => {
    const suffix = uniqueId();
    const name = `UsrClone ${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillUserForm({
      name,
      lastName: 'Clone',
      nickName: `clone_${suffix}`,
      email: `clone_${suffix}@test.com`,
      password: 'Clone@123',
      confirmPassword: 'Clone@123',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.clickClone(name);
    page.assertModalOpen('Crear usuario');
    page.assertPasswordFieldsVisible();
    const cloneName = `UsrCloned ${suffix}`;
    page.fillUserForm({
      name: cloneName,
      nickName: `cloned_${suffix}`,
      email: `cloned_${suffix}@test.com`,
      password: 'Clone@456',
      confirmPassword: 'Clone@456',
    });
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

  it('toggles a user enabled/disabled', () => {
    const suffix = uniqueId();
    const name = `UsrToggle ${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillUserForm({
      name,
      lastName: 'Toggle',
      nickName: `toggle_${suffix}`,
      email: `toggle_${suffix}@test.com`,
      password: 'Toggle@123',
      confirmPassword: 'Toggle@123',
      enabled: true,
    });
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

  it('opens the detail sidebar with nested entities', () => {
    page.visit();
    page.assertLoaded();
    page.getRows().first().click();
    page.assertSidebarOpen();
    page.assertSidebarContains('Detalle');
    page.closeSidebar();
    page.assertSidebarClosed();
  });

  // ─── Bulk Delete ──────────────────────────────────────────

  it('bulk deletes multiple users', () => {
    const suffix = uniqueId();
    const user1 = `BulkUsr1 ${suffix}`;
    const user2 = `BulkUsr2 ${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillUserForm({
      name: user1,
      lastName: 'Bulk1',
      nickName: `bulk1_${suffix}`,
      email: `bulk1_${suffix}@test.com`,
      password: 'Bulk@123',
      confirmPassword: 'Bulk@123',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.openCreateModal();
    page.fillUserForm({
      name: user2,
      lastName: 'Bulk2',
      nickName: `bulk2_${suffix}`,
      email: `bulk2_${suffix}@test.com`,
      password: 'Bulk@456',
      confirmPassword: 'Bulk@456',
      enabled: true,
    });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.selectRow(user1);
    page.selectRow(user2);
    page.clickBulkDelete();
    page.assertConfirmDialogOpen('Eliminar usuarios seleccionados');
    page.confirmAction();
    cy.wait('@batchDelete');
    cy.wait('@list');
    page.assertRowMissing(user1);
    page.assertRowMissing(user2);
  });

  // ─── Cancel ───────────────────────────────────────────────

  it('cancels delete dialog without deleting', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();

    page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
      const name = text.trim();
      page.clickDelete(name);
      page.assertConfirmDialogOpen('Eliminar usuario');
      page.cancelConfirmDialog();
      page.assertRowVisible(name);
    });
  });
});
