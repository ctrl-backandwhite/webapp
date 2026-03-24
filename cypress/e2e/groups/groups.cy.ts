import { GroupsPage } from '../../pages/groups.page';

describe('Groups (Grupos)', () => {
    const page = new GroupsPage();
    const uniqueId = () => `CYPRESS_${Date.now()}`;

    beforeEach(() => {
        cy.login();
        page.interceptAll();
    });

    // ─── Listing ──────────────────────────────────────────────

    it('loads the groups page and displays the data table', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();
    });

    // ─── Create ───────────────────────────────────────────────

    it('opens and closes the create group modal', () => {
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
        page.clearInput('uniqueName');
        page.assertSubmitDisabled();
        page.cancelModal();
    });

    it('creates a new group', () => {
        const suffix = uniqueId();
        const name = `Group ${suffix}`;
        const uniqueName = `GROUP_${suffix}`;

        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.fillGroupForm({
            name,
            uniqueName,
            description: 'Created by Cypress',
            enabled: true,
        });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(name);

        // Cleanup
        page.clickDelete(name);
        page.confirmAction();
        cy.wait('@delete');
    });

    // ─── CRUD lifecycle ───────────────────────────────────────

    it('creates, edits, and deletes a group', () => {
        const suffix = uniqueId();
        const name = `Grp ${suffix}`;
        const uniqueName = `GRP_${suffix}`;

        page.visit();
        page.assertLoaded();

        // Create
        page.openCreateModal();
        page.fillGroupForm({ name, uniqueName, description: 'Original', enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');
        page.assertRowVisible(name);

        // Edit
        page.clickEdit(name);
        page.assertModalOpen('Editar grupo');
        page.fillGroupForm({ description: `Updated ${suffix}` });
        page.submitForm();
        cy.wait('@update');
        cy.wait('@list');
        page.assertRowVisible(name);

        // Delete
        page.clickDelete(name);
        page.assertConfirmDialogOpen('Eliminar grupo');
        page.confirmAction();
        cy.wait('@delete');
        cy.wait('@list');
        page.assertRowMissing(name);
    });

    // ─── Clone ────────────────────────────────────────────────

    it('clones a group', () => {
        const suffix = uniqueId();
        const name = `GrpClone ${suffix}`;
        const uniqueName = `GRP_CLONE_${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillGroupForm({ name, uniqueName, description: 'Original', enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.clickClone(name);
        page.assertModalOpen('Crear grupo');
        const cloneName = `GrpCloned ${suffix}`;
        page.fillGroupForm({ name: cloneName, uniqueName: `GRP_CLONED_${suffix}` });
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

    it('toggles a group enabled/disabled', () => {
        const suffix = uniqueId();
        const name = `GrpToggle ${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillGroupForm({ name, uniqueName: `GRP_TGL_${suffix}`, enabled: true });
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

    it('opens the detail sidebar and shows nested entities', () => {
        page.visit();
        page.assertLoaded();
        page.getRows().first().click();
        page.assertSidebarOpen();
        page.assertSidebarContains('Detalle');
        page.closeSidebar();
        page.assertSidebarClosed();
    });

    // ─── Bulk Delete ──────────────────────────────────────────

    it('bulk deletes multiple groups', () => {
        const suffix = uniqueId();
        const grp1 = `BulkGrp1 ${suffix}`;
        const grp2 = `BulkGrp2 ${suffix}`;

        page.visit();
        page.assertLoaded();

        page.openCreateModal();
        page.fillGroupForm({ name: grp1, uniqueName: `BULK_G1_${suffix}`, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.openCreateModal();
        page.fillGroupForm({ name: grp2, uniqueName: `BULK_G2_${suffix}`, enabled: true });
        page.submitForm();
        cy.wait('@create');
        cy.wait('@list');

        page.selectRow(grp1);
        page.selectRow(grp2);
        page.clickBulkDelete();
        page.assertConfirmDialogOpen('Eliminar grupos seleccionados');
        page.confirmAction();
        cy.wait('@batchDelete');
        cy.wait('@list');
        page.assertRowMissing(grp1);
        page.assertRowMissing(grp2);
    });

    // ─── Cancel ───────────────────────────────────────────────

    it('cancels delete dialog without deleting', () => {
        page.visit();
        page.assertLoaded();
        page.assertTableNotEmpty();

        page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
            const name = text.trim();
            page.clickDelete(name);
            page.assertConfirmDialogOpen('Eliminar grupo');
            page.cancelConfirmDialog();
            page.assertRowVisible(name);
        });
    });

    // ─── Unique name auto-uppercase ───────────────────────────

    it('auto-uppercases the uniqueName field', () => {
        page.visit();
        page.assertLoaded();
        page.openCreateModal();
        page.fillInput('uniqueName', 'test_group');
        cy.get('.modal-open [formcontrolname="uniqueName"]').should('have.value', 'TEST_GROUP');
        page.cancelModal();
    });
});
