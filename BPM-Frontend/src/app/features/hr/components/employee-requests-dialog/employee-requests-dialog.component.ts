import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RequestService } from '../../../../core/services/request.service';
import { Employee, RequestDto, RequestStatus, RequestType } from '../../../../core/models';

interface EmployeeRequestsData {
  employee: Employee;
}

@Component({
  selector: 'app-employee-requests-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="employee-requests-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>assignment</mat-icon>
        Employee Requests
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <!-- Employee Info -->
          <div class="employee-info">
            <div class="employee-avatar">
              {{getInitials(data.employee.firstName, data.employee.lastName)}}
            </div>
            <div class="employee-details">
              <h3>{{data.employee.firstName}} {{data.employee.lastName}}</h3>
              <p>{{data.employee.position}} - {{data.employee.department}}</p>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading requests...</p>
          </div>

          <!-- No Requests -->
          <div *ngIf="!isLoading && requests.length === 0" class="no-requests">
            <mat-icon>inbox</mat-icon>
            <h3>No Requests Found</h3>
            <p>This employee hasn't submitted any requests yet.</p>
          </div>

          <!-- Requests Content -->
          <div *ngIf="!isLoading && requests.length > 0">
            <mat-tab-group>
              <!-- All Requests Tab -->
              <mat-tab label="All Requests ({{requests.length}})">
                <div class="tab-content">
                  <div class="requests-summary">
                    <mat-card class="summary-card">
                      <mat-card-content>
                        <div class="summary-stats">
                          <div class="stat">
                            <span class="stat-number">{{getRequestsByStatus('Pending').length}}</span>
                            <span class="stat-label">Pending</span>
                          </div>
                          <div class="stat">
                            <span class="stat-number">{{getRequestsByStatus('Approved').length}}</span>
                            <span class="stat-label">Approved</span>
                          </div>
                          <div class="stat">
                            <span class="stat-number">{{getRequestsByStatus('Rejected').length}}</span>
                            <span class="stat-label">Rejected</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <div class="requests-table">
                    <table mat-table [dataSource]="requests" class="full-width">
                      <!-- Type Column -->
                      <ng-container matColumnDef="type">
                        <th mat-header-cell *matHeaderCellDef>Type</th>
                        <td mat-cell *matCellDef="let request">
                          <mat-chip [class]="getTypeClass(request.type)">
                            {{getRequestTypeName(request.type)}}
                          </mat-chip>
                        </td>
                      </ng-container>

                      <!-- Title Column -->
                      <ng-container matColumnDef="title">
                        <th mat-header-cell *matHeaderCellDef>Title</th>
                        <td mat-cell *matCellDef="let request">
                          <div class="request-title">
                            <strong>{{request.title}}</strong>
                            <small>{{request.description | slice:0:50}}{{request.description.length > 50 ? '...' : ''}}</small>
                          </div>
                        </td>
                      </ng-container>

                      <!-- Status Column -->
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let request">
                          <mat-chip [class]="getStatusClass(request.status)">
                            {{getRequestStatusName(request.status)}}
                          </mat-chip>
                        </td>
                      </ng-container>

                      <!-- Date Column -->
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Created</th>
                        <td mat-cell *matCellDef="let request">
                          {{request.createdAt | date:'short'}}
                        </td>
                      </ng-container>

                      <!-- Actions Column -->
                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Actions</th>
                        <td mat-cell *matCellDef="let request">
                          <button mat-icon-button 
                                  (click)="viewRequest(request)" 
                                  matTooltip="View Details">
                            <mat-icon>visibility</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                </div>
              </mat-tab>

              <!-- Pending Requests Tab -->
              <mat-tab label="Pending ({{getRequestsByStatus('Pending').length}})">
                <div class="tab-content">
                  <div class="requests-table">
                    <table mat-table [dataSource]="getRequestsByStatus('Pending')" class="full-width">
                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                </div>
              </mat-tab>

              <!-- Approved Requests Tab -->
              <mat-tab label="Approved ({{getRequestsByStatus('Approved').length}})">
                <div class="tab-content">
                  <div class="requests-table">
                    <table mat-table [dataSource]="getRequestsByStatus('Approved')" class="full-width">
                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="exportRequests()" [disabled]="requests.length === 0">
          <mat-icon>download</mat-icon>
          Export
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .employee-requests-dialog {
      min-width: 800px;
      max-width: 90vw;
      max-height: 90vh;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      margin: 0;
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .employee-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .employee-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .employee-details h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
    }

    .employee-details p {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .loading-container, .no-requests {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
    }

    .no-requests mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .tab-content {
      padding: 1rem 0;
    }

    .requests-summary {
      margin-bottom: 2rem;
    }

    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .summary-stats {
      display: flex;
      justify-content: space-around;
      text-align: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .requests-table {
      width: 100%;
    }

    .full-width {
      width: 100%;
    }

    .request-title {
      display: flex;
      flex-direction: column;
    }

    .request-title small {
      color: #666;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    /* Status and Type Chips */
    .status-pending { background-color: #fff3e0; color: #ef6c00; }
    .status-approved { background-color: #e8f5e8; color: #2e7d32; }
    .status-rejected { background-color: #ffebee; color: #c62828; }
    .status-in-progress { background-color: #e3f2fd; color: #1976d2; }

    .type-leave { background-color: #f3e5f5; color: #7b1fa2; }
    .type-expense { background-color: #e8f5e8; color: #388e3c; }
    .type-training { background-color: #e3f2fd; color: #1976d2; }
    .type-other { background-color: #f5f5f5; color: #616161; }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .employee-requests-dialog {
        min-width: 95vw;
      }

      .employee-info {
        flex-direction: column;
        text-align: center;
      }

      .summary-stats {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class EmployeeRequestsDialogComponent implements OnInit {
  requests: RequestDto[] = [];
  isLoading = false;
  displayedColumns: string[] = ['type', 'title', 'status', 'date', 'actions'];

  constructor(
    private readonly dialogRef: MatDialogRef<EmployeeRequestsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: EmployeeRequestsData,
    private readonly requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeRequests();
  }

  private loadEmployeeRequests(): void {
    this.isLoading = true;
    
    // Simulate API call to get employee requests
    // Replace with actual service call: this.requestService.getRequestsByEmployee(this.data.employee.id)
    setTimeout(() => {
      this.requests = this.generateMockRequests();
      this.isLoading = false;
    }, 1000);
  }

  private generateMockRequests(): RequestDto[] {
    return [
      {
        id: '1',
        type: RequestType.Leave,
        title: 'Annual Leave Request',
        description: 'Requesting 5 days of annual leave for vacation',
        status: RequestStatus.Pending,
        initiatorId: this.data.employee.id,
        initiatorName: `${this.data.employee.firstName} ${this.data.employee.lastName}`,
        requestSteps: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        type: RequestType.Expense,
        title: 'Business Trip Expenses',
        description: 'Reimbursement for business trip to New York',
        status: RequestStatus.Approved,
        initiatorId: this.data.employee.id,
        initiatorName: `${this.data.employee.firstName} ${this.data.employee.lastName}`,
        requestSteps: [],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12')
      }
    ];
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getRequestsByStatus(status: string): RequestDto[] {
    return this.requests.filter(request => this.getRequestStatusName(request.status) === status);
  }

  getRequestStatusName(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.Pending: return 'Pending';
      case RequestStatus.Approved: return 'Approved';
      case RequestStatus.Rejected: return 'Rejected';
      case RequestStatus.Archived: return 'Archived';
      default: return 'Unknown';
    }
  }

  getRequestTypeName(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'Leave';
      case RequestType.Expense: return 'Expense';
      case RequestType.Training: return 'Training';
      default: return 'Other';
    }
  }

  getStatusClass(status: RequestStatus): string {
    return `status-${this.getRequestStatusName(status).toLowerCase().replace(' ', '-')}`;
  }

  getTypeClass(type: RequestType): string {
    return `type-${this.getRequestTypeName(type).toLowerCase()}`;
  }

  viewRequest(request: RequestDto): void {
    // TODO: Open request details dialog
    console.log('View request:', request);
  }

  exportRequests(): void {
    // TODO: Implement export functionality
    console.log('Export requests for employee:', this.data.employee);
  }
}
