import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { DetailSidebarComponent } from '../../../shared/detail-sidebar/detail-sidebar.component';
import { AuditInfoComponent } from '../../../shared/audit-info/audit-info.component';
import { NestedEntitiesComponent } from '../../../shared/nested-entities/nested-entities.component';
import { OauthClientsService } from '../services/oauth-clients.service';
import { OauthClientsReloadService } from '../services/oauth-clients-reload.service';
import { OAuthClient, OAuthClientInput } from '../interfaces/oauth-client.model';
import { ScopesService } from '../../scopes/services/scopes.service';
import { RedirectUrisService } from '../../redirect-uris/services/redirect-uris.service';
import { GrantTypesService } from '../../grant-types/services/grant-types.service';
import { Scope } from '../../scopes/interfaces/scope.model';
import { RedirectUri } from '../../redirect-uris/interfaces/redirect-uri.model';
import { GrantType } from '../../grant-types/interfaces/grant-type.model';

@Component({
    selector: 'app-oauth-clients',
    standalone: true,
    imports: [
        CommonModule,
        DataTableComponent,
        ReactiveFormsModule,
        ConfirmDialogComponent,
        DetailSidebarComponent,
        AuditInfoComponent,
        NestedEntitiesComponent,
        TranslateModule
    ],
    templateUrl: './oauth-clients.component.html',
})
export class OauthClientsComponent implements OnInit, OnDestroy {
    private oauthClientsReloadService = inject(OauthClientsReloadService);
    private oauthClientsService = inject(OauthClientsService);
    private scopesService = inject(ScopesService);
    private redirectUrisService = inject(RedirectUrisService);
    private grantTypesService = inject(GrantTypesService);
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
    editingId = signal<number | null>(null);

    isDeleteOpen = signal(false);
    deleting = signal(false);
    deleteError = signal('');
    deleteTarget = signal<OAuthClient | null>(null);

    isDetailOpen = signal(false);
    detailItem = signal<OAuthClient | null>(null);

    scopes = signal<Scope[]>([]);
    redirectUris = signal<RedirectUri[]>([]);
    grantTypes = signal<GrantType[]>([]);
    scopeSearch = signal('');
    redirectUriSearch = signal('');
    grantTypeSearch = signal('');

    oauthClientForm = this.fb.nonNullable.group({
        clientId: ['', [Validators.required]],
        clientSecret: [''],
        scopeIds: [[] as number[]],
        redirectUriIds: [[] as number[]],
        grantTypeIds: [[] as number[]],
    });

    columnDefs: ColDef<OAuthClient>[] = [];
    rowActions: DataTableAction<OAuthClient>[] = [];

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

