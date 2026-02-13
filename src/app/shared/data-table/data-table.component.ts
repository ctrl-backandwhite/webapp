import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, signal, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import type { ColDef, ColumnState, GridApi, GridReadyEvent, SortModelItem } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { Observable, Subscription } from 'rxjs';
import { DataTableActionsRendererComponent, DataTableAction } from './data-table-actions-renderer.component';

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
  imports: [CommonModule, AgGridModule],
  templateUrl: './data-table.component.html'
})
export class DataTableComponent implements OnInit, OnChanges, OnDestroy {
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
  @Input() overlayNoRowsTemplate = 'No hay registros para mostrar';
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

  ngOnInit() {
    this.pageSizeSignal.set(this.pageSize);
    if (!this.loadFn) {
      this.rows.set(this.rowData ?? []);
      this.totalRows.set(this.totalRowsCount ?? this.rowData.length);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
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
        headerName: 'Acciones',
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

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.restoreState();
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
