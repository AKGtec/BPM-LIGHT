import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, RequestService, NotificationService } from '../../../../core/services';
import { UserDto, RequestSummary, NotificationSummary } from '../../../../core/models';
import { StatsCardComponent } from '../stats-card/stats-card.component';
import { RecentRequestsComponent } from '../recent-requests/recent-requests.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsCardComponent, RecentRequestsComponent, QuickActionsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: UserDto | null = null;
  requestSummary: RequestSummary | null = null;
  notificationSummary: NotificationSummary | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private requestService: RequestService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Load request summary
    this.requestService.getRequestSummary().subscribe({
      next: (summary) => {
        this.requestSummary = summary;
      },
      error: (error) => {
        console.error('Error loading request summary:', error);
      }
    });

    // Load notification summary
    this.notificationService.getNotificationSummary().subscribe({
      next: (summary) => {
        this.notificationSummary = summary;
      },
      error: (error) => {
        console.error('Error loading notification summary:', error);
      }
    });

    this.isLoading = false;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getUserDisplayName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return this.currentUser?.userName || 'User';
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }
}
