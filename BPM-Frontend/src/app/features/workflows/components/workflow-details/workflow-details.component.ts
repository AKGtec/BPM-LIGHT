import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';

import { WorkflowService } from '../../../../core/services/workflow.service';
import { WorkflowDto } from '../../../../core/models';

@Component({
  selector: 'app-workflow-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTooltipModule,
    MatTableModule
  ],
  template: `
    <div class="workflow-details-container">
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Workflow Details -->
      <div *ngIf="!loading && workflow">
        <!-- Header Card -->
        <mat-card class="header-card">
          <mat-card-header>
            <mat-card-title>
              <div class="title-section">
                <mat-icon>account_tree</mat-icon>
                <div>
                  <h2>{{workflow.name}}</h2>
                  <span class="workflow-version">Version {{workflow.version}}</span>
                </div>
              </div>
              <div class="status-section">
                <mat-chip [class]="workflow.isActive ? 'status-active' : 'status-inactive'">
                  {{workflow.isActive ? 'Active' : 'Inactive'}}
                </mat-chip>
              </div>
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div class="workflow-info">
              <div class="info-item">
                <strong>Workflow ID:</strong>
                <span class="workflow-id">{{workflow.id}}</span>
              </div>
              <div class="info-item">
                <strong>Created:</strong>
                <span>{{workflow.createdAt | date:'full'}}</span>
              </div>
              <div class="info-item" *ngIf="workflow.updatedAt">
                <strong>Last Updated:</strong>
                <span>{{workflow.updatedAt | date:'full'}}</span>
              </div>
              <div class="info-item">
                <strong>Total Steps:</strong>
                <span>{{workflow.steps ? workflow.steps.length : 0}}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="description-section" *ngIf="workflow.description">
              <h3>Description</h3>
              <p>{{workflow.description}}</p>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button routerLink="/workflows">
              <mat-icon>arrow_back</mat-icon>
              Back to Workflows
            </button>
            <button mat-raised-button color="primary" [routerLink]="['/workflows/designer', workflow.id]">
              <mat-icon>edit</mat-icon>
              Edit Workflow
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Workflow Steps -->
        <mat-card class="steps-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>timeline</mat-icon>
              Workflow Steps
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div *ngIf="workflow.steps && workflow.steps.length > 0">
              <!-- Visual Stepper -->
              <mat-stepper [linear]="false" orientation="vertical" class="workflow-stepper">
                <mat-step *ngFor="let step of sortedSteps; let i = index">
                  <ng-template matStepLabel>
                    <div class="step-label">
                      <span class="step-name">{{step.stepName}}</span>
                      <span class="step-order">Step {{step.order}}</span>
                    </div>
                  </ng-template>

                  <div class="step-content">
                    <div class="step-details">
                      <div class="step-detail">
                        <strong>Responsible Role:</strong>
                        <mat-chip class="role-chip">{{step.responsibleRole}}</mat-chip>
                      </div>
                      <div class="step-detail" *ngIf="step.dueInHours">
                        <strong>Due Time:</strong>
                        <span>{{step.dueInHours}} hours</span>
                      </div>
                      <div class="step-detail">
                        <strong>Created:</strong>
                        <span>{{step.createdAt | date:'short'}}</span>
                      </div>
                    </div>
                  </div>
                </mat-step>
              </mat-stepper>

              <!-- Steps Table -->
              <div class="steps-table-section">
                <h4>Steps Summary</h4>
                <table mat-table [dataSource]="sortedSteps" class="steps-table">
                  <!-- Order Column -->
                  <ng-container matColumnDef="order">
                    <th mat-header-cell *matHeaderCellDef>Order</th>
                    <td mat-cell *matCellDef="let step">{{step.order}}</td>
                  </ng-container>

                  <!-- Step Name Column -->
                  <ng-container matColumnDef="stepName">
                    <th mat-header-cell *matHeaderCellDef>Step Name</th>
                    <td mat-cell *matCellDef="let step">{{step.stepName}}</td>
                  </ng-container>

                  <!-- Responsible Role Column -->
                  <ng-container matColumnDef="responsibleRole">
                    <th mat-header-cell *matHeaderCellDef>Responsible Role</th>
                    <td mat-cell *matCellDef="let step">
                      <mat-chip class="role-chip">{{step.responsibleRole}}</mat-chip>
                    </td>
                  </ng-container>

                  <!-- Due Time Column -->
                  <ng-container matColumnDef="dueInHours">
                    <th mat-header-cell *matHeaderCellDef>Due Time</th>
                    <td mat-cell *matCellDef="let step">
                      {{step.dueInHours ? step.dueInHours + ' hours' : 'No limit'}}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="stepColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: stepColumns;"></tr>
                </table>
              </div>
            </div>

            <div *ngIf="!workflow.steps || workflow.steps.length === 0" class="no-steps">
              <mat-icon>info</mat-icon>
              <h4>No Steps Defined</h4>
              <p>This workflow doesn't have any steps configured yet.</p>
              <button mat-raised-button color="primary" [routerLink]="['/workflows/designer', workflow.id]">
                Add Steps
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !workflow" class="error-container">
        <mat-card>
          <mat-card-content>
            <div class="error-content">
              <mat-icon>error</mat-icon>
              <h3>Workflow Not Found</h3>
              <p>The workflow you're looking for doesn't exist or has been removed.</p>
              <button mat-raised-button color="primary" routerLink="/workflows">
                Back to Workflows
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .workflow-details-container {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .header-card {
      margin-bottom: 1rem;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-section h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .workflow-version {
      color: #666;
      font-size: 0.9rem;
      font-weight: normal;
    }

    mat-card-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .workflow-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .workflow-id {
      font-family: monospace;
      background-color: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .description-section {
      margin-top: 1rem;
    }

    .description-section h3 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .description-section p {
      line-height: 1.6;
      color: #666;
    }

    .steps-card {
      margin-top: 1rem;
    }

    .workflow-stepper {
      margin: 1rem 0;
    }

    .step-label {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .step-name {
      font-weight: 500;
    }

    .step-order {
      font-size: 0.8rem;
      color: #666;
    }

    .step-content {
      padding: 1rem 0;
    }

    .step-details {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
    }

    .step-detail {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .role-chip {
      background-color: #e3f2fd;
      color: #1976d2;
      font-size: 0.75rem;
    }

    .steps-table-section {
      margin-top: 2rem;
    }

    .steps-table-section h4 {
      margin-bottom: 1rem;
      color: #333;
    }

    .steps-table {
      width: 100%;
    }

    .status-active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-inactive {
      background-color: #f8d7da;
      color: #721c24;
    }

    .no-steps {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-steps mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ff9800;
      margin-bottom: 1rem;
    }

    .error-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .error-content {
      text-align: center;
      padding: 2rem;
    }

    .error-content mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #f44336;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      mat-card-title {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .workflow-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WorkflowDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  workflow: WorkflowDto | null = null;
  loading = false;
  workflowId: string;
  stepColumns: string[] = ['order', 'stepName', 'responsibleRole', 'dueInHours'];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly workflowService: WorkflowService
  ) {
    this.workflowId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadWorkflowDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get sortedSteps() {
    if (!this.workflow?.steps) return [];
    return [...this.workflow.steps].sort((a, b) => a.order - b.order);
  }

  loadWorkflowDetails(): void {
    this.loading = true;
    
    this.workflowService.getWorkflowWithSteps(this.workflowId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (workflow) => {
        this.workflow = workflow;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading workflow details:', error);
        this.workflow = null;
        this.loading = false;
      }
    });
  }
}
