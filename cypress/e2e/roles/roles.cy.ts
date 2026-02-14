import { RolesPage } from '../../pages/roles.page';

describe('Roles', () => {
  const rolesPage = new RolesPage();
  const uniqueId = () => `CYPRESS_${Date.now()}`;

  beforeEach(() => {
    cy.visit('/');
    cy.loginWithToken();
  });

  it('opens the create role modal', () => {
    rolesPage.visit();
    rolesPage.assertLoaded();
    rolesPage.openCreateModal();
    rolesPage.closeModal();
  });

  it('creates, edits, and deletes a role', () => {
    const suffix = uniqueId();
    const roleName = `Role ${suffix}`;
    const roleUniqueName = `ROLE_${suffix}`;
    const updatedDescription = `Updated ${suffix}`;

    cy.intercept('POST', '**/roles').as('createRole');
    cy.intercept('PUT', '**/roles/*').as('updateRole');
    cy.intercept('DELETE', '**/roles/*').as('deleteRole');
    cy.intercept('GET', '**/roles').as('loadRoles');

    rolesPage.visit();
    rolesPage.assertLoaded();

    rolesPage.openCreateModal();
    rolesPage.fillRoleForm({
      name: roleName,
      uniqueName: roleUniqueName,
      description: 'Role created by Cypress',
      enabled: true,
    });
    rolesPage.submitForm();

    cy.wait('@createRole');
    cy.wait('@loadRoles');
    rolesPage.assertRoleVisible(roleName);

    rolesPage.openEditModal(roleName);
    rolesPage.fillRoleForm({
      name: roleName,
      uniqueName: roleUniqueName,
      description: updatedDescription,
    });
    rolesPage.submitForm();

    cy.wait('@updateRole');
    cy.wait('@loadRoles');
    rolesPage.assertRoleVisible(roleName);

    rolesPage.openDeleteModal(roleName);
    rolesPage.confirmDelete();

    cy.wait('@deleteRole');
    cy.wait('@loadRoles');
    rolesPage.assertRoleMissing(roleName);
  });
});
