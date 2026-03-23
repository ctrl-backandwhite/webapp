import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

export interface DataTableAction<T> {
    id: string;
    label: string;
    icon?: string;
    handler: (row: T) => void;
    buttonClass?: (row: T) => string;
}

@Component({
    selector: 'app-data-table-actions-renderer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './data-table-actions-renderer.component.html'
})
export class DataTableActionsRendererComponent implements ICellRendererAngularComp {
    actions: DataTableAction<any>[] = [];
    row?: any;

    agInit(params: ICellRendererParams): void {
        this.actions = (params as { actions?: DataTableAction<any>[] }).actions ?? [];
        this.row = params.data;
    }

    refresh(params: ICellRendererParams): boolean {
        this.actions = (params as { actions?: DataTableAction<any>[] }).actions ?? [];
        this.row = params.data;
        return true;
    }

    onAction(action: DataTableAction<any>) {
        if (this.row) {
            action.handler(this.row);
        }
    }
}
