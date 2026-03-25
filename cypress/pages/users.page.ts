import { BaseCrudPage } from './base-crud.page';

export class UsersPage extends BaseCrudPage {
    readonly route = '/admin/users';
    readonly apiResource = 'users';

    openCreateModal(): void {
        this.clickCreate();
        this.assertModalOpen('Crear usuario');
    }

    openEditModal(name: string): void {
        this.clickEdit(name);
        this.assertModalOpen('Editar usuario');
    }

    openDeleteDialog(name: string): void {
        this.clickDelete(name);
        this.assertConfirmDialogOpen('Eliminar usuario');
    }

    fillUserForm(data: {
        name?: string;
        lastName?: string;
        nickName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        enabled?: boolean;
        accountNonExpired?: boolean;
        accountNonLocked?: boolean;
        credentialsNonExpired?: boolean;
    }): void {
        if (data.name !== undefined) {
            this.fillInput('name', data.name);
        }
        if (data.lastName !== undefined) {
            this.fillInput('lastName', data.lastName);
        }
        if (data.nickName !== undefined) {
            this.fillInput('nickName', data.nickName);
        }
        if (data.email !== undefined) {
            this.fillInput('email', data.email);
        }
        if (data.password !== undefined) {
            this.fillInput('password', data.password);
        }
        if (data.confirmPassword !== undefined) {
            this.fillInput('confirmPassword', data.confirmPassword);
        }
        if (data.enabled !== undefined) {
            this.setToggle('enabled', data.enabled);
        }
        if (data.accountNonExpired !== undefined) {
            this.setToggle('accountNonExpired', data.accountNonExpired);
        }
        if (data.accountNonLocked !== undefined) {
            this.setToggle('accountNonLocked', data.accountNonLocked);
        }
        if (data.credentialsNonExpired !== undefined) {
            this.setToggle('credentialsNonExpired', data.credentialsNonExpired);
        }
    }

    assertPasswordFieldsVisible(): void {
        cy.get('.modal-open [formcontrolname="password"]').should('exist');
        cy.get('.modal-open [formcontrolname="confirmPassword"]').should('exist');
    }

    assertPasswordFieldsHidden(): void {
        cy.get('.modal-open [formcontrolname="password"]').should('not.exist');
        cy.get('.modal-open [formcontrolname="confirmPassword"]').should('not.exist');
    }

    assertPasswordMatch(): void {
        cy.get('.modal-open').find('.dt-input-valid').should('exist');
    }

    assertPasswordMismatch(): void {
        cy.get('.modal-open').find('.dt-input-invalid').should('exist');
    }

    searchAndSelectRole(roleName: string): void {
        cy.get('.modal-open').contains('label', 'Roles').parent().within(() => {
            cy.get('input[type="text"]').clear().type(roleName);
            cy.contains('label', roleName).find('input[type="checkbox"]').check({ force: true });
        });
    }

    searchAndSelectGroup(groupName: string): void {
        cy.get('.modal-open').contains('label', 'Grupos').parent().within(() => {
            cy.get('input[type="text"]').clear().type(groupName);
            cy.contains('label', groupName).find('input[type="checkbox"]').check({ force: true });
        });
    }

    searchAndSelectScope(scopeName: string): void {
        cy.get('.modal-open').contains('label', 'Ámbitos').parent().within(() => {
            cy.get('input[type="text"]').clear().type(scopeName);
            cy.contains('label', scopeName).find('input[type="checkbox"]').check({ force: true });
        });
    }
}
