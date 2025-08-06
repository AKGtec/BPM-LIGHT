import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards';

const routes: Routes = [
  {
    path: '',
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () => import('./components/admin-placeholder/admin-placeholder.component').then(c => c.AdminPlaceholderComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
