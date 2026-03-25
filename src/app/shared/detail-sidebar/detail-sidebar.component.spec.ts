import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailSidebarComponent } from './detail-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';

describe('DetailSidebarComponent', () => {
    let component: DetailSidebarComponent;
    let fixture: ComponentFixture<DetailSidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DetailSidebarComponent, TranslateModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(DetailSidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default open to false', () => {
        expect(component.open).toBe(false);
    });

    it('should default title to empty string', () => {
        expect(component.title).toBe('');
    });

    it('should emit close event on onClose', () => {
        const spy = vi.spyOn(component.close, 'emit');
        component.onClose();
        expect(spy).toHaveBeenCalled();
    });

    it('should accept title input', () => {
        component.title = 'Test Title';
        expect(component.title).toBe('Test Title');
    });
});
