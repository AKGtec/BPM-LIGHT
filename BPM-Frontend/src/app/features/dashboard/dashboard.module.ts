import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { ManagerDashboardComponent } from './components/manager-dashboard/manager-dashboard.component';
import { HRDashboardComponent } from './components/hr-dashboard/hr-dashboard.component';
import { ReportingDashboardComponent } from './components/reporting-dashboard/reporting-dashboard.component';

const routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'employee',
    component: EmployeeDashboardComponent
  },
  {
    path: 'manager',
    component: ManagerDashboardComponent,
    data: { roles: ['Manager', 'Admin'] }
  },
  {
    path: 'hr',
    component: HRDashboardComponent,
    data: { roles: ['HR', 'Admin'] }
  },
  {
    path: 'reports',
    component: ReportingDashboardComponent,
    data: { roles: ['Manager', 'HR', 'Admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardModule { }