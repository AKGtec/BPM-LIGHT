import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/request-list/request-list.component').then(c => c.RequestListComponent)
  },
  {
    path: 'new/:type',
    loadComponent: () => import('./components/request-form/request-form.component').then(c => c.RequestFormComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/request-form/request-form.component').then(c => c.RequestFormComponent)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./components/request-details/request-details.component').then(c => c.RequestDetailsComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/request-form/request-form.component').then(c => c.RequestFormComponent)
  },
  {
    path: 'approval',
    loadComponent: () => import('./components/request-approval/request-approval.component').then(c => c.RequestApprovalComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/requests-not-found/requests-not-found.component').then(c => c.RequestsNotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule { }
