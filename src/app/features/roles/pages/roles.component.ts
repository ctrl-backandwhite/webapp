
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Role } from '../interfaces/role.model';
import { RolesService } from '../services/roles.service';
import { RolesReloadService } from '../services/roles-reload.service';
import { DataTableComponent } from '../../../shared/data-table/data-table.component';
import type { DataTableAction } from '../../../shared/data-table/data-table-actions-renderer.component';
import type { DataTableQuery, DataTableResult } from '../../../shared/data-table/data-table.component';
import type { ColDef, SortModelItem } from 'ag-grid-community';
import { map, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [DataTableComponent],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit, OnDestroy {
  private rolesReloadService = inject(RolesReloadService);
  private rolesService = inject(RolesService);
  private reloadSub?: Subscription;

  reloadToken = 0;

  columnDefs: ColDef<Role>[] = [
    { field: 'id' as keyof Role, headerName: 'ID', minWidth: 80, maxWidth: 120 },
    { field: 'name' as keyof Role, headerName: 'Nombre', flex: 1 },
    { field: 'uniqueName' as keyof Role, headerName: 'Nombre Único', flex: 1 },
    { field: 'description' as keyof Role, headerName: 'Descripción', flex: 2 },
    {
      field: 'enabled' as keyof Role,
      headerName: 'Activo',
      minWidth: 100,
      maxWidth: 120,
      cellRenderer: (params: { value: boolean }) => params.value ? 'Sí' : 'No',
    },
  ];

  rowActions: DataTableAction<Role>[] = [
    { id: 'detail', label: 'Detalle', icon: 'fa-solid fa-eye', handler: (row) => this.onDetailRole(row) },
    { id: 'edit', label: 'Editar', icon: 'fa-solid fa-pen', handler: (row) => this.onEditRole(row) },
    { id: 'delete', label: 'Eliminar', icon: 'fa-solid fa-trash', handler: (row) => this.onDeleteRole(row) },
  ];

  onEditRole(row: Role) {
    alert('Editar: ' + row.name);
  }

  onDeleteRole(row: Role) {
    alert('Eliminar: ' + row.name);
  }

  onDetailRole(row: Role) {
    alert('Detalle: ' + row.name);
  }

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  };
  ngOnInit() {
    this.reloadSub = this.rolesReloadService.reload$.subscribe(() => {
      this.reloadToken += 1;
    });
  }

  ngOnDestroy(): void {
    this.reloadSub?.unsubscribe();
  }

  loadRoles = (query: DataTableQuery): Observable<DataTableResult<Role>> => {
    return this.rolesService.getRoles().pipe(
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
    sorted.sort((a, b) => {
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
    });
    return sorted;
  }

  private applyFilters(data: Role[], filterModel: Record<string, unknown>): Role[] {
    const entries = Object.entries(filterModel ?? {});
    if (entries.length === 0) {
      return data;
    }

    return data.filter((row) => {
      return entries.every(([field, rawModel]) => {
        const model = rawModel as { filterType?: string; type?: string; filter?: unknown };
        const value = this.getFieldValue(row, field);

        if (!model || model.filter === undefined || model.filter === null) {
          return true;
        }

        if (model.filterType === 'text') {
          const filterValue = String(model.filter).toLowerCase();
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

        if (model.filterType === 'number') {
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

        if (model.filterType === 'boolean') {
          return Boolean(value) === Boolean(model.filter);
        }

        return true;
      });
    });
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
}
