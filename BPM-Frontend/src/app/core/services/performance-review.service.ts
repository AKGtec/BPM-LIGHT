import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, PaginationParams } from '../models';
import { environment } from '../../../environments/environment';

export interface PerformanceReview {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  dueDate: string;
  createdDate: string;
  progress: number;
  priority: ReviewPriority;
  description?: string;
  goals?: string[];
  feedback?: string;
  rating?: number;
  reviewerId?: string;
  reviewerName?: string;
  completedDate?: string;
}

export interface CreatePerformanceReviewDto {
  title: string;
  employeeId: string;
  reviewType: ReviewType;
  dueDate: string;
  priority: ReviewPriority;
  description?: string;
  goals?: string[];
}

export interface UpdatePerformanceReviewDto {
  title?: string;
  reviewType?: ReviewType;
  dueDate?: string;
  priority?: ReviewPriority;
  description?: string;
  goals?: string[];
  progress?: number;
  feedback?: string;
  rating?: number;
}

export interface PerformanceReviewStatistics {
  totalReviews: number;
  pendingReviews: number;
  completedReviews: number;
  overdueReviews: number;
  averageRating: number;
  completionRate: number;
}

export enum ReviewType {
  Annual = 0,
  Quarterly = 1,
  Probationary = 2,
  Project = 3,
  ThreeSixty = 4,
  MidYear = 5
}

export enum ReviewStatus {
  Draft = 0,
  InProgress = 1,
  Completed = 2,
  Overdue = 3,
  Cancelled = 4
}

export enum ReviewPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceReviewService {
  private readonly API_URL = `${environment.apiUrl}/api/PerformanceReview`;

  constructor(private http: HttpClient) {}

