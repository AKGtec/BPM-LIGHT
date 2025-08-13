import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { 
  PerformanceReviewService, 
  PerformanceReview,
  ReviewType, 
  ReviewStatus,
  ReviewPriority 
} from '../../../../core/services/performance-review.service';

@Component({
  selector: 'app-review-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatListModule
  ],
  template: `
    <div class="review-details-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>visibility</mat-icon>
        Performance Review Details
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <!-- Review Header -->
          <mat-card class="review-header-card">
            <mat-card-content>
              <div class="review-header">
                <div class="review-title-section">
                  <h2>{{ review.title }}</h2>
                  <div class="review-meta">
                    <mat-chip [class]="'status-' + review.status">
                      {{ getStatusDisplay(review.status) }}
                    </mat-chip>
                    <mat-chip [class]="'priority-' + getPriorityClass(review.priority)" class="priority-chip">
                      {{ getPriorityDisplay(review.priority) }}
                    </mat-chip>
                    <span class="review-type">{{ getReviewTypeDisplay(review.reviewType) }}</span>
                  </div>
                </div>
                <div class="progress-section">
                  <div class="progress-container">
                    <mat-progress-bar mode="determinate" [value]="review.progress"></mat-progress-bar>
                    <span class="progress-text">{{ review.progress }}% Complete</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Employee Information -->
          <mat-card class="employee-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon>
                Employee Information
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="employee-info">
                <div class="info-item">
                  <strong>Name:</strong> {{ review.employeeName }}
                </div>
                <div class="info-item" *ngIf="review.employeePosition">
                  <strong>Position:</strong> {{ review.employeePosition }}
                </div>
                <div class="info-item">
                  <strong>Employee ID:</strong> {{ review.employeeId }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Review Details Tabs -->
          <mat-card class="details-card">
            <mat-tab-group>
              <!-- Overview Tab -->
              <mat-tab label="Overview">
                <div class="tab-content">
                  <div class="overview-grid">
                    <div class="overview-item">
                      <mat-icon>event</mat-icon>
                      <div>
                        <strong>Created Date</strong>
                        <p>{{ review.createdDate | date:'MMM dd, yyyy' }}</p>
                      </div>
                    </div>
                    <div class="overview-item">
                      <mat-icon>schedule</mat-icon>
                      <div>
                        <strong>Due Date</strong>
                        <p [class.overdue]="isOverdue(review.dueDate)">
                          {{ review.dueDate | date:'MMM dd, yyyy' }}
                          <mat-icon *ngIf="isOverdue(review.dueDate)" class="warning-icon">warning</mat-icon>
                        </p>
                      </div>
                    </div>
                    <div class="overview-item" *ngIf="review.completedDate">
                      <mat-icon>check_circle</mat-icon>
                      <div>
                        <strong>Completed Date</strong>
                        <p>{{ review.completedDate | date:'MMM dd, yyyy' }}</p>
                      </div>
                    </div>
                    <div class="overview-item">
                      <mat-icon>person</mat-icon>
                      <div>
                        <strong>Reviewer</strong>
                        <p>{{ review.reviewerName || 'Not assigned' }}</p>
                      </div>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="description-section">
                    <h3>
                      <mat-icon>description</mat-icon>
                      Description
                    </h3>
                    <p class="description-text">{{ review.description }}</p>
                  </div>
                </div>
              </mat-tab>

              <!-- Goals Tab -->
              <mat-tab label="Goals">
                <div class="tab-content">
                  <div *ngIf="review.goals && review.goals.length > 0; else noGoals">
                    <div *ngFor="let goal of review.goals; let i = index" class="goal-card">
                      <mat-card>
                        <mat-card-header>
                          <mat-card-title>
                            <mat-icon>flag</mat-icon>
                            Goal {{ i + 1 }}
                          </mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <p class="goal-description">{{ goal }}</p>
                        </mat-card-content>
                      </mat-card>
                    </div>
                  </div>
                  <ng-template #noGoals>
                    <div class="no-goals">
                      <mat-icon>flag</mat-icon>
                      <h3>No Goals Defined</h3>
                      <p>No goals have been set for this performance review.</p>
                    </div>
                  </ng-template>
                </div>
              </mat-tab>

              <!-- Feedback Tab -->
              <mat-tab label="Feedback">
                <div class="tab-content">
                  <div *ngIf="review.feedback; else noFeedback">
                    <div class="feedback-section">
                      <h3>
                        <mat-icon>feedback</mat-icon>
                        Review Feedback
                      </h3>
                      <p class="feedback-text">{{ review.feedback }}</p>
                      <div class="rating-section" *ngIf="review.rating">
                        <h4>Overall Rating</h4>
                        <div class="rating-display">
                          <span class="rating-value">{{ review.rating }}/5</span>
                          <div class="stars">
                            <mat-icon *ngFor="let star of getStarArray(review.rating)" 
                                     [class]="star ? 'star-filled' : 'star-empty'">
                              {{ star ? 'star' : 'star_border' }}
                            </mat-icon>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ng-template #noFeedback>
                    <div class="no-feedback">
                      <mat-icon>feedback</mat-icon>
                      <h3>No Feedback</h3>
                      <p>No feedback has been provided for this review yet.</p>
                    </div>
                  </ng-template>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Edit Review
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .review-details-dialog {
      width: 100%;
      max-width: 900px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
      margin: 0;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 80vh;
      overflow-y: auto;
    }

    .review-header-card {
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .review-title-section h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .review-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .review-meta mat-chip {
      color: white;
    }

    .review-type {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.875rem;
    }

    .progress-section {
      min-width: 200px;
    }

    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progress-text {
      text-align: center;
      font-weight: 500;
    }

    .employee-card,
    .details-card {
      margin-bottom: 1.5rem;
    }

    .employee-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
    }

    .employee-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tab-content {
      padding: 1.5rem;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .overview-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .overview-item mat-icon {
      color: #1976d2;
      margin-top: 0.25rem;
    }

    .overview-item strong {
      display: block;
      margin-bottom: 0.25rem;
      color: #333;
    }

    .overview-item p {
      margin: 0;
      color: #666;
    }

    .overdue {
      color: #d32f2f !important;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .warning-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
    }

    .description-section h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
      margin-bottom: 1rem;
    }

    .description-text {
      line-height: 1.6;
      color: #666;
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin: 0;
    }

    .goal-card {
      margin-bottom: 1rem;
    }

    .goal-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
    }

    .goal-description {
      margin: 1rem 0;
      line-height: 1.6;
    }

    .goal-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .feedback-section h3 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
      margin-bottom: 1rem;
    }

    .feedback-text {
      line-height: 1.6;
      color: #666;
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin: 0 0 2rem 0;
    }

    .rating-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1976d2;
    }

    .stars {
      display: flex;
      gap: 0.25rem;
    }

    .star-filled {
      color: #ffc107;
    }

    .star-empty {
      color: #e0e0e0;
    }

    .no-goals,
    .no-feedback {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-goals mat-icon,
    .no-feedback mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    .no-goals h3,
    .no-feedback h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .no-goals p,
    .no-feedback p {
      margin: 0;
    }

    /* Status chips */
    .status-draft { background-color: #9e9e9e; }
    .status-in-progress { background-color: #2196f3; }
    .status-completed { background-color: #4caf50; }
    .status-overdue { background-color: #f44336; }

    /* Priority chips */
    .priority-low { background-color: #4caf50; }
    .priority-medium { background-color: #ff9800; }
    .priority-high { background-color: #f44336; }
    .priority-critical { background-color: #9c27b0; }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .review-header {
        flex-direction: column;
        gap: 1rem;
      }

      .progress-section {
        min-width: auto;
        width: 100%;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .dialog-content {
        padding: 1rem;
      }
    }
  `]
})
export class ReviewDetailsDialogComponent implements OnInit {
  review: PerformanceReview;

  constructor(
    private dialogRef: MatDialogRef<ReviewDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { review: PerformanceReview },
    private performanceReviewService: PerformanceReviewService
  ) {
    this.review = data.review;
  }

  ngOnInit(): void {
    // Load additional details if needed
  }

  getReviewTypeDisplay(type: ReviewType): string {
    return this.performanceReviewService.getReviewTypeLabel(type);
  }

  getStatusDisplay(status: ReviewStatus): string {
    return this.performanceReviewService.getReviewStatusLabel(status);
  }

  getPriorityDisplay(priority: ReviewPriority): string {
    return this.performanceReviewService.getReviewPriorityLabel(priority);
  }

  getPriorityClass(priority: ReviewPriority): string {
    switch (priority) {
      case ReviewPriority.Low: return 'low';
      case ReviewPriority.Medium: return 'medium';
      case ReviewPriority.High: return 'high';
      case ReviewPriority.Critical: return 'critical';
      default: return 'medium';
    }
  }

  isOverdue(dueDate: string): boolean {
    return new Date() > new Date(dueDate);
  }

  getStarArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', review: this.review });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}