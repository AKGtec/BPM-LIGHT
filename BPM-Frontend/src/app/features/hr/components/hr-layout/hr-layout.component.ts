import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-hr-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <div class="hr-layout">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav mode="side" opened class="sidenav">
          <div class="sidebar-header">
            <mat-icon class="hr-icon">people</mat-icon>
            <h2>HR Management</h2>
            <p>Human Resources Portal</p>
          </div>
          
          <mat-nav-list class="nav-menu">
            <!-- Dashboard Section -->
            <div class="nav-section">
              <h3 class="section-title">
                <mat-icon>dashboard</mat-icon>
                Overview
              </h3>
            </div>

            <a mat-list-item routerLink="/dashboard/hr" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>HR Dashboard</span>
            </a>

            <!-- Employee Management Section -->
            <div class="nav-section">
              <h3 class="section-title">
                <mat-icon>group</mat-icon>
                Employee Management
              </h3>
            </div>
            
            <a mat-list-item routerLink="employees" routerLinkActive="active">
              <mat-icon matListItemIcon>badge</mat-icon>
              <span matListItemTitle>Employee Records</span>
            </a>
            
            <a mat-list-item routerLink="performance-reviews" routerLinkActive="active">
              <mat-icon matListItemIcon>star_rate</mat-icon>
              <span matListItemTitle>Performance Reviews</span>
            </a>

            <!-- Request Management Section -->
            <div class="nav-section">
              <h3 class="section-title">
                <mat-icon>assignment</mat-icon>
                Request Management
              </h3>
            </div>
            
            <a mat-list-item routerLink="leave-management" routerLinkActive="active">
              <mat-icon matListItemIcon>event_available</mat-icon>
              <span matListItemTitle>Leave Management</span>
            </a>
            
            <a mat-list-item routerLink="/requests/approval" routerLinkActive="active">
              <mat-icon matListItemIcon>approval</mat-icon>
              <span matListItemTitle>Pending Approvals</span>
            </a>

            <!-- Reports & Analytics Section -->
            <div class="nav-section">
              <h3 class="section-title">
                <mat-icon>analytics</mat-icon>
                Reports & Analytics
              </h3>
            </div>
            
            <a mat-list-item routerLink="reports" routerLinkActive="active">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>HR Reports</span>
            </a>

            <!-- Policy Management Section -->
            <div class="nav-section">
              <h3 class="section-title">
                <mat-icon>policy</mat-icon>
                Policies & Procedures
              </h3>
            </div>
            
            <a mat-list-item routerLink="policies" routerLinkActive="active">
              <mat-icon matListItemIcon>description</mat-icon>
              <span matListItemTitle>Policy Management</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styleUrls: ['./hr-layout.component.scss']
})
export class HRLayoutComponent {}