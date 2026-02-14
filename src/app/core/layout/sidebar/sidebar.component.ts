import { Component, signal } from '@angular/core';
import { RolesReloadService } from '../../../features/roles/services/roles-reload.service';
import { RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  host: { '[class.collapsed]': 'isCollapsed()' },
  imports: [RouterLink, TranslateModule]
})
export class SidebarComponent {
  isCollapsed = signal(false);

  constructor(private rolesReloadService: RolesReloadService) { }


  // reloadRoles y onRolesClick eliminados: la recarga se maneja solo en el componente de roles

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
