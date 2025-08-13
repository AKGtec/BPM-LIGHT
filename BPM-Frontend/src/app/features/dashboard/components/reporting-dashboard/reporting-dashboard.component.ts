import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Charts
import { Chart } from 'chart.js/auto';

// Services (existing endpoints only)
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { WorkflowService } from '../../../../core/services/workflow.service';
import { RequestService } from '../../../../core/services/request.service';
import { RequestSummary, RequestDto, PaginationParams } from '../../../../core/models';

interface ActivityItem {
  type: 'user' | 'workflow' | 'request' | 'approval';
  action: string;
  user: string;
  time: string; // e.g. "2h ago"
}

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './reporting-dashboard.component.html',
  styleUrls: ['./reporting-dashboard.component.scss']
})
export class ReportingDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>();

  isLoading = false;
  currentUser: any = null;

  // Optional period UI (not used in backend calls but kept for UX)
  period: 'daily' | 'weekly' | 'monthly' = 'monthly';

  // Aggregated stats for KPI cards
  systemStats = {
    totalUsers: 0,
    activeWorkflows: 0,
    totalRequests: 0,
    pendingApprovals: 0
  };

  // Data caches
  requestSummary: RequestSummary | null = null;
  totalWorkflows = 0;
  totalUsers = 0;
  activeUsers = 0;

  // Derived metrics
  get approvalRate(): number {
    const total = this.requestSummary?.totalRequests || 0;
    const approved = this.requestSummary?.approvedRequests || 0;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  }

  // Recent activity (from latest requests)
  recentActivities: ActivityItem[] = [];

  // Charts instances
  private typeChart: Chart | null = null;
  private statusChart: Chart | null = null;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly workflowService: WorkflowService,
    private readonly requestService: RequestService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Initial load
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Charts are drawn when data arrives
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Destroy charts to avoid memory leaks
    this.typeChart?.destroy();
    this.statusChart?.destroy();
  }

  // Navigation shortcut
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Period selector (visual only)
  setPeriod(period: 'daily' | 'weekly' | 'monthly'): void {
    this.period = period;
  }

  // Main loader using existing endpoints only
  private loadDashboard(): void {
    this.isLoading = true;

    const summary$ = this.requestService.getRequestSummary();
    const activeWorkflows$ = this.workflowService.getActiveWorkflows();
    const workflowsPage$ = this.workflowService.getWorkflows({ pageNumber: 1, pageSize: 1 } as PaginationParams);
    const users$ = this.userService.getUsers();
    const recentRequests$ = this.requestService.getRequests({
      pageNumber: 1,
      pageSize: 6,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    } as PaginationParams);

    forkJoin({ 
      summary: summary$, 
      activeWorkflows: activeWorkflows$, 
      workflowsPage: workflowsPage$, 
      users: users$,
      recent: recentRequests$ 
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ summary, activeWorkflows, workflowsPage, users, recent }) => {
          this.requestSummary = summary;
          this.totalWorkflows = workflowsPage?.totalCount || 0;
          this.totalUsers = users?.length || 0;
          
          // Estimate active users as a percentage of total users (you can adjust this logic)
          this.activeUsers = Math.floor(this.totalUsers * 0.3); // Assuming 30% are active

          // Map to KPI cards
          this.systemStats = {
            totalUsers: this.totalUsers,
            activeWorkflows: activeWorkflows?.length || 0,
            totalRequests: summary.totalRequests,
            pendingApprovals: summary.pendingRequests
          };

          // Recent activity from latest requests
          const latestRequests: RequestDto[] = recent?.data || [];
          this.recentActivities = latestRequests.map(r => ({
            type: 'request',
            action: `${r.title || 'Request'} • Status ${r.status}`,
            user: r.initiatorName,
            time: this.formatTimeAgo(r.createdAt.toString())
          }));

          // Draw/Update charts
          setTimeout(() => {
            const typeData = this.mapTypeData(summary.requestsByType);
            this.drawTypeChart(typeData.labels, typeData.values);

            const statusData = this.mapStatusData(summary.requestsByStatus);
            this.drawStatusChart(statusData.labels, statusData.values);
          });
        },
        error: (error) => {
          console.error('Dashboard loading error:', error);
          // Graceful fallback if API fails
          this.systemStats = { totalUsers: 0, activeWorkflows: 0, totalRequests: 0, pendingApprovals: 0 };
          this.recentActivities = [];
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  // Helper to format time ago
  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }

  // Mapping helpers
  private mapTypeData(map: RequestSummary['requestsByType']) {
    const labels = ['Leave', 'Expense', 'Training', 'IT Support', 'Profile Update'];
    const values = [map.leave, map.expense, map.training, map.itSupport, map.profileUpdate];
    return { labels, values };
  }

  private mapStatusData(map: RequestSummary['requestsByStatus']) {
    const labels = ['Pending', 'Approved', 'Rejected', 'Archived'];
    const values = [map.pending, map.approved, map.rejected, map.archived];
    return { labels, values };
  }

  private drawTypeChart(labels: string[], data: number[]): void {
    const canvas = document.getElementById('requestsByTypeChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    // Destroy previous instance
    this.typeChart?.destroy();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

    this.typeChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Requests by Type',
            data,
            backgroundColor: gradient,
            borderColor: '#3b82f6',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.2)' } }
        }
      }
    });
  }

  private drawStatusChart(labels: string[], data: number[]): void {
    const canvas = document.getElementById('workflowStatusChart') as HTMLCanvasElement | null;
    if (!canvas) return;

    // Destroy previous instance
    this.statusChart?.destroy();

    this.statusChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#94a3b8'],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '60%'
      }
    });
  }

  // Activity helpers for template
  getActivityIcon(type: ActivityItem['type']): string {
    switch (type) {
      case 'user': return 'manage_accounts';
      case 'workflow': return 'account_tree';
      case 'approval': return 'thumb_up';
      default: return 'trending_up';
    }
  }

  getActivityColor(type: ActivityItem['type']): 'primary' | 'accent' | 'warn' | undefined {
    switch (type) {
      case 'user': return 'primary';
      case 'workflow': return 'accent';
      case 'approval': return 'primary';
      default: return undefined;
    }
  }

  // Export actions – use existing user export only
  exportUsersExcel(): void {
    this.userService.exportUsers('excel')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'users.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Export failed:', error);
        }
      });
  }
}