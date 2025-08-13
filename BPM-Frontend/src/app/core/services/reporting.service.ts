import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  requestType?: string;
  status?: string;
  department?: string;
  userId?: string;
  workflowId?: string;
}

export interface ReportData {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageProcessingTime: number;
  requestsByType: { [type: string]: number };
  requestsByStatus: { [status: string]: number };
  requestsByDepartment: { [department: string]: number };
  processingTimeByType: { [type: string]: number };
  approvalRateByManager: { [manager: string]: number };
  monthlyTrends: {
    month: string;
    submitted: number;
    approved: number;
    rejected: number;
  }[];
}

export interface UserActivityReport {
  userId: string;
  userName: string;
  department: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageResponseTime: number;
  lastActivity: Date;
}

export interface WorkflowPerformanceReport {
  workflowId: string;
  workflowName: string;
  totalRequests: number;
  averageCompletionTime: number;
  bottleneckSteps: {
    stepName: string;
    averageTime: number;
    pendingCount: number;
  }[];
  completionRate: number;
  userSatisfactionScore?: number;
}

export interface SystemHealthReport {
  totalUsers: number;
  activeUsers: number;
  totalWorkflows: number;
  activeWorkflows: number;
  systemUptime: number;
  averageResponseTime: number;
  errorRate: number;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  databaseHealth: {
    connectionCount: number;
    queryPerformance: number;
    indexHealth: number;
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeRawData?: boolean;
  template?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private readonly API_URL = `${environment.apiUrl}/api/reporting`;

  constructor(private readonly http: HttpClient) {}

  // General reporting
  getSystemOverviewReport(filters?: ReportFilter): Observable<ReportData> {
    let params = this.buildFilterParams(filters);
    return this.http.get<ReportData>(`${this.API_URL}/overview`, { params });
  }

  getUserActivityReport(filters?: ReportFilter): Observable<UserActivityReport[]> {
    let params = this.buildFilterParams(filters);
    return this.http.get<UserActivityReport[]>(`${this.API_URL}/user-activity`, { params });
  }

  getWorkflowPerformanceReport(filters?: ReportFilter): Observable<WorkflowPerformanceReport[]> {
    let params = this.buildFilterParams(filters);
    return this.http.get<WorkflowPerformanceReport[]>(`${this.API_URL}/workflow-performance`, { params });
  }

  getSystemHealthReport(): Observable<SystemHealthReport> {
    return this.http.get<SystemHealthReport>(`${this.API_URL}/system-health`);
  }

  // Specific analytics
  getRequestTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly', filters?: ReportFilter): Observable<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  }> {
    let params = this.buildFilterParams(filters);
    params = params.set('period', period);
    return this.http.get<any>(`${this.API_URL}/request-trends`, { params });
  }

  getApprovalRates(filters?: ReportFilter): Observable<{
    overall: number;
    byType: { [type: string]: number };
    byDepartment: { [department: string]: number };
    byManager: { [manager: string]: number };
  }> {
    let params = this.buildFilterParams(filters);
    return this.http.get<any>(`${this.API_URL}/approval-rates`, { params });
  }

  getProcessingTimeAnalysis(filters?: ReportFilter): Observable<{
    average: number;
    median: number;
    byType: { [type: string]: { average: number; median: number } };
    byStep: { [step: string]: { average: number; median: number } };
    distribution: {
      range: string;
      count: number;
      percentage: number;
    }[];
  }> {
    let params = this.buildFilterParams(filters);
    return this.http.get<any>(`${this.API_URL}/processing-time`, { params });
  }

  getBottleneckAnalysis(filters?: ReportFilter): Observable<{
    workflowId: string;
    workflowName: string;
    bottlenecks: {
      stepName: string;
      averageTime: number;
      pendingCount: number;
      impactScore: number;
    }[];
  }[]> {
    let params = this.buildFilterParams(filters);
    return this.http.get<any>(`${this.API_URL}/bottlenecks`, { params });
  }

  // Department-specific reports
  getDepartmentReport(departmentId: string, filters?: ReportFilter): Observable<{
    departmentName: string;
    totalEmployees: number;
    totalRequests: number;
    averageProcessingTime: number;
    topRequestTypes: { type: string; count: number }[];
    employeeActivity: UserActivityReport[];
    trends: any[];
  }> {
    let params = this.buildFilterParams(filters);
    return this.http.get<any>(`${this.API_URL}/department/${departmentId}`, { params });
  }

  // Manager-specific reports
  getManagerReport(managerId: string, filters?: ReportFilter): Observable<{
    managerName: string;
    teamSize: number;
    pendingApprovals: number;
    averageApprovalTime: number;
    approvalRate: number;
    teamActivity: UserActivityReport[];
    workloadDistribution: any[];
  }> {
    let params = this.buildFilterParams(filters);
    return this.http.get<any>(`${this.API_URL}/manager/${managerId}`, { params });
  }

  // Export functionality
  exportReport(
    reportType: 'overview' | 'user-activity' | 'workflow-performance' | 'system-health',
    options: ExportOptions,
    filters?: ReportFilter
  ): Observable<Blob> {
    let params = this.buildFilterParams(filters);
    params = params.set('format', options.format);
    
    if (options.includeCharts !== undefined) {
      params = params.set('includeCharts', options.includeCharts.toString());
    }
    
    if (options.includeRawData !== undefined) {
      params = params.set('includeRawData', options.includeRawData.toString());
    }
    
    if (options.template) {
      params = params.set('template', options.template);
    }

    return this.http.get(`${this.API_URL}/export/${reportType}`, {
      params,
      responseType: 'blob'
    });
  }

  // Custom reports
  createCustomReport(reportConfig: {
    name: string;
    description?: string;
    filters: ReportFilter;
    metrics: string[];
    chartTypes: string[];
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      recipients: string[];
    };
  }): Observable<{ reportId: string }> {
    return this.http.post<{ reportId: string }>(`${this.API_URL}/custom`, reportConfig);
  }

  getCustomReports(): Observable<{
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    lastRun?: Date;
    isScheduled: boolean;
  }[]> {
    return this.http.get<any[]>(`${this.API_URL}/custom`);
  }

  runCustomReport(reportId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/custom/${reportId}/run`, {});
  }

  deleteCustomReport(reportId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/custom/${reportId}`);
  }

  // Scheduled reports
  scheduleReport(reportId: string, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel';
  }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/schedule/${reportId}`, schedule);
  }

  getScheduledReports(): Observable<{
    id: string;
    reportName: string;
    frequency: string;
    nextRun: Date;
    recipients: string[];
    isActive: boolean;
  }[]> {
    return this.http.get<any[]>(`${this.API_URL}/scheduled`);
  }

  // Utility methods
  private buildFilterParams(filters?: ReportFilter): HttpParams {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate.toISOString());
      }
      if (filters.requestType) {
        params = params.set('requestType', filters.requestType);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.department) {
        params = params.set('department', filters.department);
      }
      if (filters.userId) {
        params = params.set('userId', filters.userId);
      }
      if (filters.workflowId) {
        params = params.set('workflowId', filters.workflowId);
      }
    }
    
    return params;
  }
}
