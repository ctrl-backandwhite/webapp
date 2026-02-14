import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, signal, computed, inject } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import type { ColDef, ColumnState, GridApi, GridReadyEvent, SortModelItem } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { Observable, Subscription } from 'rxjs';
import { DataTableActionsRendererComponent, DataTableAction } from './data-table-actions-renderer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface DataTableQuery {
  page: number;
  pageSize: number;
  sortModel: SortModelItem[];
  filterModel: Record<string, unknown>;
}

export interface DataTableResult<T> {
  rows: T[];
  total: number;
}

export type DataTableLoadFn<T> = (query: DataTableQuery) => Observable<DataTableResult<T>>;

export interface DataTableBulkAction<T> {
  id: string;
  label: string;
  handler: (rows: T[]) => void;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, AgGridModule, TranslateModule],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent implements OnInit, OnChanges, OnDestroy {
  private readonly translate = inject(TranslateService);
  @Input({ required: true }) tableId = '';
  @Input({ required: true }) columnDefs: ColDef[] = [];
  @Input() defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  };
  @Input() title = '';
  @Input() loadFn?: DataTableLoadFn<unknown>;
  @Input() rowData: unknown[] = [];
  @Input() totalRowsCount?: number;
  @Input() rowActions: DataTableAction<any>[] = [];
  @Input() bulkActions: DataTableBulkAction<any>[] = [];
  @Input() enableSelection = false;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50];
  @Input() overlayNoRowsTemplate = '';
  @Input() reloadToken = 0;
  @Input() getRowId?: (row: any) => string;

  @Output() selectedRowsChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();

  theme = themeQuartz;
  rows = signal<any[]>([]);
  totalRows = signal(0);
  loading = signal(false);
  error = signal('');
  page = signal(1);
  pageSizeSignal = signal(10);
  selectedRows = signal<any[]>([]);
  localeText = signal<Record<string, string>>({});

  totalPages = computed(() => {
    const total = this.totalRows();
    const size = this.pageSizeSignal();
    if (total === 0) {
      return 0;
    }
    return Math.max(1, Math.ceil(total / size));
  });

  gridApi?: GridApi;
  private loadSub?: Subscription;
  private langSub?: Subscription;
  private usesDefaultOverlay = true;

  ngOnInit() {
    if (this.overlayNoRowsTemplate) {
      this.usesDefaultOverlay = false;
    }
    this.applyTranslatedOverlay();
    this.localeText.set(this.buildLocaleText());
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.applyTranslatedOverlay();
      this.localeText.set(this.buildLocaleText());
      if (this.gridApi) {
        this.gridApi.setGridOption('columnDefs', this.gridColumnDefs);
        (this.gridApi as unknown as { setGridOption: (key: string, value: unknown) => void })
          .setGridOption('localeText', this.localeText());
      }
    });
    this.pageSizeSignal.set(this.pageSize);
    if (!this.loadFn) {
      this.rows.set(this.rowData ?? []);
      this.totalRows.set(this.totalRowsCount ?? this.rowData.length);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['overlayNoRowsTemplate'] && !changes['overlayNoRowsTemplate'].firstChange) {
      this.usesDefaultOverlay = !this.overlayNoRowsTemplate;
      this.applyTranslatedOverlay();
    }

    if (changes['columnDefs'] && this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.gridColumnDefs);
    }

    if (changes['rowActions'] && this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.gridColumnDefs);
    }

    if (changes['reloadToken'] && !changes['reloadToken'].firstChange) {
      this.load();
    }

    if (changes['rowData'] && !this.loadFn) {
      this.rows.set(this.rowData ?? []);
      this.totalRows.set(this.totalRowsCount ?? this.rowData.length);
    }
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  get gridColumnDefs(): ColDef[] {
    const defs = [...this.columnDefs];

    if (this.enableSelection) {
      defs.unshift({
        headerName: '',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 52,
        maxWidth: 52,
        pinned: 'left',
        sortable: false,
        filter: false,
        resizable: false,
      });
    }

    if (this.rowActions.length > 0) {
      defs.push({
        headerName: this.translate.instant('table.actions'),
        cellRenderer: DataTableActionsRendererComponent,
        headerClass: 'ag-header-center',
        minWidth: 140,
        maxWidth: 220,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRendererParams: {
          actions: this.rowActions,
        },
      });
    }

    return defs;
  }

  private applyTranslatedOverlay(): void {
    if (this.usesDefaultOverlay) {
      this.overlayNoRowsTemplate = this.translate.instant('table.noRows');
    }
  }

  private buildLocaleText(): Record<string, string> {
    return {
      filterOoo: this.translate.instant('grid.filter.search'),
      equals: this.translate.instant('grid.filter.equals'),
      notEqual: this.translate.instant('grid.filter.notEqual'),
      greaterThan: this.translate.instant('grid.filter.greaterThan'),
      greaterThanOrEqual: this.translate.instant('grid.filter.greaterThanOrEqual'),
      lessThan: this.translate.instant('grid.filter.lessThan'),
      lessThanOrEqual: this.translate.instant('grid.filter.lessThanOrEqual'),
      inRange: this.translate.instant('grid.filter.inRange'),
      contains: this.translate.instant('grid.filter.contains'),
      notContains: this.translate.instant('grid.filter.notContains'),
      startsWith: this.translate.instant('grid.filter.startsWith'),
      endsWith: this.translate.instant('grid.filter.endsWith'),
      blank: this.translate.instant('grid.filter.blank'),
      notBlank: this.translate.instant('grid.filter.notBlank'),
      andCondition: this.translate.instant('grid.filter.and'),
      orCondition: this.translate.instant('grid.filter.or')
    };
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.restoreState();
    (this.gridApi as unknown as { setGridOption: (key: string, value: unknown) => void })
      .setGridOption('localeText', this.localeText());
    this.load();
  }

  onSelectionChanged() {
    const rows = this.gridApi?.getSelectedRows() ?? [];
    this.selectedRows.set(rows);
    this.selectedRowsChange.emit(rows);
  }

  onRowClicked(event: { data?: any }) {
    if (event?.data) {
      this.rowClick.emit(event.data);
    }
  }

  gridGetRowId = (params: { data?: any }) => {
    if (!params?.data) {
      return '';
    }
    if (this.getRowId) {
      return this.getRowId(params.data);
    }
    const fallback = params.data?.id;
    return typeof fallback === 'number' ? String(fallback) : (fallback ?? '');
  };

  onSortChanged() {
    this.page.set(1);
    this.saveState();
    this.load();
  }

  onFilterChanged() {
    this.page.set(1);
    this.saveState();
    this.load();
  }

  changePageSize(size: number) {
    if (Number.isNaN(size) || size === this.pageSizeSignal()) {
      return;
    }

    this.pageSizeSignal.set(size);
    this.page.set(1);
    this.load();
  }

  onPageSizeChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.changePageSize(value);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if (total === 0) {
      return;
    }

    const next = Math.min(Math.max(1, page), total);
    if (next === this.page()) {
      return;
    }

    this.page.set(next);
    this.load();
  }

  exportCsv() {
    this.gridApi?.exportDataAsCsv();
  }

  exportExcel() {
    const api = this.gridApi as unknown as { exportDataAsExcel?: () => void };
    api?.exportDataAsExcel?.();
  }

  onBulkAction(action: DataTableBulkAction<any>) {
    action.handler(this.selectedRows());
  }

  private load() {
    if (!this.loadFn) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.loadSub?.unsubscribe();
    this.loadSub = this.loadFn(this.buildQuery()).subscribe({
      next: (result) => {
        this.rows.set(result.rows);
        this.totalRows.set(result.total);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.totalRows.set(0);
        this.loading.set(false);
        this.error.set('No se pudieron cargar los datos.');
      },
    });
  }

  private buildQuery(): DataTableQuery {
    return {
      page: this.page(),
      pageSize: this.pageSizeSignal(),
      sortModel: this.buildSortModel(this.gridApi?.getColumnState() ?? []),
      filterModel: this.gridApi?.getFilterModel() ?? {},
    };
  }

  private storageKey(): string {
    return `data-table:${this.tableId}`;
  }

  private saveState(): void {
    if (!this.tableId || !this.gridApi) {
      return;
    }

    const state = {
      columnState: this.gridApi.getColumnState(),
      filterModel: this.gridApi.getFilterModel(),
    };

    localStorage.setItem(this.storageKey(), JSON.stringify(state));
  }

  private restoreState(): void {
    if (!this.tableId || !this.gridApi) {
      return;
    }

    const raw = localStorage.getItem(this.storageKey());
    if (!raw) {
      return;
    }

    try {
      const state = JSON.parse(raw) as { columnState?: unknown; filterModel?: Record<string, unknown> };
      if (state.columnState && Array.isArray(state.columnState)) {
        this.gridApi.applyColumnState({ state: state.columnState, applyOrder: true });
      }
      if (state.filterModel) {
        this.gridApi.setFilterModel(state.filterModel);
      }
    } catch {
      localStorage.removeItem(this.storageKey());
    }
  }

  canExportExcel(): boolean {
    const api = this.gridApi as unknown as { exportDataAsExcel?: () => void } | undefined;
    return Boolean(api?.exportDataAsExcel);
  }

  private buildSortModel(columnState: ColumnState[]): SortModelItem[] {
    return columnState
      .filter((col) => Boolean(col.sort))
      .map((col) => ({ colId: col.colId, sort: col.sort ?? 'asc' }));
  }
}
