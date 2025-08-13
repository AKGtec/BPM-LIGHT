import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard-layout/dashboard-layout.component').then(c => c.DashboardLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'employee',
        loadComponent: () => import('./components/employee-dashboard/employee-dashboard.component').then(c => c.EmployeeDashboardComponent)
      },
      {
        path: 'manager',
        loadComponent: () => import('./components/manager-dashboard/manager-dashboard.component').then(c => c.ManagerDashboardComponent)
      },
      {
        path: 'hr',
        loadComponent: () => import('./components/hr-dashboard/hr-dashboard.component').then(c => c.HRDashboardComponent)
      },
      {
        path: 'reporting',
        loadComponent: () => import('./components/reporting-dashboard/reporting-dashboard.component').then(c => c.ReportingDashboardComponent)
      },
      {
        path: '**',
        loadComponent: () => import('./components/dashboard-not-found/dashboard-not-found.component').then(c => c.DashboardNotFoundComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
