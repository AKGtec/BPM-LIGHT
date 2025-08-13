import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RequestDto } from '../../../../core/models';

@Component({
  selector: 'app-request-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="request-details-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon>visibility</mat-icon>
        <h2>Request Details</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <div class="detail-section">
          <h3>Basic Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Request ID:</label>
              <span>{{request.id}}</span>
            </div>
            <div class="detail-item">
              <label>Initiator:</label>
              <span>{{request.initiatorName}}</span>
            </div>
            <div class="detail-item">
              <label>Title:</label>
              <span>{{request.title || 'Leave Request'}}</span>
            </div>
            <div class="detail-item">
              <label>Type:</label>
              <mat-chip class="type-chip">Leave Request</mat-chip>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <mat-chip [class]="getStatusClass(request.status)">
                {{getStatusLabel(request.status)}}
              </mat-chip>
            </div>
            <div class="detail-item">
              <label>Created:</label>
              <span>{{request.createdAt | date:'medium'}}</span>
            </div>
            <div class="detail-item" *ngIf="request.updatedAt">
              <label>Updated:</label>
              <span>{{request.updatedAt | date:'medium'}}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="detail-section" *ngIf="request.description">
          <h3>Description</h3>
          <p class="description">{{request.description}}</p>
        </div>

        <mat-divider *ngIf="request.description"></mat-divider>

        <div class="detail-section" *ngIf="request.requestSteps && request.requestSteps.length > 0">
          <h3>Workflow Steps</h3>
          <div class="steps-list">
            <div class="step-item" *ngFor="let step of request.requestSteps; let i = index">
              <div class="step-header">
                <div class="step-number">{{i + 1}}</div>
                <div class="step-info">
                  <h4>{{step.workflowStepName}}</h4>
                  <p class="step-role">{{step.responsibleRole}}</p>
                </div>
                <mat-chip [class]="getStepStatusClass(step.status)">
                  {{getStepStatusLabel(step.status)}}
                </mat-chip>
              </div>
              <div class="step-details" *ngIf="step.validatorName || step.comments">
                <div *ngIf="step.validatorName" class="validator">
                  <strong>Validated by:</strong> {{step.validatorName}}
                </div>
                <div *ngIf="step.validatedAt" class="validated-date">
                  <strong>Date:</strong> {{step.validatedAt | date:'medium'}}
                </div>
                <div *ngIf="step.comments" class="comments">
                  <strong>Comments:</strong> {{step.comments}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="close()">Close</button>
        <button mat-raised-button color="primary" (click)="close()">
          <mat-icon>check</mat-icon>
          OK
        </button>
      </div>
    </div>
  `,
  styles: [`
    .request-details-dialog {
      width: 100%;
      max-width: 800px;
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

    .detail-section {
      margin-bottom: 1.5rem;
    }

    .detail-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-weight: 500;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
    }

    .detail-item span {
      color: #333;
    }

    .description {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin: 0;
      white-space: pre-wrap;
    }

    .type-chip {
      background-color: #e3f2fd;
      color: #1976d2;
      width: fit-content;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-approved {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .step-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      background: #fafafa;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2196f3;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.875rem;
    }

    .step-info {
      flex: 1;
    }

    .step-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .step-role {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .step-details {
      margin-left: 48px;
      padding-top: 0.5rem;
      border-top: 1px solid #e0e0e0;
    }

    .step-details > div {
      margin-bottom: 0.5rem;
    }

    .step-details > div:last-child {
      margin-bottom: 0;
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
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .step-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .step-details {
        margin-left: 0;
      }
    }
  `]
})
export class RequestDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RequestDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public request: RequestDto
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      case 4: return 'Archived';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-pending';
      case 2: return 'status-approved';
      case 3: return 'status-rejected';
      case 4: return 'status-archived';
      default: return '';
    }
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
}