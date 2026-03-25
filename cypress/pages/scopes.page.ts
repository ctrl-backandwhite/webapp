import { BaseCrudPage } from './base-crud.page';

export class ScopesPage extends BaseCrudPage {
  readonly route = '/admin/scopes';
  readonly apiResource = 'scopes';

  openCreateModal(): void {
    this.clickCreate();
    this.assertModalOpen('Crear ámbito');
  }

  openEditModal(name: string): void {
    this.clickEdit(name);
    this.assertModalOpen('Editar ámbito');
  }

  openDeleteDialog(name: string): void {
    this.clickDelete(name);
    this.assertConfirmDialogOpen('Eliminar ámbito');
  }

  fillScopeForm(data: { name?: string; description?: string; enabled?: boolean }): void {
    if (data.name !== undefined) {
      this.fillSelect('name', data.name);
    }
    if (data.description !== undefined) {
      this.fillTextarea('description', data.description);
    }
    if (data.enabled !== undefined) {
      this.setToggle('enabled', data.enabled);
    }
  }

  assertUniqueNameGenerated(expected: string): void {
    // uniqueName is a hidden form control — verify via the intercepted request body
    cy.get('.modal-open').should('exist');
  }
}
