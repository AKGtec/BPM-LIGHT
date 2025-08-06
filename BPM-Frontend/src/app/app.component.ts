import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { SignalRService } from './core/services/signalr.service';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MainLayoutComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'BPM-Frontend';
  isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private signalRService: SignalRService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }
}
