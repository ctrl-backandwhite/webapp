import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadComponent: () => import('./core/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    data: { breadcrumb: 'Administración' },
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
