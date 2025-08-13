import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  RequestDto, 
  CreateRequestDto, 
  UpdateRequestDto,
  ApproveRejectStepDto,
  RequestSummary,
  PaginatedResponse,
  PaginationParams,
  RequestStatus,
  RequestType
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private readonly API_URL = `${environment.apiUrl}/api/Request`;

  constructor(private http: HttpClient) {}

  getRequests(params?: PaginationParams): Observable<PaginatedResponse<RequestDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<RequestDto>>(this.API_URL, { params: httpParams });
  }

  getMyRequests(params?: PaginationParams): Observable<PaginatedResponse<RequestDto>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
      if (params.status !== undefined && params.status !== null) httpParams = httpParams.set('status', params.status.toString());
      if (params.type !== undefined && params.type !== null) httpParams = httpParams.set('type', params.type.toString());
    }

    return this.http.get<PaginatedResponse<RequestDto>>(`${this.API_URL}/my-requests`, { params: httpParams });
  }

  getRequestById(id: string): Observable<RequestDto> {
    return this.http.get<RequestDto>(`${this.API_URL}/${id}`);
  }

  createRequest(request: CreateRequestDto): Observable<RequestDto> {
    return this.http.post<RequestDto>(this.API_URL, request);
  }

  updateRequest(id: string, request: UpdateRequestDto): Observable<RequestDto> {
    return this.http.put<RequestDto>(`${this.API_URL}/${id}`, request);
  }

  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Request Steps
  getRequestSteps(requestId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${requestId}/steps`);
  }

  // Request Status Filtering
  getRequestsByStatus(status: string, params?: PaginationParams): Observable<RequestDto[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<RequestDto[]>(`${this.API_URL}/status/${status}`, { params: httpParams });
  }

  approveStep(requestId: string, stepId: string, data: ApproveRejectStepDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${requestId}/steps/${stepId}/approve`, data);
  }

  rejectStep(requestId: string, stepId: string, data: ApproveRejectStepDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${requestId}/steps/${stepId}/reject`, data);
  }

  getRequestSummary(): Observable<RequestSummary> {
    return this.http.get<RequestSummary>(`${this.API_URL}/summary`);
  }

  getRequestsByType(type: RequestType, params?: PaginationParams): Observable<PaginatedResponse<RequestDto>> {
    let httpParams = new HttpParams().set('type', type.toString());

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<RequestDto>>(`${this.API_URL}/by-type`, { params: httpParams });
  }

  getPendingApprovals(params?: PaginationParams): Observable<PaginatedResponse<RequestDto>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.type !== undefined && params.type !== null) httpParams = httpParams.set('type', params.type.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    console.log('API call params:', httpParams.toString());
    return this.http.get<PaginatedResponse<RequestDto>>(`${this.API_URL}/pending-approvals`, { params: httpParams });
  }

  getRequestsForRole(role: string, params?: PaginationParams): Observable<PaginatedResponse<RequestDto>> {
    let httpParams = new HttpParams().set('role', role);

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<RequestDto>>(`${this.API_URL}/for-role`, { params: httpParams });
  }
}