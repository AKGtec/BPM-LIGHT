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
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/admin/components/system-settings/system-settings.component').then(c => c.SystemSettingsComponent),
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'hr',
    loadChildren: () => import('./features/hr/hr.module').then(m => m.HRModule),
    canActivate: [AuthGuard],
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'manager',
    loadChildren: () => import('./features/manager/manager.module').then(m => m.ManagerModule),
    canActivate: [AuthGuard],
    data: { roles: ['Manager', 'Admin'] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications-page.component').then(c => c.NotificationsPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications/test',
    loadComponent: () => import('./features/notifications/notification-test.component').then(c => c.NotificationTestComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'icon-test',
    loadComponent: () => import('./shared/components/icon-test/icon-test.component').then(c => c.IconTestComponent)
  },
  {
    path: 'debug-workflows',
    loadComponent: () => import('./debug-workflows.component').then(c => c.DebugWorkflowsComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];