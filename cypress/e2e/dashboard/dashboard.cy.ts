import { AdminPage } from '../../pages/admin.page';

describe('Dashboard', () => {
  const adminPage = new AdminPage();

  beforeEach(() => {
    cy.login();
  });

  it('loads the admin layout with sidebar and navbar', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').should('exist');
    cy.get('app-navbar').should('exist');
  });

  it('displays the brand name', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').should('contain.text', 'B&W');
  });

  it('shows sidebar menu items', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.get('[data-tour="sidebar"]').within(() => {
      cy.contains('Usuarios').should('exist');
      cy.contains('Gateway').should('exist');
      cy.contains('Aplicaciones').should('exist');
    });
  });
});
