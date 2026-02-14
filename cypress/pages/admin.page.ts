export class AdminPage {
    visit(): void {
        cy.visit('/admin');
    }

    assertLoaded(): void {
        cy.url().should('include', '/admin');
        cy.get('app-navbar').should('exist');
        cy.get('app-sidebar').should('exist');
    }
}
