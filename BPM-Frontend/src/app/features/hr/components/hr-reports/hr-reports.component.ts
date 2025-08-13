import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
// We'll create a simple leave service interface for now
interface LeaveStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
  totalDaysApproved: number;
  mostRequestedLeaveType: string;
  requestsByType?: { [key: number]: number };
  requestsByStatus?: { [key: number]: number };
}

interface LeaveRequest {
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

enum LeaveType {
  AnnualLeave = 0,
  SickLeave = 1,
  PersonalLeave = 2,
  MaternityLeave = 3,
  PaternityLeave = 4,
  EmergencyLeave = 5,
  StudyLeave = 6,
  UnpaidLeave = 7
}

enum LeaveStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3
}

// Mock service for now
class LeaveService {
  getLeaveStatistics(startDate?: string, endDate?: string) {
    // Mock implementation
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalRequests: 45,
          pendingRequests: 8,
          approvedRequests: 32,
          rejectedRequests: 5,
          totalDaysRequested: 180,
          totalDaysApproved: 145,
          mostRequestedLeaveType: 'Annual Leave',
          requestsByType: {
            0: 25, // Annual Leave
            1: 12, // Sick Leave
            2: 8   // Personal Leave
          },
          requestsByStatus: {
            0: 8,  // Pending
            1: 32, // Approved
            2: 5   // Rejected
          }
        });
      }, 1000);
    });
  }

  getLeaveRequests(params: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: '1',
              employeeId: 'emp1',
              employeeName: 'John Doe',
              employeeEmail: 'john.doe@company.com',
              leaveType: LeaveType.AnnualLeave,
              startDate: '2024-01-15',
              endDate: '2024-01-19',
              days: 5,
              reason: 'Family vacation',
              status: LeaveStatus.Pending,
              submittedDate: '2024-01-10'
            }
          ]
        });
      }, 500);
    });
  }

  exportLeaveReport(format: string, startDate?: string, endDate?: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(new Blob(['Mock report data'], { type: 'application/octet-stream' }));
      }, 1000);
    });
  }

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
}
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-hr-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './hr-reports.component.html',
  styleUrls: ['./hr-reports.component.scss']
})
export class HRReportsComponent implements OnInit {
  filterForm!: FormGroup;
  statistics: LeaveStatistics | null = null;
  recentLeaves: LeaveRequest[] = [];
  isLoading = false;
  
  // Chart data
  leaveTypeChartData: any[] = [];
  leaveStatusChartData: any[] = [];
  
  // Enums for template
  LeaveType = LeaveType;
  LeaveStatus = LeaveStatus;

  // Make leaveService public for template access
  public leaveService = new LeaveService();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadReports();
  }

  private initializeForm(): void {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    this.filterForm = this.fb.group({
      startDate: [startOfYear.toISOString().split('T')[0]],
      endDate: [currentDate.toISOString().split('T')[0]]
    });
  }

  async loadReports(): Promise<void> {
    this.isLoading = true;
    const formValue = this.filterForm.value;

    try {
      // Load statistics
      const stats = await this.leaveService.getLeaveStatistics(formValue.startDate, formValue.endDate) as LeaveStatistics;
      this.statistics = stats;
      this.prepareChartData();

      // Load recent leave requests
      const response = await this.leaveService.getLeaveRequests({
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'submittedDate',
        sortDirection: 'desc'
      }) as any;
      this.recentLeaves = response.data;

      this.isLoading = false;
    } catch (error) {
      console.error('Error loading reports:', error);
      this.isLoading = false;
    }
  }

  private prepareChartData(): void {
    if (!this.statistics) return;

    // Prepare leave type chart data
    this.leaveTypeChartData = Object.entries(this.statistics.requestsByType || {}).map(([type, count]) => ({
      name: this.leaveService.getLeaveTypeLabel(Number(type) as LeaveType),
      value: count
    }));

    // Prepare leave status chart data
    this.leaveStatusChartData = Object.entries(this.statistics.requestsByStatus || {}).map(([status, count]) => ({
      name: this.leaveService.getLeaveStatusLabel(Number(status) as LeaveStatus),
      value: count
    }));
  }

  onFilterChange(): void {
    this.loadReports();
  }

  async exportReport(format: 'excel' | 'pdf'): Promise<void> {
    const formValue = this.filterForm.value;

    try {
      const blob = await this.leaveService.exportLeaveReport(format, formValue.startDate, formValue.endDate) as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leave-report-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }

  getStatusClass(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.Pending: return 'status-pending';
      case LeaveStatus.Approved: return 'status-approved';
      case LeaveStatus.Rejected: return 'status-rejected';
      case LeaveStatus.Cancelled: return 'status-cancelled';
      default: return '';
    }
  }

  getLeaveTypeClass(type: LeaveType): string {
    switch (type) {
      case LeaveType.AnnualLeave: return 'type-annual';
      case LeaveType.SickLeave: return 'type-sick';
      case LeaveType.PersonalLeave: return 'type-personal';
      case LeaveType.MaternityLeave: return 'type-maternity';
      case LeaveType.PaternityLeave: return 'type-paternity';
      case LeaveType.EmergencyLeave: return 'type-emergency';
      case LeaveType.StudyLeave: return 'type-study';
      case LeaveType.UnpaidLeave: return 'type-unpaid';
      default: return '';
    }
  }
}
