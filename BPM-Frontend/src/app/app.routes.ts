import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'requests',
    loadChildren: () => import('./features/requests/requests.module').then(m => m.RequestsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'workflows',
    loadChildren: () => import('./features/workflows/workflows.module').then(m => m.WorkflowsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./shared/components/notification-list/notification-list.component').then(c => c.NotificationListComponent)
  },
  {
    path: 'icon-test',
    loadComponent: () => import('./shared/components/icon-test/icon-test.component').then(c => c.IconTestComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];