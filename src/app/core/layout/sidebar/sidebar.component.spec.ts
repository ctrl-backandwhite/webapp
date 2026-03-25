import { TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('SidebarComponent', () => {
    let component: SidebarComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarComponent, TranslateModule.forRoot()],
            providers: [provideRouter([])],
        }).compileComponents();

        const fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should start as not collapsed', () => {
        expect(component.isCollapsed()).toBe(false);
    });

    describe('toggle', () => {
        it('should toggle collapsed state', () => {
            component.toggle();
            expect(component.isCollapsed()).toBe(true);
            component.toggle();
            expect(component.isCollapsed()).toBe(false);
        });
    });

    describe('toggleMenu', () => {
        it('should expand a menu item with children', () => {
            const item = component.menuItems[0]; // 'Users' with children
            component.toggleMenu(item);
            expect(component.isExpanded(item)).toBe(true);
        });

        it('should collapse an already expanded menu item', () => {
            const item = component.menuItems[0];
            component.toggleMenu(item);
            component.toggleMenu(item);
            expect(component.isExpanded(item)).toBe(false);
        });

        it('should switch expansion to a different item', () => {
            const item1 = component.menuItems[0];
            const item2 = component.menuItems[1];
            component.toggleMenu(item1);
            component.toggleMenu(item2);
            expect(component.isExpanded(item1)).toBe(false);
            expect(component.isExpanded(item2)).toBe(true);
        });
    });

    describe('isExpanded', () => {
        it('should return false when no item is expanded', () => {
            expect(component.isExpanded(component.menuItems[0])).toBe(false);
        });
    });

    it('should have menu items configured', () => {
        expect(component.menuItems.length).toBeGreaterThan(0);
        expect(component.menuItems[0].labelKey).toBeDefined();
    });
});
