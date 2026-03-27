import { RedirectUrisPage } from '../../pages/redirect-uris.page';

describe('Redirect URIs (URIs de redirección)', () => {
    const page = new RedirectUrisPage();
    const uniqueId = () => `CYPRESS_${Date.now()}`;

    beforeEach(() => {
        cy.login();
    });

    // ─── Listing ──────────────────────────────────────────────

    it('loads the redirect URIs page and displays the data table', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();
    });

    // ─── Create ───────────────────────────────────────────────

    it('opens and closes the create redirect URI modal', () => {
        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.cancelModal();
        page.assertModalClosed();
    });

    it('validates required fields on create', () => {
        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.clearInput('name');
        page.clearInput('value');
        page.assertSubmitDisabled();
        page.cancelModal();
    });

    it('creates a new redirect URI', () => {
        const suffix = uniqueId();
        const name = `RedirectURI ${suffix}`;
        const value = `http://localhost:${suffix}/callback`;

        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.fillRedirectUriForm({ name, value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(name);
    });

    // ─── CRUD lifecycle ───────────────────────────────────────

    it('creates, edits, and deletes a redirect URI', () => {
        const suffix = uniqueId();
        const name = `URI ${suffix}`;
        const value = `http://test.com/${suffix}`;

        page.visit();
        page.assertLoaded();

        // Create
        page.openCreateModal();
        page.fillRedirectUriForm({ name, value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(name);

        // Edit
        page.clickEdit(name);
        page.assertModalOpen('Editar URI de redirección');
        page.fillRedirectUriForm({ value: `http://updated.com/${suffix}` });
        page.submitForm();
        cy.wait('@update');
        cy.wait('@list');
        page.assertRowVisible(name);

        // Delete
        page.clickDelete(name);
        page.assertConfirmDialogOpen('Eliminar URI de redirección');
        page.confirmAction();
        cy.wait('@delete');
        cy.wait('@list');
        page.assertRowMissing(name);
    });

    // ─── Clone ────────────────────────────────────────────────

    it('clones a redirect URI', () => {
        const suffix = uniqueId();
        const name = `URIClone ${suffix}`;
        const value = `http://clone.com/${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillRedirectUriForm({ name, value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.clickClone(name);
        page.assertModalOpen('Crear URI de redirección');
        const cloneName = `URICloned ${suffix}`;
        page.fillRedirectUriForm({ name: cloneName, value: `http://cloned.com/${suffix}` });
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

    it('toggles a redirect URI enabled/disabled', () => {
        const suffix = uniqueId();
        const name = `URIToggle ${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillRedirectUriForm({ name, value: `http://toggle.com/${suffix}`, enabled: true });
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

    it('opens the detail sidebar on row click', () => {
        page.visit();
        page.assertLoaded();
        page.getRows().first().click();
        page.assertSidebarOpen();
        page.assertSidebarContains('Detalle');
        page.closeSidebar();
        page.assertSidebarClosed();
    });

    // ─── Bulk Delete ──────────────────────────────────────────

    it('bulk deletes multiple redirect URIs', () => {
        const suffix = uniqueId();
        const uri1 = `BulkURI1 ${suffix}`;
        const uri2 = `BulkURI2 ${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillRedirectUriForm({ name: uri1, value: `http://bulk1.com/${suffix}`, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.openCreateModal();
        page.fillRedirectUriForm({ name: uri2, value: `http://bulk2.com/${suffix}`, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.selectRow(uri1);
        page.selectRow(uri2);
        page.clickBulkDelete();
        page.assertConfirmDialogOpen('Eliminar URIs de redirección seleccionadas');
        page.confirmAction();
        cy.wait('@batchDelete');
        cy.wait('@list');
        page.assertRowMissing(uri1);
        page.assertRowMissing(uri2);
    });

    // ─── Cancel ───────────────────────────────────────────────

    it('cancels delete dialog without deleting', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();

        page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
            const name = text.trim();
            page.clickDelete(name);
            page.assertConfirmDialogOpen('Eliminar URI de redirección');
            page.cancelConfirmDialog();
            page.assertRowVisible(name);
        });
    });
});
