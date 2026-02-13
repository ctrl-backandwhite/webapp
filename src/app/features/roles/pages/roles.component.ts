
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Role } from '../interfaces/role.model';
import { RolesService } from '../services/roles.service';
import { RolesReloadService } from '../services/roles-reload.service';
import { AgGridModule } from 'ag-grid-angular';
import { ActionsRendererComponent } from '../components/actions-renderer.component';

import { themeQuartz } from 'ag-grid-community';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private rolesReloadService = inject(RolesReloadService);
  private reloadSub: any;

  private rolesService = inject(RolesService);
  private router = inject(Router);
  private routerSubscription: any;


  columnDefs: import('ag-grid-community').ColDef<Role>[] = [
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
    {
      headerName: 'Acciones',
      cellRenderer: ActionsRendererComponent,
      minWidth: 120,
      maxWidth: 160,
      pinned: 'right',
      sortable: false,
      filter: false,
    },
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
  rowData: Role[] = [];
  errorMsg = '';
  theme = themeQuartz;
  pagination = true;
  paginationPageSize = 10;

  ngOnInit() {
    // Asignar handlers a cellRendererParams después de que this esté inicializado
    const actionsCol = this.columnDefs.find(col => col.headerName === 'Acciones');
    if (actionsCol) {
      actionsCol.cellRendererParams = {
        onDetail: (row: Role) => this.onDetailRole(row),
        onEdit: (row: Role) => this.onEditRole(row),
        onDelete: (row: Role) => this.onDeleteRole(row),
      };
    }
    this.loadRoles();
    this.reloadSub = this.rolesReloadService.reload$.subscribe(() => this.loadRoles());
  }


  private loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.rowData = [...roles];
        this.errorMsg = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.rowData = [];
        this.errorMsg = 'No se pudieron cargar los roles. Verifica la API o la conexión.';
        console.error('Error al cargar roles:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
