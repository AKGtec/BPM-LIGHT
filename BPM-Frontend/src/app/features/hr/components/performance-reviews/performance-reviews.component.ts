import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { CreateReviewDialogComponent } from '../create-review-dialog/create-review-dialog.component';
import { EditReviewDialogComponent } from '../edit-review-dialog/edit-review-dialog.component';
import { ReviewDetailsDialogComponent } from '../review-details-dialog/review-details-dialog.component';
import { 
  PerformanceReviewService, 
  PerformanceReview, 
  ReviewType, 
  ReviewStatus, 
  ReviewPriority 
} from '../../../../core/services/performance-review.service';
import { PaginationParams } from '../../../../core/models';

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  action: () => void;
  color: string;
  count?: number;
}

interface RecentActivity {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-performance-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRippleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './performance-reviews.component.html',
  styleUrls: ['./performance-reviews.component.scss']
})
export class PerformanceReviewsComponent implements OnInit {
  reviews: PerformanceReview[] = [];
  filteredReviews: PerformanceReview[] = [];
  displayedColumns: string[] = ['employee', 'title', 'type', 'status', 'progress', 'dueDate', 'actions'];
  
  selectedStatusFilter = '';
  selectedTypeFilter = '';
  selectedPriorityFilter = '';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  isLoading = false;

  quickActions: QuickAction[] = [
    {
      icon: 'add_circle',
      title: 'Create Review',
      description: 'Start new performance review',
      action: () => this.createReview(),
      color: 'primary'
    },
    {
      icon: 'schedule',
      title: 'Due This Week',
      description: 'Reviews due soon',
      action: () => this.filterByDueSoon(),
      color: 'warn',
      count: 0
    },
    {
      icon: 'analytics',
      title: 'Review Reports',
      description: 'Generate analytics',
      action: () => this.generateReports(),
      color: 'accent'
    },
    {
      icon: 'settings',
      title: 'Review Settings',
      description: 'Configure templates',
      action: () => this.manageSettings(),
      color: 'primary'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      icon: 'check_circle',
      title: 'Annual review completed',
      subtitle: 'Sarah Johnson - Engineering',
      time: '2 hours ago',
      type: 'success'
    },
    {
      icon: 'schedule',
      title: 'Review reminder sent',
      subtitle: 'Quarterly reviews due next week',
      time: '4 hours ago',
      type: 'info'
    },
    {
      icon: 'star',
      title: 'High performance rating',
      subtitle: 'Mike Chen - 4.8/5.0 rating',
      time: '6 hours ago',
      type: 'success'
    },
    {
      icon: 'warning',
      title: 'Overdue review alert',
      subtitle: 'Emily Davis - 3 days overdue',
      time: '1 day ago',
      type: 'warning'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private performanceReviewService: PerformanceReviewService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.updateQuickActionCounts();
  }

  loadReviews(): void {
    this.isLoading = true;
    
    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      status: this.selectedStatusFilter ? this.getStatusEnumValue(this.selectedStatusFilter) : undefined,
      type: this.selectedTypeFilter ? this.getTypeEnumValue(this.selectedTypeFilter) : undefined,
      sortBy: 'createdDate',
      sortDirection: 'desc'
    };

    this.performanceReviewService.getPerformanceReviews(params).subscribe({
      next: (response) => {
        this.reviews = response.data;
        this.filteredReviews = response.data;
        this.totalCount = response.totalCount;
        this.updateQuickActionCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading performance reviews:', error);
        this.isLoading = false;
        this.showErrorMessage('Error loading performance reviews. Please try again.');
        this.reviews = [];
        this.filteredReviews = [];
        this.totalCount = 0;
      }
    });
  }

  private updateQuickActionCounts(): void {
    // Update due this week count
    const dueSoonCount = this.getDueSoonReviews().length;
    this.quickActions[1].count = dueSoonCount;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadReviews();
  }

  getDueSoonReviews(): PerformanceReview[] {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return this.reviews.filter(review => {
      const dueDate = new Date(review.dueDate);
      return dueDate <= nextWeek && review.status !== ReviewStatus.Completed;
    });
  }

  getReviewsByStatus(status: string): PerformanceReview[] {
    const statusEnum = this.getStatusEnumValue(status);
    return this.reviews.filter(review => review.status === statusEnum);
  }

  getPendingReviews(): number {
    return this.getReviewsByStatus('draft').length + this.getReviewsByStatus('in-progress').length;
  }

  getCompletedReviews(): number {
    return this.getReviewsByStatus('completed').length;
  }

  getOverdueReviews(): number {
    return this.getReviewsByStatus('overdue').length;
  }

