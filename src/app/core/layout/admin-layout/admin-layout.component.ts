import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, SidebarComponent],
    templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent { }
