import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MockIndicatorService {

    /** Set of resource names currently served from mock data */
    private readonly _activeResources = signal<Set<string>>(new Set());

    /** True when at least one resource is returning mock data */
    readonly isActive = computed(() => this._activeResources().size > 0);

    /** Human-readable list of resources currently mocked */
    readonly activeResources = computed(() => [...this._activeResources()]);

    /** Mark a resource as being served from mock data */
    activate(resource: string): void {
        this._activeResources.update(set => {
            const next = new Set(set);
            next.add(resource);
            return next;
        });
    }

    /** Mark a resource as being served from real backend */
    deactivate(resource: string): void {
        this._activeResources.update(set => {
            const next = new Set(set);
            next.delete(resource);
            return next;
        });
    }

    /** Clear all mock indicators */
    reset(): void {
        this._activeResources.set(new Set());
    }
}
