import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto, NotificationType } from '../../../core/models/notification.models';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
})
export class NotificationListComponent implements OnInit {
  notifications: NotificationDto[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    
    // Subscribe to real-time updates
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  private loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        // Fallback to paginated endpoint
        this.notificationService.getNotifications({ pageNumber: 1, pageSize: 50 }).subscribe({
          next: (response) => {
            this.notifications = response.data;
          },
          error: (fallbackError) => {
            console.error('Error loading notifications from fallback:', fallbackError);
          }
        });
      }
    });
  }

  markAsRead(notification: NotificationDto): void {
    if (notification.isRead) return;
    
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      }
    });
  }

  clearAllNotifications(): void {
    this.notificationService.clearAllNotifications().subscribe({
      next: () => {
        this.notifications = [];
      },
      error: (error) => {
        console.error('Error clearing all notifications:', error);
      }
    });
  }

  deleteNotification(notification: NotificationDto): void {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  refreshNotifications(): void {
    this.loadNotifications();
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
      case NotificationType.Info:
      case NotificationType.RequestUpdate:
      case NotificationType.WorkflowUpdate:
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
}