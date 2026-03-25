import { AdminPage } from '../../pages/admin.page';

describe('Sidebar Navigation', () => {
  const adminPage = new AdminPage();

  beforeEach(() => {
    cy.login();
  });

  // ─── Menu visibility ─────────────────────────────────────

  it('displays the sidebar with all menu groups', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').within(() => {
      cy.contains('Usuarios').should('exist');
      cy.contains('Gateway').should('exist');
      cy.contains('Aplicaciones').should('exist');
    });
  });

  // ─── Users submenu navigation ─────────────────────────────

  it('navigates to Users page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Usuarios').first().click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Usuarios').click();
    cy.url().should('include', '/admin/users');
  });

  it('navigates to Roles page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Usuarios').first().click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Roles').click();
    cy.url().should('include', '/admin/roles');
  });

  it('navigates to Groups page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Usuarios').first().click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Grupos').click();
    cy.url().should('include', '/admin/groups');
  });

  it('navigates to Permissions page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Usuarios').first().click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Permisos').click();
    cy.url().should('include', '/admin/permissions');
  });

  it('navigates to Scopes page via sidebar (under Users)', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Usuarios').first().click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Ámbitos').first().click();
    cy.url().should('include', '/admin/scopes');
  });

  // ─── Gateway submenu navigation ───────────────────────────

  it('navigates to Gateway Routes page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Gateway').click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Rutas').click();
    cy.url().should('include', '/admin/gateway');
  });

  // ─── Applications submenu navigation ─────────────────────

  it('navigates to OAuth Clients page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Aplicaciones').click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Clientes OAuth').click();
    cy.url().should('include', '/admin/applications/oauthclients');
  });

  it('navigates to Redirect URIs page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Aplicaciones').click();
    cy.get('[data-tour="sidebar"]').contains('a', 'URIs de redirección').click();
    cy.url().should('include', '/admin/applications/redirecturis');
  });

  it('navigates to Grant Types page via sidebar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Aplicaciones').click();
    cy.get('[data-tour="sidebar"]').contains('a', 'Tipos de concesión').click();
    cy.url().should('include', '/admin/applications/granttypes');
  });

  it('navigates to Scopes page via sidebar (under Applications)', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').contains('Aplicaciones').click();
    cy.get('[data-tour="sidebar"] a[href*="/applications/scopes"]').click({ force: true });
    cy.url().should('include', '/admin/applications/scopes');
  });

  // ─── Brand link ───────────────────────────────────────────

  it('navigates to admin dashboard via brand logo', () => {
    cy.visit('/admin/roles');
    cy.url().should('include', '/admin/roles');
    cy.get('[data-tour="sidebar"]').find('a[aria-label="Ir a administración"]').click();
    cy.url().should('include', '/admin');
  });

  // ─── Submenu toggle ───────────────────────────────────────

  it('toggles submenus open and closed', () => {
    adminPage.visit();
    adminPage.assertLoaded();

    // Open Users submenu
    cy.get('[data-tour="sidebar"]').contains('button', 'Usuarios').click();
    cy.get('[data-tour="sidebar"]').find('.sidebar-submenu.is-open').should('exist');

    // Close by clicking again
    cy.get('[data-tour="sidebar"]').contains('button', 'Usuarios').click();
    cy.get('[data-tour="sidebar"]').find('.sidebar-submenu.is-open').should('not.exist');
  });
});
