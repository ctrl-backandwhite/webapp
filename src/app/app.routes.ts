import { Routes } from '@angular/router';
import { AuthCallbackComponent } from './auth/auth-callback.component';

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
    ],
  },
  {
    path: '**',
    redirectTo: '/admin',
  },
];
