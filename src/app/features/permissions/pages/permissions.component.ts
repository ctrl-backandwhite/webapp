import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PermissionsService } from '../services/permissions.service';
import { PermissionsReloadService } from '../services/permissions-reload.service';
import { Permission } from '../interfaces/permission.model';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import { AuditInfoComponent } from '../../../shared/audit-info/audit-info.component';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableBulkAction, DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../core/auth/services/role.service';

@Component({
    selector: 'app-permissions',
    standalone: true,
    imports: [CommonModule, DataTableComponent, ReactiveFormsModule, ConfirmDialogComponent, DetailSidebarComponent, AuditInfoComponent, HasRoleDirective, TranslateModule],
    templateUrl: './permissions.component.html',
})
export class PermissionsComponent implements OnInit, OnDestroy {
    private permissionsReloadService = inject(PermissionsReloadService);
    private permissionsService = inject(PermissionsService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private roleService = inject(RoleService);
    private reloadSub?: Subscription;
    private saveSub?: Subscription;
    private uniqueNameSub?: Subscription;
    private langSub?: Subscription;

    reloadToken = signal(0);

    isModalOpen = signal(false);
    isEditMode = signal(false);
    saving = signal(false);
    errorMsg = signal('');
    editingPermissionId = signal<number | null>(null);

    isDeleteOpen = signal(false);
    deleting = signal(false);
    deleteError = signal('');
    deleteTarget = signal<Permission | null>(null);

    isBulkDeleteOpen = signal(false);
    bulkDeleting = signal(false);
    bulkDeleteError = signal('');
    bulkDeleteTargets = signal<Permission[]>([]);

    isDetailOpen = signal(false);
    detailPermission = signal<Permission | null>(null);

    permissionForm = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        uniqueName: ['', [Validators.required]],
        description: [''],
        enabled: [true],
    });

    columnDefs: ColDef<Permission>[] = [];
    rowActions: DataTableAction<Permission>[] = [];
    bulkActions: DataTableBulkAction<Permission>[] = [];

    onEditPermission(row: Permission) {
        this.openEdit(row);
    }

    onDeletePermission(row: Permission) {
        this.openDelete(row);
    }

    onDetailPermission(row: Permission) {
        this.openDetail(row);
    }

    defaultColDef = {
        resizable: true,
        sortable: true,
        filter: true,
        minWidth: 100,
    };

    ngOnInit() {
        this.buildColumnDefs();
        this.buildRowActions();
        this.buildBulkActions();
        this.langSub = this.translate.onLangChange.subscribe(() => {
            this.buildColumnDefs();
            this.buildRowActions();
            this.buildBulkActions();
        });

        this.reloadSub = this.permissionsReloadService.reload$.subscribe(() => {
            this.reloadToken.update(v => v + 1);
        });

        this.uniqueNameSub = this.permissionForm.controls.uniqueName.valueChanges.subscribe((value) => {
            const upper = (value ?? '').toUpperCase();
            if (value !== upper) {
                this.permissionForm.controls.uniqueName.setValue(upper, { emitEvent: false });
            }
        });
    }

    ngOnDestroy(): void {
        this.reloadSub?.unsubscribe();
        this.saveSub?.unsubscribe();
        this.uniqueNameSub?.unsubscribe();
        this.langSub?.unsubscribe();
    }

    openCreate() {
        this.isEditMode.set(false);
        this.editingPermissionId.set(null);
        this.errorMsg.set('');
        this.permissionForm.reset({
            name: '',
            uniqueName: '',
            description: '',
            enabled: true,
        });
        this.isModalOpen.set(true);
    }

    openEdit(permission: Permission) {
        this.isEditMode.set(true);
        this.editingPermissionId.set(permission.id);
        this.errorMsg.set('');
        this.permissionForm.reset({
            name: permission.name ?? '',
            uniqueName: permission.uniqueName ?? '',
            description: permission.description ?? '',
            enabled: permission.enabled ?? true,
        });
        this.isModalOpen.set(true);
    }

    openClone(permission: Permission) {
        this.isEditMode.set(false);
        this.editingPermissionId.set(null);
        this.errorMsg.set('');
        this.permissionForm.reset({
            name: permission.name ?? '',
            uniqueName: '',
            description: permission.description ?? '',
            enabled: permission.enabled ?? true,
        });
        this.isModalOpen.set(true);
    }

    closeModal() {
        if (this.saving()) {
            return;
        }
        this.isModalOpen.set(false);
        this.errorMsg.set('');
    }

    openDelete(permission: Permission) {
        this.deleteTarget.set(permission);
        this.deleteError.set('');
        this.deleting.set(false);
        this.isDeleteOpen.set(true);
    }

    closeDelete() {
        if (this.deleting()) {
            return;
        }
        this.isDeleteOpen.set(false);
        this.deleteError.set('');
        this.deleteTarget.set(null);
    }

    openDetail(permission: Permission) {
        this.detailPermission.set(permission);
        this.isDetailOpen.set(true);
    }

    closeDetail() {
        this.isDetailOpen.set(false);
        this.detailPermission.set(null);
    }

    confirmDelete() {
        const target = this.deleteTarget();
        if (!target) {
            return;
        }

        this.deleting.set(true);
        this.deleteError.set('');
        this.saveSub?.unsubscribe();
        this.saveSub = this.permissionsService.delete(target.id)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.deleting.set(false);
                    this.isDeleteOpen.set(false);
                    this.deleteTarget.set(null);
                    this.permissionsReloadService.triggerReload();
                },
                error: () => {
                    this.deleting.set(false);
                    this.deleteError.set(this.translate.instant('permissions.deleteError'));
                }
            });
    }

    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                field: 'id' as keyof Permission,
                headerName: this.translate.instant('permissions.table.id'),
                minWidth: 80,
                maxWidth: 120
            },
            { field: 'name' as keyof Permission, headerName: this.translate.instant('permissions.table.name'), flex: 1 },
            {
                field: 'uniqueName' as keyof Permission,
                headerName: this.translate.instant('permissions.table.uniqueName'),
                flex: 1
            },
            {
                field: 'description' as keyof Permission,
                headerName: this.translate.instant('permissions.table.description'),
                flex: 2
            },
            {
                field: 'enabled' as keyof Permission,
                headerName: this.translate.instant('permissions.table.active'),
                minWidth: 100,
                maxWidth: 120,
                cellRenderer: (params: { value: boolean }) =>
                    `<span class="inline-block w-3 h-3 rounded-full ${params.value ? 'bg-green-300 ring-2 ring-green-200' : 'bg-red-300 ring-2 ring-red-200'}"></span>`
            }
        ];
    }

    private buildRowActions(): void {
        const isAdmin = this.roleService.isAdmin();

        this.rowActions = [
            {
                id: 'detail',
                label: this.translate.instant('permissions.action.detail'),
                icon: 'fa-solid fa-eye',
                handler: (row) => this.onDetailPermission(row),
                buttonClass: () => 'dt-btn-detail'
            }
        ];

        if (isAdmin) {
            this.rowActions.push(
                {
                    id: 'toggle',
                    label: this.translate.instant('permissions.action.toggle'),
                    icon: 'fa-solid fa-power-off',
                    handler: (row) => this.togglePermission(row),
                    buttonClass: (row) => row.enabled ? 'dt-btn-toggle-active' : 'dt-btn-toggle-inactive'
                },
                {
                    id: 'clone',
                    label: this.translate.instant('permissions.action.clone'),
                    icon: 'fa-solid fa-clone',
                    handler: (row) => this.openClone(row),
                    buttonClass: () => 'dt-btn-clone'
                },
                {
                    id: 'edit',
                    label: this.translate.instant('permissions.action.edit'),
                    icon: 'fa-solid fa-pen',
                    handler: (row) => this.onEditPermission(row),
                    buttonClass: () => 'dt-btn-edit'
                },
                {
                    id: 'delete',
                    label: this.translate.instant('permissions.action.delete'),
                    icon: 'fa-solid fa-trash',
                    handler: (row) => this.onDeletePermission(row),
                    buttonClass: () => 'dt-btn-delete'
                }
            );
        }
    }

    togglePermission(permission: Permission) {
        this.saveSub?.unsubscribe();
        this.saveSub = this.permissionsService.toggle(permission.id)
            .pipe(take(1))
            .subscribe({
                next: () => this.permissionsReloadService.triggerReload(),
                error: () => { },
            });
    }

    submitPermission() {
        if (this.permissionForm.invalid) {
            this.permissionForm.markAllAsTouched();
            return;
        }

        const payload = this.permissionForm.getRawValue();
        this.saving.set(true);
        this.errorMsg.set('');
        this.saveSub?.unsubscribe();

        if (this.isEditMode() && this.editingPermissionId() !== null) {
            this.saveSub = this.permissionsService.update(this.editingPermissionId() as number, payload)
                .pipe(take(1))
                .subscribe({
                    next: () => this.finishSave(),
                    error: () => this.handleSaveError(),
                });
            return;
        }

        this.saveSub = this.permissionsService.create(payload)
            .pipe(take(1))
            .subscribe({
                next: () => this.finishSave(),
                error: () => this.handleSaveError(),
            });
    }

    private finishSave() {
        this.saving.set(false);
        this.isModalOpen.set(false);
        this.permissionsReloadService.triggerReload();
    }

    private handleSaveError() {
        this.saving.set(false);
        this.errorMsg.set(this.translate.instant('permissions.saveError'));
    }

    loadPermissions = (query: DataTableQuery): Observable<DataTableResult<Permission>> => {
        return this.permissionsService.list().pipe(
            map((permissions: Permission[]) => {
                let data = [...permissions];
                data = this.applyFilters(data, query.filterModel);
                data = this.applySort(data, query.sortModel);

                const total = data.length;
                const start = (query.page - 1) * query.pageSize;
                const rows = data.slice(start, start + query.pageSize);

                return { rows, total };
            })
        );
    };

    private applySort(data: Permission[], sortModel: SortModelItem[]): Permission[] {
        if (!sortModel?.length) {
            return data;
        }

        const sorted = [...data];
        sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
        return sorted;
    }

    private applyFilters(data: Permission[], filterModel: Record<string, unknown>): Permission[] {
        const entries = Object.entries(filterModel ?? {});
        if (entries.length === 0) {
            return data;
        }

        return data.filter((row) =>
            entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
        );
    }

    private compareBySortModel(a: Permission, b: Permission, sortModel: SortModelItem[]): number {
        for (const sort of sortModel) {
            if (!sort.colId) {
                continue;
            }
            const aValue = this.getFieldValue(a, sort.colId);
            const bValue = this.getFieldValue(b, sort.colId);
            const comparison = this.compareValues(aValue, bValue);
            if (comparison !== 0) {
                return sort.sort === 'asc' ? comparison : -comparison;
            }
        }
        return 0;
    }

    private matchesFilter(row: Permission, field: string, rawModel: unknown): boolean {
        const model = rawModel as { filterType?: string; type?: string; filter?: unknown };
        const value = this.getFieldValue(row, field);

        if (!model || model.filter === undefined || model.filter === null) {
            return true;
        }

        switch (model.filterType) {
            case 'text':
                return this.matchesTextFilter(value, model);
            case 'number':
                return this.matchesNumberFilter(value, model);
            case 'boolean':
                return Boolean(value) === Boolean(model.filter);
            default:
                return true;
        }
    }

    private matchesTextFilter(value: unknown, model: { type?: string; filter?: unknown }): boolean {
        const filterValue = String(model.filter ?? '').toLowerCase();
        const candidate = String(value ?? '').toLowerCase();
        switch (model.type) {
            case 'equals':
                return candidate === filterValue;
            case 'startsWith':
                return candidate.startsWith(filterValue);
            case 'endsWith':
                return candidate.endsWith(filterValue);
            default:
                return candidate.includes(filterValue);
        }
    }

    private matchesNumberFilter(value: unknown, model: { type?: string; filter?: unknown }): boolean {
        const filterValue = Number(model.filter);
        const candidate = Number(value);
        switch (model.type) {
            case 'equals':
                return candidate === filterValue;
            case 'lessThan':
                return candidate < filterValue;
            case 'greaterThan':
                return candidate > filterValue;
            default:
                return true;
        }
    }

    private compareValues(aValue: unknown, bValue: unknown): number {
        if (aValue === bValue) {
            return 0;
        }
        if (aValue === null || aValue === undefined) {
            return -1;
        }
        if (bValue === null || bValue === undefined) {
            return 1;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue);
        }
        return aValue > bValue ? 1 : -1;
    }

    private getFieldValue(row: Permission, field: string): unknown {
        return (row as unknown as Record<string, unknown>)[field];
    }

    trackByPermissionId = (row: Permission) => String(row.id);

    private buildBulkActions() {
        const isAdmin = this.roleService.isAdmin();
        this.bulkActions = [];
        if (isAdmin) {
            this.bulkActions.push({
                id: 'bulk-delete',
                label: this.translate.instant('permissions.action.bulkDelete'),
                handler: (rows) => this.openBulkDelete(rows),
            });
        }
    }

    openBulkDelete(rows: Permission[]) {
        this.bulkDeleteTargets.set(rows);
        this.bulkDeleteError.set('');
        this.bulkDeleting.set(false);
        this.isBulkDeleteOpen.set(true);
    }

    closeBulkDelete() {
        if (this.bulkDeleting()) return;
        this.isBulkDeleteOpen.set(false);
        this.bulkDeleteError.set('');
        this.bulkDeleteTargets.set([]);
    }

    confirmBulkDelete() {
        const targets = this.bulkDeleteTargets();
        if (!targets.length) return;
        this.bulkDeleting.set(true);
        this.bulkDeleteError.set('');
        this.saveSub?.unsubscribe();
        this.saveSub = this.permissionsService.bulkDelete(targets.map(r => r.id))
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.bulkDeleting.set(false);
                    this.isBulkDeleteOpen.set(false);
                    this.bulkDeleteTargets.set([]);
                    this.permissionsReloadService.triggerReload();
                },
                error: () => {
                    this.bulkDeleting.set(false);
                    this.bulkDeleteError.set(this.translate.instant('permissions.bulkDeleteError'));
                },
            });
    }
}
