import { Component, computed, inject } from '@angular/core';
import { MockIndicatorService } from '../../../core/mock/mock-indicator.service';

@Component({
    selector: 'app-mock-banner',
    standalone: true,
    templateUrl: './mock-banner.component.html',
})
export class MockBannerComponent {
    private readonly mockIndicator = inject(MockIndicatorService);

    readonly resources = computed(() =>
        this.mockIndicator.activeResources().join(', ')
    );
}
