import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { 
  NotificationDto, 
  CreateNotificationDto,
  MarkNotificationReadDto,
  NotificationSummary,
  PaginatedResponse,
  PaginationParams,
  NotificationType
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/api/notification`;

  constructor(private http: HttpClient) {}

  getNotifications(params?: PaginationParams): Observable<PaginatedResponse<NotificationDto>> {
    // For now, return mock data until backend is ready
    const mockNotifications: NotificationDto[] = [
      {
        id: '1',
        userId: 'user1',
        title: 'Leave Request Approved',
        message: 'Your leave request has been approved by your manager',
        isRead: false,
        type: NotificationType.Success,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(),
        isDeleted: false
      },
      {
        id: '2',
        userId: 'user1',
        title: 'New Workflow Available',
        message: 'A new expense report workflow has been created',
        isRead: true,
        type: NotificationType.Info,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        updatedAt: new Date(),
        isDeleted: false
      }
    ];

    const response: PaginatedResponse<NotificationDto> = {
      data: mockNotifications,
      totalCount: mockNotifications.length,
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };

    return of(response);
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
    return of(void 0); // Mock implementation
  }

  markAllAsRead(): Observable<void> {
    return of(void 0); // Mock implementation
  }

  clearAllNotifications(): Observable<void> {
    return of(void 0); // Mock implementation
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getNotificationSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.API_URL}/summary`);
  }
}