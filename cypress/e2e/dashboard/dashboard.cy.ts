import { AdminPage } from '../../pages/admin.page';

describe('Dashboard', () => {
  const adminPage = new AdminPage();

  beforeEach(() => {
    cy.visit('/');
    cy.loginWithToken();
  });

  it('loads the admin layout', () => {
    adminPage.visit();
    adminPage.assertLoaded();
    cy.contains('Roles').should('exist');
  });
});
