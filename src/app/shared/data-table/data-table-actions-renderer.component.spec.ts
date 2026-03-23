import { TestBed } from '@angular/core/testing';
import { DataTableActionsRendererComponent, DataTableAction } from './data-table-actions-renderer.component';
import type { ICellRendererParams } from 'ag-grid-community';

describe('DataTableActionsRendererComponent', () => {
    let component: DataTableActionsRendererComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DataTableActionsRendererComponent],
        });
        const fixture = TestBed.createComponent(DataTableActionsRendererComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should init with actions and row from params', () => {
        const handler = vi.fn();
        const actions: DataTableAction<any>[] = [
            { id: 'edit', label: 'Edit', handler },
        ];
        const data = { id: 1, name: 'Test' };

        component.agInit({ actions, data } as unknown as ICellRendererParams);

        expect(component.actions).toEqual(actions);
        expect(component.row).toEqual(data);
    });

    it('should default actions to empty array if not provided', () => {
        component.agInit({ data: { id: 1 } } as unknown as ICellRendererParams);
        expect(component.actions).toEqual([]);
    });

    it('should refresh with new params', () => {
        const handler = vi.fn();
        const actions: DataTableAction<any>[] = [
            { id: 'delete', label: 'Delete', handler },
        ];
        const data = { id: 2, name: 'Updated' };

        const result = component.refresh({ actions, data } as unknown as ICellRendererParams);

        expect(result).toBe(true);
        expect(component.actions).toEqual(actions);
        expect(component.row).toEqual(data);
    });

    it('should call action handler with row on onAction', () => {
        const handler = vi.fn();
        const action: DataTableAction<any> = { id: 'edit', label: 'Edit', handler };
        component.row = { id: 1, name: 'Row' };

        component.onAction(action);

        expect(handler).toHaveBeenCalledWith({ id: 1, name: 'Row' });
    });

    it('should not call handler if row is undefined', () => {
        const handler = vi.fn();
        const action: DataTableAction<any> = { id: 'edit', label: 'Edit', handler };
        component.row = undefined;

        component.onAction(action);

        expect(handler).not.toHaveBeenCalled();
    });
});
