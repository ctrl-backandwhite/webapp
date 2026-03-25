
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role, RoleInput } from '../interfaces/role.model';
import { RolesService } from '../services/roles.service';
import { RolesReloadService } from '../services/roles-reload.service';
import { PermissionsService } from '../../permissions/services/permissions.service';
import { Permission } from '../../permissions/interfaces/permission.model';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import { AuditInfoComponent } from '../../../shared/audit-info/audit-info.component';
import { NestedEntitiesComponent } from '../../../shared/nested-entities/nested-entities.component';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableBulkAction, DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../core/auth/services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ReactiveFormsModule, ConfirmDialogComponent, DetailSidebarComponent, AuditInfoComponent, NestedEntitiesComponent, HasRoleDirective, TranslateModule],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit, OnDestroy {
  private rolesReloadService = inject(RolesReloadService);
  private rolesService = inject(RolesService);
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
  editingRoleId = signal<number | null>(null);

  isDeleteOpen = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deleteTarget = signal<Role | null>(null);

  isBulkDeleteOpen = signal(false);
  bulkDeleting = signal(false);
  bulkDeleteError = signal('');
  bulkDeleteTargets = signal<Role[]>([]);

  isDetailOpen = signal(false);
  detailRole = signal<Role | null>(null);

  permissions = signal<Permission[]>([]);
  permissionSearch = signal('');

  roleForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    uniqueName: ['', [Validators.required]],
    description: [''],
    enabled: [true],
    permissionIds: this.fb.nonNullable.control<number[]>([]),
  });

  columnDefs: ColDef<Role>[] = [];
  rowActions: DataTableAction<Role>[] = [];
  bulkActions: DataTableBulkAction<Role>[] = [];

  onEditRole(row: Role) {
    this.openEdit(row);
  }

  onDeleteRole(row: Role) {
    this.openDelete(row);
  }

  onDetailRole(row: Role) {
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

    this.loadReferenceData();

    this.reloadSub = this.rolesReloadService.reload$.subscribe(() => {
      this.reloadToken.update(v => v + 1);
    });

    this.uniqueNameSub = this.roleForm.controls.uniqueName.valueChanges.subscribe((value) => {
      const upper = (value ?? '').toUpperCase();
      if (value !== upper) {
        this.roleForm.controls.uniqueName.setValue(upper, { emitEvent: false });
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
    this.editingRoleId.set(null);
    this.errorMsg.set('');
    this.roleForm.reset({
      name: '',
      uniqueName: '',
      description: '',
      enabled: true,
      permissionIds: [],
    });
    this.isModalOpen.set(true);
  }

  openEdit(role: Role) {
    this.isEditMode.set(true);
    this.editingRoleId.set(role.id);
    this.errorMsg.set('');
    this.roleForm.reset({
      name: role.name ?? '',
      uniqueName: role.uniqueName ?? '',
      description: role.description ?? '',
      enabled: role.enabled ?? true,
      permissionIds: this.collectIds(role.permissions),
    });
    this.isModalOpen.set(true);
  }

  openClone(role: Role) {
    this.isEditMode.set(false);
    this.editingRoleId.set(null);
    this.errorMsg.set('');
    this.roleForm.reset({
      name: role.name ?? '',
      uniqueName: '',
      description: role.description ?? '',
      enabled: role.enabled ?? true,
      permissionIds: this.collectIds(role.permissions),
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

  openDelete(role: Role) {
    this.deleteTarget.set(role);
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

  openDetail(role: Role) {
    this.detailRole.set(role);
    this.isDetailOpen.set(true);
  }

  closeDetail() {
    this.isDetailOpen.set(false);
    this.detailRole.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');
    this.saveSub?.unsubscribe();
    this.saveSub = this.rolesService.delete(target.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.isDeleteOpen.set(false);
          this.deleteTarget.set(null);
          this.rolesReloadService.triggerReload();
        },
        error: () => {
          this.deleting.set(false);
          this.deleteError.set(this.translate.instant('roles.deleteError'));
        }
      });
  }

  private buildColumnDefs(): void {
    this.columnDefs = [
      {
        field: 'id' as keyof Role,
        headerName: this.translate.instant('roles.table.id'),
        minWidth: 80,
        maxWidth: 120
      },
      { field: 'name' as keyof Role, headerName: this.translate.instant('roles.table.name'), flex: 1 },
      {
        field: 'uniqueName' as keyof Role,
        headerName: this.translate.instant('roles.table.uniqueName'),
        flex: 1
      },
      {
        field: 'description' as keyof Role,
        headerName: this.translate.instant('roles.table.description'),
        flex: 2
      },
      {
        field: 'enabled' as keyof Role,
        headerName: this.translate.instant('roles.table.active'),
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
        label: this.translate.instant('roles.action.detail'),
        icon: 'fa-solid fa-eye',
        handler: (row) => this.onDetailRole(row),
        buttonClass: () => 'dt-btn-detail'
      }
    ];

    if (isAdmin) {
      this.rowActions.push(
        {
          id: 'toggle',
          label: this.translate.instant('roles.action.toggle'),
          icon: 'fa-solid fa-power-off',
          handler: (row) => this.toggleRole(row),
          buttonClass: (row) => row.enabled ? 'dt-btn-toggle-active' : 'dt-btn-toggle-inactive'
        },
        {
          id: 'clone',
          label: this.translate.instant('roles.action.clone'),
          icon: 'fa-solid fa-clone',
          handler: (row) => this.openClone(row),
          buttonClass: () => 'dt-btn-clone'
        },
        {
          id: 'edit',
          label: this.translate.instant('roles.action.edit'),
          icon: 'fa-solid fa-pen',
          handler: (row) => this.onEditRole(row),
          buttonClass: () => 'dt-btn-edit'
        },
        {
          id: 'delete',
          label: this.translate.instant('roles.action.delete'),
          icon: 'fa-solid fa-trash',
          handler: (row) => this.onDeleteRole(row),
          buttonClass: () => 'dt-btn-delete'
        }
      );
    }
  }

  toggleRole(role: Role) {
    this.saveSub?.unsubscribe();
    this.saveSub = this.rolesService.toggle(role.id)
      .pipe(take(1))
      .subscribe({
        next: () => this.rolesReloadService.triggerReload(),
        error: () => { },
      });
  }

  submitRole() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.saving.set(true);
    this.errorMsg.set('');
    this.saveSub?.unsubscribe();

    if (this.isEditMode() && this.editingRoleId() !== null) {
      this.saveSub = this.rolesService.update(this.editingRoleId() as number, payload)
        .pipe(take(1))
        .subscribe({
          next: () => this.finishSave(),
          error: () => this.handleSaveError(),
        });
      return;
    }

    this.saveSub = this.rolesService.create(payload)
      .pipe(take(1))
      .subscribe({
        next: () => this.finishSave(),
        error: () => this.handleSaveError(),
      });
  }

  private buildPayload(): RoleInput {
    const raw = this.roleForm.getRawValue();
    return {
      name: raw.name,
      uniqueName: raw.uniqueName,
      description: raw.description,
      enabled: raw.enabled,
      permissionIds: this.uniqueIds(raw.permissionIds),
    };
  }

  private finishSave() {
    this.saving.set(false);
    this.isModalOpen.set(false);
    this.rolesReloadService.triggerReload();
  }

  private handleSaveError() {
    this.saving.set(false);
    this.errorMsg.set(this.translate.instant('roles.saveError'));
  }

  loadRoles = (query: DataTableQuery): Observable<DataTableResult<Role>> => {
    return this.rolesService.list().pipe(
      map((roles) => {
        let data = [...roles];
        data = this.applyFilters(data, query.filterModel);
        data = this.applySort(data, query.sortModel);

        const total = data.length;
        const start = (query.page - 1) * query.pageSize;
        const rows = data.slice(start, start + query.pageSize);

        return { rows, total };
      })
    );
  };

  private applySort(data: Role[], sortModel: SortModelItem[]): Role[] {
    if (!sortModel?.length) {
      return data;
    }

    const sorted = [...data];
    sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
    return sorted;
  }

  private applyFilters(data: Role[], filterModel: Record<string, unknown>): Role[] {
    const entries = Object.entries(filterModel ?? {});
    if (entries.length === 0) {
      return data;
    }

    // Apply each column filter; all must match to keep the row.
    return data.filter((row) =>
      entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
    );
  }

  private compareBySortModel(a: Role, b: Role, sortModel: SortModelItem[]): number {
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

  private matchesFilter(row: Role, field: string, rawModel: unknown): boolean {
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

  private getFieldValue(row: Role, field: string): unknown {
    return (row as unknown as Record<string, unknown>)[field];
  }

  trackByRoleId = (row: Role) => String(row.id);

  private buildBulkActions() {
    const isAdmin = this.roleService.isAdmin();
    this.bulkActions = [];
    if (isAdmin) {
      this.bulkActions.push({
        id: 'bulk-delete',
        label: this.translate.instant('roles.action.bulkDelete'),
        handler: (rows) => this.openBulkDelete(rows),
      });
    }
  }

  openBulkDelete(rows: Role[]) {
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
    this.saveSub = this.rolesService.bulkDelete(targets.map(r => r.id))
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.bulkDeleting.set(false);
          this.isBulkDeleteOpen.set(false);
          this.bulkDeleteTargets.set([]);
          this.rolesReloadService.triggerReload();
        },
        error: () => {
          this.bulkDeleting.set(false);
          this.bulkDeleteError.set(this.translate.instant('roles.bulkDeleteError'));
        },
      });
  }

  private loadReferenceData(): void {
    this.permissionsService.listByEnabled(true).pipe(take(1)).subscribe({
      next: (permissions: Permission[]) => this.permissions.set(permissions),
      error: () => this.permissions.set([]),
    });
  }

  filteredPermissions(): Permission[] {
    return this.filterByTerm(this.permissions(), this.permissionSearch());
  }

  togglePermissionSelection(id: number): void {
    const control = this.roleForm.controls.permissionIds;
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

  getPermissionNames(role: Role | null): string {
    if (!role?.permissions?.length) {
      return '-';
    }
    const names = role.permissions.map((permission) => permission.name).filter(Boolean);
    return Array.from(new Set(names)).join(', ') || '-';
  }
}
