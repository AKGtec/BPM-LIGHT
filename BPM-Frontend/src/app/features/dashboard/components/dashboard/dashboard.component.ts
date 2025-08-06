import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/auth.service';
import { UserDto } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>Welcome back, {{currentUser?.firstName}}!</h1>
        <p>Here's what's happening with your business processes today.</p>
      </div>

      <div class="dashboard-grid">
        <!-- Employee Dashboard Card -->
        <mat-card class="dashboard-card" (click)="navigateTo('/dashboard/employee')">
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>My Dashboard</mat-card-title>
            <mat-card-subtitle>View your requests and tasks</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-number">{{employeeStats.pendingRequests}}</span>
                <span class="stat-label">Pending Requests</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{employeeStats.completedRequests}}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">
              <mat-icon>arrow_forward</mat-icon>
              View Details
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Manager Dashboard Card -->
        <mat-card 
          class="dashboard-card" 
          *ngIf="hasManagerAccess"
          (click)="navigateTo('/dashboard/manager')">
          <mat-card-header>
            <mat-icon mat-card-avatar>supervisor_account</mat-icon>
            <mat-card-title>Manager Dashboard</mat-card-title>
            <mat-card-subtitle>Approve and manage team requests</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-number">{{managerStats.pendingApprovals}}</span>
                <span class="stat-label">Pending Approvals</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{managerStats.teamRequests}}</span>
                <span class="stat-label">Team Requests</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">
              <mat-icon>arrow_forward</mat-icon>
              View Details
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- HR Dashboard Card -->
        <mat-card 
          class="dashboard-card" 
          *ngIf="hasHRAccess"
          (click)="navigateTo('/dashboard/hr')">
          <mat-card-header>
            <mat-icon mat-card-avatar>people</mat-icon>
            <mat-card-title>HR Dashboard</mat-card-title>
            <mat-card-subtitle>Process and archive requests</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-number">{{hrStats.toProcess}}</span>
                <span class="stat-label">To Process</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{hrStats.processed}}</span>
                <span class="stat-label">Processed Today</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">
              <mat-icon>arrow_forward</mat-icon>
              View Details
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Reports Dashboard Card -->
        <mat-card 
          class="dashboard-card" 
          *ngIf="hasReportAccess"
          (click)="navigateTo('/dashboard/reports')">
          <mat-card-header>
            <mat-icon mat-card-avatar>analytics</mat-icon>
            <mat-card-title>Reports & Analytics</mat-card-title>
            <mat-card-subtitle>View insights and statistics</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-number">{{reportStats.totalRequests}}</span>
                <span class="stat-label">Total Requests</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{reportStats.avgProcessingTime}}</span>
                <span class="stat-label">Avg. Processing Time</span>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">
              <mat-icon>arrow_forward</mat-icon>
              View Details
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/requests/new">
            <mat-icon>add</mat-icon>
            New Request
          </button>
          <button mat-raised-button color="accent" routerLink="/requests">
            <mat-icon>list</mat-icon>
            My Requests
          </button>
          <button mat-raised-button routerLink="/workflows" *ngIf="hasAdminAccess">
            <mat-icon>account_tree</mat-icon>
            Manage Workflows
          </button>
          <button mat-raised-button routerLink="/admin/users" *ngIf="hasAdminAccess">
            <mat-icon>group</mat-icon>
            Manage Users
          </button>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="recent-activity-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="activity-list" *ngIf="recentActivities.length > 0; else noActivity">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <mat-icon [color]="getActivityColor(activity.type)">{{getActivityIcon(activity.type)}}</mat-icon>
                <div class="activity-content">
                  <div class="activity-title">{{activity.title}}</div>
                  <div class="activity-description">{{activity.description}}</div>
                  <div class="activity-time">{{formatTime(activity.timestamp)}}</div>
                </div>
              </div>
            </div>
            <ng-template #noActivity>
              <div class="no-activity">
                <mat-icon>inbox</mat-icon>
                <p>No recent activity</p>
              </div>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: UserDto | null = null;
  hasManagerAccess = false;
  hasHRAccess = false;
  hasAdminAccess = false;
  hasReportAccess = false;

  employeeStats = {
    pendingRequests: 0,
    completedRequests: 0
  };

  managerStats = {
    pendingApprovals: 0,
    teamRequests: 0
  };

  hrStats = {
    toProcess: 0,
    processed: 0
  };

  reportStats = {
    totalRequests: 0,
    avgProcessingTime: '0h'
  };

  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardStats();
    this.loadRecentActivity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.hasManagerAccess = this.authService.hasAnyRole(['Manager', 'Admin']);
          this.hasHRAccess = this.authService.hasAnyRole(['HR', 'Admin']);
          this.hasAdminAccess = this.authService.hasRole('Admin');
          this.hasReportAccess = this.authService.hasAnyRole(['Manager', 'HR', 'Admin']);
        }
      });
  }

  private loadDashboardStats(): void {
    // TODO: Implement actual API calls to load statistics
    // For now, using mock data
    this.employeeStats = {
      pendingRequests: 3,
      completedRequests: 12
    };

    this.managerStats = {
      pendingApprovals: 5,
      teamRequests: 18
    };

    this.hrStats = {
      toProcess: 8,
      processed: 15
    };

    this.reportStats = {
      totalRequests: 156,
      avgProcessingTime: '2.5h'
    };
  }

  private loadRecentActivity(): void {
    // TODO: Implement actual API call to load recent activities
    // For now, using mock data
    this.recentActivities = [
      {
        type: 'request_submitted',
        title: 'Leave Request Submitted',
        description: 'Your annual leave request has been submitted for approval',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: 'request_approved',
        title: 'Expense Report Approved',
        description: 'Your expense report #ER-2024-001 has been approved',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        type: 'workflow_updated',
        title: 'Workflow Updated',
        description: 'The IT Support workflow has been updated',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'request_submitted': 'send',
      'request_approved': 'check_circle',
      'request_rejected': 'cancel',
      'workflow_updated': 'update',
      'user_assigned': 'person_add'
    };
    return iconMap[type] || 'info';
  }

  getActivityColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'request_submitted': 'primary',
      'request_approved': 'primary',
      'request_rejected': 'warn',
      'workflow_updated': 'accent',
      'user_assigned': 'primary'
    };
    return colorMap[type] || '';
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  }
}