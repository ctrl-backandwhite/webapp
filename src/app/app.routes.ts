import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './core/auth/auth-callback.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    data: { breadcrumb: 'breadcrumb.admin' },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'breadcrumb.dashboard' },
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/pages/roles.component').then(m => m.RolesComponent),
        data: { breadcrumb: 'breadcrumb.roles' },
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/pages/users.component').then(m => m.UsersComponent),
        data: { breadcrumb: 'breadcrumb.users' },
      },
      {
        path: 'groups',
        loadComponent: () => import('./features/groups/pages/groups.component').then(m => m.GroupsComponent),
        data: { breadcrumb: 'breadcrumb.groups' },
      },
      {
        path: 'scopes',
        loadComponent: () => import('./features/scopes/pages/scopes.component').then(m => m.ScopesComponent),
        data: { breadcrumb: 'breadcrumb.scopes' },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/admin',
  },
];
