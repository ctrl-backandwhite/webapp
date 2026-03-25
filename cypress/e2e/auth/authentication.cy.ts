import { AdminPage } from '../../pages/admin.page';

describe('Authentication', () => {
  const adminPage = new AdminPage();

  beforeEach(() => {
    cy.login();
  });

  it('allows access to admin when token exists', () => {
    adminPage.visit();
    adminPage.assertLoaded();
  });

  it('shows the sidebar navigation', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').should('exist');
  });

  it('shows the navbar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('app-navbar').should('exist');
  });

  it('preserves session across navigation', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.visit('/admin/roles');
    cy.url().should('include', '/admin/roles');
    cy.get('app-navbar').should('exist');
  });
});
