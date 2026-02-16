import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsService } from '../services/groups.service';
import { GroupsReloadService } from '../services/groups-reload.service';
import { Group, GroupInput } from '../interfaces/group.model';
import { RolesService } from '../../roles/services/roles.service';
import { Role } from '../../roles/interfaces/role.model';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import { AuditInfoComponent } from '../../../shared/audit-info/audit-info.component';
import { NestedEntitiesComponent } from '../../../shared/nested-entities/nested-entities.component';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../core/auth/services/role.service';

@Component({
    selector: 'app-groups',
    standalone: true,
    imports: [CommonModule, DataTableComponent, ReactiveFormsModule, ConfirmDialogComponent, DetailSidebarComponent, AuditInfoComponent, NestedEntitiesComponent, HasRoleDirective, TranslateModule],
    templateUrl: './groups.component.html',
})
export class GroupsComponent implements OnInit, OnDestroy {
    private groupsReloadService = inject(GroupsReloadService);
    private groupsService = inject(GroupsService);
    private rolesService = inject(RolesService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private roleService = inject(RoleService);
    private reloadSub?: Subscription;
    private saveSub?: Subscription;
    private uniqueNameSub?: Subscription;
    private langSub?: Subscription;

    reloadToken = 0;

    isModalOpen = signal(false);
    isEditMode = signal(false);
    saving = signal(false);
    errorMsg = signal('');
    editingGroupId = signal<number | null>(null);

    isDeleteOpen = signal(false);
    deleting = signal(false);
    deleteError = signal('');
    deleteTarget = signal<Group | null>(null);

    isDetailOpen = signal(false);
    detailGroup = signal<Group | null>(null);

    roles = signal<Role[]>([]);
    roleSearch = signal('');

    groupForm = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        uniqueName: ['', [Validators.required]],
        description: [''],
        enabled: [true],
        roleIds: this.fb.nonNullable.control<number[]>([]),
    });

    columnDefs: ColDef<Group>[] = [];
    rowActions: DataTableAction<Group>[] = [];

    onEditGroup(row: Group) {
        this.openEdit(row);
    }

    onDeleteGroup(row: Group) {
        this.openDelete(row);
    }

    onDetailGroup(row: Group) {
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
        this.langSub = this.translate.onLangChange.subscribe(() => {
            this.buildColumnDefs();
            this.buildRowActions();
        });

        this.loadReferenceData();

        this.reloadSub = this.groupsReloadService.reload$.subscribe(() => {
            this.reloadToken += 1;
        });

        this.uniqueNameSub = this.groupForm.controls.uniqueName.valueChanges.subscribe((value) => {
            const upper = (value ?? '').toUpperCase();
            if (value !== upper) {
                this.groupForm.controls.uniqueName.setValue(upper, { emitEvent: false });
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
        this.editingGroupId.set(null);
        this.errorMsg.set('');
        this.groupForm.reset({
            name: '',
            uniqueName: '',
            description: '',
            enabled: true,
            roleIds: [],
        });
        this.isModalOpen.set(true);
    }

    openEdit(group: Group) {
        this.isEditMode.set(true);
        this.editingGroupId.set(group.id);
        this.errorMsg.set('');
        this.groupForm.reset({
            name: group.name ?? '',
            uniqueName: group.uniqueName ?? '',
            description: group.description ?? '',
            enabled: group.enabled ?? true,
            roleIds: this.collectIds(group.roles),
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

    openDelete(group: Group) {
        this.deleteTarget.set(group);
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

    openDetail(group: Group) {
        this.detailGroup.set(group);
        this.isDetailOpen.set(true);
    }

    closeDetail() {
        this.isDetailOpen.set(false);
        this.detailGroup.set(null);
    }

    confirmDelete() {
        const target = this.deleteTarget();
        if (!target) {
            return;
        }

        this.deleting.set(true);
        this.deleteError.set('');
        this.saveSub?.unsubscribe();
        this.saveSub = this.groupsService.delete(target.id)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.deleting.set(false);
                    this.isDeleteOpen.set(false);
                    this.deleteTarget.set(null);
                    this.groupsReloadService.triggerReload();
                },
                error: () => {
                    this.deleting.set(false);
                    this.deleteError.set(this.translate.instant('groups.deleteError'));
                }
            });
    }

    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                field: 'id' as keyof Group,
                headerName: this.translate.instant('groups.table.id'),
                minWidth: 80,
                maxWidth: 120
            },
            { field: 'name' as keyof Group, headerName: this.translate.instant('groups.table.name'), flex: 1 },
            {
                field: 'uniqueName' as keyof Group,
                headerName: this.translate.instant('groups.table.uniqueName'),
                flex: 1
            },
            {
                field: 'description' as keyof Group,
                headerName: this.translate.instant('groups.table.description'),
                flex: 2
            },
            {
                field: 'enabled' as keyof Group,
                headerName: this.translate.instant('groups.table.active'),
                minWidth: 100,
                maxWidth: 120,
                cellRenderer: (params: { value: boolean }) =>
                    params.value
                        ? this.translate.instant('common.yes')
                        : this.translate.instant('common.no')
            }
        ];
    }

    private buildRowActions(): void {
        const isAdmin = this.roleService.isAdmin();

        this.rowActions = [
            {
                id: 'detail',
                label: this.translate.instant('groups.action.detail'),
                icon: 'fa-solid fa-eye',
                handler: (row) => this.onDetailGroup(row)
            }
        ];

        if (isAdmin) {
            this.rowActions.push(
                {
                    id: 'edit',
                    label: this.translate.instant('groups.action.edit'),
                    icon: 'fa-solid fa-pen',
                    handler: (row) => this.onEditGroup(row)
                },
                {
                    id: 'delete',
                    label: this.translate.instant('groups.action.delete'),
                    icon: 'fa-solid fa-trash',
                    handler: (row) => this.onDeleteGroup(row)
                }
            );
        }
    }

    submitGroup() {
        if (this.groupForm.invalid) {
            this.groupForm.markAllAsTouched();
            return;
        }

        const payload = this.buildPayload();
        this.saving.set(true);
        this.errorMsg.set('');
        this.saveSub?.unsubscribe();

        if (this.isEditMode() && this.editingGroupId() !== null) {
            this.saveSub = this.groupsService.update(this.editingGroupId() as number, payload)
                .pipe(take(1))
                .subscribe({
                    next: () => this.finishSave(),
                    error: () => this.handleSaveError(),
                });
            return;
        }

        this.saveSub = this.groupsService.create(payload)
            .pipe(take(1))
            .subscribe({
                next: () => this.finishSave(),
                error: () => this.handleSaveError(),
            });
    }

    private buildPayload(): GroupInput {
        const raw = this.groupForm.getRawValue();
        return {
            name: raw.name,
            uniqueName: raw.uniqueName,
            description: raw.description,
            enabled: raw.enabled,
            roleIds: this.uniqueIds(raw.roleIds),
        };
    }

    private finishSave() {
        this.saving.set(false);
        this.isModalOpen.set(false);
        this.groupsReloadService.triggerReload();
    }

    private handleSaveError() {
        this.saving.set(false);
        this.errorMsg.set(this.translate.instant('groups.saveError'));
    }

    loadGroups = (query: DataTableQuery): Observable<DataTableResult<Group>> => {
        return this.groupsService.list().pipe(
            map((groups) => {
                let data = [...groups];
                data = this.applyFilters(data, query.filterModel);
                data = this.applySort(data, query.sortModel);

                const total = data.length;
                const start = (query.page - 1) * query.pageSize;
                const rows = data.slice(start, start + query.pageSize);

                return { rows, total };
            })
        );
    };

    private applySort(data: Group[], sortModel: SortModelItem[]): Group[] {
        if (!sortModel?.length) {
            return data;
        }

        const sorted = [...data];
        sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
        return sorted;
    }

    private applyFilters(data: Group[], filterModel: Record<string, unknown>): Group[] {
        const entries = Object.entries(filterModel ?? {});
        if (entries.length === 0) {
            return data;
        }

        return data.filter((row) =>
            entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
        );
    }

    private compareBySortModel(a: Group, b: Group, sortModel: SortModelItem[]): number {
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

    private matchesFilter(row: Group, field: string, rawModel: unknown): boolean {
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

    private getFieldValue(row: Group, field: string): unknown {
        return (row as unknown as Record<string, unknown>)[field];
    }

    private loadReferenceData(): void {
        this.rolesService.list().pipe(take(1)).subscribe({
            next: (roles: Role[]) => this.roles.set(roles),
            error: () => this.roles.set([]),
        });
    }

    filteredRoles(): Role[] {
        return this.filterByTerm(this.roles(), this.roleSearch());
    }

    toggleRoleSelection(id: number): void {
        const control = this.groupForm.controls.roleIds;
        const current = new Set(control.value ?? []);
        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }
        control.setValue(Array.from(current));
    }

    isSelected(values: number[] | null | undefined, id: number): boolean {
        return Boolean(values?.includes(id));
    }

    private filterByTerm<T extends { name?: string; uniqueName?: string }>(items: T[], term: string): T[] {
        const normalized = term.trim().toLowerCase();
        if (!normalized) {
            return items;
        }
        return items.filter((item) => {
            const name = (item.name ?? '').toLowerCase();
            const uniqueName = (item.uniqueName ?? '').toLowerCase();
            return name.includes(normalized) || uniqueName.includes(normalized);
        });
    }

    private collectIds(items?: Array<{ id: number }>): number[] {
        if (!items?.length) {
            return [];
        }
        return Array.from(new Set(items.map((item) => item.id)));
    }

    private uniqueIds(values: number[] | null | undefined): number[] {
        if (!values?.length) {
            return [];
        }
        return Array.from(new Set(values));
    }

    getRoleNames(group: Group | null): string {
        if (!group?.roles?.length) {
            return '-';
        }
        const names = group.roles.map((role) => role.name).filter(Boolean);
        return Array.from(new Set(names)).join(', ') || '-';
    }

    trackByGroupId = (row: Group) => String(row.id);
}
