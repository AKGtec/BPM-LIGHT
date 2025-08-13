import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../core/guards';

const routes = [
  {
    path: '',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(c => c.UserProfileComponent),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileModule { }
