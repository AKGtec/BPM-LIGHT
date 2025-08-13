import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { NotificationService } from '../../core/services/notification.service';
import { NotificationDto, NotificationType } from '../../core/models/notification.models';
import { PaginatedResponse } from '../../core/models';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="notifications-page">
      <mat-card class="notifications-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications</mat-icon>
            Notifications
          </mat-card-title>
          <mat-card-subtitle>
            Manage your notifications and stay updated
          </mat-card-subtitle>
          <div class="header-actions">
            <button mat-button (click)="refreshAll()" [disabled]="isLoading">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="markAllAsRead()" 
              [disabled]="isLoading || unreadCount === 0">
              <mat-icon>done_all</mat-icon>
              Mark All Read ({{unreadCount}})
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedTabChange)="onTabChange($event)">
            <!-- All Notifications Tab -->
            <mat-tab label="All Notifications">
              <ng-template matTabContent>
                <div class="tab-content">
                  <div *ngIf="isLoading" class="loading-container">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Loading notifications...</p>
                  </div>

                  <div *ngIf="!isLoading && allNotifications.length === 0" class="no-notifications">
                    <mat-icon>notifications_none</mat-icon>
                    <p>No notifications found</p>
                    <button mat-button (click)="loadAllNotifications()">
                      <mat-icon>refresh</mat-icon>
                      Refresh
                    </button>
                  </div>

                  <mat-list *ngIf="!isLoading && allNotifications.length > 0" class="notification-list">
                    <mat-list-item 
                      *ngFor="let notification of allNotifications; trackBy: trackByNotificationId"
                      [class.unread]="!notification.isRead"
                      class="notification-item">
                      
                      <mat-icon matListItemIcon [color]="getNotificationColor(notification.type)">
                        {{getNotificationIcon(notification.type)}}
                      </mat-icon>
                      
                      <div matListItemTitle>{{notification.title}}</div>
                      <div matListItemLine>{{notification.message}}</div>
                      <div matListItemLine class="notification-meta">
                        <span class="timestamp">{{notification.createdAt | date:'medium'}}</span>
                        <mat-chip [class]="getNotificationTypeClass(notification.type)">
                          {{getNotificationTypeLabel(notification.type)}}
                        </mat-chip>
                      </div>

                      <div class="notification-actions">
                        <button 
                          mat-icon-button 
                          *ngIf="!notification.isRead" 
                          (click)="markAsRead(notification)"
                          matTooltip="Mark as read">
                          <mat-icon>done</mat-icon>
                        </button>
                        <button 
                          mat-icon-button 
                          (click)="deleteNotification(notification)"
                          matTooltip="Delete notification">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </div>
              </ng-template>
            </mat-tab>

            <!-- Unread Notifications Tab -->
            <mat-tab [label]="'Unread (' + unreadCount + ')'">
              <ng-template matTabContent>
                <div class="tab-content">
                  <div *ngIf="isLoading" class="loading-container">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Loading unread notifications...</p>
                  </div>

                  <div *ngIf="!isLoading && unreadNotifications.length === 0" class="no-notifications">
                    <mat-icon>mark_email_read</mat-icon>
                    <p>No unread notifications</p>
                    <button mat-button (click)="loadUnreadNotifications()">
                      <mat-icon>refresh</mat-icon>
                      Refresh
                    </button>
                  </div>

                  <mat-list *ngIf="!isLoading && unreadNotifications.length > 0" class="notification-list">
                    <mat-list-item 
                      *ngFor="let notification of unreadNotifications; trackBy: trackByNotificationId"
                      class="notification-item unread">
                      
                      <mat-icon matListItemIcon [color]="getNotificationColor(notification.type)">
                        {{getNotificationIcon(notification.type)}}
                      </mat-icon>
                      
                      <div matListItemTitle>{{notification.title}}</div>
                      <div matListItemLine>{{notification.message}}</div>
                      <div matListItemLine class="notification-meta">
                        <span class="timestamp">{{notification.createdAt | date:'medium'}}</span>
                        <mat-chip [class]="getNotificationTypeClass(notification.type)">
                          {{getNotificationTypeLabel(notification.type)}}
                        </mat-chip>
                      </div>

                      <div class="notification-actions">
                        <button 
                          mat-icon-button 
                          (click)="markAsRead(notification)"
                          matTooltip="Mark as read">
                          <mat-icon>done</mat-icon>
                        </button>
                        <button 
                          mat-icon-button 
                          (click)="deleteNotification(notification)"
                          matTooltip="Delete notification">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>

        <mat-card-actions *ngIf="allNotifications.length > 0">
          <button 
            mat-stroked-button 
            color="warn" 
            (click)="clearAllNotifications()"
            [disabled]="isLoading">
            <mat-icon>clear_all</mat-icon>
            Clear All Notifications
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .notifications-page {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .notifications-card {
      min-height: 600px;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      .mat-mdc-card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }
    }

    .tab-content {
      min-height: 400px;
      padding: 1rem 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #666;

      mat-spinner {
        margin-bottom: 1rem;
      }
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #666;

      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }
    }

    .notification-list {
      .notification-item {
        border-bottom: 1px solid #f0f0f0;
        padding: 1rem 0;
        position: relative;

        &.unread {
          background-color: #f8f9ff;
          border-left: 4px solid #2196f3;
          padding-left: calc(1rem - 4px);

          &::before {
            content: '';
            position: absolute;
            left: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background-color: #2196f3;
            border-radius: 50%;
          }
        }

        .notification-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #666;

          .timestamp {
            color: #999;
          }
        }

        .notification-actions {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        &:hover .notification-actions {
          opacity: 1;
        }
      }
    }

    .notification-type-info { background-color: #e3f2fd; color: #1976d2; }
    .notification-type-success { background-color: #e8f5e8; color: #2e7d32; }
    .notification-type-warning { background-color: #fff3e0; color: #ef6c00; }
    .notification-type-error { background-color: #ffebee; color: #c62828; }
    .notification-type-request { background-color: #f3e5f5; color: #7b1fa2; }
    .notification-type-workflow { background-color: #e0f2f1; color: #00695c; }

    mat-card-actions {
      display: flex;
      justify-content: center;
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .notifications-page {
        padding: 0.5rem;
      }

      mat-card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }

      .notification-list .notification-item {
        .notification-actions {
          position: static;
          transform: none;
          opacity: 1;
          margin-top: 0.5rem;
          justify-content: flex-end;
        }

        .notification-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
      }
    }
  `]
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  allNotifications: NotificationDto[] = [];
  unreadNotifications: NotificationDto[] = [];
  unreadCount = 0;
  isLoading = false;
  selectedTabIndex = 0;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    forkJoin({
      allNotifications: this.notificationService.getMyNotifications(),
      unreadCount: this.notificationService.getUnreadCount()
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.allNotifications = data.allNotifications;
        this.unreadNotifications = data.allNotifications.filter(n => !n.isRead);
        this.unreadCount = data.unreadCount.count;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.handleError('Failed to load notifications');
        this.isLoading = false;
      }
    });
  }

  private subscribeToRealTimeUpdates(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.allNotifications = notifications;
        this.unreadNotifications = notifications.filter(n => !n.isRead);
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  loadAllNotifications(): void {
    this.isLoading = true;
    this.notificationService.getMyNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.allNotifications = notifications;
          this.unreadNotifications = notifications.filter(n => !n.isRead);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading all notifications:', error);
          this.handleError('Failed to load notifications');
          this.isLoading = false;
        }
      });
  }

  loadUnreadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getUnreadNotifications({ pageNumber: 1, pageSize: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.unreadNotifications = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading unread notifications:', error);
          this.handleError('Failed to load unread notifications');
          this.isLoading = false;
        }
      });
  }

  refreshAll(): void {
    if (this.selectedTabIndex === 0) {
      this.loadAllNotifications();
    } else {
      this.loadUnreadNotifications();
    }
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    if (event.index === 1 && this.unreadNotifications.length === 0) {
      this.loadUnreadNotifications();
    }
  }

  markAsRead(notification: NotificationDto): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notification.id);
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.showSuccess('Notification marked as read');
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
          this.handleError('Failed to mark notification as read');
        }
      });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allNotifications.forEach(n => n.isRead = true);
          this.unreadNotifications = [];
          this.unreadCount = 0;
          this.showSuccess('All notifications marked as read');
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
          this.handleError('Failed to mark all notifications as read');
        }
      });
  }

  deleteNotification(notification: NotificationDto): void {
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allNotifications = this.allNotifications.filter(n => n.id !== notification.id);
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.showSuccess('Notification deleted');
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
          this.handleError('Failed to delete notification');
        }
      });
  }

  clearAllNotifications(): void {
    this.notificationService.clearAllNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allNotifications = [];
          this.unreadNotifications = [];
          this.unreadCount = 0;
          this.showSuccess('All notifications cleared');
        },
        error: (error) => {
          console.error('Error clearing all notifications:', error);
          this.handleError('Failed to clear all notifications');
        }
      });
  }

  trackByNotificationId(index: number, notification: NotificationDto): string {
    return notification.id;
  }

  getNotificationIcon(type: NotificationType): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success: return 'primary';
      case NotificationType.Warning: return 'accent';
      case NotificationType.Error: return 'warn';
      default: return '';
    }
  }

  getNotificationTypeLabel(type: NotificationType): string {
    switch (type) {
      case NotificationType.Info: return 'Info';
      case NotificationType.Success: return 'Success';
      case NotificationType.Warning: return 'Warning';
      case NotificationType.Error: return 'Error';
      case NotificationType.RequestUpdate: return 'Request Update';
      case NotificationType.WorkflowUpdate: return 'Workflow Update';
      default: return 'Notification';
    }
  }

  getNotificationTypeClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.Info: return 'notification-type-info';
      case NotificationType.Success: return 'notification-type-success';
      case NotificationType.Warning: return 'notification-type-warning';
      case NotificationType.Error: return 'notification-type-error';
      case NotificationType.RequestUpdate: return 'notification-type-request';
      case NotificationType.WorkflowUpdate: return 'notification-type-workflow';
      default: return 'notification-type-info';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private handleError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}