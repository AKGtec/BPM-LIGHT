import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

const routes: Routes = [
  {
    path: 'leave-management',
    loadComponent: () => import('./components/leave-management/leave-management.component').then(c => c.LeaveManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'employees',
    loadComponent: () => import('./components/employee-management/employee-management.component').then(c => c.EmployeeManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'performance-reviews',
    loadComponent: () => import('./components/performance-reviews/performance-reviews.component').then(c => c.PerformanceReviewsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'policies',
    loadComponent: () => import('./components/policy-management/policy-management.component').then(c => c.PolicyManagementComponent),
    canActivate: [RoleGuard],
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/hr-reports/hr-reports.component').then(c => c.HRReportsComponent),
    canActivate: [RoleGuard],
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: '**',
    loadComponent: () => import('./components/hr-not-found/hr-not-found.component').then(c => c.HRNotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HRRoutingModule { }
