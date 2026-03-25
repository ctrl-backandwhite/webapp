import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBannerComponent } from './mock-banner.component';
import { MockIndicatorService } from '../../../core/mock/mock-indicator.service';

describe('MockBannerComponent', () => {
    let component: MockBannerComponent;
    let fixture: ComponentFixture<MockBannerComponent>;
    let mockIndicator: MockIndicatorService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MockBannerComponent],
            providers: [MockIndicatorService],
        }).compileComponents();

        fixture = TestBed.createComponent(MockBannerComponent);
        component = fixture.componentInstance;
        mockIndicator = TestBed.inject(MockIndicatorService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return empty resources string when no mocks active', () => {
        expect(component.resources()).toBe('');
    });

    it('should return comma-separated resources when mocks active', () => {
        mockIndicator.activate('roles');
        mockIndicator.activate('users');
        expect(component.resources()).toContain('roles');
        expect(component.resources()).toContain('users');
    });
});
