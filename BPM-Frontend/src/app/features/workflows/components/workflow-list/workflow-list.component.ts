import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { WorkflowService } from '../../../../core/services/workflow.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WorkflowDto, PaginationParams } from '../../../../core/models';

@Component({
  selector: 'app-workflow-list',
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
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule
  ],
  template: `
    <div class="workflow-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_tree</mat-icon>
            Workflow Management
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" routerLink="/workflows/designer">
              <mat-icon>add</mat-icon>
              Create Workflow
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search workflows...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="onFilterChange()">
                <mat-option value="">All</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Loading workflows...</p>
          </div>

        

          <!-- Workflows Table -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="workflows" class="workflows-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let workflow">
                  <div class="workflow-name">
                    <strong>{{workflow.name}}</strong>
                    <small *ngIf="workflow.description">{{workflow.description}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Version Column -->
              <ng-container matColumnDef="version">
                <th mat-header-cell *matHeaderCellDef>Version</th>
                <td mat-cell *matCellDef="let workflow">
                  <mat-chip class="version-chip">v{{workflow.version}}</mat-chip>
                </td>
              </ng-container>

              <!-- Steps Column -->
              <ng-container matColumnDef="steps">
                <th mat-header-cell *matHeaderCellDef>Steps</th>
                <td mat-cell *matCellDef="let workflow">
                  <span class="steps-count">{{workflow.steps?.length || 0}} steps</span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let workflow">
                  <mat-chip [class]="workflow.isActive ? 'status-active' : 'status-inactive'">
                    {{workflow.isActive ? 'Active' : 'Inactive'}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Created Date Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let workflow">
                  {{workflow.createdAt | date:'short'}}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let workflow">
                  <div class="action-buttons">
                    <button mat-icon-button [routerLink]="['/workflows/details', workflow.id]" matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button [routerLink]="['/workflows/designer', workflow.id]" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <mat-slide-toggle 
                      [checked]="workflow.isActive" 
                      (change)="toggleWorkflowStatus(workflow)"
                      matTooltip="Toggle Active Status">
                    </mat-slide-toggle>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="workflow-row"></tr>
            </table>

            <!-- No Data Message -->
            <div *ngIf="workflows.length === 0" class="no-data">
              <mat-icon>account_tree</mat-icon>
              <h3>No workflows found</h3>
              <p>Create your first workflow to get started with process automation.</p>
              <button mat-raised-button color="primary" routerLink="/workflows/designer">
                Create Your First Workflow
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
    .workflow-list-container {
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

    .workflows-table {
      width: 100%;
    }

    .workflow-row:hover {
      background-color: #f5f5f5;
    }

    .workflow-name strong {
      display: block;
      font-size: 1rem;
    }

    .workflow-name small {
      color: #666;
      font-size: 0.8rem;
      display: block;
      margin-top: 0.25rem;
    }

    .version-chip {
      background-color: #e3f2fd;
      color: #1976d2;
      font-size: 0.75rem;
    }

    .steps-count {
      color: #666;
      font-size: 0.9rem;
    }

    .status-active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-inactive {
      background-color: #f8d7da;
      color: #721c24;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
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
        gap: 0.25rem;
      }
    }
  `]
})
export class WorkflowListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  workflows: WorkflowDto[] = [];
  displayedColumns: string[] = ['name', 'version', 'steps', 'status', 'createdAt', 'actions'];
  loading = false;
  
  // Pagination
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filters
  searchTerm = '';
  selectedStatus: string = '';

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly authService: AuthService
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadWorkflows();
    });
  }

  ngOnInit(): void {
    this.loadWorkflows();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkflows(): void {
    this.loading = true;

    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    this.workflowService.getWorkflows(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.workflows = response.data;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading workflows:', error);
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadWorkflows();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadWorkflows();
  }

  toggleWorkflowStatus(workflow: WorkflowDto): void {
    const updatedWorkflow = {
      ...workflow,
      isActive: !workflow.isActive
    };

    this.workflowService.updateWorkflow(workflow.id, updatedWorkflow).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        workflow.isActive = !workflow.isActive;
      },
      error: (error) => {
        console.error('Error updating workflow status:', error);
      }
    });
  }
}
