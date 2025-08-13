import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { RequestService } from '../../../../core/services/request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestDto, RequestType, RequestStatus, PaginationParams } from '../../../../core/models';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    FormsModule
  ],
  template: `
    <div class="request-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assignment</mat-icon>
            <span *ngIf="!isViewingEmployeeRequests">My Requests</span>
            <span *ngIf="isViewingEmployeeRequests">{{initiatorName}}'s Requests</span>
          </mat-card-title>
          <div class="header-actions">
            <button *ngIf="isViewingEmployeeRequests"
                    mat-stroked-button
                    routerLink="/requests"
                    class="back-button">
              <mat-icon>arrow_back</mat-icon>
              Back to My Requests
            </button>
            <button *ngIf="!isViewingEmployeeRequests"
                    mat-raised-button
                    color="primary"
                    routerLink="/requests/new">
              <mat-icon>add</mat-icon>
              New Request
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters">
            <mat-form-field appearance="outline" *ngIf="!isViewingEmployeeRequests">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search requests...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onFilterChange()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option [value]="RequestStatus.Pending">Pending</mat-option>
                <mat-option [value]="RequestStatus.Approved">Approved</mat-option>
                <mat-option [value]="RequestStatus.Rejected">Rejected</mat-option>
                <mat-option [value]="RequestStatus.Archived">Archived</mat-option>
              </mat-select>
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
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <!-- Requests Table -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="requests" class="requests-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let request">
                  <span class="request-id">{{request.id.substring(0, 8)}}</span>
                </td>
              </ng-container>

              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let request">
                  <div class="request-title">
                    <strong>{{request.title || 'No Title'}}</strong>
                    <small>{{getRequestTypeLabel(request.type)}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let request">
                  <mat-chip [class]="getStatusClass(request.status)">
                    {{getStatusLabel(request.status)}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Created Date Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let request">
                  {{request.createdAt | date:'short'}}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let request">
                  <button mat-icon-button [routerLink]="['/requests/details', request.id]" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button *ngIf="canEditRequest(request)" [routerLink]="['/requests/edit', request.id]" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- No Data Message -->
            <div *ngIf="requests.length === 0" class="no-data">
              <mat-icon>assignment</mat-icon>
              <h3 *ngIf="!isViewingEmployeeRequests">No requests found</h3>
              <h3 *ngIf="isViewingEmployeeRequests">No requests found for {{initiatorName}}</h3>
              <p *ngIf="!isViewingEmployeeRequests">You haven't created any requests yet.</p>
              <p *ngIf="isViewingEmployeeRequests">This employee hasn't created any requests yet.</p>
              <button *ngIf="!isViewingEmployeeRequests"
                      mat-raised-button
                      color="primary"
                      routerLink="/requests/new">
                Create Your First Request
              </button>
              <button *ngIf="isViewingEmployeeRequests"
                      mat-stroked-button
                      routerLink="/requests">
                <mat-icon>arrow_back</mat-icon>
                Back to My Requests
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
    .request-list-container {
      padding: 1rem;
      max-width: 1200px;
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

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .requests-table {
      width: 100%;
    }

    .request-id {
      font-family: monospace;
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .request-title strong {
      display: block;
    }

    .request-title small {
      color: #666;
      font-size: 0.8rem;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background-color: #d4edda;
      color: #155724;
    }

    .status-rejected {
      background-color: #f8d7da;
      color: #721c24;
    }

    .status-archived {
      background-color: #e2e3e5;
      color: #383d41;
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
      color: #ccc;
    }

    .back-button {
      margin-right: 12px;
    }

    .back-button mat-icon {
      margin-right: 4px;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }

      .filters mat-form-field {
        min-width: 100%;
      }
    }
  `]
})
export class RequestListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  requests: RequestDto[] = [];
  displayedColumns: string[] = ['id', 'title', 'status', 'createdAt', 'actions'];
  loading = false;
  
  // Pagination
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filters
  searchTerm = '';
  selectedStatus: RequestStatus | '' = '';
  selectedType: RequestType | '' = '';

  // Employee filter (when viewing specific employee's requests)
  initiatorId: string | null = null;
  initiatorName: string | null = null;
  isViewingEmployeeRequests = false;

  // Enums for template
  RequestStatus = RequestStatus;
  RequestType = RequestType;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadRequests();
    });
  }

  ngOnInit(): void {
    // Check for query parameters to determine if we're viewing a specific employee's requests
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.initiatorId = params['initiatorId'] || null;
      this.initiatorName = params['initiatorName'] || null;
      this.isViewingEmployeeRequests = !!this.initiatorId;

      // Load requests based on whether we're viewing employee-specific requests or user's own requests
      this.loadRequests();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequests(): void {
    this.loading = true;

    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      status: this.selectedStatus !== '' ? this.selectedStatus : undefined,
      type: this.selectedType !== '' ? this.selectedType : undefined
    };

    // If viewing a specific employee's requests, use the search endpoint with their ID
    if (this.isViewingEmployeeRequests && this.initiatorId) {
      // Use the search endpoint with the employee ID as the search term
      params.searchTerm = this.initiatorId;

      this.requestService.getRequests(params).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.requests = response.data;
          this.totalCount = response.totalCount;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading employee requests:', error);
          this.loading = false;
        }
      });
    } else {
      // Use regular search term if provided
      params.searchTerm = this.searchTerm || undefined;

      // Load user's own requests
      this.requestService.getMyRequests(params).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.requests = response.data;
          this.totalCount = response.totalCount;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading requests:', error);
          this.loading = false;
        }
      });
    }
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRequests();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRequests();
  }

  getRequestTypeLabel(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'Leave Request';
      case RequestType.Expense: return 'Expense Report';
      case RequestType.Training: return 'Training Request';
      case RequestType.ITSupport: return 'IT Support';
      case RequestType.ProfileUpdate: return 'Profile Update';
      default: return 'Unknown';
    }
  }

  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.Pending: return 'Pending';
      case RequestStatus.Approved: return 'Approved';
      case RequestStatus.Rejected: return 'Rejected';
      case RequestStatus.Archived: return 'Archived';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.Pending: return 'status-pending';
      case RequestStatus.Approved: return 'status-approved';
      case RequestStatus.Rejected: return 'status-rejected';
      case RequestStatus.Archived: return 'status-archived';
      default: return '';
    }
  }

  canEditRequest(request: RequestDto): boolean {
    return request.status === RequestStatus.Pending;
  }
}
