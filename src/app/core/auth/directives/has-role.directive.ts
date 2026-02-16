import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { RoleService } from '../services/role.service';

@Directive({
    selector: '[hasRole]',
    standalone: true
})
export class HasRoleDirective {
    private readonly roleService = inject(RoleService);
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);
    private hasView = false;

    @Input() set hasRole(roles: string | string[]) {
        this.checkRole(roles);
    }

    constructor() {
        // Reaccionar a cambios en los roles del usuario
        effect(() => {
            this.roleService.getRoles(); // Trigger the effect
            this.updateView();
        });
    }

    private rolesInput: string | string[] = [];

    private checkRole(roles: string | string[]): void {
        this.rolesInput = roles;
        this.updateView();
    }

    private updateView(): void {
        const roles = Array.isArray(this.rolesInput) ? this.rolesInput : [this.rolesInput];
        const hasPermission = this.roleService.hasAnyRole(roles);

        if (hasPermission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasPermission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}
