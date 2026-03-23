import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GatewayRoute, GatewayRouteInput, BulkImportResult } from '../interfaces/gateway-route.model';
import { GatewayRoutesService } from '../services/gateway-routes.service';
import { GatewayRoutesReloadService } from '../services/gateway-routes-reload.service';
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
  selector: 'app-gateway-routes',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    DetailSidebarComponent,
    AuditInfoComponent,
    HasRoleDirective,
    TranslateModule,
  ],
  templateUrl: './gateway-routes.component.html',
})
export class GatewayRoutesComponent implements OnInit, OnDestroy {
  private routesService = inject(GatewayRoutesService);
  private reloadService = inject(GatewayRoutesReloadService);
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
  editingRouteId = signal<string | null>(null);

  isDeleteOpen = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deleteTarget = signal<GatewayRoute | null>(null);

  isDetailOpen = signal(false);
  detailRoute = signal<GatewayRoute | null>(null);

  isRefreshing = signal(false);

  isBulkOpen = signal(false);
  bulkJson = signal('');
  bulkImporting = signal(false);
  bulkError = signal('');
  bulkResult = signal<BulkImportResult | null>(null);

  isBulkDeleteOpen = signal(false);
  bulkDeleting = signal(false);
  bulkDeleteError = signal('');
  bulkDeleteTargets = signal<GatewayRoute[]>([]);

  routeForm = this.fb.nonNullable.group({
    id: ['', [Validators.required]],
    uri: ['', [Validators.required]],
    predicates: this.fb.array<string>([], [Validators.required]),
    filters: this.fb.array<string>([]),
    order: [0, [Validators.required]],
    rateLimitReplenishRate: [null as number | null, [Validators.min(1)]],
    rateLimitBurstCapacity: [null as number | null, [Validators.min(1)]],
    rateLimitRequestedTokens: [null as number | null, [Validators.min(1)]],
  });

