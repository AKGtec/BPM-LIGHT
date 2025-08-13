import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, PaginationParams } from '../models';
import { environment } from '../../../environments/environment';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  comments?: string;
  attachments?: string[];
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveTypeConfig {
  id: string;
  name: string;
  maxDaysPerYear: number;
  requiresApproval: boolean;
  allowCarryOver: boolean;
  isActive: boolean;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: File[];
}

export interface ApproveRejectLeaveDto {
  comments?: string;
}

export interface LeaveStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
  totalDaysApproved: number;
  mostRequestedLeaveType: string;
}

export enum LeaveType {
  AnnualLeave = 0,
  SickLeave = 1,
  PersonalLeave = 2,
  MaternityLeave = 3,
  PaternityLeave = 4,
  EmergencyLeave = 5,
  StudyLeave = 6,
  UnpaidLeave = 7
}

export enum LeaveStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly API_URL = `${environment.apiUrl}/api/Leave`;

  constructor(private http: HttpClient) {}

  // Leave Requests
  getLeaveRequests(params?: PaginationParams): Observable<PaginatedResponse<LeaveRequest>> {
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

    console.log('Getting leave requests with params:', httpParams.toString());
    return this.http.get<PaginatedResponse<LeaveRequest>>(this.API_URL, { params: httpParams });
  }

  getPendingLeaveRequests(params?: PaginationParams): Observable<PaginatedResponse<LeaveRequest>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.type !== undefined && params.type !== null) httpParams = httpParams.set('type', params.type.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    console.log('Getting pending leave requests with params:', httpParams.toString());
    return this.http.get<PaginatedResponse<LeaveRequest>>(`${this.API_URL}/pending`, { params: httpParams });
  }

  getMyLeaveRequests(params?: PaginationParams): Observable<PaginatedResponse<LeaveRequest>> {
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

    return this.http.get<PaginatedResponse<LeaveRequest>>(`${this.API_URL}/my-requests`, { params: httpParams });
  }

  getLeaveRequestById(id: string): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.API_URL}/${id}`);
  }

  createLeaveRequest(request: CreateLeaveRequestDto): Observable<LeaveRequest> {
    const formData = new FormData();
    formData.append('employeeId', request.employeeId);
    formData.append('leaveType', request.leaveType.toString());
    formData.append('startDate', request.startDate);
    formData.append('endDate', request.endDate);
    formData.append('reason', request.reason);

    if (request.attachments) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return this.http.post<LeaveRequest>(this.API_URL, formData);
  }

  approveLeaveRequest(id: string, data: ApproveRejectLeaveDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/approve`, data);
  }

  rejectLeaveRequest(id: string, data: ApproveRejectLeaveDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/reject`, data);
  }

  cancelLeaveRequest(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/cancel`, {});
  }

  bulkApproveLeaveRequests(ids: string[], comments?: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-approve`, { ids, comments });
  }

  bulkRejectLeaveRequests(ids: string[], comments?: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/bulk-reject`, { ids, comments });
  }

  // Leave Balances
  getLeaveBalances(employeeId?: string): Observable<LeaveBalance[]> {
    let httpParams = new HttpParams();
    if (employeeId) {
      httpParams = httpParams.set('employeeId', employeeId);
    }

    return this.http.get<LeaveBalance[]>(`${this.API_URL}/balances`, { params: httpParams });
  }

  getMyLeaveBalances(): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.API_URL}/my-balances`);
  }

  updateLeaveBalance(employeeId: string, leaveType: LeaveType, adjustment: number, reason: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/balances/adjust`, {
      employeeId,
      leaveType,
      adjustment,
      reason
    });
  }

  // Leave Types Configuration
  getLeaveTypes(): Observable<LeaveTypeConfig[]> {
    return this.http.get<LeaveTypeConfig[]>(`${this.API_URL}/types`);
  }

  // Statistics and Reports
  getLeaveStatistics(startDate?: string, endDate?: string): Observable<LeaveStatistics> {
    let httpParams = new HttpParams();
    if (startDate) httpParams = httpParams.set('startDate', startDate);
    if (endDate) httpParams = httpParams.set('endDate', endDate);

    return this.http.get<LeaveStatistics>(`${this.API_URL}/statistics`, { params: httpParams });
  }

  exportLeaveReport(format: 'excel' | 'pdf', startDate?: string, endDate?: string): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    if (startDate) httpParams = httpParams.set('startDate', startDate);
    if (endDate) httpParams = httpParams.set('endDate', endDate);

    return this.http.get(`${this.API_URL}/export`, { 
      params: httpParams, 
      responseType: 'blob' 
    });
  }

  // Utility methods
  getLeaveTypeLabel(type: LeaveType): string {
    switch (type) {
      case LeaveType.AnnualLeave: return 'Annual Leave';
      case LeaveType.SickLeave: return 'Sick Leave';
      case LeaveType.PersonalLeave: return 'Personal Leave';
      case LeaveType.MaternityLeave: return 'Maternity Leave';
      case LeaveType.PaternityLeave: return 'Paternity Leave';
      case LeaveType.EmergencyLeave: return 'Emergency Leave';
      case LeaveType.StudyLeave: return 'Study Leave';
      case LeaveType.UnpaidLeave: return 'Unpaid Leave';
      default: return 'Unknown';
    }
  }

  getLeaveStatusLabel(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.Pending: return 'Pending';
      case LeaveStatus.Approved: return 'Approved';
      case LeaveStatus.Rejected: return 'Rejected';
      case LeaveStatus.Cancelled: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
}