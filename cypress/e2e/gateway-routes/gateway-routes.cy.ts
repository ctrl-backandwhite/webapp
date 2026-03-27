import { GatewayRoutesPage } from '../../pages/gateway-routes.page';

describe('Gateway Routes (Rutas del Gateway)', () => {
  const page = new GatewayRoutesPage();
  const uniqueId = () => `cypress-${Date.now()}`;

  beforeEach(() => {
    cy.login();
  });

  // ─── Listing ──────────────────────────────────────────────

  it('loads the gateway routes page and displays the data table', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();
  });

  // ─── Create ───────────────────────────────────────────────

  it('opens and closes the create route modal', () => {
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
    page.clearInput('id');
    page.clearInput('uri');
    page.assertSubmitDisabled();
    page.cancelModal();
  });

  it('creates a new gateway route with predicates and filters', () => {
    const suffix = uniqueId();
    const routeId = `route-${suffix}`;

    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillRouteForm({
      id: routeId,
      uri: 'http://localhost:8080',
      order: 1,
    });
    page.addPredicate(`Path=/api/v1/${suffix}/**`);
    page.addFilter('StripPrefix=2');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(routeId);

    // Cleanup
    page.clickDelete(routeId);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── CRUD lifecycle ───────────────────────────────────────

  it('creates, edits, and deletes a gateway route', () => {
    const suffix = uniqueId();
    const routeId = `gw-${suffix}`;

    page.visit();
    page.assertLoaded();

    // Create
    page.openCreateModal();
    page.fillRouteForm({ id: routeId, uri: 'http://localhost:8080', order: 1 });
    page.addPredicate('Path=/api/test/**');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(routeId);

    // Edit
    page.clickEdit(routeId);
    page.assertModalOpen('Editar ruta');
    page.fillRouteForm({ uri: 'http://localhost:9090', order: 2 });
    page.submitForm();
    cy.wait('@update');
    cy.wait('@list');
    page.assertRowVisible(routeId);

    // Delete
    page.clickDelete(routeId);
    page.assertConfirmDialogOpen('Eliminar ruta');
    page.confirmAction();
    cy.wait('@delete');
    cy.wait('@list');
    page.assertRowMissing(routeId);
  });

  // ─── Rate Limiting ───────────────────────────────────────

  it('creates a route with rate limiting configuration', () => {
    const suffix = uniqueId();
    const routeId = `gw-rl-${suffix}`;

    page.visit();
    page.assertLoaded();
    page.openCreateModal();
    page.fillRouteForm({
      id: routeId,
      uri: 'http://localhost:8080',
      order: 1,
      rateLimitReplenishRate: 10,
      rateLimitBurstCapacity: 20,
      rateLimitRequestedTokens: 1,
    });
    page.addPredicate('Path=/api/limited/**');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(routeId);

    // Cleanup
    page.clickDelete(routeId);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Clone ────────────────────────────────────────────────

  it('clones a gateway route', () => {
    const suffix = uniqueId();
    const routeId = `gw-clone-${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillRouteForm({ id: routeId, uri: 'http://localhost:8080', order: 1 });
    page.addPredicate('Path=/api/clone/**');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.clickClone(routeId);
    page.assertModalOpen('Crear ruta');
    const cloneId = `gw-cloned-${suffix}`;
    page.fillRouteForm({ id: cloneId });
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');
    page.assertRowVisible(cloneId);

    // Cleanup
    page.clickDelete(cloneId);
    page.confirmAction();
    cy.wait('@delete');
    page.clickDelete(routeId);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Toggle ───────────────────────────────────────────────

  it('toggles a gateway route enabled/disabled', () => {
    const suffix = uniqueId();
    const routeId = `gw-toggle-${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillRouteForm({ id: routeId, uri: 'http://localhost:8080', order: 1 });
    page.addPredicate('Path=/api/toggle/**');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.clickToggle(routeId);
    cy.wait('@toggle');
    cy.wait('@list');

    // Cleanup
    page.clickDelete(routeId);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Detail Sidebar ──────────────────────────────────────

  it('opens the detail sidebar with predicates and filters', () => {
    page.visit();
    page.assertLoaded();
    page.getRows().first().click();
    page.assertSidebarOpen();
    page.assertSidebarContains('Detalle de ruta');
    page.closeSidebar();
    page.assertSidebarClosed();
  });

  // ─── Refresh Gateway ──────────────────────────────────────

  it('refreshes the gateway', () => {
    page.visit();
    page.assertLoaded();
    page.clickRefreshGateway();
    cy.wait('@refresh');
  });

  // ─── Bulk Import ──────────────────────────────────────────

  it('opens the bulk import modal', () => {
    page.visit();
    page.assertLoaded();
    page.openBulkImportModal();
    page.cancelModal();
    page.assertModalClosed();
  });

  it('loads the import template', () => {
    page.visit();
    page.assertLoaded();
    page.openBulkImportModal();
    page.clickLoadTemplate();
    cy.get('.modal-open textarea').invoke('val').should('not.be.empty');
    page.cancelModal();
  });

  it('imports routes from JSON', () => {
    const suffix = uniqueId();
    const json = JSON.stringify([
      {
        id: `import-1-${suffix}`,
        uri: 'http://localhost:8080',
        order: 1,
        predicates: ['Path=/api/import1/**'],
        filters: ['StripPrefix=2'],
      },
    ]);

    page.visit();
    page.assertLoaded();
    page.openBulkImportModal();
    page.fillBulkImportJson(json);
    page.submitBulkImport();
    cy.wait('@bulkImport');
    cy.wait('@list');

    // Cleanup
    page.clickDelete(`import-1-${suffix}`);
    page.confirmAction();
    cy.wait('@delete');
  });

  // ─── Bulk Delete ──────────────────────────────────────────

  it('bulk deletes multiple gateway routes', () => {
    const suffix = uniqueId();
    const route1 = `bulk-gw1-${suffix}`;
    const route2 = `bulk-gw2-${suffix}`;

    page.visit();
    page.assertLoaded();

    page.openCreateModal();
    page.fillRouteForm({ id: route1, uri: 'http://localhost:8080', order: 1 });
    page.addPredicate('Path=/api/bulk1/**');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.openCreateModal();
    page.fillRouteForm({ id: route2, uri: 'http://localhost:9090', order: 2 });
    page.addPredicate('Path=/api/bulk2/**');
    page.submitForm();
    cy.wait('@create');
    cy.wait('@list');

    page.selectRow(route1);
    page.selectRow(route2);
    page.clickBulkDelete();
    page.assertConfirmDialogOpen('Eliminar rutas seleccionadas');
    page.confirmAction();
    cy.wait('@batchDelete');
    cy.wait('@list');
    page.assertRowMissing(route1);
    page.assertRowMissing(route2);
  });

  // ─── Cancel ───────────────────────────────────────────────

  it('cancels delete dialog without deleting', () => {
    page.visit();
    page.assertLoaded();
    page.assertTableNotEmpty();

    page.getRows().first().find('.ag-cell').eq(1).invoke('text').then((text) => {
      const id = text.trim();
      page.clickDelete(id);
      page.assertConfirmDialogOpen('Eliminar ruta');
      page.cancelConfirmDialog();
      page.assertRowVisible(id);
    });
  });
});
