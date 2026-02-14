import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./core/auth/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    data: { breadcrumb: 'Administración' },
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/pages/roles.component').then(m => m.RolesComponent),
        data: { breadcrumb: 'Roles' },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/admin',
  },
];
