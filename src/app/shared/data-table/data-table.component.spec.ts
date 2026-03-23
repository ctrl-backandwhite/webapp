import { TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('DataTableComponent', () => {
    let component: DataTableComponent;
    let fixture: any;
    let translate: TranslateService;

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [DataTableComponent, TranslateModule.forRoot()],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        fixture = TestBed.createComponent(DataTableComponent);
        component = fixture.componentInstance;
        translate = TestBed.inject(TranslateService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should compute totalPages correctly', () => {
        component.totalRows.set(25);
        component.pageSizeSignal.set(10);
        expect(component.totalPages()).toBe(3);
    });

    it('should compute totalPages as 0 when no rows', () => {
        component.totalRows.set(0);
        component.pageSizeSignal.set(10);
        expect(component.totalPages()).toBe(0);
    });

    it('should set rows from rowData when no loadFn', () => {
        component.loadFn = undefined as any;
        component.rowData = [{ id: 1 }, { id: 2 }];
        component.ngOnChanges({
            rowData: { currentValue: component.rowData, previousValue: undefined, firstChange: true, isFirstChange: () => true },
        });
        expect(component.rows()).toEqual([{ id: 1 }, { id: 2 }]);
        expect(component.totalRows()).toBe(2);
    });

    it('should set totalRows from totalRowsCount when provided', () => {
        component.loadFn = undefined as any;
        component.rowData = [{ id: 1 }];
        component.totalRowsCount = 50;
        component.ngOnChanges({
            rowData: { currentValue: component.rowData, previousValue: undefined, firstChange: true, isFirstChange: () => true },
        });
        expect(component.totalRows()).toBe(50);
    });

    it('should not load on reloadToken first change', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.ngOnChanges({
            reloadToken: { currentValue: 1, previousValue: undefined, firstChange: true, isFirstChange: () => true },
        });
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should load on reloadToken subsequent change', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.ngOnChanges({
            reloadToken: { currentValue: 2, previousValue: 1, firstChange: false, isFirstChange: () => false },
        });
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should append actions column to gridColumnDefs when rowActions exist', () => {
        vi.spyOn(translate, 'instant').mockImplementation((key: string | string[]) =>
            Array.isArray(key) ? key.join(',') : key
        );
        component.columnDefs = [{ field: 'name' }];
        component.rowActions = [{ id: 'edit', label: 'Edit', handler: vi.fn() }];
        const defs = component.gridColumnDefs;
        expect(defs.length).toBe(2);
        expect(defs[1].pinned).toBe('right');
    });

    it('should not append actions column when no rowActions', () => {
        component.columnDefs = [{ field: 'name' }];
        component.rowActions = [];
        const defs = component.gridColumnDefs;
        expect(defs.length).toBe(1);
    });

    it('should changePageSize and reset page', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.pageSizeSignal.set(10);
        component.changePageSize(25);
        expect(component.pageSizeSignal()).toBe(25);
        expect(component.page()).toBe(1);
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should not change page size when NaN', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.changePageSize(NaN);
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should not change page size when same', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.pageSizeSignal.set(10);
        component.changePageSize(10);
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should goToPage within bounds', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.totalRows.set(50);
        component.pageSizeSignal.set(10);
        component.page.set(1);

        component.goToPage(3);
        expect(component.page()).toBe(3);
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should clamp goToPage to max', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.totalRows.set(50);
        component.pageSizeSignal.set(10);
        component.page.set(1);

        component.goToPage(100);
        expect(component.page()).toBe(5);
    });

    it('should not goToPage when totalPages is 0', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.totalRows.set(0);
        component.goToPage(1);
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should not goToPage when already on the same page', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.totalRows.set(50);
        component.pageSizeSignal.set(10);
        component.page.set(3);

        component.goToPage(3);
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('should call refresh which calls load', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        component.refresh();
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should emit selectedRowsChange on selectionChanged', () => {
        const spy = vi.spyOn(component.selectedRowsChange, 'emit');
        (component as any).gridApi = { getSelectedRows: () => [{ id: 1 }] };
        component.onSelectionChanged();
        expect(component.selectedRows()).toEqual([{ id: 1 }]);
        expect(spy).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('should emit rowClick on row clicked', () => {
        const spy = vi.spyOn(component.rowClick, 'emit');
        component.onRowClicked({ data: { id: 1 } });
        expect(spy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should not emit rowClick when no data', () => {
        const spy = vi.spyOn(component.rowClick, 'emit');
        component.onRowClicked({});
        expect(spy).not.toHaveBeenCalled();
    });

    it('should generate row id from data.id', () => {
        expect(component.gridGetRowId({ data: { id: 42 } })).toBe('42');
    });

    it('should generate row id from custom getRowId', () => {
        component.getRowId = (data: any) => `custom-${data.code}`;
        expect(component.gridGetRowId({ data: { code: 'ABC' } })).toBe('custom-ABC');
    });

    it('should return empty string for no data', () => {
        expect(component.gridGetRowId({})).toBe('');
    });

    it('should call action handler on onBulkAction', () => {
        const handler = vi.fn();
        component.selectedRows.set([{ id: 1 }, { id: 2 }]);
        component.onBulkAction({ id: 'delete', label: 'Delete', handler });
        expect(handler).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    it('should handle load error', () => {
        component.loadFn = () => throwError(() => new Error('fail'));
        (component as any).load();
        expect(component.rows()).toEqual([]);
        expect(component.totalRows()).toBe(0);
        expect(component.error()).toBe('No se pudieron cargar los datos.');
    });

    it('should handle load success', () => {
        component.loadFn = () => of({ rows: [{ id: 1 }], total: 1 });
        (component as any).load();
        expect(component.rows()).toEqual([{ id: 1 }]);
        expect(component.totalRows()).toBe(1);
        expect(component.loading()).toBe(false);
    });

    it('should not load if loadFn is undefined', () => {
        component.loadFn = undefined as any;
        expect(() => (component as any).load()).not.toThrow();
    });

    it('should save and restore state', () => {
        component.tableId = 'test-table';
        const mockApi = {
            getColumnState: () => [{ colId: 'name', sort: 'asc' }],
            getFilterModel: () => ({ name: { type: 'contains', filter: 'x' } }),
            applyColumnState: vi.fn(),
            setFilterModel: vi.fn(),
        };
        (component as any).gridApi = mockApi;

        (component as any).saveState();
        const saved = localStorage.getItem('data-table:test-table');
        expect(saved).toBeTruthy();

        (component as any).restoreState();
        expect(mockApi.applyColumnState).toHaveBeenCalled();
        expect(mockApi.setFilterModel).toHaveBeenCalled();
    });

    it('should remove invalid state from localStorage', () => {
        component.tableId = 'bad-table';
        localStorage.setItem('data-table:bad-table', 'NOT-JSON');
        (component as any).gridApi = {};
        (component as any).restoreState();
        expect(localStorage.getItem('data-table:bad-table')).toBeNull();
    });

    it('should canExportExcel return false by default', () => {
        (component as any).gridApi = {};
        expect(component.canExportExcel()).toBe(false);
    });

    it('should canExportExcel return true when api has method', () => {
        (component as any).gridApi = { exportDataAsExcel: vi.fn() };
        expect(component.canExportExcel()).toBe(true);
    });

    it('should exportCsv call api', () => {
        const exportFn = vi.fn();
        (component as any).gridApi = { exportDataAsCsv: exportFn };
        component.exportCsv();
        expect(exportFn).toHaveBeenCalled();
    });

    it('should onSortChanged reset page and save state', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        const saveSpy = vi.spyOn(component as any, 'saveState').mockImplementation(() => { });
        component.page.set(3);
        component.onSortChanged();
        expect(component.page()).toBe(1);
        expect(saveSpy).toHaveBeenCalled();
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should onFilterChanged reset page and save state', () => {
        const loadSpy = vi.spyOn(component as any, 'load');
        const saveSpy = vi.spyOn(component as any, 'saveState').mockImplementation(() => { });
        component.page.set(3);
        component.onFilterChanged();
        expect(component.page()).toBe(1);
        expect(saveSpy).toHaveBeenCalled();
        expect(loadSpy).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
        const sub = { unsubscribe: vi.fn() };
        (component as any).loadSub = sub;
        (component as any).langSub = sub;
        component.ngOnDestroy();
        expect(sub.unsubscribe).toHaveBeenCalledTimes(2);
    });

    it('should handle onPageSizeChange from event', () => {
        const spy = vi.spyOn(component, 'changePageSize');
        const event = { target: { value: '25' } } as unknown as Event;
        component.onPageSizeChange(event);
        expect(spy).toHaveBeenCalledWith(25);
    });
});
