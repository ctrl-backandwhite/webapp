import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { UsersReloadService } from '../services/users-reload.service';
import { User, UserInput } from '../interfaces/user.model';
import { RolesService } from '../../roles/services/roles.service';
import { GroupsService } from '../../groups/services/groups.service';
import { ScopesService } from '../../scopes/services/scopes.service';
import { Role } from '../../roles/interfaces/role.model';
import { Group } from '../../groups/interfaces/group.model';
import { Scope } from '../../scopes/interfaces/scope.model';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, DataTableComponent, ReactiveFormsModule, ConfirmDialogComponent, DetailSidebarComponent, TranslateModule],
    templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit, OnDestroy {
    private usersReloadService = inject(UsersReloadService);
    private usersService = inject(UsersService);
    private rolesService = inject(RolesService);
    private groupsService = inject(GroupsService);
    private scopesService = inject(ScopesService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private reloadSub?: Subscription;
    private saveSub?: Subscription;
    private langSub?: Subscription;

    reloadToken = 0;

    isModalOpen = signal(false);
    isEditMode = signal(false);
    saving = signal(false);
    errorMsg = signal('');
    editingUserId = signal<number | null>(null);

    isDeleteOpen = signal(false);
    deleting = signal(false);
    deleteError = signal('');
    deleteTarget = signal<User | null>(null);

    isDetailOpen = signal(false);
    detailUser = signal<User | null>(null);

    roles = signal<Role[]>([]);
    groups = signal<Group[]>([]);
    scopes = signal<Scope[]>([]);
    roleSearch = signal('');
    groupSearch = signal('');
    scopeSearch = signal('');

    userForm = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        nickName: ['', [Validators.required]],
        email: ['', [Validators.required]],
        password: [''],
        confirmPassword: [''],
        enabled: [true],
        accountNonExpired: [true],
        accountNonLocked: [true],
        credentialsNonExpired: [true],
        scopeIds: this.fb.nonNullable.control<number[]>([]),
        roleIds: this.fb.nonNullable.control<number[]>([]),
        groupIds: this.fb.nonNullable.control<number[]>([]),
    });

    columnDefs: ColDef<User>[] = [];
    rowActions: DataTableAction<User>[] = [];

    onEditUser(row: User) {
        this.openEdit(row);
    }

    onDeleteUser(row: User) {
        this.openDelete(row);
    }

    onDetailUser(row: User) {
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

        this.reloadSub = this.usersReloadService.reload$.subscribe(() => {
            this.reloadToken += 1;
        });
    }

    ngOnDestroy(): void {
        this.reloadSub?.unsubscribe();
        this.saveSub?.unsubscribe();
        this.langSub?.unsubscribe();
    }

    openCreate() {
        this.isEditMode.set(false);
        this.editingUserId.set(null);
        this.errorMsg.set('');
        this.userForm.reset({
            name: '',
            lastName: '',
            nickName: '',
            email: '',
            password: '',
            confirmPassword: '',
            enabled: true,
            accountNonExpired: true,
            accountNonLocked: true,
            credentialsNonExpired: true,
            scopeIds: [],
            roleIds: [],
            groupIds: [],
        });
        this.isModalOpen.set(true);
    }

    openEdit(user: User) {
        this.isEditMode.set(true);
        this.editingUserId.set(user.id);
        this.errorMsg.set('');
        this.userForm.reset({
            name: user.name ?? '',
            lastName: user.lastName ?? '',
            nickName: user.nickName ?? '',
            email: user.email ?? '',
            password: '',
            confirmPassword: '',
            enabled: user.enabled ?? true,
            accountNonExpired: user.accountNonExpired ?? true,
            accountNonLocked: user.accountNonLocked ?? true,
            credentialsNonExpired: user.credentialsNonExpired ?? true,
            scopeIds: this.collectIds(user.scopes),
            roleIds: this.collectIds(user.roles),
            groupIds: this.collectIds(user.groups),
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

    openDelete(user: User) {
        this.deleteTarget.set(user);
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

    openDetail(user: User) {
        this.detailUser.set(user);
        this.isDetailOpen.set(true);
    }

    closeDetail() {
        this.isDetailOpen.set(false);
        this.detailUser.set(null);
    }

    confirmDelete() {
        const target = this.deleteTarget();
        if (!target) {
            return;
        }

        this.deleting.set(true);
        this.deleteError.set('');
        this.saveSub?.unsubscribe();
        this.saveSub = this.usersService.deleteUser(target.id)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.deleting.set(false);
                    this.isDeleteOpen.set(false);
                    this.deleteTarget.set(null);
                    this.usersReloadService.triggerReload();
                },
                error: () => {
                    this.deleting.set(false);
                    this.deleteError.set(this.translate.instant('users.deleteError'));
                }
            });
    }

    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                field: 'id' as keyof User,
                headerName: this.translate.instant('users.table.id'),
                minWidth: 80,
                maxWidth: 120
            },
            { field: 'name' as keyof User, headerName: this.translate.instant('users.table.name'), flex: 1 },
            { field: 'lastName' as keyof User, headerName: this.translate.instant('users.table.lastName'), flex: 1 },
            { field: 'nickName' as keyof User, headerName: this.translate.instant('users.table.nickName'), flex: 1 },
            { field: 'email' as keyof User, headerName: this.translate.instant('users.table.email'), flex: 1 },
            {
                field: 'enabled' as keyof User,
                headerName: this.translate.instant('users.table.active'),
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
        this.rowActions = [
            {
                id: 'detail',
                label: this.translate.instant('users.action.detail'),
                icon: 'fa-solid fa-eye',
                handler: (row) => this.onDetailUser(row)
            },
            {
                id: 'edit',
                label: this.translate.instant('users.action.edit'),
                icon: 'fa-solid fa-pen',
                handler: (row) => this.onEditUser(row)
            },
            {
                id: 'delete',
                label: this.translate.instant('users.action.delete'),
                icon: 'fa-solid fa-trash',
                handler: (row) => this.onDeleteUser(row)
            }
        ];
    }

    submitUser() {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        const password = this.userForm.controls.password.value;
        const confirm = this.userForm.controls.confirmPassword.value;
        const isPasswordProvided = Boolean(password || confirm);

        if (!this.isEditMode() && !isPasswordProvided) {
            this.errorMsg.set(this.translate.instant('users.passwordRequired'));
            return;
        }

        if (isPasswordProvided && password !== confirm) {
            this.errorMsg.set(this.translate.instant('users.passwordMismatch'));
            return;
        }

        const payload = this.buildPayload();
        this.saving.set(true);
        this.errorMsg.set('');
        this.saveSub?.unsubscribe();

        if (this.isEditMode() && this.editingUserId() !== null) {
            this.saveSub = this.usersService.updateUser(this.editingUserId() as number, payload)
                .pipe(take(1))
                .subscribe({
                    next: () => this.finishSave(),
                    error: () => this.handleSaveError(),
                });
            return;
        }

        this.saveSub = this.usersService.createUser(payload)
            .pipe(take(1))
            .subscribe({
                next: () => this.finishSave(),
                error: () => this.handleSaveError(),
            });
    }

    private buildPayload(): UserInput {
        const raw = this.userForm.getRawValue();
        const payload: UserInput = {
            name: raw.name,
            lastName: raw.lastName,
            nickName: raw.nickName,
            email: raw.email,
            enabled: raw.enabled,
            accountNonExpired: raw.accountNonExpired,
            accountNonLocked: raw.accountNonLocked,
            credentialsNonExpired: raw.credentialsNonExpired,
            scopeIds: this.uniqueIds(raw.scopeIds),
            roleIds: this.uniqueIds(raw.roleIds),
            groupIds: this.uniqueIds(raw.groupIds),
        };

        if (raw.password) {
            payload.password = raw.password;
        }

        return payload;
    }

    private finishSave() {
        this.saving.set(false);
        this.isModalOpen.set(false);
        this.usersReloadService.triggerReload();
    }

    private handleSaveError() {
        this.saving.set(false);
        this.errorMsg.set(this.translate.instant('users.saveError'));
    }

    loadUsers = (query: DataTableQuery): Observable<DataTableResult<User>> => {
        return this.usersService.getUsers().pipe(
            map((users) => {
                let data = [...users];
                data = this.applyFilters(data, query.filterModel);
                data = this.applySort(data, query.sortModel);

                const total = data.length;
                const start = (query.page - 1) * query.pageSize;
                const rows = data.slice(start, start + query.pageSize);

                return { rows, total };
            })
        );
    };

    private applySort(data: User[], sortModel: SortModelItem[]): User[] {
        if (!sortModel?.length) {
            return data;
        }

        const sorted = [...data];
        sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
        return sorted;
    }

    private applyFilters(data: User[], filterModel: Record<string, unknown>): User[] {
        const entries = Object.entries(filterModel ?? {});
        if (entries.length === 0) {
            return data;
        }

        return data.filter((row) =>
            entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
        );
    }

    private compareBySortModel(a: User, b: User, sortModel: SortModelItem[]): number {
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

    private matchesFilter(row: User, field: string, rawModel: unknown): boolean {
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

    private getFieldValue(row: User, field: string): unknown {
        return (row as unknown as Record<string, unknown>)[field];
    }

    private loadReferenceData(): void {
        this.rolesService.getRoles().pipe(take(1)).subscribe({
            next: (roles) => this.roles.set(roles),
            error: () => this.roles.set([]),
        });
        this.groupsService.getGroups().pipe(take(1)).subscribe({
            next: (groups) => this.groups.set(groups),
            error: () => this.groups.set([]),
        });
        this.scopesService.getScopes().pipe(take(1)).subscribe({
            next: (scopes) => this.scopes.set(scopes),
            error: () => this.scopes.set([]),
        });
    }

    filteredRoles(): Role[] {
        return this.filterByTerm(this.roles(), this.roleSearch());
    }

    filteredGroups(): Group[] {
        return this.filterByTerm(this.groups(), this.groupSearch());
    }

    filteredScopes(): Scope[] {
        return this.filterByTerm(this.scopes(), this.scopeSearch());
    }

    toggleSelection(controlName: 'scopeIds' | 'roleIds' | 'groupIds', id: number): void {
        const control = this.userForm.controls[controlName];
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

    getScopeNames(user: User | null): string {
        if (!user?.scopes?.length) {
            return '-';
        }
        const names = user.scopes.map((scope) => scope.name).filter(Boolean);
        return Array.from(new Set(names)).join(', ') || '-';
    }

    getRoleNames(user: User | null): string {
        if (!user?.roles?.length) {
            return '-';
        }
        const names = user.roles.map((role) => role.name).filter(Boolean);
        return Array.from(new Set(names)).join(', ') || '-';
    }

    getGroupNames(user: User | null): string {
        if (!user?.groups?.length) {
            return '-';
        }
        const names = user.groups.map((group) => group.name).filter(Boolean);
        return Array.from(new Set(names)).join(', ') || '-';
    }

    trackByUserId = (row: User) => String(row.id);
}
