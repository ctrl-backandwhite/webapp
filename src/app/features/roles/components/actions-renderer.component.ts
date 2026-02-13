import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-actions-renderer',
  standalone: true,
  template: `
    <div class="flex gap-2 justify-center items-center pt-2">
      <button class="btn btn-xs bg-base-200 border-none hover:bg-base-300" (click)="onDetail()" title="Ver Detalle">
        <i class="fa-solid fa-eye text-base-content/60 text-sm"></i>
      </button>
      <button class="btn btn-xs bg-base-200 border-none hover:bg-base-300" (click)="onEdit()" title="Editar">
        <i class="fa-solid fa-pen text-base-content/60 text-sm"></i>
      </button>
      <button class="btn btn-xs bg-base-200 border-none hover:bg-base-300" (click)="onDelete()" title="Eliminar">
        <i class="fa-solid fa-trash text-base-content/60 text-sm"></i>
      </button>
    </div>
  `
})
export class ActionsRendererComponent implements ICellRendererAngularComp {
  params: any;

  onDetail() {
    if (this.params && this.params.onDetail) {
      this.params.onDetail(this.params.data);
    }
  }

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  onEdit() {
    if (this.params && this.params.onEdit) {
      this.params.onEdit(this.params.data);
    }
  }

  onDelete() {
    if (this.params && this.params.onDelete) {
      this.params.onDelete(this.params.data);
    }
  }
}
