import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { RequestService } from '../../../../core/services/request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestDto, RequestType, RequestStatus, StepStatus } from '../../../../core/models';

@Component({
  selector: 'app-request-details',
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
    MatTooltipModule
  ],
  template: `
    <div class="request-details-container">
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Request Details -->
      <div *ngIf="!loading && request" class="request-details">
        <!-- Header Card -->
        <mat-card class="header-card">
          <mat-card-header>
            <div mat-card-avatar class="request-avatar">
              <mat-icon>{{getRequestTypeIcon(request.type)}}</mat-icon>
            </div>
            <mat-card-title>
              <div class="title-content">
                <h1 class="request-title">{{request.title || 'Request Details'}}</h1>
                <div class="request-meta">
                  <mat-chip class="type-chip">{{getRequestTypeLabel(request.type)}}</mat-chip>
                  <mat-chip [class]="getStatusClass(request.status)" class="status-chip">
                    <mat-icon>{{getStatusIcon(request.status)}}</mat-icon>
                    {{getStatusLabel(request.status)}}
                  </mat-chip>
                </div>
              </div>
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <!-- Request Information Grid -->
            <div class="info-grid">
              <div class="info-card">
                <mat-icon class="info-icon">fingerprint</mat-icon>
                <div class="info-content">
                  <span class="info-label">Request ID</span>
                  <span class="info-value">{{request.id.substring(0, 8)}}...</span>
                </div>
              </div>

              <div class="info-card">
                <mat-icon class="info-icon">person</mat-icon>
                <div class="info-content">
                  <span class="info-label">Submitted by</span>
                  <span class="info-value">{{request.initiatorName || 'Unknown'}}</span>
                </div>
              </div>

              <div class="info-card">
                <mat-icon class="info-icon">schedule</mat-icon>
                <div class="info-content">
                  <span class="info-label">Created</span>
                  <span class="info-value">{{request.createdAt | date:'MMM d, y, h:mm a'}}</span>
                </div>
              </div>

              <div class="info-card" *ngIf="request.updatedAt">
                <mat-icon class="info-icon">update</mat-icon>
                <div class="info-content">
                  <span class="info-label">Last Updated</span>
                  <span class="info-value">{{request.updatedAt | date:'MMM d, y, h:mm a'}}</span>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div class="description-section" *ngIf="request.description">
              <h3>
                <mat-icon>description</mat-icon>
                Description
              </h3>
              <div class="description-content">
                <p>{{request.description}}</p>
              </div>
            </div>

            <!-- Request Details Section -->
            <div class="details-section" *ngIf="hasRequestDetails()">
              <h3>
                <mat-icon>info</mat-icon>
                Request Details
              </h3>
              <div class="details-content">
                <ng-container [ngSwitch]="request.type">
                  <!-- Leave Request Details -->
                  <div *ngSwitchCase="RequestType.Leave" class="request-type-details">
                    <div class="detail-item" *ngIf="getLeaveStartDate()">
                      <mat-icon>event</mat-icon>
                      <span><strong>Start Date:</strong> {{getLeaveStartDate() | date:'fullDate'}}</span>
                    </div>
                    <div class="detail-item" *ngIf="getLeaveEndDate()">
                      <mat-icon>event</mat-icon>
                      <span><strong>End Date:</strong> {{getLeaveEndDate() | date:'fullDate'}}</span>
                    </div>
                  </div>

                  <!-- Expense Request Details -->
                  <div *ngSwitchCase="RequestType.Expense" class="request-type-details">
                    <div class="detail-item" *ngIf="getExpenseAmount()">
                      <mat-icon>attach_money</mat-icon>
                      <span><strong>Amount:</strong> {{getExpenseAmount() | currency}}</span>
                    </div>
                  </div>

                  <!-- Training Request Details -->
                  <div *ngSwitchCase="RequestType.Training" class="request-type-details">
                    <div class="detail-item" *ngIf="getTrainingCourse()">
                      <mat-icon>school</mat-icon>
                      <span><strong>Course:</strong> {{getTrainingCourse()}}</span>
                    </div>
                    <div class="detail-item" *ngIf="getTrainingProvider()">
                      <mat-icon>business</mat-icon>
                      <span><strong>Provider:</strong> {{getTrainingProvider()}}</span>
                    </div>
                  </div>

                  <!-- IT Support Details -->
                  <div *ngSwitchCase="RequestType.ITSupport" class="request-type-details">
                    <div class="detail-item" *ngIf="getITPriority()">
                      <mat-icon>priority_high</mat-icon>
                      <span><strong>Priority:</strong> {{getITPriority()}}</span>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions align="end" class="action-buttons">
            <button mat-button routerLink="/requests" class="back-button">
              <mat-icon>arrow_back</mat-icon>
              Back to Requests
            </button>
            <button mat-raised-button color="primary" *ngIf="canEditRequest()" (click)="editRequest()" class="edit-button">
              <mat-icon>edit</mat-icon>
              Edit Request
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Workflow Steps -->
        <mat-card class="workflow-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>timeline</mat-icon>
              Workflow Progress
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <mat-stepper [linear]="false" orientation="vertical" class="workflow-stepper">
              <mat-step *ngFor="let step of request.requestSteps; let i = index" 
                        [completed]="step.status === StepStatus.Approved"
                        [hasError]="step.status === StepStatus.Rejected">
                <ng-template matStepLabel>
                  <div class="step-label">
                    <span class="step-name">{{step.workflowStepName}}</span>
                    <span class="step-role">({{step.responsibleRole}})</span>
                  </div>
                </ng-template>

                <div class="step-content">
                  <div class="step-status">
                    <mat-chip [class]="getStepStatusClass(step.status)">
                      {{getStepStatusLabel(step.status)}}
                    </mat-chip>
                  </div>

                  <div class="step-details" *ngIf="step.validatedAt || step.validatorName">
                    <div *ngIf="step.validatorName" class="step-detail">
                      <strong>Processed by:</strong> {{step.validatorName}}
                    </div>
                    <div *ngIf="step.validatedAt" class="step-detail">
                      <strong>Date:</strong> {{step.validatedAt | date:'short'}}
                    </div>
                    <div *ngIf="step.comments" class="step-detail">
                      <strong>Comments:</strong>
                      <p class="step-comments">{{step.comments}}</p>
                    </div>
                  </div>

                  <div *ngIf="step.status === StepStatus.Pending" class="pending-message">
                    <mat-icon>schedule</mat-icon>
                    <span>Waiting for approval from {{step.responsibleRole}}</span>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading && !request" class="error-container">
        <mat-card>
          <mat-card-content>
            <div class="error-content">
              <mat-icon>error</mat-icon>
              <h3>Request Not Found</h3>
              <p>The request you're looking for doesn't exist or you don't have permission to view it.</p>
              <button mat-raised-button color="primary" routerLink="/requests">
                Back to Requests
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .request-details-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .request-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header-card .mat-mdc-card-header {
      padding: 2rem;
    }

    .header-card .mat-mdc-card-content {
      padding: 0 2rem 1rem;
    }

    .header-card .mat-mdc-card-actions {
      padding: 1rem 2rem 2rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .request-avatar {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
    }

    .request-avatar mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .title-content {
      flex: 1;
    }

    .request-title {
      margin: 0 0 1rem 0;
      font-size: 2rem;
      font-weight: 600;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .request-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .type-chip {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      font-weight: 500;
    }

    .status-chip {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-chip mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .info-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1rem;
      color: #1f2937;
      font-weight: 600;
    }

    .description-section, .details-section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .description-section h3, .details-section h3 {
      margin: 0 0 1.5rem 0;
      color: #1f2937;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .description-section h3 mat-icon, .details-section h3 mat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .description-content {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .description-content p {
      margin: 0;
      line-height: 1.7;
      color: #374151;
      font-size: 1rem;
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

    .request-type {
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

    .request-info {
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

    .request-id {
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

    .workflow-card {
      margin-top: 1rem;
    }

    .workflow-stepper {
      margin-top: 1rem;
    }

    .step-label {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .step-name {
      font-weight: 500;
    }

    .step-role {
      font-size: 0.8rem;
      color: #666;
    }

    .step-content {
      padding: 1rem 0;
    }

    .step-status {
      margin-bottom: 1rem;
    }

    .step-details {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .step-detail {
      margin-bottom: 0.5rem;
    }

    .step-comments {
      margin: 0.5rem 0 0 0;
      padding: 0.5rem;
      background-color: white;
      border-left: 3px solid #2196f3;
      border-radius: 0 4px 4px 0;
    }

    .pending-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ff9800;
      font-style: italic;
    }

    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-approved { background-color: #d4edda; color: #155724; }
    .status-rejected { background-color: #f8d7da; color: #721c24; }
    .status-archived { background-color: #e2e3e5; color: #383d41; }

    .step-status-pending { background-color: #fff3cd; color: #856404; }
    .step-status-approved { background-color: #d4edda; color: #155724; }
    .step-status-rejected { background-color: #f8d7da; color: #721c24; }

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

      .request-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RequestDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  request: RequestDto | null = null;
  loading = false;
  requestId: string;

  // Enums for template
  RequestStatus = RequestStatus;
  RequestType = RequestType;
  StepStatus = StepStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private authService: AuthService
  ) {
    this.requestId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadRequestDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequestDetails(): void {
    this.loading = true;
    
    this.requestService.getRequestById(this.requestId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (request) => {
        this.request = request;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading request details:', error);
        this.request = null;
        this.loading = false;
      }
    });
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

  getStepStatusLabel(status: StepStatus): string {
    switch (status) {
      case StepStatus.Pending: return 'Pending';
      case StepStatus.Approved: return 'Approved';
      case StepStatus.Rejected: return 'Rejected';
      default: return 'Unknown';
    }
  }

  getStepStatusClass(status: StepStatus): string {
    switch (status) {
      case StepStatus.Pending: return 'step-status-pending';
      case StepStatus.Approved: return 'step-status-approved';
      case StepStatus.Rejected: return 'step-status-rejected';
      default: return '';
    }
  }

  canEditRequest(): boolean {
    if (!this.request) return false;

    const currentUser = this.authService.getCurrentUser();
    return this.request.status === RequestStatus.Pending &&
           this.request.initiatorId === currentUser?.id;
  }

  editRequest(): void {
    if (this.request) {
      // For now, we'll navigate to the new request form with the same type
      // In a real implementation, you'd create a proper edit form
      this.router.navigate(['/requests/new', this.getRequestTypeRoute(this.request.type)], {
        queryParams: { edit: this.request.id }
      });
    }
  }

  getRequestTypeRoute(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'leave';
      case RequestType.Expense: return 'expense';
      case RequestType.Training: return 'training';
      case RequestType.ITSupport: return 'it-ticket';
      case RequestType.ProfileUpdate: return 'profile-update';
      default: return 'leave';
    }
  }

  getRequestTypeIcon(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'beach_access';
      case RequestType.Expense: return 'receipt';
      case RequestType.Training: return 'school';
      case RequestType.ITSupport: return 'computer';
      case RequestType.ProfileUpdate: return 'person';
      default: return 'assignment';
    }
  }

  getStatusIcon(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.Pending: return 'schedule';
      case RequestStatus.Approved: return 'check_circle';
      case RequestStatus.Rejected: return 'cancel';
      case RequestStatus.Archived: return 'archive';
      default: return 'help';
    }
  }

  hasRequestDetails(): boolean {
    return true; // For now, always show the details section
  }

  // Leave request specific methods
  getLeaveStartDate(): string | null {
    // This would need to be extracted from request data or additional fields
    return null; // Placeholder
  }

  getLeaveEndDate(): string | null {
    // This would need to be extracted from request data or additional fields
    return null; // Placeholder
  }

  // Expense request specific methods
  getExpenseAmount(): number | null {
    // This would need to be extracted from request data or additional fields
    return null; // Placeholder
  }

  // Training request specific methods
  getTrainingCourse(): string | null {
    // This would need to be extracted from request data or additional fields
    return null; // Placeholder
  }

  getTrainingProvider(): string | null {
    // This would need to be extracted from request data or additional fields
    return null; // Placeholder
  }

  // IT Support specific methods
  getITPriority(): string | null {
    // This would need to be extracted from request data or additional fields
    return null; // Placeholder
  }
}
