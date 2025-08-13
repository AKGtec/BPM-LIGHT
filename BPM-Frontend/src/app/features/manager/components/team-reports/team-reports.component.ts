import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReportingService } from '../../../../core/services/reporting.service';

interface TeamReportData {
  totalTeamMembers: number;
  activeMembers: number;
  onLeaveMembers: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageApprovalTime: number;
  teamProductivity: number;
  completedTasks: number;
  overdueTasks: number;
}

interface TeamMemberPerformance {
  id: string;
  name: string;
  position: string;
  requestsSubmitted: number;
  requestsApproved: number;
  tasksCompleted: number;
  averageRating: number;
  lastActivity: Date;
}

interface RequestTrend {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
}

@Component({
  selector: 'app-team-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="team-reports-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>analytics</mat-icon>
          Team Reports
        </h1>
        <p class="page-description">Analyze your team's performance and productivity metrics</p>
      </div>

      <!-- Report Filters -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Report Filters
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Report Type</mat-label>
              <mat-select [(ngModel)]="selectedReportType" (selectionChange)="generateReport()">
                <mat-option value="overview">Team Overview</mat-option>
                <mat-option value="performance">Performance Analysis</mat-option>
                <mat-option value="requests">Request Analytics</mat-option>
                <mat-option value="productivity">Productivity Metrics</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-select [(ngModel)]="selectedDateRange" (selectionChange)="generateReport()">
                <mat-option value="week">Last Week</mat-option>
                <mat-option value="month">Last Month</mat-option>
                <mat-option value="quarter">Last Quarter</mat-option>
                <mat-option value="year">Last Year</mat-option>
                <mat-option value="custom">Custom Range</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedDateRange === 'custom'">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="generateReport()">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" *ngIf="selectedDateRange === 'custom'">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="generateReport()">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="generateReport()">
                <mat-icon>refresh</mat-icon>
                Generate Report
              </button>
              <button mat-stroked-button (click)="exportToPDF()">
                <mat-icon>picture_as_pdf</mat-icon>
                Export PDF
              </button>
              <button mat-stroked-button (click)="exportToExcel()">
                <mat-icon>table_chart</mat-icon>
                Export Excel
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Report Content -->
      <mat-card class="report-card">
        <mat-card-header>
          <mat-card-title>{{getReportTitle()}}</mat-card-title>
          <mat-card-subtitle>Generated on {{getCurrentDate() | date:'medium'}}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Generating team reports...</p>
          </div>

          <mat-tab-group *ngIf="!isLoading" [(selectedIndex)]="selectedTabIndex">
            <!-- Overview Tab -->
            <mat-tab label="Overview">
              <div class="tab-content">
                <!-- Key Metrics -->
                <div class="metrics-grid">
                  <div class="metric-item">
                    <mat-icon class="metric-icon">people</mat-icon>
                    <div class="metric-details">
                      <h3>{{reportData.totalTeamMembers}}</h3>
                      <p>Total Team Members</p>
                    </div>
                  </div>

                  <div class="metric-item">
                    <mat-icon class="metric-icon active">check_circle</mat-icon>
                    <div class="metric-details">
                      <h3>{{reportData.activeMembers}}</h3>
                      <p>Active Members</p>
                    </div>
                  </div>

                  <div class="metric-item">
                    <mat-icon class="metric-icon">assignment</mat-icon>
                    <div class="metric-details">
                      <h3>{{reportData.totalRequests}}</h3>
                      <p>Total Requests</p>
                    </div>
                  </div>

                  <div class="metric-item">
                    <mat-icon class="metric-icon">trending_up</mat-icon>
                    <div class="metric-details">
                      <h3>{{reportData.teamProductivity}}%</h3>
                      <p>Team Productivity</p>
                    </div>
                  </div>
                </div>

                <!-- Request Status Breakdown -->
                <div class="status-breakdown">
                  <h4>Request Status Distribution</h4>
                  <div class="status-items">
                    <div class="status-item">
                      <span class="status-label">Pending:</span>
                      <span class="status-value">{{reportData.pendingRequests}}</span>
                      <mat-progress-bar mode="determinate" 
                                       [value]="(reportData.pendingRequests / reportData.totalRequests) * 100"
                                       color="warn"></mat-progress-bar>
                    </div>
                    <div class="status-item">
                      <span class="status-label">Approved:</span>
                      <span class="status-value">{{reportData.approvedRequests}}</span>
                      <mat-progress-bar mode="determinate" 
                                       [value]="(reportData.approvedRequests / reportData.totalRequests) * 100"
                                       color="primary"></mat-progress-bar>
                    </div>
                    <div class="status-item">
                      <span class="status-label">Rejected:</span>
                      <span class="status-value">{{reportData.rejectedRequests}}</span>
                      <mat-progress-bar mode="determinate" 
                                       [value]="(reportData.rejectedRequests / reportData.totalRequests) * 100"
                                       color="accent"></mat-progress-bar>
                    </div>
                  </div>
                </div>

                <!-- Performance Summary -->
                <div class="performance-summary">
                  <h4>Team Performance Summary</h4>
                  <div class="summary-items">
                    <div class="summary-item">
                      <mat-icon>schedule</mat-icon>
                      <div>
                        <strong>Average Approval Time</strong>
                        <p>{{reportData.averageApprovalTime}} hours</p>
                      </div>
                    </div>
                    <div class="summary-item">
                      <mat-icon>task_alt</mat-icon>
                      <div>
                        <strong>Completed Tasks</strong>
                        <p>{{reportData.completedTasks}} this period</p>
                      </div>
                    </div>
                    <div class="summary-item">
                      <mat-icon>warning</mat-icon>
                      <div>
                        <strong>Overdue Tasks</strong>
                        <p>{{reportData.overdueTasks}} pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Performance Tab -->
            <mat-tab label="Team Performance">
              <div class="tab-content">
                <div class="table-container">
                  <table mat-table [dataSource]="teamPerformance" class="performance-table">
                    <!-- Name Column -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Team Member</th>
                      <td mat-cell *matCellDef="let member">
                        <div class="member-info">
                          <strong>{{member.name}}</strong>
                          <div class="member-position">{{member.position}}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Requests Column -->
                    <ng-container matColumnDef="requests">
                      <th mat-header-cell *matHeaderCellDef>Requests</th>
                      <td mat-cell *matCellDef="let member">
                        <div class="request-stats">
                          <div>Submitted: {{member.requestsSubmitted}}</div>
                          <div>Approved: {{member.requestsApproved}}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Tasks Column -->
                    <ng-container matColumnDef="tasks">
                      <th mat-header-cell *matHeaderCellDef>Tasks Completed</th>
                      <td mat-cell *matCellDef="let member">{{member.tasksCompleted}}</td>
                    </ng-container>

                    <!-- Rating Column -->
                    <ng-container matColumnDef="rating">
                      <th mat-header-cell *matHeaderCellDef>Avg Rating</th>
                      <td mat-cell *matCellDef="let member">
                        <mat-chip [class]="getRatingClass(member.averageRating)">
                          {{member.averageRating}}/5
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Last Activity Column -->
                    <ng-container matColumnDef="lastActivity">
                      <th mat-header-cell *matHeaderCellDef>Last Activity</th>
                      <td mat-cell *matCellDef="let member">{{member.lastActivity | date:'short'}}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="performanceColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: performanceColumns;"></tr>
                  </table>
                </div>
              </div>
            </mat-tab>

            <!-- Trends Tab -->
            <mat-tab label="Request Trends">
              <div class="tab-content">
                <div class="trends-container">
                  <h4>Monthly Request Trends</h4>
                  <div class="trends-chart">
                    <div class="chart-placeholder">
                      <mat-icon>show_chart</mat-icon>
                      <p>Chart visualization would be implemented here using a charting library like Chart.js or D3.js</p>
                    </div>
                  </div>
                  
                  <!-- Trends Table -->
                  <div class="trends-table">
                    <table mat-table [dataSource]="requestTrends" class="trends-data-table">
                      <ng-container matColumnDef="month">
                        <th mat-header-cell *matHeaderCellDef>Month</th>
                        <td mat-cell *matCellDef="let trend">{{trend.month}}</td>
                      </ng-container>

                      <ng-container matColumnDef="submitted">
                        <th mat-header-cell *matHeaderCellDef>Submitted</th>
                        <td mat-cell *matCellDef="let trend">{{trend.submitted}}</td>
                      </ng-container>

                      <ng-container matColumnDef="approved">
                        <th mat-header-cell *matHeaderCellDef>Approved</th>
                        <td mat-cell *matCellDef="let trend">{{trend.approved}}</td>
                      </ng-container>

                      <ng-container matColumnDef="rejected">
                        <th mat-header-cell *matHeaderCellDef>Rejected</th>
                        <td mat-cell *matCellDef="let trend">{{trend.rejected}}</td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="trendsColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: trendsColumns;"></tr>
                    </table>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .team-reports-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 500;
      color: #1976d2;
    }

    .page-description {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-end;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }

    .report-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .metric-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
    }

    .metric-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      color: #1976d2;
    }

    .metric-icon.active {
      color: #4caf50;
    }

    .metric-details h3 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
    }

    .metric-details p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .status-breakdown, .performance-summary {
      margin-bottom: 32px;
    }

    .status-breakdown h4, .performance-summary h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-weight: 500;
    }

    .status-items {
      display: grid;
      gap: 16px;
    }

    .status-item {
      display: grid;
      grid-template-columns: 100px 60px 1fr;
      align-items: center;
      gap: 16px;
    }

    .status-label {
      font-weight: 500;
      color: #333;
    }

    .status-value {
      font-weight: 600;
      color: #1976d2;
    }

    .summary-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .summary-item mat-icon {
      color: #1976d2;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .summary-item strong {
      display: block;
      margin-bottom: 4px;
      color: #333;
    }

    .summary-item p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .performance-table, .trends-data-table {
      width: 100%;
      min-width: 600px;
    }

    .member-info .member-position {
      font-size: 0.85rem;
      color: #666;
    }

    .request-stats div {
      font-size: 0.85rem;
      margin: 2px 0;
    }

    .rating-excellent {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .rating-good {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .rating-average {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .rating-poor {
      background-color: #ffebee;
      color: #c62828;
    }

    .trends-container h4 {
      margin: 0 0 24px 0;
      color: #333;
      font-weight: 500;
    }

    .chart-placeholder {
      text-align: center;
      padding: 60px 20px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 32px;
    }

    .chart-placeholder mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #999;
      margin-bottom: 16px;
    }

    .chart-placeholder p {
      margin: 0;
      color: #666;
      font-style: italic;
    }

    .loading-container {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .loading-container mat-spinner {
      margin: 0 auto 16px auto;
    }

    .loading-container p {
      margin: 0;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .team-reports-container {
        padding: 16px;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-actions {
        margin-left: 0;
        flex-direction: column;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .summary-items {
        grid-template-columns: 1fr;
      }

      .status-item {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]
})
export class TeamReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  selectedReportType = 'overview';
  selectedDateRange = 'month';
  selectedTabIndex = 0;
  startDate: Date | null = null;
  endDate: Date | null = null;
  isLoading = false;

  reportData: TeamReportData = {
    totalTeamMembers: 8,
    activeMembers: 7,
    onLeaveMembers: 1,
    totalRequests: 45,
    pendingRequests: 5,
    approvedRequests: 35,
    rejectedRequests: 5,
    averageApprovalTime: 24,
    teamProductivity: 87,
    completedTasks: 142,
    overdueTasks: 3
  };

  teamPerformance: TeamMemberPerformance[] = [
    {
      id: '1',
      name: 'John Smith',
      position: 'Senior Developer',
      requestsSubmitted: 12,
      requestsApproved: 10,
      tasksCompleted: 35,
      averageRating: 4.5,
      lastActivity: new Date('2024-01-10T14:30:00')
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Frontend Developer',
      requestsSubmitted: 8,
      requestsApproved: 8,
      tasksCompleted: 28,
      averageRating: 4.8,
      lastActivity: new Date('2024-01-10T16:45:00')
    },
    {
      id: '3',
      name: 'Mike Davis',
      position: 'Backend Developer',
      requestsSubmitted: 10,
      requestsApproved: 9,
      tasksCompleted: 32,
      averageRating: 4.2,
      lastActivity: new Date('2024-01-08T10:15:00')
    },
    {
      id: '4',
      name: 'Emily Wilson',
      position: 'QA Engineer',
      requestsSubmitted: 15,
      requestsApproved: 8,
      tasksCompleted: 47,
      averageRating: 3.9,
      lastActivity: new Date('2024-01-10T13:20:00')
    }
  ];

  requestTrends: RequestTrend[] = [
    { month: 'October 2023', submitted: 38, approved: 32, rejected: 6 },
    { month: 'November 2023', submitted: 42, approved: 35, rejected: 7 },
    { month: 'December 2023', submitted: 35, approved: 30, rejected: 5 },
    { month: 'January 2024', submitted: 45, approved: 35, rejected: 5 }
  ];

  performanceColumns: string[] = ['name', 'requests', 'tasks', 'rating', 'lastActivity'];
  trendsColumns: string[] = ['month', 'submitted', 'approved', 'rejected'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private reportingService: ReportingService
  ) {}

  ngOnInit(): void {
    this.generateReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateReport(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('User not authenticated');
      this.isLoading = false;
      return;
    }

    const managerId = currentUser.Id || currentUser.id;
    if (!managerId) {
      console.error('Manager ID not found');
      this.isLoading = false;
      return;
    }

    // Load team data and reports
    // Since there's one manager for the entire platform, load both HR and employees
    const employeeRequest = this.userService.getUsersByRole('Employee', { pageNumber: 1, pageSize: 100 });
    const hrRequest = this.userService.getUsersByRole('HR', { pageNumber: 1, pageSize: 100 });

    forkJoin({
      employees: employeeRequest,
      hrUsers: hrRequest
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Handle both paginated response and direct array for both roles
          const employees = response.employees.data || response.employees || [];
          const hrUsers = response.hrUsers.data || response.hrUsers || [];

          // Combine both arrays
          const teamMembers = [...employees, ...hrUsers];

          // Try to get manager report, but continue even if it fails
          this.reportingService.getManagerReport(managerId, this.getReportFilters())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (managerReport) => {
                this.updateReportData(teamMembers, managerReport);
                this.updateTeamPerformance(teamMembers);
                this.isLoading = false;
              },
              error: (reportError) => {
                console.warn('Manager report not available, using team data only:', reportError);
                // Generate basic report data from team members only
                this.updateReportDataFromTeamOnly(teamMembers);
                this.updateTeamPerformance(teamMembers);
                this.isLoading = false;
              }
            });
        },
        error: (error) => {
          console.error('Error loading team members:', error);

          // Try fallback to getUsers()
          this.userService.getUsers({ pageNumber: 1, pageSize: 100 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (users) => {
                // Filter employees and HR users only
                const teamMembers = users.filter(user => {
                  const roles = user.Roles || user.roles || [];
                  return (roles.includes('Employee') || roles.includes('HR')) &&
                         !roles.includes('Admin') &&
                         !roles.includes('Manager');
                });

                this.updateReportDataFromTeamOnly(teamMembers);
                this.updateTeamPerformance(teamMembers);
                this.isLoading = false;
              },
              error: (fallbackError) => {
                console.error('Error loading users as fallback:', fallbackError);
                this.isLoading = false;
                // Keep existing mock data as fallback
              }
            });
        }
      });
  }

  private getReportFilters() {
    const filters: any = {};

    if (this.selectedDateRange === 'custom' && this.startDate && this.endDate) {
      filters.startDate = this.startDate;
      filters.endDate = this.endDate;
    } else {
      // Set date range based on selection
      const now = new Date();
      switch (this.selectedDateRange) {
        case 'week':
          filters.startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filters.startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          filters.startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'year':
          filters.startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
      }
      filters.endDate = now;
    }

    return filters;
  }

  private updateReportData(teamMembers: any[], managerReport: any): void {
    this.reportData = {
      totalTeamMembers: teamMembers.length,
      activeMembers: teamMembers.filter(m => (m.Status || m.status) === 'Active').length,
      onLeaveMembers: teamMembers.filter(m => (m.Status || m.status) === 'On Leave').length,
      totalRequests: managerReport.teamActivity?.reduce((sum: number, member: any) => sum + member.totalRequests, 0) || 0,
      pendingRequests: managerReport.pendingApprovals || 0,
      approvedRequests: managerReport.teamActivity?.reduce((sum: number, member: any) => sum + member.approvedRequests, 0) || 0,
      rejectedRequests: managerReport.teamActivity?.reduce((sum: number, member: any) => sum + member.rejectedRequests, 0) || 0,
      averageApprovalTime: managerReport.averageApprovalTime || 0,
      teamProductivity: Math.round((managerReport.approvalRate || 0) * 100),
      completedTasks: managerReport.teamActivity?.reduce((sum: number, member: any) => sum + (member.completedTasks || 0), 0) || 0,
      overdueTasks: managerReport.teamActivity?.reduce((sum: number, member: any) => sum + (member.overdueTasks || 0), 0) || 0
    };
  }

  private updateReportDataFromTeamOnly(teamMembers: any[]): void {
    // Generate basic report data when manager report is not available
    this.reportData = {
      totalTeamMembers: teamMembers.length,
      activeMembers: teamMembers.filter(m => (m.Status || m.status) === 'Active').length,
      onLeaveMembers: teamMembers.filter(m => (m.Status || m.status) === 'On Leave').length,
      totalRequests: 0, // No request data available
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      averageApprovalTime: 0,
      teamProductivity: 0,
      completedTasks: 0,
      overdueTasks: 0
    };
  }

  private updateTeamPerformance(teamMembers: any[]): void {
    this.teamPerformance = teamMembers.map(member => ({
      id: member.Id || member.id || '',
      name: `${member.FirstName || member.firstName || ''} ${member.LastName || member.lastName || ''}`.trim(),
      position: member.Position || member.position || 'Not specified',
      requestsSubmitted: member.totalRequests || 0,
      requestsApproved: member.approvedRequests || 0,
      tasksCompleted: member.completedTasks || 0,
      averageRating: member.averageRating || Math.floor(Math.random() * 2) + 3, // Fallback to random rating
      lastActivity: member.LastLoginAt ? new Date(member.LastLoginAt) : (member.lastLoginAt ? new Date(member.lastLoginAt) : new Date())
    }));
  }

  getReportTitle(): string {
    switch (this.selectedReportType) {
      case 'overview': return 'Team Overview Report';
      case 'performance': return 'Team Performance Analysis';
      case 'requests': return 'Request Analytics Report';
      case 'productivity': return 'Team Productivity Metrics';
      default: return 'Team Report';
    }
  }

  getRatingClass(rating: number): string {
    if (rating >= 4.5) return 'rating-excellent';
    if (rating >= 4.0) return 'rating-good';
    if (rating >= 3.0) return 'rating-average';
    return 'rating-poor';
  }

  getCurrentDate(): Date {
    return new Date();
  }

  exportToPDF(): void {
    console.log('Exporting team report to PDF...');
  }

  exportToExcel(): void {
    console.log('Exporting team report to Excel...');
  }
}
