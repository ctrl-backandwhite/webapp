Cypress.Commands.add('loginWithToken', () => {
  cy.session('auth-session', () => {
    cy.visit('/');
    cy.window().then((win) => {
      const existingToken = win.localStorage.getItem('access_token');
      const accessToken = Cypress.env('accessToken') as string | undefined;
      const refreshToken = Cypress.env('refreshToken') as string | undefined;
      const expiresIn = Number(Cypress.env('expiresIn') ?? 3600);

      if (existingToken) {
        return;
      }

      if (accessToken) {
        const expiresAt = Date.now() + expiresIn * 1000;
        win.localStorage.setItem('access_token', accessToken);
        win.localStorage.setItem('token_expires_at', String(expiresAt));
        win.localStorage.setItem('token_type', 'Bearer');

        if (refreshToken) {
          win.localStorage.setItem('refresh_token', refreshToken);
        }
        return;
      }

      if (Cypress.config('isInteractive')) {
        cy.visit('/admin', { failOnStatusCode: false });
        cy.log('Complete login in the opened browser, then resume.');
        cy.pause();
        return;
      }

      throw new Error('Missing token. Use CYPRESS_accessToken or run cypress:open for manual login.');
    });

    cy.visit('/admin', { failOnStatusCode: false });
    cy.window().then((win) => {
      const token = win.localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Login required. No token found after manual login.');
      }
    });
  }, {
    validate() {
      cy.visit('/');
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'access_token')
        .should('be.a', 'string');
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginWithToken(): Chainable<void>;
    }
  }
}

export { };
