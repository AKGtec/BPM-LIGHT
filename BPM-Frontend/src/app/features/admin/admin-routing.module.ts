import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

const routes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () => import('./components/admin-layout/admin-layout.component').then(c => c.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () => import('./components/user-management/user-management.component').then(c => c.UserManagementComponent)
      },
      {
        path: 'workflow-designer',
        loadComponent: () => import('./components/workflow-designer/workflow-designer.component').then(c => c.WorkflowDesignerComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
