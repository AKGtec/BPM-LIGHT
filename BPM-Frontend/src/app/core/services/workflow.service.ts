import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  WorkflowDto, 
  CreateWorkflowDto, 
  UpdateWorkflowDto,
  PaginatedResponse,
  PaginationParams
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly API_URL = `${environment.apiUrl}/api/workflow`;

  constructor(private http: HttpClient) {}

  getWorkflows(params?: PaginationParams): Observable<PaginatedResponse<WorkflowDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<WorkflowDto>>(this.API_URL, { params: httpParams });
  }

  getActiveWorkflows(): Observable<WorkflowDto[]> {
    return this.http.get<WorkflowDto[]>(`${this.API_URL}/active`);
  }

  getWorkflowById(id: string): Observable<WorkflowDto> {
    return this.http.get<WorkflowDto>(`${this.API_URL}/${id}`);
  }

  getWorkflowWithSteps(id: string): Observable<WorkflowDto> {
    return this.http.get<WorkflowDto>(`${this.API_URL}/${id}/steps`);
  }

  createWorkflow(workflow: CreateWorkflowDto): Observable<WorkflowDto> {
    return this.http.post<WorkflowDto>(this.API_URL, workflow);
  }

  updateWorkflow(id: string, workflow: UpdateWorkflowDto): Observable<WorkflowDto> {
    return this.http.put<WorkflowDto>(`${this.API_URL}/${id}`, workflow);
  }

  deleteWorkflow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activateWorkflow(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivateWorkflow(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/deactivate`, {});
  }

  duplicateWorkflow(id: string): Observable<WorkflowDto> {
    return this.http.post<WorkflowDto>(`${this.API_URL}/${id}/duplicate`, {});
  }

  getWorkflowVersions(workflowName: string): Observable<WorkflowDto[]> {
    return this.http.get<WorkflowDto[]>(`${this.API_URL}/versions/${workflowName}`);
  }
}
