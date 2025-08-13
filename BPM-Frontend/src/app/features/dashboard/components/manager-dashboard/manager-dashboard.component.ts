import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';

import { RequestService } from '../../../../core/services/request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReportingService } from '../../../../core/services/reporting.service';
import { RequestDto, RequestStatus, RequestType, PaginationParams } from '../../../../core/models';
import { ApproveRejectStepDto } from '../../../../core/models/request.models';

interface TeamMetrics {
  totalTeamMembers: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  averageApprovalTime: number;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  action: () => void;
  color: string;
  count?: number;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  pendingRequests: number;
  lastActivity: Date;
  avatar: string;
}

interface RecentActivity {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Loading states
  loadingMetrics = true;
  loadingRequests = true;

  // Data properties
  teamMetrics: TeamMetrics = {
    totalTeamMembers: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    averageApprovalTime: 0
  };

  pendingRequests: RequestDto[] = [];
  pendingColumns: string[] = ['employee', 'type', 'title', 'priority', 'actions'];

  quickActions: QuickAction[] = [
    {
      icon: 'pending_actions',
      title: 'Review Pending',
      description: 'Approve team requests',
      action: () => this.navigateToApprovals(),
      color: 'warn',
      count: 0
    },
    {
      icon: 'groups',
      title: 'Team Overview',
      description: 'View team performance',
      action: () => this.scrollToTeamSection(),
      color: 'primary'
    },
    {
      icon: 'analytics',
      title: 'Manager Reports',
      description: 'Generate team reports',
      action: () => this.generateTeamReport(),
      color: 'accent'
    },
    {
      icon: 'settings',
      title: 'Approval Settings',
      description: 'Configure approval rules',
      action: () => this.openApprovalSettings(),
      color: 'primary'
    }
  ];

  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Senior Developer',
      department: 'Engineering',
      pendingRequests: 2,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      avatar: 'SJ'
    },
    {
      id: '2',
      name: 'Mike Chen',
      position: 'UX Designer',
      department: 'Design',
      pendingRequests: 1,
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
      avatar: 'MC'
    },
    {
      id: '3',
      name: 'Emily Davis',
      position: 'Marketing Specialist',
      department: 'Marketing',
      pendingRequests: 0,
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      avatar: 'ED'
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
      title: 'New request received',
      subtitle: 'Mike Chen - Training approval',
      time: '4 hours ago',
      type: 'info'
    },
    {
      icon: 'cancel',
      title: 'Request rejected',
      subtitle: 'Expense claim - missing receipts',
      time: '6 hours ago',
      type: 'error'
    },
    {
      icon: 'trending_up',
      title: 'Team performance update',
      subtitle: 'Monthly approval rate: 95%',
      time: '1 day ago',
      type: 'success'
    }
  ];

  constructor(
    private readonly requestService: RequestService,
    private readonly authService: AuthService,
    private readonly reportingService: ReportingService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.updateQuickActionCounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loadPendingRequests();
    this.loadManagerMetrics();
  }

  private updateQuickActionCounts(): void {
    this.quickActions[0].count = this.teamMetrics.pendingApprovals;
  }

  loadPendingRequests(): void {
    this.loadingRequests = true;

    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    this.requestService.getRequests(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading requests:', error);
        return of(this.getMockRequestsResponse());
      })
    ).subscribe({
      next: (response) => {
        const currentUser = this.authService.getCurrentUser();
        const currentUserId = currentUser?.Id || currentUser?.id;

        this.pendingRequests = response.data.filter(request =>
          request.status === RequestStatus.Pending &&
          request.initiatorId !== currentUserId
        );

        this.updateQuickActionCounts();
        this.loadingRequests = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.loadingRequests = false;
        this.showErrorMessage('Failed to load requests');
      }
    });
  }

  loadManagerMetrics(): void {
    this.loadingMetrics = true;

    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 100,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    this.requestService.getRequests(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading requests for metrics:', error);
        this.setMockMetrics();
        return of({ data: [], totalCount: 0, pageNumber: 1, pageSize: 100, totalPages: 1, hasPreviousPage: false, hasNextPage: false });
      })
    ).subscribe({
      next: (response) => {
        this.calculateMetricsFromRequests(response.data);
        this.loadingMetrics = false;
      },
      error: (error) => {
        console.error('Error loading requests for metrics:', error);
        this.setMockMetrics();
      }
    });
  }

  private getMockRequestsResponse() {
    return {
      data: [
        {
          id: '1',
          type: RequestType.Leave,
          initiatorId: 'user1',
          initiatorName: 'Sarah Johnson',
          status: RequestStatus.Pending,
          title: 'Annual Leave - Christmas Holiday',
          description: 'Vacation leave for Christmas holidays',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          requestSteps: [{
            id: 'step1',
            status: 1,
            workflowStepName: 'Manager Approval',
            requestId: '1',
            workflowStepId: 'ws1',
            responsibleRole: 'Manager',
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
          }]
        },
        {
          id: '2',
          type: RequestType.Training,
          initiatorId: 'user2',
          initiatorName: 'Mike Chen',
          status: RequestStatus.Pending,
          title: 'Angular Advanced Training',
          description: 'Professional development training',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          requestSteps: [{
            id: 'step2',
            status: 1,
            workflowStepName: 'Manager Approval',
            requestId: '2',
            workflowStepId: 'ws2',
            responsibleRole: 'Manager',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }]
        },
        {
          id: '3',
          type: RequestType.Expense,
          initiatorId: 'user3',
          initiatorName: 'Emily Davis',
          status: RequestStatus.Pending,
          title: 'Client Meeting Expenses',
          description: 'Business meal with client',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          requestSteps: [{
            id: 'step3',
            status: 1,
            workflowStepName: 'Manager Approval',
            requestId: '3',
            workflowStepId: 'ws3',
            responsibleRole: 'Manager',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }]
        }
      ],
      totalCount: 3,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
  }

  private calculateMetricsFromRequests(requests: RequestDto[]): void {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthRequests = requests.filter(request =>
      new Date(request.createdAt) >= thisMonth
    );

    const pendingRequests = requests.filter(r => r.status === RequestStatus.Pending);
    const approvedThisMonth = thisMonthRequests.filter(r => r.status === RequestStatus.Approved);
    const rejectedThisMonth = thisMonthRequests.filter(r => r.status === RequestStatus.Rejected);

    const completedRequests = requests.filter(r =>
      r.status === RequestStatus.Approved || r.status === RequestStatus.Rejected
    );

    let averageTime = 0;
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, request) => {
        const created = new Date(request.createdAt);
        const updated = request.updatedAt ? new Date(request.updatedAt) : new Date();
        const diffHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + diffHours;
      }, 0);
      averageTime = totalTime / completedRequests.length;
    }

    this.teamMetrics = {
      totalTeamMembers: 8,
      pendingApprovals: pendingRequests.length,
      approvedThisMonth: approvedThisMonth.length,
      rejectedThisMonth: rejectedThisMonth.length,
      averageApprovalTime: Math.round(averageTime * 10) / 10
    };

    this.updateQuickActionCounts();
  }

  private setMockMetrics(): void {
    this.teamMetrics = {
      totalTeamMembers: 8,
      pendingApprovals: 5,
      approvedThisMonth: 23,
      rejectedThisMonth: 3,
      averageApprovalTime: 4.2
    };
    this.loadingMetrics = false;
    this.updateQuickActionCounts();
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

  getRequestTypeClass(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'type-leave';
      case RequestType.Expense: return 'type-expense';
      case RequestType.Training: return 'type-training';
      case RequestType.ITSupport: return 'type-it';
      case RequestType.ProfileUpdate: return 'type-profile';
      default: return '';
    }
  }

  getPriorityLabel(request: RequestDto): string {
    const daysSinceCreated = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 3) return 'High';
    if (daysSinceCreated > 1) return 'Medium';
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

  quickApprove(request: RequestDto): void {
    if (!request.requestSteps || request.requestSteps.length === 0) {
      this.showWarningMessage('No workflow steps found for this request');
      return;
    }

    const currentStep = request.requestSteps.find(step => step.status === 1);
    if (!currentStep) {
      this.showWarningMessage('No pending step found for approval');
      return;
    }

    const approvalData: ApproveRejectStepDto = {
      comments: 'Quick approval from manager dashboard'
    };

    this.requestService.approveStep(request.id, currentStep.id, approvalData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccessMessage(`Request from ${request.initiatorName} has been approved`);
        this.loadPendingRequests();
        this.loadManagerMetrics();
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.showErrorMessage('Failed to approve request. Please try again.');
      }
    });
  }

  quickReject(request: RequestDto): void {
    if (!request.requestSteps || request.requestSteps.length === 0) {
      this.showWarningMessage('No workflow steps found for this request');
      return;
    }

    const currentStep = request.requestSteps.find(step => step.status === 1);
    if (!currentStep) {
      this.showWarningMessage('No pending step found for rejection');
      return;
    }

    const rejectionData: ApproveRejectStepDto = {
      comments: 'Quick rejection from manager dashboard'
    };

    this.requestService.rejectStep(request.id, currentStep.id, rejectionData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccessMessage(`Request from ${request.initiatorName} has been rejected`);
        this.loadPendingRequests();
        this.loadManagerMetrics();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.showErrorMessage('Failed to reject request. Please try again.');
      }
    });
  }

  getApprovalPercentage(): number {
    const total = this.teamMetrics.approvedThisMonth + this.teamMetrics.rejectedThisMonth;
    if (total === 0) return 0;
    return (this.teamMetrics.approvedThisMonth / total) * 100;
  }

  getRejectionPercentage(): number {
    const total = this.teamMetrics.approvedThisMonth + this.teamMetrics.rejectedThisMonth;
    if (total === 0) return 0;
    return (this.teamMetrics.rejectedThisMonth / total) * 100;
  }

  getEfficiencyScore(): number {
    return Math.round(this.getApprovalPercentage());
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  // Quick Actions
  navigateToApprovals(): void {
    // Navigate to approvals page
    console.log('Navigate to approvals');
  }

  scrollToTeamSection(): void {
    // Scroll to team section
    document.querySelector('.team-overview-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  generateTeamReport(): void {
    this.showInfoMessage('Team report generation feature coming soon!');
  }

  openApprovalSettings(): void {
    this.showInfoMessage('Approval settings feature coming soon!');
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