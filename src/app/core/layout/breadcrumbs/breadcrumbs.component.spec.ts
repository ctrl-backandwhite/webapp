import { TestBed } from '@angular/core/testing';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('BreadcrumbsComponent', () => {
    let component: BreadcrumbsComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BreadcrumbsComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])],
        }).compileComponents();

        const fixture = TestBed.createComponent(BreadcrumbsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty crumbs', () => {
        expect(component.crumbs()).toEqual([]);
    });

    it('should clean up subscriptions on destroy', () => {
        expect(() => component.ngOnDestroy()).not.toThrow();
    });
});
