import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableBulkAction, DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import { AuditInfoComponent } from '../../../shared/audit-info/audit-info.component';
import { HasRoleDirective } from '../../../core/auth/directives/has-role.directive';
import { RedirectUrisService } from '../services/redirect-uris.service';
import { RedirectUrisReloadService } from '../services/redirect-uris-reload.service';
import { RedirectUri, RedirectUriInput } from '../interfaces/redirect-uri.model';
import { RoleService } from '../../../core/auth/services/role.service';

@Component({
  selector: 'app-redirect-uris',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    DetailSidebarComponent,
    AuditInfoComponent,
    HasRoleDirective,
    TranslateModule
  ],
  templateUrl: './redirect-uris.component.html',
})
export class RedirectUrisComponent implements OnInit, OnDestroy {
  private redirectUrisReloadService = inject(RedirectUrisReloadService);
  private redirectUrisService = inject(RedirectUrisService);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);
  private roleService = inject(RoleService);
  private reloadSub?: Subscription;
  private saveSub?: Subscription;
  private langSub?: Subscription;

  reloadToken = signal(0);

  isModalOpen = signal(false);
  isEditMode = signal(false);
  saving = signal(false);
  errorMsg = signal('');
  editingId = signal<number | null>(null);

  isDeleteOpen = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deleteTarget = signal<RedirectUri | null>(null);

  isBulkDeleteOpen = signal(false);
  bulkDeleting = signal(false);
  bulkDeleteError = signal('');
  bulkDeleteTargets = signal<RedirectUri[]>([]);

  isDetailOpen = signal(false);
  detailItem = signal<RedirectUri | null>(null);

  redirectUriForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    value: ['', [Validators.required]],
    enabled: [true],
  });

  columnDefs: ColDef<RedirectUri>[] = [];
  rowActions: DataTableAction<RedirectUri>[] = [];
  bulkActions: DataTableBulkAction<RedirectUri>[] = [];

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

    this.reloadSub = this.redirectUrisReloadService.reload$.subscribe(() => {
      this.reloadToken.update(v => v + 1);
    });
  }

  ngOnDestroy(): void {
    this.reloadSub?.unsubscribe();
    this.saveSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  onEdit(row: RedirectUri) {
    this.openEdit(row);
  }

  onDelete(row: RedirectUri) {
    this.openDelete(row);
  }

  onDetail(row: RedirectUri) {
    this.openDetail(row);
  }

  openCreate() {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.errorMsg.set('');
    this.redirectUriForm.reset({
      name: '',
      value: '',
      enabled: true,
    });
    this.isModalOpen.set(true);
  }

  openEdit(item: RedirectUri) {
    this.isEditMode.set(true);
    this.editingId.set(item.id);
    this.errorMsg.set('');
    this.redirectUriForm.reset({
      name: item.name ?? '',
      value: item.value ?? '',
      enabled: item.enabled ?? true,
    });
    this.isModalOpen.set(true);
  }

  openClone(item: RedirectUri) {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.errorMsg.set('');
    this.redirectUriForm.reset({
      name: item.name ?? '',
      value: item.value ?? '',
      enabled: item.enabled ?? true,
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

  openDelete(item: RedirectUri) {
    this.deleteTarget.set(item);
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

  openDetail(item: RedirectUri) {
    this.detailItem.set(item);
    this.isDetailOpen.set(true);
  }

  closeDetail() {
    this.isDetailOpen.set(false);
    this.detailItem.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');
    this.saveSub?.unsubscribe();
    this.saveSub = this.redirectUrisService.delete(target.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.isDeleteOpen.set(false);
          this.deleteTarget.set(null);
          this.redirectUrisReloadService.triggerReload();
        },
        error: () => {
          this.deleting.set(false);
          this.deleteError.set(this.translate.instant('redirectUris.deleteError'));
        }
      });
  }

  toggleRedirectUri(redirectUri: RedirectUri) {
    this.saveSub?.unsubscribe();
    this.saveSub = this.redirectUrisService.toggle(redirectUri.id)
      .pipe(take(1))
      .subscribe({
        next: () => this.redirectUrisReloadService.triggerReload(),
        error: () => { },
      });
  }

  submitRedirectUri() {
    if (this.redirectUriForm.invalid) {
      this.redirectUriForm.markAllAsTouched();
      return;
    }

    const payload = this.redirectUriForm.getRawValue() as RedirectUriInput;
    this.saving.set(true);
    this.errorMsg.set('');
    this.saveSub?.unsubscribe();

    if (this.isEditMode() && this.editingId() !== null) {
      this.saveSub = this.redirectUrisService.update(this.editingId() as number, payload)
        .pipe(take(1))
        .subscribe({
          next: () => this.finishSave(),
          error: () => this.handleSaveError(),
        });
      return;
    }

    this.saveSub = this.redirectUrisService.create(payload)
      .pipe(take(1))
      .subscribe({
        next: () => this.finishSave(),
        error: () => this.handleSaveError(),
      });
  }

  private finishSave() {
    this.saving.set(false);
    this.isModalOpen.set(false);
    this.redirectUrisReloadService.triggerReload();
  }

  private handleSaveError() {
    this.saving.set(false);
    this.errorMsg.set(this.translate.instant('redirectUris.saveError'));
  }

  private buildColumnDefs(): void {
    this.columnDefs = [
      {
        field: 'id' as keyof RedirectUri,
        headerName: this.translate.instant('redirectUris.table.id'),
        minWidth: 80,
        maxWidth: 120
      },
      { field: 'name' as keyof RedirectUri, headerName: this.translate.instant('redirectUris.table.name'), flex: 1 },
      { field: 'value' as keyof RedirectUri, headerName: this.translate.instant('redirectUris.table.value'), flex: 2 },
      {
        field: 'enabled' as keyof RedirectUri,
        headerName: this.translate.instant('redirectUris.table.active'),
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
        label: this.translate.instant('redirectUris.action.detail'),
        icon: 'fa-solid fa-eye',
        handler: (row) => this.onDetail(row),
        buttonClass: () => 'dt-btn-detail'
      }
    ];

    if (isAdmin) {
      this.rowActions.push(
        {
          id: 'toggle',
          label: this.translate.instant('redirectUris.action.toggle'),
          icon: 'fa-solid fa-power-off',
          handler: (row) => this.toggleRedirectUri(row),
          buttonClass: (row) => row.enabled ? 'dt-btn-toggle-active' : 'dt-btn-toggle-inactive'
        },
        {
          id: 'clone',
          label: this.translate.instant('redirectUris.action.clone'),
          icon: 'fa-solid fa-clone',
          handler: (row) => this.openClone(row),
          buttonClass: () => 'dt-btn-clone'
        },
        {
          id: 'edit',
          label: this.translate.instant('redirectUris.action.edit'),
          icon: 'fa-solid fa-pen',
          handler: (row) => this.onEdit(row),
          buttonClass: () => 'dt-btn-edit'
        },
        {
          id: 'delete',
          label: this.translate.instant('redirectUris.action.delete'),
          icon: 'fa-solid fa-trash',
          handler: (row) => this.onDelete(row),
          buttonClass: () => 'dt-btn-delete'
        }
      );
    }
  }

  loadRedirectUris = (query: DataTableQuery): Observable<DataTableResult<RedirectUri>> => {
    return this.redirectUrisService.list().pipe(
      map((items: RedirectUri[]) => {
        let data = [...items];
        data = this.applyFilters(data, query.filterModel);
        data = this.applySort(data, query.sortModel);

        const total = data.length;
        const start = (query.page - 1) * query.pageSize;
        const rows = data.slice(start, start + query.pageSize);

        return { rows, total };
      })
    );
  };

  private applySort(data: RedirectUri[], sortModel: SortModelItem[]): RedirectUri[] {
    if (!sortModel?.length) {
      return data;
    }

    const sorted = [...data];
    sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
    return sorted;
  }

  private applyFilters(data: RedirectUri[], filterModel: Record<string, unknown>): RedirectUri[] {
    const entries = Object.entries(filterModel ?? {});
    if (entries.length === 0) {
      return data;
    }

    return data.filter((row) =>
      entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
    );
  }

  private compareBySortModel(a: RedirectUri, b: RedirectUri, sortModel: SortModelItem[]): number {
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

  private matchesFilter(row: RedirectUri, field: string, rawModel: unknown): boolean {
    const model = rawModel as { filterType?: string; type?: string; filter?: unknown };
    const value = this.getFieldValue(row, field);

    if (!model || model.filter === undefined || model.filter === null) {
      return true;
    }

    const filterValue = model.filter;
    if (typeof value === 'string' && typeof filterValue === 'string') {
      return this.matchTextFilter(value, filterValue, model.type);
    }
    if (typeof value === 'number' && typeof filterValue === 'number') {
      return this.matchNumberFilter(value, filterValue, model.type);
    }

    return true;
  }

  private matchTextFilter(value: string, filterValue: string, type?: string): boolean {
    const normalizedValue = value.toLowerCase();
    const normalizedFilter = filterValue.toLowerCase();
    switch (type) {
      case 'equals':
        return normalizedValue === normalizedFilter;
      case 'notEqual':
        return normalizedValue !== normalizedFilter;
      case 'contains':
        return normalizedValue.includes(normalizedFilter);
      case 'notContains':
        return !normalizedValue.includes(normalizedFilter);
      case 'startsWith':
        return normalizedValue.startsWith(normalizedFilter);
      case 'endsWith':
        return normalizedValue.endsWith(normalizedFilter);
      default:
        return true;
    }
  }

  private matchNumberFilter(value: number, filterValue: number, type?: string): boolean {
    switch (type) {
      case 'equals':
        return value === filterValue;
      case 'lessThan':
        return value < filterValue;
      case 'greaterThan':
        return value > filterValue;
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

  private getFieldValue(row: RedirectUri, field: string): unknown {
    return (row as unknown as Record<string, unknown>)[field];
  }

  trackByRedirectUriId = (row: RedirectUri) => String(row.id);

  private buildBulkActions() {
    const isAdmin = this.roleService.isAdmin();
    this.bulkActions = [];
    if (isAdmin) {
      this.bulkActions.push({
        id: 'bulk-delete',
        label: this.translate.instant('redirectUris.action.bulkDelete'),
        handler: (rows) => this.openBulkDelete(rows),
      });
    }
  }

  openBulkDelete(rows: RedirectUri[]) {
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
    this.saveSub = this.redirectUrisService.bulkDelete(targets.map(r => r.id))
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.bulkDeleting.set(false);
          this.isBulkDeleteOpen.set(false);
          this.bulkDeleteTargets.set([]);
          this.redirectUrisReloadService.triggerReload();
        },
        error: () => {
          this.bulkDeleting.set(false);
          this.bulkDeleteError.set(this.translate.instant('redirectUris.bulkDeleteError'));
        },
      });
  }
}