        this.reloadSub = this.oauthClientsReloadService.reload$.subscribe(() => {
            this.reloadToken += 1;
        });
    }

    ngOnDestroy(): void {
        this.reloadSub?.unsubscribe();
        this.saveSub?.unsubscribe();
        this.langSub?.unsubscribe();
    }

    onEdit(row: OAuthClient) {
        this.openEdit(row);
    }

    onDelete(row: OAuthClient) {
        this.openDelete(row);
    }

    onDetail(row: OAuthClient) {
        this.openDetail(row);
    }

    openCreate() {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.errorMsg.set('');
        this.oauthClientForm.reset({
            clientId: '',
            clientSecret: '',
            scopeIds: [],
            redirectUriIds: [],
            grantTypeIds: [],
        });
        this.isModalOpen.set(true);
    }

    openEdit(item: OAuthClient) {
        this.isEditMode.set(true);
        this.editingId.set(item.id);
        this.errorMsg.set('');
        this.oauthClientForm.reset({
            clientId: item.clientId ?? '',
            clientSecret: '',
            scopeIds: this.collectIds(item.scopes),
            redirectUriIds: this.collectIds(item.redirectUris),
            grantTypeIds: this.collectIds(item.grantTypes),
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

    openDelete(item: OAuthClient) {
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

    openDetail(item: OAuthClient) {
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
        this.saveSub = this.oauthClientsService.delete(target.id)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.deleting.set(false);
                    this.isDeleteOpen.set(false);
                    this.deleteTarget.set(null);
                    this.oauthClientsReloadService.triggerReload();
                },
                error: () => {
                    this.deleting.set(false);
                    this.deleteError.set(this.translate.instant('oauthClients.deleteError'));
                }
            });
    }

    submitClient() {
        if (this.oauthClientForm.invalid) {
            this.oauthClientForm.markAllAsTouched();
            return;
        }

        const raw = this.oauthClientForm.getRawValue();
        const payload: OAuthClientInput = {
            clientId: raw.clientId,
            scopeIds: this.uniqueIds(raw.scopeIds),
            redirectUriIds: this.uniqueIds(raw.redirectUriIds),
            grantTypeIds: this.uniqueIds(raw.grantTypeIds),
        };

        const hasSecret = Boolean(raw.clientSecret);
        if (!this.isEditMode() && !hasSecret) {
            this.errorMsg.set(this.translate.instant('oauthClients.secretRequired'));
            return;
        }
        if (hasSecret) {
            payload.clientSecret = raw.clientSecret;
        }

        this.saving.set(true);
        this.errorMsg.set('');
        this.saveSub?.unsubscribe();

        if (this.isEditMode() && this.editingId() !== null) {
            this.saveSub = this.oauthClientsService.update(this.editingId() as number, payload)
                .pipe(take(1))
                .subscribe({
                    next: () => this.finishSave(),
                    error: () => this.handleSaveError(),
                });
            return;
        }

        this.saveSub = this.oauthClientsService.create(payload)
            .pipe(take(1))
            .subscribe({
                next: () => this.finishSave(),
                error: () => this.handleSaveError(),
            });
    }

    private finishSave() {
        this.saving.set(false);
        this.isModalOpen.set(false);
        this.oauthClientsReloadService.triggerReload();
    }

    private handleSaveError() {
        this.saving.set(false);
        this.errorMsg.set(this.translate.instant('oauthClients.saveError'));
    }

    private buildColumnDefs(): void {
        this.columnDefs = [
            {
                field: 'id' as keyof OAuthClient,
                headerName: this.translate.instant('oauthClients.table.id'),
                minWidth: 80,
                maxWidth: 120
            },
            { field: 'clientId' as keyof OAuthClient, headerName: this.translate.instant('oauthClients.table.clientId'), flex: 1 },
            {
                field: 'scopes' as keyof OAuthClient,
                headerName: this.translate.instant('oauthClients.table.scopes'),
                flex: 1,
                valueFormatter: (params) => this.joinNames(params.value as Scope[])
            },
            {
                field: 'redirectUris' as keyof OAuthClient,
                headerName: this.translate.instant('oauthClients.table.redirectUris'),
                flex: 1,
                valueFormatter: (params) => this.joinNames(params.value as RedirectUri[])
            },
            {
                field: 'grantTypes' as keyof OAuthClient,
                headerName: this.translate.instant('oauthClients.table.grantTypes'),
                flex: 1,
                valueFormatter: (params) => this.joinValues(params.value as GrantType[])
            }
        ];
    }

    private buildRowActions(): void {
        this.rowActions = [
            {
                id: 'detail',
                label: this.translate.instant('oauthClients.action.detail'),
                icon: 'fa-solid fa-eye',
                handler: (row) => this.onDetail(row)
            },
            {
                id: 'edit',
                label: this.translate.instant('oauthClients.action.edit'),
                icon: 'fa-solid fa-pen',
                handler: (row) => this.onEdit(row)
            },
            {
                id: 'delete',
                label: this.translate.instant('oauthClients.action.delete'),
                icon: 'fa-solid fa-trash',
                handler: (row) => this.onDelete(row)
            }
        ];
    }

    loadOauthClients = (query: DataTableQuery): Observable<DataTableResult<OAuthClient>> => {
        return this.oauthClientsService.list().pipe(
            map((items: OAuthClient[]) => {
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

    private loadReferenceData(): void {
        this.scopesService.list().pipe(take(1)).subscribe({
            next: (scopes: Scope[]) => this.scopes.set(scopes),
            error: () => this.scopes.set([]),
        });
        this.redirectUrisService.list().pipe(take(1)).subscribe({
            next: (redirectUris: RedirectUri[]) => this.redirectUris.set(redirectUris),
            error: () => this.redirectUris.set([]),
        });
        this.grantTypesService.list().pipe(take(1)).subscribe({
            next: (grantTypes: GrantType[]) => this.grantTypes.set(grantTypes),
            error: () => this.grantTypes.set([]),
        });
    }

    filteredScopes(): Scope[] {
        return this.filterByTerm(this.scopes(), this.scopeSearch());
    }

    filteredRedirectUris(): RedirectUri[] {
        return this.filterByTerm(this.redirectUris(), this.redirectUriSearch());
    }

    filteredGrantTypes(): GrantType[] {
        return this.filterByTerm(this.grantTypes(), this.grantTypeSearch());
    }

    toggleSelection(controlName: 'scopeIds' | 'redirectUriIds' | 'grantTypeIds', id: number): void {
        const control = this.oauthClientForm.controls[controlName];
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

    private filterByTerm<T extends { name?: string; uniqueName?: string; value?: string }>(items: T[], term: string): T[] {
        const normalized = term.trim().toLowerCase();
        if (!normalized) {
            return items;
        }
        return items.filter((item) => {
            const name = (item.name ?? '').toLowerCase();
            const uniqueName = (item.uniqueName ?? '').toLowerCase();
            const value = (item.value ?? '').toLowerCase();
            return name.includes(normalized) || uniqueName.includes(normalized) || value.includes(normalized);
        });
    }

    private collectIds(items?: Array<{ id: number }>): number[] {
        if (!items?.length) {
            return [];
        }
        return Array.from(new Set(items.map((item) => item.id)));
    }

    private uniqueIds(ids: number[]): number[] {
        return Array.from(new Set(ids ?? []));
    }

    private joinNames(items?: Array<{ name?: string }>): string {
        if (!items?.length) {
            return '-';
        }
        return items.map((item) => item.name).filter(Boolean).join(', ');
    }

    private joinValues(items?: Array<{ value?: string }>): string {
        if (!items?.length) {
            return '-';
        }
        return items.map((item) => item.value).filter(Boolean).join(', ');
    }

    getScopeNames(client: OAuthClient): string {
        return this.joinNames(client.scopes);
    }

    getRedirectUriNames(client: OAuthClient): string {
        return this.joinNames(client.redirectUris);
    }

    getGrantTypeValues(client: OAuthClient): string {
        return this.joinValues(client.grantTypes);
    }

    private applySort(data: OAuthClient[], sortModel: SortModelItem[]): OAuthClient[] {
        if (!sortModel?.length) {
            return data;
        }

        const sorted = [...data];
        sorted.sort((a, b) => this.compareBySortModel(a, b, sortModel));
        return sorted;
    }

    private applyFilters(data: OAuthClient[], filterModel: Record<string, unknown>): OAuthClient[] {
        const entries = Object.entries(filterModel ?? {});
        if (entries.length === 0) {
            return data;
        }

        return data.filter((row) =>
            entries.every(([field, rawModel]) => this.matchesFilter(row, field, rawModel))
        );
    }

    private compareBySortModel(a: OAuthClient, b: OAuthClient, sortModel: SortModelItem[]): number {
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

    private matchesFilter(row: OAuthClient, field: string, rawModel: unknown): boolean {
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

    private getFieldValue(row: OAuthClient, field: string): unknown {
        return (row as unknown as Record<string, unknown>)[field];
    }

    trackByOauthClientId = (row: OAuthClient) => String(row.id);
}
