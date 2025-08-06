import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-background">
        <div class="auth-overlay"></div>
      </div>
      <div class="auth-content">
        <div class="auth-card-container">
          <div class="brand-section">
            <div class="brand-logo">
              <mat-icon class="brand-icon">business</mat-icon>
            </div>
            <h1 class="brand-title">BPM Light</h1>
            <p class="brand-subtitle">Intelligent Business Process Management Platform</p>
          </div>
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent { }