import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/requests-placeholder/requests-placeholder.component').then(c => c.RequestsPlaceholderComponent)
  },
  {
    path: 'new/:type',
    loadComponent: () => import('./components/request-form/request-form.component').then(c => c.RequestFormComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule { }
