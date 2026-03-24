import { BaseCrudPage } from './base-crud.page';

export class RolesPage extends BaseCrudPage {
  readonly route = '/admin/roles';
  readonly apiResource = 'roles';

  openCreateModal(): void {
    this.clickCreate();
    this.assertModalOpen('Crear rol');
  }

  openEditModal(roleName: string): void {
    this.clickEdit(roleName);
    this.assertModalOpen('Editar rol');
  }

  openDeleteDialog(roleName: string): void {
    this.clickDelete(roleName);
    this.assertConfirmDialogOpen('Eliminar rol');
  }

  closeModal(): void {
    this.cancelModal();
  }

  fillRoleForm(data: {
    name?: string;
    uniqueName?: string;
    description?: string;
    enabled?: boolean;
  }): void {
    if (data.name !== undefined) {
      this.fillInput('name', data.name);
    }
    if (data.uniqueName !== undefined) {
      this.fillInput('uniqueName', data.uniqueName);
    }
    if (data.description !== undefined) {
      this.fillTextarea('description', data.description);
    }
    if (data.enabled !== undefined) {
      this.setToggle('enabled', data.enabled);
    }
  }

  searchAndSelectPermission(permissionName: string): void {
    cy.get('.modal-open').contains('label', 'Permisos').parent().within(() => {
      cy.get('input[type="text"]').clear().type(permissionName);
      cy.contains('label', permissionName).find('input[type="checkbox"]').check({ force: true });
    });
  }

  /** @deprecated Use confirmAction() */
  confirmDelete(): void {
    this.confirmAction();
  }

  /** @deprecated Use assertRowVisible() */
  assertRoleVisible(roleName: string): void {
    this.assertRowVisible(roleName);
  }

  /** @deprecated Use assertRowMissing() */
  assertRoleMissing(roleName: string): void {
    this.assertRowMissing(roleName);
  }
}
