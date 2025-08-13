import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { RequestService } from '../../../../core/services/request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestDto, RequestType, RequestStatus, PaginationParams, ApproveRejectStepDto } from '../../../../core/models';

@Component({
  selector: 'app-request-approval',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="approval-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>approval</mat-icon>
            Pending Approvals
          </mat-card-title>
          <div class="header-stats">
            <mat-chip class="pending-count">{{totalCount}} pending</mat-chip>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearchInput($event)" placeholder="Search requests...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (selectionChange)="onFilterChange()">
                <mat-option value="">All Types</mat-option>
                <mat-option [value]="RequestType.Leave">Leave</mat-option>
                <mat-option [value]="RequestType.Expense">Expense</mat-option>
                <mat-option [value]="RequestType.Training">Training</mat-option>
                <mat-option [value]="RequestType.ITSupport">IT Support</mat-option>
                <mat-option [value]="RequestType.ProfileUpdate">Profile Update</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="accent" (click)="clearFilters()" *ngIf="hasActiveFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>

          <!-- Active Filters Display -->
          <div class="active-filters" *ngIf="hasActiveFilters()">
            <span class="filter-label">Active filters:</span>
            <mat-chip *ngIf="searchTerm" (removed)="clearSearch()" removable>
              Search: "{{searchTerm}}"
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip *ngIf="selectedType" (removed)="clearTypeFilter()" removable>
              Type: {{getRequestTypeLabel(selectedType)}}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <!-- Requests Table -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="requests" class="approval-table">
              <!-- Requester Column -->
              <ng-container matColumnDef="requester">
                <th mat-header-cell *matHeaderCellDef>Requester</th>
                <td mat-cell *matCellDef="let request">
                  <div class="requester-info">
                    <strong>{{request.initiatorName}}</strong>
                    <small>{{request.createdAt | date:'short'}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Request Column -->
              <ng-container matColumnDef="request">
                <th mat-header-cell *matHeaderCellDef>Request</th>
                <td mat-cell *matCellDef="let request">
                  <div class="request-info">
                    <strong>{{request.title || 'No Title'}}</strong>
                    <span class="request-type">{{getRequestTypeLabel(request.type)}}</span>
                    <p class="request-description" *ngIf="request.description">
                      {{request.description | slice:0:100}}{{request.description.length > 100 ? '...' : ''}}
                    </p>
                  </div>
                </td>
              </ng-container>

              <!-- Current Step Column -->
              <ng-container matColumnDef="currentStep">
                <th mat-header-cell *matHeaderCellDef>Current Step</th>
                <td mat-cell *matCellDef="let request">
                  <div class="step-info">
                    <span class="step-name">{{getCurrentStepName(request)}}</span>
                    <mat-chip class="step-role">{{getCurrentStepRole(request)}}</mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Priority Column -->
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let request">
                  <mat-chip [class]="getPriorityClass(request)">
                    {{getPriorityLabel(request)}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let request">
                  <div class="action-buttons">
                    <button mat-icon-button [routerLink]="['/requests/details', request.id]" matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-raised-button color="primary" (click)="approveRequest(request)" matTooltip="Approve">
                      <mat-icon>check</mat-icon>
                      Approve
                    </button>
                    <button mat-raised-button color="warn" (click)="rejectRequest(request)" matTooltip="Reject">
                      <mat-icon>close</mat-icon>
                      Reject
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="approval-row"></tr>
            </table>

            <!-- No Data Message -->
            <div *ngIf="requests.length === 0" class="no-data">
              <mat-icon>assignment_turned_in</mat-icon>
              <h3>No pending approvals found</h3>
              <p *ngIf="hasActiveFilters()">Try adjusting your filters to see more results.</p>
              <p *ngIf="!hasActiveFilters()">All requests have been processed or there are no requests requiring your approval.</p>
              <button mat-raised-button color="primary" (click)="clearFilters()" *ngIf="hasActiveFilters()">
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <mat-paginator
            *ngIf="!loading && totalCount > 0"
            [length]="totalCount"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            [pageIndex]="currentPage - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .approval-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pending-count {
      background-color: #ff9800;
      color: white;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .active-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-label {
      font-weight: 500;
      color: #666;
      margin-right: 0.5rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .approval-table {
      width: 100%;
    }

    .approval-row:hover {
      background-color: #f5f5f5;
    }

    .requester-info {
      display: flex;
      flex-direction: column;
    }

    .requester-info strong {
      font-size: 0.9rem;
    }

    .requester-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .request-info {
      max-width: 300px;
    }

    .request-info strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .request-type {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .request-description {
      margin: 0.5rem 0 0 0;
      color: #666;
      font-size: 0.8rem;
      line-height: 1.4;
    }

    .step-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .step-name {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .step-role {
      background-color: #f3e5f5;
      color: #7b1fa2;
      font-size: 0.75rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .action-buttons button {
      min-width: auto;
    }

    .priority-high {
      background-color: #ffebee;
      color: #c62828;
    }

    .priority-medium {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .priority-low {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      color: #4caf50;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }
      
      .filters mat-form-field {
        min-width: 100%;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class RequestApprovalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  requests: RequestDto[] = [];
  displayedColumns: string[] = ['requester', 'request', 'currentStep', 'priority', 'actions'];
  loading = false;
  
  // Pagination
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filters
  searchTerm = '';
  selectedType: RequestType | '' = '';
  
  // Enums for template
  RequestType = RequestType;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadPendingRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchDebounce(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadPendingRequests();
    });
  }

  loadPendingRequests(): void {
    this.loading = true;
    
    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      type: this.selectedType || undefined,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    console.log('Loading pending requests with params:', params);

    this.requestService.getPendingApprovals(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        console.log('Data count:', response.data?.length);
        console.log('Total count:', response.totalCount);
        
        this.requests = response.data || [];
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending requests:', error);
        this.snackBar.open('Error loading requests. Please try again.', 'Close', { duration: 3000 });
        this.requests = [];
        this.totalCount = 0;
        this.loading = false;
      }
    });
  }

  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
    this.searchSubject$.next(this.searchTerm);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadPendingRequests();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPendingRequests();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPendingRequests();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedType);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.currentPage = 1;
    this.loadPendingRequests();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadPendingRequests();
  }

  clearTypeFilter(): void {
    this.selectedType = '';
    this.currentPage = 1;
    this.loadPendingRequests();
  }

  approveRequest(request: RequestDto): void {
    const currentStep = this.getCurrentStep(request);
    if (!currentStep) {
      this.snackBar.open('No pending step found for this request', 'Close', { duration: 3000 });
      return;
    }

    const approvalData: ApproveRejectStepDto = {
      comments: 'Approved by manager'
    };

    this.requestService.approveStep(request.id, currentStep.id, approvalData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.snackBar.open('Request approved successfully', 'Close', { duration: 3000 });
        this.loadPendingRequests();
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.snackBar.open('Error approving request', 'Close', { duration: 3000 });
      }
    });
  }

  rejectRequest(request: RequestDto): void {
    const currentStep = this.getCurrentStep(request);
    if (!currentStep) {
      this.snackBar.open('No pending step found for this request', 'Close', { duration: 3000 });
      return;
    }

    const rejectionData: ApproveRejectStepDto = {
      comments: 'Rejected by manager'
    };

    this.requestService.rejectStep(request.id, currentStep.id, rejectionData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.snackBar.open('Request rejected', 'Close', { duration: 3000 });
        this.loadPendingRequests();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.snackBar.open('Error rejecting request', 'Close', { duration: 3000 });
      }
    });
  }

  getCurrentStep(request: RequestDto) {
    return request.requestSteps?.find(step => step.status === 1); // Pending status
  }

  getCurrentStepName(request: RequestDto): string {
    const currentStep = this.getCurrentStep(request);
    return currentStep?.workflowStepName || 'Unknown';
  }

  getCurrentStepRole(request: RequestDto): string {
    const currentStep = this.getCurrentStep(request);
    return currentStep?.responsibleRole || 'Unknown';
  }

  getRequestTypeLabel(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'Leave';
      case RequestType.Expense: return 'Expense';
      case RequestType.Training: return 'Training';
      case RequestType.ITSupport: return 'IT Support';
      case RequestType.ProfileUpdate: return 'Profile';
      default: return 'Unknown';
    }
  }

  getPriorityLabel(request: RequestDto): string {
    // This is a placeholder - you might want to add priority to your model
    const daysSinceCreated = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 7) return 'High';
    if (daysSinceCreated > 3) return 'Medium';
    return 'Low';
  }

  getPriorityClass(request: RequestDto): string {
    const priority = this.getPriorityLabel(request);
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  }
}