import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/workflow-list/workflow-list.component').then(c => c.WorkflowListComponent)
  },
  {
    path: 'designer',
    loadComponent: () => import('./components/workflow-designer/workflow-designer.component').then(c => c.WorkflowDesignerComponent)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./components/workflow-details/workflow-details.component').then(c => c.WorkflowDetailsComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/workflows-not-found/workflows-not-found.component').then(c => c.WorkflowsNotFoundComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule { }
