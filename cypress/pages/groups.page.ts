import { BaseCrudPage } from './base-crud.page';

export class GroupsPage extends BaseCrudPage {
    readonly route = '/admin/groups';
    readonly apiResource = 'groups';

    openCreateModal(): void {
        this.clickCreate();
        this.assertModalOpen('Crear grupo');
    }

    openEditModal(name: string): void {
        this.clickEdit(name);
        this.assertModalOpen('Editar grupo');
    }

    openDeleteDialog(name: string): void {
        this.clickDelete(name);
        this.assertConfirmDialogOpen('Eliminar grupo');
    }

    fillGroupForm(data: {
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

    searchAndSelectRole(roleName: string): void {
        cy.get('.modal-open').contains('label', 'Roles').parent().within(() => {
            cy.get('input[type="text"]').clear().type(roleName);
            cy.contains('label', roleName).find('input[type="checkbox"]').check({ force: true });
        });
    }

    searchAndSelectPermission(permissionName: string): void {
        cy.get('.modal-open').contains('label', 'Permisos').parent().within(() => {
            cy.get('input[type="text"]').clear().type(permissionName);
            cy.contains('label', permissionName).find('input[type="checkbox"]').check({ force: true });
        });
    }
}
