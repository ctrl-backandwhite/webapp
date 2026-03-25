import { GrantTypesPage } from '../../pages/grant-types.page';

describe('Grant Types (Tipos de concesión)', () => {
    const page = new GrantTypesPage();
    const uniqueId = () => `CYPRESS_${Date.now()}`;

    beforeEach(() => {
        cy.login();
        page.interceptAll();
    });

    // ─── Listing ──────────────────────────────────────────────

    it('loads the grant types page and displays the data table', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();
    });

    // ─── Create ───────────────────────────────────────────────

    it('opens and closes the create grant type modal', () => {
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
        page.clearInput('value');
        page.assertSubmitDisabled();
        page.cancelModal();
    });

    it('creates a new grant type', () => {
        const suffix = uniqueId();
        const value = `custom_grant_${suffix}`;

        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.fillGrantTypeForm({ value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(value);
    });

    // ─── CRUD lifecycle ───────────────────────────────────────

    it('creates, edits, and deletes a grant type', () => {
        const suffix = uniqueId();
        const value = `grant_${suffix}`;

        page.visit();
        page.assertLoaded();

        // Create
        page.openCreateModal();
        page.fillGrantTypeForm({ value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(value);

        // Edit
        page.clickEdit(value);
        page.assertModalOpen('Editar tipo de concesión');
        const updatedValue = `grant_upd_${suffix}`;
        page.fillGrantTypeForm({ value: updatedValue });
        page.submitForm();
        cy.wait('@update');
        cy.wait('@list');
        page.assertRowVisible(updatedValue);

        // Delete
        page.clickDelete(updatedValue);
        page.assertConfirmDialogOpen('Eliminar tipo de concesión');
        page.confirmAction();
        cy.wait('@delete');
        cy.wait('@list');
        page.assertRowMissing(updatedValue);
    });

    // ─── Clone ────────────────────────────────────────────────

    it('clones a grant type', () => {
        const suffix = uniqueId();
        const value = `gt_clone_${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillGrantTypeForm({ value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.clickClone(value);
        page.assertModalOpen('Crear tipo de concesión');
        const cloneValue = `gt_cloned_${suffix}`;
        page.fillGrantTypeForm({ value: cloneValue });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(cloneValue);

        // Cleanup
        page.clickDelete(cloneValue);
        page.confirmAction();
        cy.wait('@delete');
        page.clickDelete(value);
        page.confirmAction();
        cy.wait('@delete');
    });

    // ─── Toggle ───────────────────────────────────────────────

    it('toggles a grant type enabled/disabled', () => {
        const suffix = uniqueId();
        const value = `gt_toggle_${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillGrantTypeForm({ value, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.clickToggle(value);
        cy.wait('@toggle');
        cy.wait('@list');

        // Cleanup
        page.clickDelete(value);
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

    it('bulk deletes multiple grant types', () => {
        const suffix = uniqueId();
        const gt1 = `bulk_gt1_${suffix}`;
        const gt2 = `bulk_gt2_${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillGrantTypeForm({ value: gt1, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.openCreateModal();
        page.fillGrantTypeForm({ value: gt2, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.selectRow(gt1);
        page.selectRow(gt2);
        page.clickBulkDelete();
        page.assertConfirmDialogOpen('Eliminar tipos de concesión seleccionados');
        page.confirmAction();
        cy.wait('@batchDelete');
        cy.wait('@list');
        page.assertRowMissing(gt1);
        page.assertRowMissing(gt2);
    });

    // ─── Cancel ───────────────────────────────────────────────

    it('cancels delete dialog without deleting', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();

        page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
            const value = text.trim();
            page.clickDelete(value);
            page.assertConfirmDialogOpen('Eliminar tipo de concesión');
            page.cancelConfirmDialog();
            page.assertRowVisible(value);
        });
    });
});
