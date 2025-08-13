import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

interface ReportData {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalWorkflows: number;
  activeWorkflows: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    FormsModule
  ],
  template: `
    <div class="admin-reports-container">
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
              <mat-select [(ngModel)]="selectedReportType">
                <mat-option value="overview">System Overview</mat-option>
                <mat-option value="users">User Activity</mat-option>
                <mat-option value="requests">Request Analytics</mat-option>
                <mat-option value="workflows">Workflow Performance</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-select [(ngModel)]="selectedDateRange">
                <mat-option value="today">Today</mat-option>
                <mat-option value="week">This Week</mat-option>
                <mat-option value="month">This Month</mat-option>
                <mat-option value="quarter">This Quarter</mat-option>
                <mat-option value="year">This Year</mat-option>
                <mat-option value="custom">Custom Range</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="date-range" *ngIf="selectedDateRange === 'custom'">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary" (click)="generateReport()">
              <mat-icon>assessment</mat-icon>
              Generate Report
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- System Overview Cards -->
      <div class="overview-cards">
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric">
              <div class="metric-icon users">
                <mat-icon>people</mat-icon>
              </div>
              <div class="metric-info">
                <h3>{{reportData.totalUsers}}</h3>
                <p>Total Users</p>
                <small>{{reportData.activeUsers}} active</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric">
              <div class="metric-icon requests">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="metric-info">
                <h3>{{reportData.totalRequests}}</h3>
                <p>Total Requests</p>
                <small>{{reportData.pendingRequests}} pending</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric">
              <div class="metric-icon workflows">
                <mat-icon>account_tree</mat-icon>
              </div>
              <div class="metric-info">
                <h3>{{reportData.totalWorkflows}}</h3>
                <p>Total Workflows</p>
                <small>{{reportData.activeWorkflows}} active</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric">
              <div class="metric-icon performance">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="metric-info">
                <h3>{{getApprovalRate()}}%</h3>
                <p>Approval Rate</p>
                <small>Last 30 days</small>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Detailed Reports -->
      <mat-card class="report-details">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>bar_chart</mat-icon>
            {{getReportTitle()}}
          </mat-card-title>
          <div class="export-actions">
            <button mat-button (click)="exportToPDF()">
              <mat-icon>picture_as_pdf</mat-icon>
              Export PDF
            </button>
            <button mat-button (click)="exportToExcel()">
              <mat-icon>table_chart</mat-icon>
              Export Excel
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div [ngSwitch]="selectedReportType">
            <!-- System Overview -->
            <div *ngSwitchCase="'overview'" class="report-content">
              <div class="summary-grid">
                <div class="summary-item">
                  <h4>Request Status Distribution</h4>
                  <div class="status-breakdown">
                    <div class="status-item">
                      <span class="status-label">Pending:</span>
                      <span class="status-value">{{reportData.pendingRequests}}</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">Approved:</span>
                      <span class="status-value">{{reportData.approvedRequests}}</span>
                    </div>
                    <div class="status-item">
                      <span class="status-label">Rejected:</span>
                      <span class="status-value">{{reportData.rejectedRequests}}</span>
                    </div>
                  </div>
                </div>

                <div class="summary-item">
                  <h4>System Health</h4>
                  <div class="health-indicators">
                    <div class="health-item">
                      <span class="health-label">Database:</span>
                      <span class="health-status healthy">Healthy</span>
                    </div>
                    <div class="health-item">
                      <span class="health-label">API:</span>
                      <span class="health-status healthy">Healthy</span>
                    </div>
                    <div class="health-item">
                      <span class="health-label">Storage:</span>
                      <span class="health-status warning">Warning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Activity -->
            <div *ngSwitchCase="'users'" class="report-content">
              <p>User activity report would be displayed here with charts and detailed analytics.</p>
            </div>

            <!-- Request Analytics -->
            <div *ngSwitchCase="'requests'" class="report-content">
              <p>Request analytics with trends, processing times, and bottleneck analysis.</p>
            </div>

            <!-- Workflow Performance -->
            <div *ngSwitchCase="'workflows'" class="report-content">
              <p>Workflow performance metrics including completion rates and average processing times.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-reports-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filters-card {
      margin-bottom: 1rem;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .date-range {
      display: flex;
      gap: 1rem;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .metric {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .metric-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.2);
    }

    .metric-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .metric-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }

    .metric-info p {
      margin: 0.25rem 0;
      font-size: 1rem;
    }

    .metric-info small {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .report-details {
      margin-top: 1rem;
    }

    .report-details mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .export-actions {
      display: flex;
      gap: 0.5rem;
    }

    .report-content {
      padding: 1rem 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .summary-item h4 {
      margin-bottom: 1rem;
      color: #333;
    }

    .status-breakdown,
    .health-indicators {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }

    .status-item,
    .health-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .status-label,
    .health-label {
      font-weight: 500;
    }

    .health-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .health-status.healthy {
      background-color: #d4edda;
      color: #155724;
    }

    .health-status.warning {
      background-color: #fff3cd;
      color: #856404;
    }

    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .date-range {
        flex-direction: column;
      }

      .overview-cards {
        grid-template-columns: 1fr;
      }

      .export-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  selectedReportType = 'overview';
  selectedDateRange = 'month';
  startDate: Date | null = null;
  endDate: Date | null = null;

  reportData: ReportData = {
    totalUsers: 35,
    activeUsers: 28,
    totalRequests: 142,
    pendingRequests: 8,
    approvedRequests: 118,
    rejectedRequests: 16,
    totalWorkflows: 12,
    activeWorkflows: 9
  };

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    // In a real application, this would call the backend API
    console.log('Generating report:', {
      type: this.selectedReportType,
      dateRange: this.selectedDateRange,
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  getReportTitle(): string {
    switch (this.selectedReportType) {
      case 'overview': return 'System Overview Report';
      case 'users': return 'User Activity Report';
      case 'requests': return 'Request Analytics Report';
      case 'workflows': return 'Workflow Performance Report';
      default: return 'Report';
    }
  }

  getApprovalRate(): number {
    const total = this.reportData.approvedRequests + this.reportData.rejectedRequests;
    if (total === 0) return 0;
    return Math.round((this.reportData.approvedRequests / total) * 100);
  }

  exportToPDF(): void {
    console.log('Exporting to PDF...');
  }

  exportToExcel(): void {
    console.log('Exporting to Excel...');
  }
}
