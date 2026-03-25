import { BaseCrudPage } from './base-crud.page';

export class GrantTypesPage extends BaseCrudPage {
    readonly route = '/admin/applications/granttypes';
    readonly apiResource = 'granttypes';

    openCreateModal(): void {
        this.clickCreate();
        this.assertModalOpen('Crear tipo de concesión');
    }

    openEditModal(value: string): void {
        this.clickEdit(value);
        this.assertModalOpen('Editar tipo de concesión');
    }

    openDeleteDialog(value: string): void {
        this.clickDelete(value);
        this.assertConfirmDialogOpen('Eliminar tipo de concesión');
    }

    fillGrantTypeForm(data: { value?: string; enabled?: boolean }): void {
        if (data.value !== undefined) {
            this.fillInput('value', data.value);
        }
        if (data.enabled !== undefined) {
            this.setToggle('enabled', data.enabled);
        }
    }
}
