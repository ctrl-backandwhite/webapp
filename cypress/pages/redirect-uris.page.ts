import { BaseCrudPage } from './base-crud.page';

export class RedirectUrisPage extends BaseCrudPage {
    readonly route = '/admin/applications/redirecturis';
    readonly apiResource = 'redirecturis';

    openCreateModal(): void {
        this.clickCreate();
        this.assertModalOpen('Crear URI de redirección');
    }

    openEditModal(name: string): void {
        this.clickEdit(name);
        this.assertModalOpen('Editar URI de redirección');
    }

    openDeleteDialog(name: string): void {
        this.clickDelete(name);
        this.assertConfirmDialogOpen('Eliminar URI de redirección');
    }

    fillRedirectUriForm(data: {
        name?: string;
        value?: string;
        enabled?: boolean;
    }): void {
        if (data.name !== undefined) {
            this.fillInput('name', data.name);
        }
        if (data.value !== undefined) {
            this.fillInput('value', data.value);
        }
        if (data.enabled !== undefined) {
            this.setToggle('enabled', data.enabled);
        }
    }
}
