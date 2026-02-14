import { AdminPage } from '../../pages/admin.page';

describe('Auth', () => {
  const adminPage = new AdminPage();

  beforeEach(() => {
    cy.visit('/');
    cy.loginWithToken();
  });

  it('allows access to admin when token exists', () => {
    adminPage.visit();
    adminPage.assertLoaded();
  });
});
