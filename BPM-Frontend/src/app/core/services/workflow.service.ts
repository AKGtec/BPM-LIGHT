import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  private readonly API_URL = `${environment.apiUrl}/api/Workflow`;

  constructor(private readonly http: HttpClient) {}

  getWorkflows(params?: PaginationParams): Observable<PaginatedResponse<WorkflowDto>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    // The API returns data in camelCase format, convert date strings to Date objects
    return this.http.get<any>(this.API_URL, { params: httpParams }).pipe(
      map(response => ({
        ...response,
        data: response.data.map((workflow: any) => ({
          ...workflow,
          createdAt: new Date(workflow.createdAt),
          updatedAt: workflow.updatedAt ? new Date(workflow.updatedAt) : undefined
        }))
      }))
    );
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

  // Get workflow steps
  getWorkflowSteps(workflowId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${workflowId}/steps`);
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
