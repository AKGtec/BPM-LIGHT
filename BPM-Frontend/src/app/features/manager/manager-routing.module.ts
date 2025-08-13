import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'team-management',
    pathMatch: 'full'
  },
  {
    path: 'team-management',
    loadComponent: () => import('./components/team-management/team-management.component').then(c => c.TeamManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Manager', 'Admin'] }
  },
  {
    path: 'team-reports',
    loadComponent: () => import('./components/team-reports/team-reports.component').then(c => c.TeamReportsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['Manager', 'Admin'] }
  },
  {
    path: '**',
    loadComponent: () => import('./components/manager-not-found/manager-not-found.component').then(c => c.ManagerNotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }
