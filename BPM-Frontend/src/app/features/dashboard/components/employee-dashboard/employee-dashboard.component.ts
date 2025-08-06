import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ChartModule } from 'primeng/chart';

import { RequestService } from '../../../../core/services/request.service';
import { RequestDto, RequestStatus, RequestType } from '../../../../core/models/request.models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    ChartModule
  ],
  template: `
    <div class="employee-dashboard">
      <div class="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Track your requests and manage your workflow</p>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card pending">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{stats.pending}}</div>
              <div class="stat-label">Pending Requests</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card approved">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{stats.approved}}</div>
              <div class="stat-label">Approved</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card rejected">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>cancel</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{stats.rejected}}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card total">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>assignment</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{stats.total}}</div>
              <div class="stat-label">Total Requests</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/requests/new">
            <mat-icon>add</mat-icon>
            New Request
          </button>
          <button mat-raised-button color="accent" routerLink="/requests">
            <mat-icon>list</mat-icon>
            View All Requests
          </button>
          <button mat-raised-button routerLink="/profile">
            <mat-icon>person</mat-icon>
            Update Profile
          </button>
        </div>
      </div>

      <!-- Recent Requests -->
      <div class="recent-requests">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Requests</mat-card-title>
            <mat-card-subtitle>Your latest submitted requests</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="requests-table" *ngIf="recentRequests.length > 0; else noRequests">
              <mat-table [dataSource]="recentRequests" class="requests-table">
                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>
                  <mat-cell *matCellDef="let request">
                    <mat-chip [color]="getRequestTypeColor(request.type)">
                      {{getRequestTypeName(request.type)}}
                    </mat-chip>
                  </mat-cell>
                </ng-container>

                <!-- Title Column -->
                <ng-container matColumnDef="title">
                  <mat-header-cell *matHeaderCellDef>Title</mat-header-cell>
                  <mat-cell *matCellDef="let request">{{request.title || 'No title'}}</mat-cell>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
                  <mat-cell *matCellDef="let request">
                    <mat-chip [color]="getStatusColor(request.status)">
                      {{getStatusName(request.status)}}
                    </mat-chip>
                  </mat-cell>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="createdAt">
                  <mat-header-cell *matHeaderCellDef>Created</mat-header-cell>
                  <mat-cell *matCellDef="let request">{{formatDate(request.createdAt)}}</mat-cell>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
                  <mat-cell *matCellDef="let request">
                    <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #actionMenu="matMenu">
                      <button mat-menu-item (click)="viewRequest(request)">
                        <mat-icon>visibility</mat-icon>
                        <span>View Details</span>
                      </button>
                      <button mat-menu-item (click)="editRequest(request)" *ngIf="canEdit(request)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="cancelRequest(request)" *ngIf="canCancel(request)">
                        <mat-icon>cancel</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </mat-menu>
                  </mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
              </mat-table>
            </div>

            <ng-template #noRequests>
              <div class="no-requests">
                <mat-icon>inbox</mat-icon>
                <h3>No requests yet</h3>
                <p>Start by creating your first request</p>
                <button mat-raised-button color="primary" routerLink="/requests/new">
                  <mat-icon>add</mat-icon>
                  Create Request
                </button>
              </div>
            </ng-template>
          </mat-card-content>
          <mat-card-actions *ngIf="recentRequests.length > 0">
            <button mat-button routerLink="/requests">View All Requests</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Request Types Chart -->
      <div class="charts-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Request Distribution</mat-card-title>
            <mat-card-subtitle>Your requests by type</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p-chart 
              type="doughnut" 
              [data]="chartData" 
              [options]="chartOptions"
              width="100%"
              height="300px">
            </p-chart>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  };

  recentRequests: RequestDto[] = [];
  displayedColumns: string[] = ['type', 'title', 'status', 'createdAt', 'actions'];

  chartData: any;
  chartOptions: any;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.initializeChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // Load user's requests
    this.requestService.getMyRequests({ pageNumber: 1, pageSize: 5 })
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.recentRequests = response.data;
        this.calculateStats();
        this.updateChartData();
      });
  }

  private calculateStats(): void {
    this.stats.total = this.recentRequests.length;
    this.stats.pending = this.recentRequests.filter(r => r.status === RequestStatus.Pending).length;
    this.stats.approved = this.recentRequests.filter(r => r.status === RequestStatus.Approved).length;
    this.stats.rejected = this.recentRequests.filter(r => r.status === RequestStatus.Rejected).length;
  }

  private initializeChart(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  private updateChartData(): void {
    const typeCount = this.recentRequests.reduce((acc, request) => {
      const typeName = this.getRequestTypeName(request.type);
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    this.chartData = {
      labels: Object.keys(typeCount),
      datasets: [{
        data: Object.values(typeCount),
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5576c',
          '#4facfe'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  getRequestTypeName(type: RequestType): string {
    const typeNames = {
      [RequestType.Leave]: 'Leave',
      [RequestType.Expense]: 'Expense',
      [RequestType.Training]: 'Training',
      [RequestType.ITSupport]: 'IT Support',
      [RequestType.ProfileUpdate]: 'Profile Update'
    };
    return typeNames[type] || 'Unknown';
  }

  getRequestTypeColor(type: RequestType): string {
    const colors = {
      [RequestType.Leave]: 'primary',
      [RequestType.Expense]: 'accent',
      [RequestType.Training]: 'warn',
      [RequestType.ITSupport]: '',
      [RequestType.ProfileUpdate]: 'primary'
    };
    return colors[type] || '';
  }

  getStatusName(status: RequestStatus): string {
    const statusNames = {
      [RequestStatus.Pending]: 'Pending',
      [RequestStatus.Approved]: 'Approved',
      [RequestStatus.Rejected]: 'Rejected',
      [RequestStatus.Archived]: 'Archived'
    };
    return statusNames[status] || 'Unknown';
  }

  getStatusColor(status: RequestStatus): string {
    const colors = {
      [RequestStatus.Pending]: 'accent',
      [RequestStatus.Approved]: 'primary',
      [RequestStatus.Rejected]: 'warn',
      [RequestStatus.Archived]: ''
    };
    return colors[status] || '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  canEdit(request: RequestDto): boolean {
    return request.status === RequestStatus.Pending;
  }

  canCancel(request: RequestDto): boolean {
    return request.status === RequestStatus.Pending;
  }

  viewRequest(request: RequestDto): void {
    // TODO: Navigate to request details
    console.log('View request:', request);
  }

  editRequest(request: RequestDto): void {
    // TODO: Navigate to edit request
    console.log('Edit request:', request);
  }

  cancelRequest(request: RequestDto): void {
    // TODO: Implement cancel request
    console.log('Cancel request:', request);
  }
}