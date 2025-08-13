import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// All components are now loaded dynamically


const routes = [
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
    loadComponent: () => import('./components/manager-dashboard/manager-dashboard.component').then(c => c.ManagerDashboardComponent),
    data: { roles: ['Manager', 'Admin'] }
  },
  {
    path: 'hr',
    loadComponent: () => import('./components/hr-dashboard/hr-dashboard.component').then(c => c.HRDashboardComponent),
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reporting-dashboard/reporting-dashboard.component').then(c => c.ReportingDashboardComponent),
    data: { roles: ['Manager', 'HR', 'Admin'] }
  },
  {
    path: 'reporting',
    loadComponent: () => import('./components/reporting-dashboard/reporting-dashboard.component').then(c => c.ReportingDashboardComponent),
    data: { roles: ['Manager', 'HR', 'Admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardModule { }