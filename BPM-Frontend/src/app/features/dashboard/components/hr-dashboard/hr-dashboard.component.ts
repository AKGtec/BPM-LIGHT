import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RequestService } from '../../../../core/services/request.service';
import { UserService } from '../../../../core/services/user.service';
import { LeaveService } from '../../../../core/services/leave.service';
import { RequestDto, RequestStatus, RequestType, PaginationParams } from '../../../../core/models';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

interface HRMetrics {
  totalEmployees: number;
  activeRequests: number;
  processedThisMonth: number;
  averageProcessingTime: number;
  leaveRequests: number;
  expenseReports: number;
  trainingRequests: number;
  pendingApprovals: number;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
  count?: number;
}

interface ActivityItem {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressBarModule,
    MatRippleModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule
],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HRDashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  hrMetrics: HRMetrics = {
    totalEmployees: 45,
    activeRequests: 12,
    processedThisMonth: 67,
    averageProcessingTime: 6.5,
    leaveRequests: 8,
    expenseReports: 15,
    trainingRequests: 4,
    pendingApprovals: 6
  };

  pendingHRRequests: RequestDto[] = [];
  hrColumns: string[] = ['employee', 'type', 'title', 'currentStep', 'actions'];

  departments = [
    { name: 'Engineering', count: 18, percentage: 40, color: '#667eea' },
    { name: 'Sales', count: 12, percentage: 27, color: '#f093fb' },
    { name: 'Marketing', count: 8, percentage: 18, color: '#4facfe' },
    { name: 'HR', count: 4, percentage: 9, color: '#43e97b' },
    { name: 'Finance', count: 3, percentage: 6, color: '#f59e0b' }
  ];

  recentHires: { name: string; department: string; startDate: Date; avatar: string }[] = [];

  quickActions: QuickAction[] = [
    {
      icon: 'assignment',
      title: 'Review Requests',
      description: 'Process pending requests',
      route: '/requests',
      color: 'primary',
      count: 12
    },
    {
      icon: 'people',
      title: 'Manage Employees',
      description: 'View employee directory',
      route: '/team',
      color: 'accent',
      count: 45
    },
    {
      icon: 'analytics',
      title: 'HR Reports',
      description: 'Generate analytics',
      route: '/reports',
      color: 'warn'
    },
    {
      icon: 'event',
      title: 'Leave Calendar',
      description: 'View leave schedule',
      route: '/leave-calendar',
      color: 'primary'
    }
  ];

  recentActivities: ActivityItem[] = [
    {
      icon: 'check_circle',
      title: 'Leave request approved',
      subtitle: 'Sarah Johnson - 3 days vacation',
      time: '2 hours ago',
      type: 'success'
    },
    {
      icon: 'person_add',
      title: 'New employee onboarded',
      subtitle: 'Mike Chen - Engineering',
      time: '4 hours ago',
      type: 'info'
    },
    {
      icon: 'schedule',
      title: 'Pending expense review',
      subtitle: 'Conference expenses - $1,200',
      time: '6 hours ago',
      type: 'warning'
    },
    {
      icon: 'assignment_turned_in',
      title: 'Training completed',
      subtitle: 'Security training - 15 employees',
      time: '1 day ago',
      type: 'success'
    }
  ];

  dailyProcessed = 5;
  efficiencyScore = 92;
  isLoading = false;

  constructor(
    private readonly requestService: RequestService,
    private readonly userService: UserService,
    private readonly leaveService: LeaveService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.generateMockRecentHires();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.loadPendingHRRequests();
    this.loadHRMetrics();
    // this.loadUserStats();
    this.loadRecentHires();
  }

  loadPendingHRRequests(): void {
    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 10,
      status: RequestStatus.Pending
    };

    this.requestService.getPendingApprovals(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pendingHRRequests = response.data.filter(request =>
            request.requestSteps?.some(step =>
              step.responsibleRole === 'HR' && step.status === 1
            )
          );
          this.hrMetrics.pendingApprovals = this.pendingHRRequests.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading pending HR requests:', error);
          this.pendingHRRequests = [];
          this.isLoading = false;
        }
      });
  }

  loadHRMetrics(): void {
    this.requestService.getRequests({ pageNumber: 1, pageSize: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const requests = response.data;
          this.hrMetrics.activeRequests = requests.filter(r => r.status === RequestStatus.Pending).length;
          this.hrMetrics.processedThisMonth = requests.filter(r => {
            const createdDate = new Date(r.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() &&
                   createdDate.getFullYear() === now.getFullYear() &&
                   r.status !== RequestStatus.Pending;
          }).length;

          this.hrMetrics.leaveRequests = requests.filter(r => r.type === RequestType.Leave).length;
          this.hrMetrics.expenseReports = requests.filter(r => r.type === RequestType.Expense).length;
          this.hrMetrics.trainingRequests = requests.filter(r => r.type === RequestType.Training).length;
        },
        error: (error) => {
          console.error('Error loading HR metrics:', error);
        }
      });
  }

  // loadUserStats(): void {
  //   this.userService.getUserStats()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (stats) => {
  //         this.hrMetrics.totalEmployees = stats.totalUsers;

  //         if (stats.usersByDepartment) {
  //           this.departments = Object.entries(stats.usersByDepartment).map(([name, count], index) => ({
  //             name,
  //             count: Number(count),
  //             percentage: Math.round((Number(count) / stats.totalUsers) * 100),
  //             color: this.departments[index]?.color || '#667eea'
  //           }));
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error loading user stats:', error);
  //       }
  //     });
  // }

  loadRecentHires(): void {
    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    this.userService.getUsers(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.recentHires = users
            .slice(0, 5)
            .map((user, index) => ({
              name: `${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`.trim() || user.userName || user.UserName || 'Unknown',
              department: this.departments[index % this.departments.length].name,
              startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              avatar: this.generateAvatar(user.firstName || user.FirstName || '', user.lastName || user.LastName || '')
            }));
        },
        error: (error) => {
          console.error('Error loading recent hires:', error);
          this.generateMockRecentHires();
        }
      });
  }

  private generateMockRecentHires(): void {
    this.recentHires = [
      {
        name: 'Sarah Johnson',
        department: 'Marketing',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        avatar: 'SJ'
      },
      {
        name: 'Mike Chen',
        department: 'Engineering',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        avatar: 'MC'
      },
      {
        name: 'Emily Davis',
        department: 'Sales',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        avatar: 'ED'
      }
    ];
  }

  private generateAvatar(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  getCurrentStepName(request: RequestDto): string {
    const currentStep = request.requestSteps?.find(step => step.status === 1);
    return currentStep?.workflowStepName || 'Unknown';
  }

  processRequest(request: RequestDto): void {
    console.log('Process request:', request.id);
    // Navigate to processing page or open dialog
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'error': return 'error';
      default: return 'notifications';
    }
  }

  navigateToQuickAction(action: QuickAction): void {
    // Navigate to the specified route
    console.log('Navigate to:', action.route);
  }

  viewAllActivity(): void {
    // Navigate to full activity log
    console.log('View all activity');
  }

  generateReport(): void {
    // Generate HR report
    console.log('Generate report');
  }

  getDepartmentInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}