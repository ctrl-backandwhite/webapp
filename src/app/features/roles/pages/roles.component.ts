
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../interfaces/role.model';
import { RolesService } from '../services/roles.service';
import { RolesReloadService } from '../services/roles-reload.service';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import { AuditInfoComponent } from '../../../shared/audit-info/audit-info.component';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../core/auth/services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ReactiveFormsModule, ConfirmDialogComponent, DetailSidebarComponent, AuditInfoComponent, HasRoleDirective, TranslateModule],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit, OnDestroy {
  private rolesReloadService = inject(RolesReloadService);
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
  editingRoleId = signal<number | null>(null);

  isDeleteOpen = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deleteTarget = signal<Role | null>(null);

  isDetailOpen = signal(false);
  detailRole = signal<Role | null>(null);

  roleForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    uniqueName: ['', [Validators.required]],
    description: [''],
    enabled: [true],
  });

  columnDefs: ColDef<Role>[] = [];
  rowActions: DataTableAction<Role>[] = [];

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
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.buildColumnDefs();
      this.buildRowActions();
    });

    this.reloadSub = this.rolesReloadService.reload$.subscribe(() => {
      this.reloadToken += 1;
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
        label: this.translate.instant('roles.action.detail'),
        icon: 'fa-solid fa-eye',
        handler: (row) => this.onDetailRole(row)
      }
    ];

    if (isAdmin) {
      this.rowActions.push(
        {
          id: 'edit',
          label: this.translate.instant('roles.action.edit'),
          icon: 'fa-solid fa-pen',
          handler: (row) => this.onEditRole(row)
        },
        {
          id: 'delete',
          label: this.translate.instant('roles.action.delete'),
          icon: 'fa-solid fa-trash',
          handler: (row) => this.onDeleteRole(row)
        }
      );
    }
  }

  submitRole() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const payload = this.roleForm.getRawValue();
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

  private finishSave() {
    this.saving.set(false);
    this.isModalOpen.set(false);
    this.rolesReloadService.triggerReload();
  }

  private handleSaveError() {
    this.saving.set(false);
    this.errorMsg.set('No se pudo guardar el rol.');
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
}
