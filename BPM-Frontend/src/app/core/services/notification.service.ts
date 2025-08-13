import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  NotificationDto,
  CreateNotificationDto,
  NotificationSummary,
  PaginatedResponse,
  PaginationParams,
  NotificationType
} from '../models';
import { environment } from '../../../environments/environment';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  requestSubmissions: boolean;
  requestApprovals: boolean;
  requestRejections: boolean;
  workflowUpdates: boolean;
  systemAlerts: boolean;
  reminderNotifications: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/api/Notification`;
  private readonly notificationsSubject = new BehaviorSubject<NotificationDto[]>([]);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);

  public readonly notifications$ = this.notificationsSubject.asObservable();
  public readonly unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingInterval = 30000; // 30 seconds
  private isPolling = false;

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar
  ) {
    this.startPolling();
  }

  getNotifications(params?: PaginationParams): Observable<PaginatedResponse<NotificationDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<NotificationDto>>(this.API_URL, { params: httpParams });
  }

  getUnreadNotifications(params?: PaginationParams): Observable<PaginatedResponse<NotificationDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<NotificationDto>>(`${this.API_URL}/unread`, { params: httpParams });
  }

  getNotificationById(id: string): Observable<NotificationDto> {
    return this.http.get<NotificationDto>(`${this.API_URL}/${id}`);
  }

  createNotification(notification: CreateNotificationDto): Observable<NotificationDto> {
    return this.http.post<NotificationDto>(this.API_URL, notification);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/mark-read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/mark-all-read`, {});
  }

  clearAllNotifications(): Observable<void> {
    // This endpoint doesn't exist in your API, so we'll implement it as delete all
    // You might want to add this endpoint to your backend or modify this method
    return this.http.delete<void>(`${this.API_URL}/clear-all`);
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getNotificationSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.API_URL}/summary`);
  }

  // Get my notifications
  getMyNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.API_URL}/my-notifications`);
  }

  // Get unread count
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/unread-count`);
  }

  // Update notification
  updateNotification(id: string, notification: Partial<NotificationDto>): Observable<NotificationDto> {
    return this.http.put<NotificationDto>(`${this.API_URL}/${id}`, notification);
  }

  // Real-time notifications
  startPolling(): void {
    if (this.isPolling) return;

    this.isPolling = true;
    this.loadNotifications();

    interval(this.pollingInterval).subscribe(() => {
      if (this.isPolling) {
        this.loadNotifications();
      }
    });
  }

  stopPolling(): void {
    this.isPolling = false;
  }

  // Check if polling is active
  isPollingActive(): boolean {
    return this.isPolling;
  }

  private loadNotifications(): void {
    // Load recent notifications for the UI
    this.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unreadCount);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        // Fallback to unread count endpoint
        this.getUnreadCount().subscribe({
          next: (countResponse) => {
            this.unreadCountSubject.next(countResponse.count);
          },
          error: (countError) => {
            console.error('Error loading unread count:', countError);
            // Set to 0 if both fail
            this.unreadCountSubject.next(0);
          }
        });
      }
    });
  }

  // Force refresh notifications
  refreshNotifications(): void {
    this.loadNotifications();
  }

  // Get notifications with error handling
  getNotificationsWithFallback(): Observable<NotificationDto[]> {
    return new Observable(observer => {
      this.getMyNotifications().subscribe({
        next: (notifications) => {
          observer.next(notifications);
          observer.complete();
        },
        error: (error) => {
          console.error('Error with my-notifications endpoint, trying paginated endpoint:', error);
          // Fallback to paginated endpoint
          this.getNotifications({ pageNumber: 1, pageSize: 50 }).subscribe({
            next: (response) => {
              observer.next(response.data);
              observer.complete();
            },
            error: (fallbackError) => {
              console.error('Both notification endpoints failed:', fallbackError);
              observer.error(fallbackError);
            }
          });
        }
      });
    });
  }

  // Notification preferences
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.API_URL}/preferences`);
  }

  updateNotificationPreferences(preferences: NotificationPreferences): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/preferences`, preferences);
  }

  // Local notification display
  showSnackBarNotification(notification: NotificationDto): void {
    const config = {
      duration: this.getSnackBarDuration(notification.type),
      panelClass: [`snackbar-${notification.type.toString().toLowerCase()}`],
      action: 'Dismiss'
    };

    this.snackBar.open(
      `${notification.title}: ${notification.message}`,
      config.action,
      config
    );
  }

  private getSnackBarDuration(type: NotificationType): number {
    switch (type) {
      case NotificationType.Error: return 8000;
      case NotificationType.Warning: return 5000;
      case NotificationType.Success:
      case NotificationType.Info:
      default: return 3000;
    }
  }

  // Browser push notifications
  requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return Promise.resolve('denied');
    }

    return Notification.requestPermission();
  }

  showBrowserNotification(notification: NotificationDto): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/assets/icons/notification-icon.png',
      badge: '/assets/icons/badge-icon.png',
      tag: notification.id,
      requireInteraction: notification.type === NotificationType.Error
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };

    // Auto-close after a delay
    setTimeout(() => {
      browserNotification.close();
    }, this.getSnackBarDuration(notification.type));
  }

  // Utility methods
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success: return 'check_circle';
      case NotificationType.Warning: return 'warning';
      case NotificationType.Error: return 'error';
      case NotificationType.Info:
      default: return 'info';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success: return '#4caf50';
      case NotificationType.Warning: return '#ff9800';
      case NotificationType.Error: return '#f44336';
      case NotificationType.Info:
      default: return '#2196f3';
    }
  }

  formatNotificationTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}