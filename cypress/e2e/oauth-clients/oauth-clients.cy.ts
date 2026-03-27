import { OauthClientsPage } from '../../pages/oauth-clients.page';

describe('OAuth Clients (Clientes OAuth)', () => {
    const page = new OauthClientsPage();
    const uniqueId = () => `CYPRESS_${Date.now()}`;

    beforeEach(() => {
        cy.login();
    });

    // ─── Listing ──────────────────────────────────────────────

    it('loads the OAuth clients page and displays the data table', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();
    });

    // ─── Create ───────────────────────────────────────────────

    it('opens and closes the create OAuth client modal', () => {
        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.assertSecretFieldVisible();
        page.cancelModal();
        page.assertModalClosed();
    });

    it('validates required fields on create', () => {
        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.clearInput('clientId');
        page.assertSubmitDisabled();
        page.cancelModal();
    });

    it('creates a new OAuth client', () => {
        const suffix = uniqueId();
        const clientId = `client_${suffix}`;

        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.fillOauthClientForm({
            clientId,
            clientSecret: 'SecretCypress@123',
        });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(clientId);
    });

    // ─── CRUD lifecycle ───────────────────────────────────────

    it('creates, edits, and deletes an OAuth client', () => {
        const suffix = uniqueId();
        const clientId = `oauth_${suffix}`;

        page.visit();
        page.assertLoaded();

        // Create
        page.openCreateModal();
        page.fillOauthClientForm({ clientId, clientSecret: 'Secret@123' });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(clientId);

        // Edit — secret field hidden
        page.clickEdit(clientId);
        page.assertModalOpen('Editar cliente OAuth');
        page.assertSecretFieldHidden();
        page.cancelModal();

        // Delete
        page.clickDelete(clientId);
        page.assertConfirmDialogOpen('Eliminar cliente OAuth');
        page.confirmAction();
        cy.wait('@delete');
        cy.wait('@list');
        page.assertRowMissing(clientId);
    });

    // ─── Clone ────────────────────────────────────────────────

    it('clones an OAuth client', () => {
        const suffix = uniqueId();
        const clientId = `oauthClone_${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillOauthClientForm({ clientId, clientSecret: 'Clone@123' });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.clickClone(clientId);
        page.assertModalOpen('Crear cliente OAuth');
        page.assertSecretFieldVisible();
        const cloneId = `oauthCloned_${suffix}`;
        page.fillOauthClientForm({ clientId: cloneId, clientSecret: 'Clone@456' });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(cloneId);

        // Cleanup
        page.clickDelete(cloneId);
        page.confirmAction();
        cy.wait('@delete');
        page.clickDelete(clientId);
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

    it('bulk deletes multiple OAuth clients', () => {
        const suffix = uniqueId();
        const client1 = `bulkOAuth1_${suffix}`;
        const client2 = `bulkOAuth2_${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillOauthClientForm({ clientId: client1, clientSecret: 'Bulk@123' });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.openCreateModal();
        page.fillOauthClientForm({ clientId: client2, clientSecret: 'Bulk@456' });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.selectRow(client1);
        page.selectRow(client2);
        page.clickBulkDelete();
        page.assertConfirmDialogOpen('Eliminar clientes OAuth seleccionados');
        page.confirmAction();
        cy.wait('@batchDelete');
        cy.wait('@list');
        page.assertRowMissing(client1);
        page.assertRowMissing(client2);
    });

    // ─── Cancel ───────────────────────────────────────────────

    it('cancels delete dialog without deleting', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();

        page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
            const value = text.trim();
            page.clickDelete(value);
            page.assertConfirmDialogOpen('Eliminar cliente OAuth');
            page.cancelConfirmDialog();
            page.assertRowVisible(value);
        });
    });

    // ─── No Toggle (OAuth clients don't have toggle) ─────────

    it('does not show toggle action on OAuth client rows', () => {
        page.visit();
        page.assertLoaded();
        page.getRows().first().within(() => {
            cy.get('[data-tour="tour-action-toggle"]').should('not.exist');
        });
    });
});
