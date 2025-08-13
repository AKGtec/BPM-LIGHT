import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RequestService } from '../../../../core/services/request.service';
import { RequestDto, RequestType, RequestStatus, PaginationParams } from '../../../../core/models';
import { RequestDetailsDialogComponent } from './request-details-dialog.component';
import { WorkflowStepsDialogComponent } from './workflow-steps-dialog.component';

interface LeaveRequest {
  id: string;
  initiatorName: string;
  title: string;
  description: string;
  type: RequestType;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
  currentStep?: string;
  comments?: string;
  hasWorkflowSteps?: boolean;
  priority?: 'Low' | 'Medium' | 'High';
  duration?: string;
}

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
  selector: 'app-leave-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatRippleModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss']
})
export class LeaveManagementComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  leaveRequests: LeaveRequest[] = [];
  filteredRequests: LeaveRequest[] = [];
  displayedColumns: string[] = ['employee', 'title', 'description', 'currentStep', 'status', 'createdAt', 'actions'];

  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';
  isLoading = false;

  quickActions: QuickAction[] = [
    {
      icon: 'pending',
      title: 'Review Pending',
      description: 'Process pending requests',
      action: () => this.filterByStatus('Pending'),
      color: 'warn',
      count: 0
    },
    {
      icon: 'calendar_today',
      title: 'Leave Calendar',
      description: 'View leave schedule',
      action: () => this.openLeaveCalendar(),
      color: 'primary'
    },
    {
      icon: 'analytics',
      title: 'Leave Reports',
      description: 'Generate reports',
      action: () => this.generateReports(),
      color: 'accent'
    },
    {
      icon: 'settings',
      title: 'Leave Policies',
      description: 'Manage policies',
      action: () => this.managePolicies(),
      color: 'primary'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      icon: 'check_circle',
      title: 'Leave request approved',
      subtitle: 'Sarah Johnson - 3 days vacation',
      time: '2 hours ago',
      type: 'success'
    },
    {
      icon: 'schedule',
      title: 'Leave request submitted',
      subtitle: 'Mike Chen - 5 days sick leave',
      time: '4 hours ago',
      type: 'info'
    },
    {
      icon: 'cancel',
      title: 'Leave request rejected',
      subtitle: 'Emily Davis - Insufficient balance',
      time: '6 hours ago',
      type: 'error'
    },
    {
      icon: 'event',
      title: 'Leave policy updated',
      subtitle: 'Annual leave policy changes',
      time: '1 day ago',
      type: 'warning'
    }
  ];

  constructor(
    private readonly requestService: RequestService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLeaveRequests();
    this.updateQuickActionCounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLeaveRequests(): void {
    this.isLoading = true;

    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 1000,
      type: RequestType.Leave,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    this.requestService.getRequestsByType(RequestType.Leave, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.leaveRequests = response.data.map(request => this.mapRequestToLeaveRequest(request));
          this.applyFilters();
          this.updateQuickActionCounts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading leave requests:', error);
          this.leaveRequests = [];
          this.filteredRequests = [];
          this.isLoading = false;
          this.showErrorMessage('Failed to load leave requests. Please try again.');
        }
      });
  }

  private mapRequestToLeaveRequest(request: RequestDto): LeaveRequest {
    return {
      id: request.id,
      initiatorName: request.initiatorName,
      title: request.title || 'Leave Request',
      description: request.description || '',
      type: request.type,
      status: this.getRequestStatusLabel(request.status),
      createdAt: new Date(request.createdAt),
      updatedAt: request.updatedAt ? new Date(request.updatedAt) : new Date(request.createdAt),
      currentStep: this.getCurrentStepName(request),
      comments: this.getLatestComments(request),
      hasWorkflowSteps: request.requestSteps && request.requestSteps.length > 0,
      priority: this.generateRandomPriority(),
      duration: this.generateRandomDuration()
    };
  }

  private generateRandomPriority(): 'Low' | 'Medium' | 'High' {
    const priorities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  private generateRandomDuration(): string {
    const days = Math.floor(Math.random() * 14) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  private getRequestStatusLabel(status: RequestStatus): 'Pending' | 'Approved' | 'Rejected' {
    switch (status) {
      case RequestStatus.Pending: return 'Pending';
      case RequestStatus.Approved: return 'Approved';
      case RequestStatus.Rejected: return 'Rejected';
      default: return 'Pending';
    }
  }

  private getCurrentStepName(request: RequestDto): string {
    if (!request.requestSteps || request.requestSteps.length === 0) {
      return 'No workflow';
    }
    
    const pendingStep = request.requestSteps.find(step => step.status === 1);
    if (pendingStep) {
      return pendingStep.workflowStepName;
    }
    
    const allCompleted = request.requestSteps.every(step => step.status === 2);
    if (allCompleted) {
      return 'Completed';
    }
    
    return 'In Progress';
  }

  private getLatestComments(request: RequestDto): string {
    const stepsWithComments = request.requestSteps?.filter(step => step.comments);
    return stepsWithComments?.length > 0 ? stepsWithComments[stepsWithComments.length - 1].comments || '' : '';
  }

  private updateQuickActionCounts(): void {
    this.quickActions[0].count = this.getPendingRequests();
  }

  applyFilters(): void {
    this.filteredRequests = this.leaveRequests.filter(request => {
      const matchesSearch = !this.searchTerm || 
        request.initiatorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || request.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || request.priority === this.selectedPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPendingRequests(): number {
    return this.leaveRequests.filter(req => req.status === 'Pending').length;
  }

  getApprovedRequests(): number {
    return this.leaveRequests.filter(req => req.status === 'Approved').length;
  }

  getRejectedRequests(): number {
    return this.leaveRequests.filter(req => req.status === 'Rejected').length;
  }

  getTotalRequests(): number {
    return this.leaveRequests.length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  viewRequest(request: LeaveRequest): void {
    this.requestService.getRequestById(request.id)
      .subscribe({
        next: (fullRequest) => {
          this.dialog.open(RequestDetailsDialogComponent, {
            width: '800px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            data: fullRequest,
            panelClass: 'request-details-dialog-panel'
          });
        },
        error: (error) => {
          console.error('Error loading request details:', error);
          this.showErrorMessage('Failed to load request details.');
        }
      });
  }

  viewWorkflowSteps(request: LeaveRequest): void {
    this.requestService.getRequestById(request.id)
      .subscribe({
        next: (fullRequest) => {
          this.dialog.open(WorkflowStepsDialogComponent, {
            width: '700px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            data: fullRequest,
            panelClass: 'workflow-steps-dialog-panel'
          });
        },
        error: (error) => {
          console.error('Error loading request details:', error);
          this.showErrorMessage('Failed to load workflow steps.');
        }
      });
  }

  approveRequest(request: LeaveRequest): void {
    this.requestService.getRequestById(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fullRequest) => {
          const pendingStep = fullRequest.requestSteps?.find(step => step.status === 1);
          
          if (pendingStep) {
            const approveData = { comments: 'Approved by HR' };

            this.requestService.approveStep(request.id, pendingStep.id, approveData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.showSuccessMessage(`Leave request for ${request.initiatorName} has been approved`);
                  this.loadLeaveRequests();
                },
                error: (error) => {
                  console.error('Error approving step:', error);
                  this.showErrorMessage('Failed to approve request. Please try again.');
                }
              });
          } else {
            this.showWarningMessage('No pending step found for this request');
          }
        },
        error: (error) => {
          console.error('Error getting request details:', error);
          this.showErrorMessage('Failed to process request.');
        }
      });
  }

  rejectRequest(request: LeaveRequest): void {
    this.requestService.getRequestById(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fullRequest) => {
          const pendingStep = fullRequest.requestSteps?.find(step => step.status === 1);
          
          if (pendingStep) {
            const rejectData = { comments: 'Rejected by HR' };

            this.requestService.rejectStep(request.id, pendingStep.id, rejectData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.showSuccessMessage(`Leave request for ${request.initiatorName} has been rejected`);
                  this.loadLeaveRequests();
                },
                error: (error) => {
                  console.error('Error rejecting step:', error);
                  this.showErrorMessage('Failed to reject request. Please try again.');
                }
              });
          } else {
            this.showWarningMessage('No pending step found for this request');
          }
        },
        error: (error) => {
          console.error('Error getting request details:', error);
          this.showErrorMessage('Failed to process request.');
        }
      });
  }

  // Quick Actions
  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  openLeaveCalendar(): void {
    this.showInfoMessage('Leave calendar feature coming soon!');
  }

  generateReports(): void {
    this.showInfoMessage('Report generation feature coming soon!');
  }

  managePolicies(): void {
    this.showInfoMessage('Policy management feature coming soon!');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.applyFilters();
  }

  exportToExcel(): void {
    this.showInfoMessage('Export functionality coming soon!');
  }

  bulkApprove(): void {
    const pendingRequests = this.filteredRequests.filter(req => req.status === 'Pending');
    if (pendingRequests.length === 0) {
      this.showWarningMessage('No pending requests to approve');
      return;
    }
    this.showInfoMessage('Bulk approval feature coming soon!');
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

  private showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}