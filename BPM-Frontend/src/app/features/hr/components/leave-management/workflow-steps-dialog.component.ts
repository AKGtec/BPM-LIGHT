import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RequestService } from '../../../../core/services/request.service';
import { RequestDto } from '../../../../core/models';

@Component({
  selector: 'app-workflow-steps-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="workflow-steps-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon>timeline</mat-icon>
        <h2>Workflow Steps</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <div class="request-info">
          <h3>{{requestData.title || 'Leave Request'}}</h3>
          <p>Initiated by: <strong>{{requestData.initiatorName}}</strong></p>
          <p>Request ID: <strong>{{requestData.id}}</strong></p>
        </div>

        <div class="progress-section" *ngIf="!isLoading && steps.length > 0">
          <div class="progress-header">
            <span>Progress: {{getCompletedSteps()}} of {{steps.length}} steps completed</span>
            <span class="progress-percentage">{{getProgressPercentage()}}%</span>
          </div>
          <mat-progress-bar 
            mode="determinate" 
            [value]="getProgressPercentage()"
            class="progress-bar">
          </mat-progress-bar>
        </div>

        <div *ngIf="isLoading" class="loading-container">
          <mat-icon class="loading-spinner">refresh</mat-icon>
          <p>Loading workflow steps...</p>
        </div>

        <div *ngIf="!isLoading && steps.length === 0" class="no-steps-container">
          <mat-icon>info</mat-icon>
          <p>No workflow steps found for this request.</p>
        </div>

        <div class="timeline" *ngIf="!isLoading && steps.length > 0">
          <div class="timeline-item" 
               *ngFor="let step of steps; let i = index; let isLast = last"
               [class.completed]="step.status === 2"
               [class.rejected]="step.status === 3"
               [class.current]="step.status === 1">
            
            <div class="timeline-marker">
              <div class="marker-circle">
                <mat-icon *ngIf="step.status === 2">check</mat-icon>
                <mat-icon *ngIf="step.status === 3">close</mat-icon>
                <mat-icon *ngIf="step.status === 1">schedule</mat-icon>
              </div>
              <div class="timeline-line" *ngIf="!isLast"></div>
            </div>

            <div class="timeline-content">
              <div class="step-header">
                <h4>{{step.workflowStepName}}</h4>
                <mat-chip [class]="getStepStatusClass(step.status)">
                  {{getStepStatusLabel(step.status)}}
                </mat-chip>
              </div>
              
              <div class="step-details">
                <div class="step-role">
                  <mat-icon>person</mat-icon>
                  <span>{{step.responsibleRole}}</span>
                </div>
                
                <div class="step-info" *ngIf="step.validatorName || step.validatedAt">
                  <div *ngIf="step.validatorName" class="validator">
                    <mat-icon>account_circle</mat-icon>
                    <span>Handled by: {{step.validatorName}}</span>
                  </div>
                  <div *ngIf="step.validatedAt" class="validated-date">
                    <mat-icon>schedule</mat-icon>
                    <span>{{step.validatedAt | date:'medium'}}</span>
                  </div>
                </div>
                
                <div *ngIf="step.comments" class="step-comments">
                  <mat-icon>comment</mat-icon>
                  <span>{{step.comments}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">Close</button>
        <button mat-raised-button color="primary" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>
    </div>
  `,
  styles: [`
    .workflow-steps-dialog {
      width: 100%;
      max-width: 700px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .dialog-header h2 {
      margin: 0;
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .request-info {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .request-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .request-info p {
      margin: 0.25rem 0;
      color: #666;
    }

    .progress-section {
      margin-bottom: 1.5rem;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .progress-percentage {
      font-weight: 500;
      color: #2196f3;
    }

    .progress-bar {
      height: 8px;
      border-radius: 4px;
    }

    .loading-container, .no-steps-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #666;
    }

    .loading-container mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      animation: spin 2s linear infinite;
    }

    .no-steps-container mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .timeline {
      position: relative;
    }

    .timeline-item {
      display: flex;
      margin-bottom: 2rem;
      position: relative;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 1rem;
    }

    .marker-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0e0e0;
      color: #666;
      position: relative;
      z-index: 2;
    }

    .timeline-item.completed .marker-circle {
      background: #4caf50;
      color: white;
    }

    .timeline-item.rejected .marker-circle {
      background: #f44336;
      color: white;
    }

    .timeline-item.current .marker-circle {
      background: #2196f3;
      color: white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
      100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
    }

    .timeline-line {
      width: 2px;
      height: 60px;
      background: #e0e0e0;
      margin-top: 8px;
    }

    .timeline-item.completed .timeline-line {
      background: #4caf50;
    }

    .timeline-content {
      flex: 1;
      padding-top: 0.5rem;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .step-header h4 {
      margin: 0;
      color: #333;
    }

    .step-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .step-role, .validator, .validated-date, .step-comments {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .step-comments {
      background: #f5f5f5;
      padding: 0.5rem;
      border-radius: 4px;
      margin-top: 0.5rem;
    }

    .step-status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .step-status-approved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .step-status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    @media (max-width: 600px) {
      .step-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .timeline-marker {
        margin-right: 0.5rem;
      }

      .marker-circle {
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class WorkflowStepsDialogComponent implements OnInit {
  steps: any[] = [];
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<WorkflowStepsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public requestData: RequestDto,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.loadWorkflowSteps();
  }

  loadWorkflowSteps(): void {
    this.isLoading = true;
    
    // If we already have request steps in the data, use them directly
    if (this.requestData.requestSteps && this.requestData.requestSteps.length > 0) {
      console.log('Using request steps from data:', this.requestData.requestSteps);
      this.steps = [...this.requestData.requestSteps].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      this.isLoading = false;
      return;
    }
    
    // Otherwise, try to fetch them from the API
    this.requestService.getRequestSteps(this.requestData.id)
      .subscribe({
        next: (steps) => {
          console.log('Loaded steps from API:', steps);
          this.steps = steps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading workflow steps:', error);
          // Fallback to request steps from the request data
          this.steps = this.requestData.requestSteps || [];
          this.isLoading = false;
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  refresh(): void {
    this.loadWorkflowSteps();
  }

  getStepStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return 'Unknown';
    }
  }

  getStepStatusClass(status: number): string {
    switch (status) {
      case 1: return 'step-status-pending';
      case 2: return 'step-status-approved';
      case 3: return 'step-status-rejected';
      default: return '';
    }
  }

  getCompletedSteps(): number {
    return this.steps.filter(step => step.status === 2).length;
  }

  getProgressPercentage(): number {
    if (this.steps.length === 0) return 0;
    return Math.round((this.getCompletedSteps() / this.steps.length) * 100);
  }
}