  getTotalReviews(): number {
    return this.reviews.length;
  }

  getAverageRating(): string {
    const completedReviews = this.reviews.filter(r => r.status === ReviewStatus.Completed);
    if (completedReviews.length === 0) return 'N/A';
    
    // Mock average rating calculation (replace with actual rating field)
    const ratings = completedReviews.map(() => Math.random() * 2 + 3); // Random rating between 3-5
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return average.toFixed(1);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  // Helper methods for enum conversions
  getStatusEnumValue(status: string): ReviewStatus {
    switch (status) {
      case 'draft': return ReviewStatus.Draft;
      case 'in-progress': return ReviewStatus.InProgress;
      case 'completed': return ReviewStatus.Completed;
      case 'overdue': return ReviewStatus.Overdue;
      default: return ReviewStatus.Draft;
    }
  }

  getTypeEnumValue(type: string): ReviewType {
    switch (type) {
      case 'annual': return ReviewType.Annual;
      case 'quarterly': return ReviewType.Quarterly;
      case 'probationary': return ReviewType.Probationary;
      case 'project': return ReviewType.Project;
      case '360': return ReviewType.ThreeSixty;
      default: return ReviewType.Annual;
    }
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

  getStatusClass(status: ReviewStatus): string {
    switch (status) {
      case ReviewStatus.Draft: return 'status-draft';
      case ReviewStatus.InProgress: return 'status-in-progress';
      case ReviewStatus.Completed: return 'status-completed';
      case ReviewStatus.Overdue: return 'status-overdue';
      default: return 'status-draft';
    }
  }

  isOverdue(dueDate: string): boolean {
    return new Date() > new Date(dueDate);
  }

  createReview(): void {
    const dialogRef = this.dialog.open(CreateReviewDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const createDto = {
          title: result.title,
          employeeId: result.employeeId,
          reviewType: result.reviewType,
          dueDate: result.dueDate,
          priority: result.priority || ReviewPriority.Medium,
          description: result.description,
          goals: result.goals
        };

        this.performanceReviewService.createPerformanceReview(createDto).subscribe({
          next: (createdReview) => {
            this.loadReviews();
            this.showSuccessMessage('Performance review created successfully!');
          },
          error: (error) => {
            console.error('Error creating performance review:', error);
            this.showErrorMessage('Error creating performance review. Please try again.');
          }
        });
      }
    });
  }

  viewReview(review: PerformanceReview): void {
    const dialogRef = this.dialog.open(ReviewDetailsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { review }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.editReview(result.review);
      }
    });
  }

  editReview(review: PerformanceReview): void {
    const dialogRef = this.dialog.open(EditReviewDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { review }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadReviews();
        this.showSuccessMessage('Performance review updated successfully!');
      }
    });
  }

  duplicateReview(review: PerformanceReview): void {
    const createDto = {
      title: `${review.title} (Copy)`,
      employeeId: review.employeeId,
      reviewType: review.reviewType,
      dueDate: review.dueDate,
      priority: review.priority,
      description: review.description,
      goals: review.goals
    };

    this.performanceReviewService.createPerformanceReview(createDto).subscribe({
      next: (duplicatedReview) => {
        this.loadReviews();
        this.showSuccessMessage('Review duplicated successfully!');
      },
      error: (error) => {
        console.error('Error duplicating performance review:', error);
        this.showErrorMessage('Error duplicating performance review. Please try again.');
      }
    });
  }

  deleteReview(review: PerformanceReview): void {
    if (confirm(`Are you sure you want to delete the review "${review.title}"?`)) {
      this.performanceReviewService.deletePerformanceReview(review.id).subscribe({
        next: () => {
          this.loadReviews();
          this.showSuccessMessage('Review deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting performance review:', error);
          this.showErrorMessage('Error deleting performance review. Please try again.');
        }
      });
    }
  }

  // Quick Action Methods
  filterByDueSoon(): void {
    // Filter to show only reviews due soon
    this.selectedStatusFilter = '';
    this.searchTerm = '';
    this.loadReviews();
    // Additional logic to filter by due date would go here
  }

  generateReports(): void {
    this.showInfoMessage('Report generation feature coming soon!');
  }

  manageSettings(): void {
    this.showInfoMessage('Settings management feature coming soon!');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatusFilter = '';
    this.selectedTypeFilter = '';
    this.selectedPriorityFilter = '';
    this.applyFilters();
  }

  exportToExcel(): void {
    this.showInfoMessage('Export functionality coming soon!');
  }

  bulkUpdate(): void {
    this.showInfoMessage('Bulk update feature coming soon!');
  }

  // Utility methods for snackbar messages
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}