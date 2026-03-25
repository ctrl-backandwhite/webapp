import { BaseCrudPage } from './base-crud.page';

export class PermissionsPage extends BaseCrudPage {
    readonly route = '/admin/permissions';
    readonly apiResource = 'permissions';

    openCreateModal(): void {
        this.clickCreate();
        this.assertModalOpen('Crear permiso');
    }

    openEditModal(name: string): void {
        this.clickEdit(name);
        this.assertModalOpen('Editar permiso');
    }

    openDeleteDialog(name: string): void {
        this.clickDelete(name);
        this.assertConfirmDialogOpen('Eliminar permiso');
    }

    fillPermissionForm(data: {
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
}
