import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { 
  NotificationDto, 
  CreateNotificationDto,
  NotificationSummary,
  PaginatedResponse,
  PaginationParams
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = `${environment.apiUrl}/api/notification`;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
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
    return this.http.patch<void>(`${this.API_URL}/${id}/read`, {})
      .pipe(
        tap(() => this.loadUnreadCount())
      );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/read-all`, {})
      .pipe(
        tap(() => this.loadUnreadCount())
      );
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.loadUnreadCount())
      );
  }

  getNotificationSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.API_URL}/summary`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/unread-count`)
      .pipe(
        tap(count => this.unreadCountSubject.next(count))
      );
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  // Method to update unread count from SignalR or other sources
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  // Method to increment unread count when new notification arrives
  incrementUnreadCount(): void {
    const currentCount = this.unreadCountSubject.value;
    this.unreadCountSubject.next(currentCount + 1);
  }

  // Method to decrement unread count when notification is read
  decrementUnreadCount(): void {
    const currentCount = this.unreadCountSubject.value;
    if (currentCount > 0) {
      this.unreadCountSubject.next(currentCount - 1);
    }
  }
}
