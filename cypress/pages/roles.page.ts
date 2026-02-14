export class RolesPage {
  visit(): void {
    cy.visit('/admin/roles');
  }

  assertLoaded(): void {
    cy.url().should('include', '/admin/roles');
    cy.contains('Roles').should('exist');
  }

  openCreateModal(): void {
    cy.get('button[data-table-actions]').click();
    cy.contains('Crear rol').should('exist');
  }

  openEditModal(roleName: string): void {
    this.getRowByName(roleName).within(() => {
      cy.get('button[title="Editar"]').click();
    });
    cy.contains('Editar rol').should('exist');
  }

  openDeleteModal(roleName: string): void {
    this.getRowByName(roleName).within(() => {
      cy.get('button[title="Eliminar"]').click();
    });
    cy.contains('Eliminar rol').should('exist');
  }

  closeModal(): void {
    cy.contains('Cancelar').click();
  }

  fillRoleForm(data: { name: string; uniqueName: string; description?: string; enabled?: boolean }): void {
    cy.get('input[formcontrolname="name"]').clear().type(data.name);
    cy.get('input[formcontrolname="uniqueName"]').clear().type(data.uniqueName);

    if (data.description !== undefined) {
      cy.get('textarea[formcontrolname="description"]').clear().type(data.description);
    }

    if (data.enabled !== undefined) {
      cy.get('input[formcontrolname="enabled"]').then(($el) => {
        const isChecked = ($el[0] as HTMLInputElement).checked;
        if (data.enabled !== isChecked) {
          cy.wrap($el).click();
        }
      });
    }
  }

  submitForm(): void {
    cy.contains('Guardar').click();
  }

  confirmDelete(): void {
    cy.contains('Eliminar').click();
  }

  assertRoleVisible(roleName: string): void {
    cy.contains('.ag-cell', roleName).should('exist');
  }

  assertRoleMissing(roleName: string): void {
    cy.contains('.ag-cell', roleName).should('not.exist');
  }

  private getRowByName(roleName: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains('.ag-row', roleName);
  }
}