  // Performance Reviews CRUD
  getPerformanceReviews(params?: PaginationParams): Observable<PaginatedResponse<PerformanceReview>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.status !== undefined && params.status !== null) httpParams = httpParams.set('status', params.status.toString());
      if (params.type !== undefined && params.type !== null) httpParams = httpParams.set('type', params.type.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    console.log('Getting performance reviews with params:', httpParams.toString());
    return this.http.get<PaginatedResponse<PerformanceReview>>(this.API_URL, { params: httpParams });
  }

  getMyPerformanceReviews(params?: PaginationParams): Observable<PaginatedResponse<PerformanceReview>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.status !== undefined && params.status !== null) httpParams = httpParams.set('status', params.status.toString());
      if (params.type !== undefined && params.type !== null) httpParams = httpParams.set('type', params.type.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<PerformanceReview>>(`${this.API_URL}/my-reviews`, { params: httpParams });
  }

  getPendingPerformanceReviews(params?: PaginationParams): Observable<PaginatedResponse<PerformanceReview>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.type !== undefined && params.type !== null) httpParams = httpParams.set('type', params.type.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<PerformanceReview>>(`${this.API_URL}/pending`, { params: httpParams });
  }

  getPerformanceReviewById(id: string): Observable<PerformanceReview> {
    return this.http.get<PerformanceReview>(`${this.API_URL}/${id}`);
  }

  createPerformanceReview(review: CreatePerformanceReviewDto): Observable<PerformanceReview> {
    return this.http.post<PerformanceReview>(this.API_URL, review);
  }

  updatePerformanceReview(id: string, review: UpdatePerformanceReviewDto): Observable<PerformanceReview> {
    return this.http.put<PerformanceReview>(`${this.API_URL}/${id}`, review);
  }

  deletePerformanceReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Review Actions
  startReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/start`, {});
  }

  completeReview(id: string, feedback: string, rating: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/complete`, { feedback, rating });
  }

  cancelReview(id: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/cancel`, { reason });
  }

  // Bulk Operations
  bulkUpdateStatus(ids: string[], status: ReviewStatus): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-update-status`, { ids, status });
  }

  bulkDelete(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-delete`, { ids });
  }

  // Statistics and Reports
  getPerformanceReviewStatistics(startDate?: string, endDate?: string): Observable<PerformanceReviewStatistics> {
    let httpParams = new HttpParams();
    if (startDate) httpParams = httpParams.set('startDate', startDate);
    if (endDate) httpParams = httpParams.set('endDate', endDate);

    return this.http.get<PerformanceReviewStatistics>(`${this.API_URL}/statistics`, { params: httpParams });
  }

  exportPerformanceReviews(format: 'excel' | 'pdf', startDate?: string, endDate?: string): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (startDate) httpParams = httpParams.set('startDate', startDate);
    if (endDate) httpParams = httpParams.set('endDate', endDate);

    return this.http.get(`${this.API_URL}/export`, { 
      params: httpParams, 
      responseType: 'blob' 
    });
  }

  // Utility methods
  getReviewTypeLabel(type: ReviewType): string {
    switch (type) {
      case ReviewType.Annual: return 'Annual Review';
      case ReviewType.Quarterly: return 'Quarterly Review';
      case ReviewType.Probationary: return 'Probationary Review';
      case ReviewType.Project: return 'Project Review';
      case ReviewType.ThreeSixty: return '360-Degree Review';
      case ReviewType.MidYear: return 'Mid-Year Review';
      default: return 'Unknown';
    }
  }

  getReviewStatusLabel(status: ReviewStatus): string {
    switch (status) {
      case ReviewStatus.Draft: return 'Draft';
      case ReviewStatus.InProgress: return 'In Progress';
      case ReviewStatus.Completed: return 'Completed';
      case ReviewStatus.Overdue: return 'Overdue';
      case ReviewStatus.Cancelled: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getReviewPriorityLabel(priority: ReviewPriority): string {
    switch (priority) {
      case ReviewPriority.Low: return 'Low';
      case ReviewPriority.Medium: return 'Medium';
      case ReviewPriority.High: return 'High';
      case ReviewPriority.Critical: return 'Critical';
      default: return 'Unknown';
    }
  }

  // Convert enum values to display strings for dropdowns
  getReviewTypeOptions(): { value: ReviewType; label: string }[] {
    return [
      { value: ReviewType.Annual, label: this.getReviewTypeLabel(ReviewType.Annual) },
      { value: ReviewType.Quarterly, label: this.getReviewTypeLabel(ReviewType.Quarterly) },
      { value: ReviewType.Probationary, label: this.getReviewTypeLabel(ReviewType.Probationary) },
      { value: ReviewType.Project, label: this.getReviewTypeLabel(ReviewType.Project) },
      { value: ReviewType.ThreeSixty, label: this.getReviewTypeLabel(ReviewType.ThreeSixty) },
      { value: ReviewType.MidYear, label: this.getReviewTypeLabel(ReviewType.MidYear) }
    ];
  }

  getReviewStatusOptions(): { value: ReviewStatus; label: string }[] {
    return [
      { value: ReviewStatus.Draft, label: this.getReviewStatusLabel(ReviewStatus.Draft) },
      { value: ReviewStatus.InProgress, label: this.getReviewStatusLabel(ReviewStatus.InProgress) },
      { value: ReviewStatus.Completed, label: this.getReviewStatusLabel(ReviewStatus.Completed) },
      { value: ReviewStatus.Overdue, label: this.getReviewStatusLabel(ReviewStatus.Overdue) },
      { value: ReviewStatus.Cancelled, label: this.getReviewStatusLabel(ReviewStatus.Cancelled) }
    ];
  }

  getReviewPriorityOptions(): { value: ReviewPriority; label: string }[] {
    return [
      { value: ReviewPriority.Low, label: this.getReviewPriorityLabel(ReviewPriority.Low) },
      { value: ReviewPriority.Medium, label: this.getReviewPriorityLabel(ReviewPriority.Medium) },
      { value: ReviewPriority.High, label: this.getReviewPriorityLabel(ReviewPriority.High) },
      { value: ReviewPriority.Critical, label: this.getReviewPriorityLabel(ReviewPriority.Critical) }
    ];
  }
}