import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(c => c.UserManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'workflow-designer',
    loadComponent: () => import('./components/workflow-designer/workflow-designer.component').then(c => c.WorkflowDesignerComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'roles',
    loadComponent: () => import('./components/role-management/role-management.component').then(c => c.RoleManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/system-settings/system-settings.component').then(c => c.SystemSettingsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/admin-reports/admin-reports.component').then(c => c.AdminReportsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: '**',
    loadComponent: () => import('./components/admin-not-found/admin-not-found.component').then(c => c.AdminNotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
