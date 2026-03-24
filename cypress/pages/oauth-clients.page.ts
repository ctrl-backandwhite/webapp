import { BaseCrudPage } from './base-crud.page';

export class OauthClientsPage extends BaseCrudPage {
    readonly route = '/admin/applications/oauthclients';
    readonly apiResource = 'oauthclients';

    openCreateModal(): void {
        this.clickCreate();
        this.assertModalOpen('Crear cliente OAuth');
    }

    openEditModal(clientId: string): void {
        this.clickEdit(clientId);
        this.assertModalOpen('Editar cliente OAuth');
    }

    openDeleteDialog(clientId: string): void {
        this.clickDelete(clientId);
        this.assertConfirmDialogOpen('Eliminar cliente OAuth');
    }

    fillOauthClientForm(data: {
        clientId?: string;
        clientSecret?: string;
    }): void {
        if (data.clientId !== undefined) {
            this.fillInput('clientId', data.clientId);
        }
        if (data.clientSecret !== undefined) {
            this.fillInput('clientSecret', data.clientSecret);
        }
    }

    assertSecretFieldVisible(): void {
        cy.get('.modal-open [formcontrolname="clientSecret"]').should('exist');
    }

    assertSecretFieldHidden(): void {
        // In edit mode, secret field exists but is empty (optional — existing secret is preserved)
        cy.get('.modal-open [formcontrolname="clientSecret"]')
            .should('exist')
            .should('have.value', '');
    }

    searchAndSelectScope(scopeName: string): void {
        cy.get('.modal-open').contains('label', 'Ámbitos').parent().within(() => {
            cy.get('input[type="text"]').clear().type(scopeName);
            cy.contains('label', scopeName).find('input[type="checkbox"]').check({ force: true });
        });
    }

    searchAndSelectRedirectUri(name: string): void {
        cy.get('.modal-open').contains('label', 'URIs de redirección').parent().within(() => {
            cy.get('input[type="text"]').clear().type(name);
            cy.contains('label', name).find('input[type="checkbox"]').check({ force: true });
        });
    }

    searchAndSelectGrantType(value: string): void {
        cy.get('.modal-open').contains('label', 'Tipos de concesión').parent().within(() => {
            cy.get('input[type="text"]').clear().type(value);
            cy.contains('label', value).find('input[type="checkbox"]').check({ force: true });
        });
    }
}
