import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ScopesService } from '../services/scopes.service';
import { ScopesReloadService } from '../services/scopes-reload.service';
import { Scope } from '../interfaces/scope.model';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-scopes',
    standalone: true,
    imports: [CommonModule, DataTableComponent, ReactiveFormsModule, ConfirmDialogComponent, DetailSidebarComponent, TranslateModule],
    templateUrl: './scopes.component.html',
})
export class ScopesComponent implements OnInit, OnDestroy {
    private scopesReloadService = inject(ScopesReloadService);
    private scopesService = inject(ScopesService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);
    private reloadSub?: Subscription;
    private saveSub?: Subscription;
    private uniqueNameSub?: Subscription;
    private langSub?: Subscription;

    reloadToken = 0;

    isModalOpen = signal(false);
    isEditMode = signal(false);
    saving = signal(false);
    errorMsg = signal('');
    editingScopeId = signal<number | null>(null);

    isDeleteOpen = signal(false);
    deleting = signal(false);
    deleteError = signal('');
    deleteTarget = signal<Scope | null>(null);

    isDetailOpen = signal(false);
    detailScope = signal<Scope | null>(null);

    scopeForm = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        uniqueName: ['', [Validators.required]],
        description: [''],
        enabled: [true],
    });

    columnDefs: ColDef<Scope>[] = [];
    rowActions: DataTableAction<Scope>[] = [];

    onEditScope(row: Scope) {
        this.openEdit(row);
    }

    onDeleteScope(row: Scope) {
        this.openDelete(row);
    }

    onDetailScope(row: Scope) {
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

        this.reloadSub = this.scopesReloadService.reload$.subscribe(() => {
            this.reloadToken += 1;
        });

        this.uniqueNameSub = this.scopeForm.controls.uniqueName.valueChanges.subscribe((value) => {
            const upper = (value ?? '').toUpperCase();
            if (value !== upper) {
                this.scopeForm.controls.uniqueName.setValue(upper, { emitEvent: false });
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
        this.editingScopeId.set(null);
        this.errorMsg.set('');
        this.scopeForm.reset({
            name: '',
            uniqueName: '',
            description: '',
            enabled: true,
        });
        this.isModalOpen.set(true);
    }

    openEdit(scope: Scope) {
        this.isEditMode.set(true);
        this.editingScopeId.set(scope.id);
        this.errorMsg.set('');
        this.scopeForm.reset({
            name: scope.name ?? '',
            uniqueName: scope.uniqueName ?? '',
            description: scope.description ?? '',
            enabled: scope.enabled ?? true,
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

    openDelete(scope: Scope) {
        this.deleteTarget.set(scope);
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

    openDetail(scope: Scope) {
        this.detailScope.set(scope);
        this.isDetailOpen.set(true);
    }

    closeDetail() {
        this.isDetailOpen.set(false);
        this.detailScope.set(null);
    }

    confirmDelete() {
        const target = this.deleteTarget();
        if (!target) {
            return;
        }

        this.deleting.set(true);
        this.deleteError.set('');
        this.saveSub?.unsubscribe();
        this.saveSub = this.scopesService.deleteScope(target.id)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.deleting.set(false);
                    this.isDeleteOpen.set(false);
                    this.deleteTarget.set(null);
                    this.scopesReloadService.triggerReload();
                },
                error: () => {
                    this.deleting.set(false);
                    this.deleteError.set(this.translate.instant('scopes.deleteError'));
                }
            });
    }

    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                field: 'id' as keyof Scope,
                headerName: this.translate.instant('scopes.table.id'),
                minWidth: 80,
                maxWidth: 120
            },
            { field: 'name' as keyof Scope, headerName: this.translate.instant('scopes.table.name'), flex: 1 },
            {
                field: 'uniqueName' as keyof Scope,
                headerName: this.translate.instant('scopes.table.uniqueName'),
                flex: 1
            },
            {
                field: 'description' as keyof Scope,
                headerName: this.translate.instant('scopes.table.description'),
                flex: 2
            },
            {
                field: 'enabled' as keyof Scope,
                headerName: this.translate.instant('scopes.table.active'),
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
                label: this.translate.instant('scopes.action.detail'),
                icon: 'fa-solid fa-eye',
                handler: (row) => this.onDetailScope(row)
            },
            {
                id: 'edit',
                label: this.translate.instant('scopes.action.edit'),
                icon: 'fa-solid fa-pen',
                handler: (row) => this.onEditScope(row)
            },
            {
                id: 'delete',
                label: this.translate.instant('scopes.action.delete'),
                icon: 'fa-solid fa-trash',
                handler: (row) => this.onDeleteScope(row)
            }
        ];
    }

    submitScope() {
        if (this.scopeForm.invalid) {
            this.scopeForm.markAllAsTouched();
            return;
        }

        const payload = this.scopeForm.getRawValue();
        this.saving.set(true);
        this.errorMsg.set('');
        this.saveSub?.unsubscribe();

        if (this.isEditMode() && this.editingScopeId() !== null) {
            this.saveSub = this.scopesService.updateScope(this.editingScopeId() as number, payload)
                .pipe(take(1))
                .subscribe({
                    next: () => this.finishSave(),
                    error: () => this.handleSaveError(),
                });
            return;
        }

        this.saveSub = this.scopesService.createScope(payload)
            .pipe(take(1))
            .subscribe({
                next: () => this.finishSave(),
                error: () => this.handleSaveError(),
            });
    }

    private finishSave() {
        this.saving.set(false);
        this.isModalOpen.set(false);
        this.scopesReloadService.triggerReload();
    }

    private handleSaveError() {
        this.saving.set(false);
        this.errorMsg.set(this.translate.instant('scopes.saveError'));
    }

    loadScopes = (query: DataTableQuery): Observable<DataTableResult<Scope>> => {
        return this.scopesService.getScopes().pipe(
            map((scopes) => {
                let data = [...scopes];
                data = this.applyFilters(data, query.filterModel);
                data = this.applySort(data, query.sortModel);

                const total = data.length;
                const start = (query.page - 1) * query.pageSize;
                const rows = data.slice(start, start + query.pageSize);

                return { rows, total };
            })
        );
    };

    private applySort(data: Scope[], sortModel: SortModelItem[]): Scope[] {
        if (!sortModel?.length) {
            return data;
        }

        const sorted = [...data];
        sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
        return sorted;
    }

    private applyFilters(data: Scope[], filterModel: Record<string, unknown>): Scope[] {
        const entries = Object.entries(filterModel ?? {});
        if (entries.length === 0) {
            return data;
        }

        return data.filter((row) =>
            entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
        );
    }

    private compareBySortModel(a: Scope, b: Scope, sortModel: SortModelItem[]): number {
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

    private matchesFilter(row: Scope, field: string, rawModel: unknown): boolean {
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

    private getFieldValue(row: Scope, field: string): unknown {
        return (row as unknown as Record<string, unknown>)[field];
    }

    trackByScopeId = (row: Scope) => String(row.id);
}