  columnDefs: ColDef<GatewayRoute>[] = [];
  rowActions: DataTableAction<GatewayRoute>[] = [];
  bulkActions: DataTableBulkAction<GatewayRoute>[] = [];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  };

  get predicatesArray(): FormArray {
    return this.routeForm.controls.predicates as unknown as FormArray;
  }

  get filtersArray(): FormArray {
    return this.routeForm.controls.filters as unknown as FormArray;
  }

  ngOnInit() {
    this.buildColumnDefs();
    this.buildRowActions();
    this.buildBulkActions();

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.buildColumnDefs();
      this.buildRowActions();
      this.buildBulkActions();
    });

    this.reloadSub = this.reloadService.reload$.subscribe(() => {
      this.reloadToken.update(v => v + 1);
    });
  }

  ngOnDestroy() {
    this.reloadSub?.unsubscribe();
    this.saveSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  openCreate() {
    this.isEditMode.set(false);
    this.editingRouteId.set(null);
    this.errorMsg.set('');
    this.resetForm();
    this.isModalOpen.set(true);
  }

  openEdit(route: GatewayRoute) {
    this.isEditMode.set(true);
    this.editingRouteId.set(route.id);
    this.errorMsg.set('');
    this.resetFormWithValues(route);
    this.isModalOpen.set(true);
  }

  openClone(route: GatewayRoute) {
    this.isEditMode.set(false);
    this.editingRouteId.set(null);
    this.errorMsg.set('');
    this.resetFormWithValues(route);
    this.routeForm.patchValue({ id: '' });
    this.isModalOpen.set(true);
  }

  closeModal() {
    if (this.saving()) return;
    this.isModalOpen.set(false);
    this.errorMsg.set('');
  }

  openDelete(route: GatewayRoute) {
    this.deleteTarget.set(route);
    this.deleteError.set('');
    this.deleting.set(false);
    this.isDeleteOpen.set(true);
  }

  closeDelete() {
    if (this.deleting()) return;
    this.isDeleteOpen.set(false);
    this.deleteError.set('');
    this.deleteTarget.set(null);
  }

  openDetail(route: GatewayRoute) {
    this.detailRoute.set(route);
    this.isDetailOpen.set(true);
  }

  closeDetail() {
    this.isDetailOpen.set(false);
    this.detailRoute.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleting.set(true);
    this.deleteError.set('');
    this.saveSub?.unsubscribe();
    this.saveSub = this.routesService.delete(target.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleting.set(false);
          this.isDeleteOpen.set(false);
          this.deleteTarget.set(null);
          this.reloadService.triggerReload();
        },
        error: () => {
          this.deleting.set(false);
          this.deleteError.set(this.translate.instant('gatewayRoutes.deleteError'));
        },
      });
  }

  toggleRoute(route: GatewayRoute) {
    this.saveSub?.unsubscribe();
    this.saveSub = this.routesService.toggle(route.id)
      .pipe(take(1))
      .subscribe({
        next: () => this.reloadService.triggerReload(),
        error: () => { },
      });
  }

  refreshGateway() {
    this.isRefreshing.set(true);
    this.saveSub?.unsubscribe();
    this.saveSub = this.routesService.refresh()
      .pipe(take(1))
      .subscribe({
        next: () => this.isRefreshing.set(false),
        error: () => this.isRefreshing.set(false),
      });
  }

  openBulkDelete(rows: GatewayRoute[]) {
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
    this.saveSub = this.routesService.bulkDelete(targets.map(r => r.id))
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.bulkDeleting.set(false);
          this.isBulkDeleteOpen.set(false);
          this.bulkDeleteTargets.set([]);
          this.reloadService.triggerReload();
        },
        error: () => {
          this.bulkDeleting.set(false);
          this.bulkDeleteError.set(this.translate.instant('gatewayRoutes.bulkDeleteError'));
        },
      });
  }

  openBulkImport() {
    this.bulkJson.set('');
    this.bulkError.set('');
    this.bulkResult.set(null);
    this.bulkImporting.set(false);
    this.isBulkOpen.set(true);
  }

  closeBulkImport() {
    if (this.bulkImporting()) return;
    this.isBulkOpen.set(false);
    this.bulkError.set('');
    this.bulkResult.set(null);
  }

  loadTemplate() {
    const template: GatewayRouteInput[] = [
      {
        id: 'my-service',
        uri: 'http://localhost:8080',
        predicates: ['Path=/api/v1/my-resource/**'],
        filters: [],
        order: 0,
        rateLimitReplenishRate: 10,
        rateLimitBurstCapacity: 20,
        rateLimitRequestedTokens: 1,
      },
      {
        id: 'another-service',
        uri: 'http://localhost:9090',
        predicates: ['Path=/api/v1/another/**', 'Path=/api/v1/extra/**'],
        filters: [],
        order: 1,
        rateLimitReplenishRate: null,
        rateLimitBurstCapacity: null,
        rateLimitRequestedTokens: null,
      },
    ];
    this.bulkJson.set(JSON.stringify(template, null, 2));
    this.bulkError.set('');
    this.bulkResult.set(null);
  }

  onBulkJsonChange(value: string) {
    this.bulkJson.set(value);
    this.bulkError.set('');
    this.bulkResult.set(null);
  }

  submitBulkImport() {
    const raw = this.bulkJson().trim();
    if (!raw) {
      this.bulkError.set(this.translate.instant('gatewayRoutes.bulk.emptyJson'));
      return;
    }

    let parsed: GatewayRouteInput[];
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.bulkError.set(this.translate.instant('gatewayRoutes.bulk.invalidJson'));
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      this.bulkError.set(this.translate.instant('gatewayRoutes.bulk.mustBeArray'));
      return;
    }

    this.bulkImporting.set(true);
    this.bulkError.set('');
    this.bulkResult.set(null);
    this.saveSub?.unsubscribe();
    this.saveSub = this.routesService.bulkImport(parsed)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.bulkImporting.set(false);
          this.bulkResult.set(result);
          this.reloadService.triggerReload();
        },
        error: () => {
          this.bulkImporting.set(false);
          this.bulkError.set(this.translate.instant('gatewayRoutes.bulk.importError'));
        },
      });
  }

  submitRoute() {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    const raw = this.routeForm.getRawValue();
    const payload: GatewayRouteInput = {
      id: raw.id,
      uri: raw.uri,
      predicates: raw.predicates as unknown as string[],
      filters: raw.filters as unknown as string[],
      order: raw.order,
      rateLimitReplenishRate: raw.rateLimitReplenishRate || null,
      rateLimitBurstCapacity: raw.rateLimitBurstCapacity || null,
      rateLimitRequestedTokens: raw.rateLimitRequestedTokens || null,
    };

    this.saving.set(true);
    this.errorMsg.set('');
    this.saveSub?.unsubscribe();

    const editId = this.editingRouteId();
    if (this.isEditMode() && editId !== null) {
      this.saveSub = this.routesService.update(editId, payload)
        .pipe(take(1))
        .subscribe({
          next: () => this.finishSave(),
          error: () => this.handleSaveError(),
        });
      return;
    }

    this.saveSub = this.routesService.create(payload)
      .pipe(take(1))
      .subscribe({
        next: () => this.finishSave(),
        error: () => this.handleSaveError(),
      });
  }

  addPredicate() {
    this.predicatesArray.push(this.fb.control('', Validators.required));
  }

  removePredicate(index: number) {
    this.predicatesArray.removeAt(index);
  }

  addFilter() {
    this.filtersArray.push(this.fb.control(''));
  }

  removeFilter(index: number) {
    this.filtersArray.removeAt(index);
  }

  loadRoutes = (query: DataTableQuery): Observable<DataTableResult<GatewayRoute>> => {
    return this.routesService.list().pipe(
      map((routes) => {
        let data = [...routes];
        data = this.applyFilters(data, query.filterModel);
        data = this.applySort(data, query.sortModel);

        const total = data.length;
        const start = (query.page - 1) * query.pageSize;
        const rows = data.slice(start, start + query.pageSize);

        return { rows, total };
      })
    );
  };

  trackByRouteId = (row: GatewayRoute) => row.id;

  private resetForm() {
    this.predicatesArray.clear();
    this.filtersArray.clear();
    this.predicatesArray.push(this.fb.control('', Validators.required));
    this.routeForm.reset({
      id: '', uri: '', order: 0,
      rateLimitReplenishRate: null,
      rateLimitBurstCapacity: null,
      rateLimitRequestedTokens: null,
    });
  }

  private resetFormWithValues(route: GatewayRoute) {
    this.predicatesArray.clear();
    this.filtersArray.clear();
    (route.predicates ?? []).forEach(p => this.predicatesArray.push(this.fb.control(p, Validators.required)));
    (route.filters ?? []).forEach(f => this.filtersArray.push(this.fb.control(f)));
    if (this.predicatesArray.length === 0) {
      this.predicatesArray.push(this.fb.control('', Validators.required));
    }
    this.routeForm.patchValue({
      id: route.id, uri: route.uri, order: route.order,
      rateLimitReplenishRate: route.rateLimitReplenishRate ?? null,
      rateLimitBurstCapacity: route.rateLimitBurstCapacity ?? null,
      rateLimitRequestedTokens: route.rateLimitRequestedTokens ?? null,
    });
  }

  private buildColumnDefs() {
    this.columnDefs = [
      {
        field: 'id' as keyof GatewayRoute,
        headerName: this.translate.instant('gatewayRoutes.table.id'),
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'uri' as keyof GatewayRoute,
        headerName: this.translate.instant('gatewayRoutes.table.uri'),
        flex: 2,
      },
      {
        field: 'order' as keyof GatewayRoute,
        headerName: this.translate.instant('gatewayRoutes.table.order'),
        minWidth: 90,
        maxWidth: 110,
      },
      {
        field: 'enabled' as keyof GatewayRoute,
        headerName: this.translate.instant('gatewayRoutes.table.active'),
        minWidth: 100,
        maxWidth: 120,
        cellRenderer: (params: { value: boolean }) =>
          `<span class="inline-block w-3 h-3 rounded-full ${params.value ? 'bg-green-300 ring-2 ring-green-200' : 'bg-red-300 ring-2 ring-red-200'}"></span>`,
      },
    ];
  }

  private buildRowActions() {
    const isAdmin = this.roleService.isAdmin();

    this.rowActions = [
      {
        id: 'detail',
        label: this.translate.instant('gatewayRoutes.action.detail'),
        icon: 'fa-solid fa-eye',
        handler: (row) => this.openDetail(row),
        buttonClass: () => 'dt-btn-detail'
      },
    ];

    if (isAdmin) {
      this.rowActions.push(
        {
          id: 'toggle',
          label: this.translate.instant('gatewayRoutes.action.toggle'),
          icon: 'fa-solid fa-power-off',
          handler: (row) => this.toggleRoute(row),
          buttonClass: (row) => row.enabled ? 'dt-btn-toggle-active' : 'dt-btn-toggle-inactive'
        },
        {
          id: 'clone',
          label: this.translate.instant('gatewayRoutes.action.clone'),
          icon: 'fa-solid fa-clone',
          handler: (row) => this.openClone(row),
          buttonClass: () => 'dt-btn-clone'
        },
        {
          id: 'edit',
          label: this.translate.instant('gatewayRoutes.action.edit'),
          icon: 'fa-solid fa-pen',
          handler: (row) => this.openEdit(row),
          buttonClass: () => 'dt-btn-edit'
        },
        {
          id: 'delete',
          label: this.translate.instant('gatewayRoutes.action.delete'),
          icon: 'fa-solid fa-trash',
          handler: (row) => this.openDelete(row),
          buttonClass: () => 'dt-btn-delete'
        }
      );
    }
  }

  private buildBulkActions() {
    const isAdmin = this.roleService.isAdmin();
    this.bulkActions = [];

    if (isAdmin) {
      this.bulkActions.push({
        id: 'bulk-delete',
        label: this.translate.instant('gatewayRoutes.action.bulkDelete'),
        handler: (rows) => this.openBulkDelete(rows),
      });
    }
  }

  private finishSave() {
    this.saving.set(false);
    this.isModalOpen.set(false);
    this.reloadService.triggerReload();
  }

  private handleSaveError() {
    this.saving.set(false);
    this.errorMsg.set(this.translate.instant('gatewayRoutes.saveError'));
  }

  private applySort(data: GatewayRoute[], sortModel: SortModelItem[]): GatewayRoute[] {
    if (!sortModel?.length) return data;
    const sorted = [...data];
    sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
    return sorted;
  }

  private applyFilters(data: GatewayRoute[], filterModel: Record<string, unknown>): GatewayRoute[] {
    const entries = Object.entries(filterModel ?? {});
    if (entries.length === 0) return data;
    return data.filter((row) =>
      entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
    );
  }

  private compareBySortModel(a: GatewayRoute, b: GatewayRoute, sortModel: SortModelItem[]): number {
    for (const sort of sortModel) {
      if (!sort.colId) continue;
      const aValue = this.getFieldValue(a, sort.colId);
      const bValue = this.getFieldValue(b, sort.colId);
      const comparison = this.compareValues(aValue, bValue);
      if (comparison !== 0) return sort.sort === 'asc' ? comparison : -comparison;
    }
    return 0;
  }

  private matchesFilter(row: GatewayRoute, field: string, rawModel: unknown): boolean {
    const model = rawModel as { filterType?: string; type?: string; filter?: unknown };
    const value = this.getFieldValue(row, field);

    if (!model || model.filter === undefined || model.filter === null) return true;

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
      case 'equals': return candidate === filterValue;
      case 'startsWith': return candidate.startsWith(filterValue);
      case 'endsWith': return candidate.endsWith(filterValue);
      default: return candidate.includes(filterValue);
    }
  }

  private matchesNumberFilter(value: unknown, model: { type?: string; filter?: unknown }): boolean {
    const filterValue = Number(model.filter);
    const candidate = Number(value);
    switch (model.type) {
      case 'equals': return candidate === filterValue;
      case 'lessThan': return candidate < filterValue;
      case 'greaterThan': return candidate > filterValue;
      default: return true;
    }
  }

  private compareValues(aValue: unknown, bValue: unknown): number {
    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return -1;
    if (bValue === null || bValue === undefined) return 1;
    if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue);
    return aValue > bValue ? 1 : -1;
  }

  private getFieldValue(row: GatewayRoute, field: string): unknown {
    return (row as unknown as Record<string, unknown>)[field];
  }
}
