import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../../../core/services/user.service';
import { UserDto, PaginationParams, Employee } from '../../../../core/models';

// Import dialog components
import { CreateEmployeeDialogComponent } from '../create-employee-dialog/create-employee-dialog.component';
import { EditEmployeeDialogComponent } from '../edit-employee-dialog/edit-employee-dialog.component';
import { EmployeeDetailsDialogComponent } from '../employee-details-dialog/employee-details-dialog.component';
import { ChangeStatusDialogComponent } from '../change-status-dialog/change-status-dialog.component';
import { AssignManagerDialogComponent } from '../assign-manager-dialog/assign-manager-dialog.component';
import { EmployeeRequestsDialogComponent } from '../employee-requests-dialog/employee-requests-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface LocalEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  manager: string;
  phoneNumber?: string;
  emergencyContact?: string;
  performanceRating?: number;
  yearsOfService?: number;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  action: () => void;
  color: string;
  count?: number;
}

interface RecentActivity {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatTabsModule,
    MatMenuModule,
    MatDividerModule,
    MatRippleModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  employees: LocalEmployee[] = [];
  filteredEmployees: LocalEmployee[] = [];
  displayedColumns: string[] = ['avatar', 'name', 'department', 'manager', 'hireDate', 'status', 'actions'];
  selectedEmployee: LocalEmployee | null = null;

  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';
  selectedPosition = '';
  pageSize = 25;
  isLoading = false;

  departments: string[] = ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations'];
  positions: string[] = ['Manager', 'Senior Developer', 'Developer', 'Designer', 'Analyst', 'Coordinator'];
  departmentStats: { department: string; count: number; percentage: number; color: string }[] = [];

  quickActions: QuickAction[] = [
    {
      icon: 'person_add',
      title: 'Add Employee',
      description: 'Create new employee record',
      action: () => this.addEmployee(),
      color: 'primary'
    },
    {
      icon: 'schedule',
      title: 'On Leave Today',
      description: 'Employees currently on leave',
      action: () => this.filterByOnLeave(),
      color: 'warn',
      count: 0
    },
    {
      icon: 'analytics',
      title: 'Employee Reports',
      description: 'Generate HR analytics',
      action: () => this.generateReport(),
      color: 'accent'
    },
    {
      icon: 'settings',
      title: 'HR Settings',
      description: 'Configure HR policies',
      action: () => this.manageSettings(),
      color: 'primary'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      icon: 'person_add',
      title: 'New employee onboarded',
      subtitle: 'Sarah Johnson joined Engineering',
      time: '2 hours ago',
      type: 'success'
    },
    {
      icon: 'trending_up',
      title: 'Performance review completed',
      subtitle: 'Mike Chen - Engineering',
      time: '4 hours ago',
      type: 'info'
    },
    {
      icon: 'event',
      title: 'Leave request approved',
      subtitle: 'Emily Davis - 5 days vacation',
      time: '6 hours ago',
      type: 'success'
    },
    {
      icon: 'warning',
      title: 'Employee status changed',
      subtitle: 'John Smith moved to inactive',
      time: '1 day ago',
      type: 'warning'
    }
  ];

  constructor(
    private readonly userService: UserService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.updateQuickActionCounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.isLoading = true;

    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 1000,
      sortBy: 'firstName',
      sortDirection: 'asc'
    };

    this.userService.getUsers(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.employees = users.map(user => this.mapUserToEmployee(user));
          this.updateDepartmentStats();
          this.updateQuickActionCounts();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.employees = [];
          this.filteredEmployees = [];
          this.isLoading = false;
          this.showErrorMessage('Failed to load employees. Please try again.');
        }
      });
  }

  private mapUserToEmployee(user: UserDto): LocalEmployee {
    const hireDate = new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000); // Random date within last 5 years
    const yearsOfService = Math.floor((Date.now() - hireDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
    
    return {
      id: user.id || user.Id || '',
      firstName: user.firstName || user.FirstName || '',
      lastName: user.lastName || user.LastName || '',
      email: user.email || user.Email || '',
      department: this.getRandomDepartment(),
      position: this.getRandomPosition(),
      hireDate: hireDate,
      status: this.getRandomStatus(),
      manager: this.getRandomManager(),
      phoneNumber: user.phoneNumber || user.PhoneNumber,
      performanceRating: Math.floor(Math.random() * 2) + 3, // Random rating between 3-5
      yearsOfService: yearsOfService
    };
  }

  private getRandomDepartment(): string {
    return this.departments[Math.floor(Math.random() * this.departments.length)];
  }

  private getRandomPosition(): string {
    return this.positions[Math.floor(Math.random() * this.positions.length)];
  }

  private getRandomStatus(): 'Active' | 'Inactive' | 'On Leave' {
    const statuses: ('Active' | 'Inactive' | 'On Leave')[] = ['Active', 'Active', 'Active', 'Active', 'Inactive', 'On Leave']; // Weighted towards Active
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomManager(): string {
    const managers = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Wilson'];
    return managers[Math.floor(Math.random() * managers.length)];
  }

  private updateDepartmentStats(): void {
    const departmentCounts: { [key: string]: number } = {};
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#f59e0b', '#ef4444'];

    this.employees.forEach(employee => {
      departmentCounts[employee.department] = (departmentCounts[employee.department] || 0) + 1;
    });

    this.departmentStats = Object.entries(departmentCounts).map(([department, count], index) => ({
      department,
      count,
      percentage: Math.round((count / this.employees.length) * 100),
      color: colors[index % colors.length]
    }));
  }

  private updateQuickActionCounts(): void {
    this.quickActions[1].count = this.getOnLeaveCount();
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = !this.searchTerm || 
        employee.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = !this.selectedDepartment || employee.department === this.selectedDepartment;
      const matchesStatus = !this.selectedStatus || employee.status === this.selectedStatus;
      const matchesPosition = !this.selectedPosition || employee.position === this.selectedPosition;
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesPosition;
    });
  }

  getActiveCount(): number {
    return this.employees.filter(emp => emp.status === 'Active').length;
  }

  getInactiveCount(): number {
    return this.employees.filter(emp => emp.status === 'Inactive').length;
  }

  getOnLeaveCount(): number {
    return this.employees.filter(emp => emp.status === 'On Leave').length;
  }

  getTotalCount(): number {
    return this.employees.length;
  }

  getAverageYearsOfService(): string {
    if (this.employees.length === 0) return 'N/A';
    const average = this.employees.reduce((sum, emp) => sum + (emp.yearsOfService || 0), 0) / this.employees.length;
    return average.toFixed(1);
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  setSelectedEmployee(employee: LocalEmployee): void {
    this.selectedEmployee = employee;
  }

  addEmployee(): void {
    const dialogRef = this.dialog.open(CreateEmployeeDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccessMessage('Employee created successfully!');
        this.loadEmployees();
      }
    });
  }

  viewEmployee(employee: LocalEmployee): void {
    const employeeData: Employee = this.convertToEmployee(employee);

    const dialogRef = this.dialog.open(EmployeeDetailsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: employeeData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editEmployee(employee);
      }
    });
  }

  editEmployee(employee: LocalEmployee): void {
    const employeeData: Employee = this.convertToEmployee(employee);

    const dialogRef = this.dialog.open(EditEmployeeDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: employeeData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccessMessage('Employee updated successfully!');
        this.loadEmployees();
      }
    });
  }

  viewRequests(employee: LocalEmployee): void {
    const employeeData: Employee = this.convertToEmployee(employee);

    const dialogRef = this.dialog.open(EmployeeRequestsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { employee: employeeData }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Employee requests dialog closed with result:', result);
      }
    });
  }

  changeStatus(employee?: LocalEmployee): void {
    if (!employee) {
      this.showWarningMessage('Please select an employee first');
      return;
    }

    const employeeData: Employee = this.convertToEmployee(employee);

    const dialogRef = this.dialog.open(ChangeStatusDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { employee: employeeData },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccessMessage('Employee status updated successfully!');
        this.loadEmployees();
      }
    });
  }

  assignManager(employee?: LocalEmployee): void {
    if (!employee) {
      this.showWarningMessage('Please select an employee first');
      return;
    }

    const employeeData: Employee = this.convertToEmployee(employee);

    const dialogRef = this.dialog.open(AssignManagerDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { employee: employeeData },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccessMessage('Manager assigned successfully!');
        this.loadEmployees();
      }
    });
  }

  generateReport(): void {
    this.showInfoMessage('Generating employee report...');
  }

  deactivateEmployee(employee?: LocalEmployee): void {
    if (!employee) {
      this.showWarningMessage('Please select an employee first');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Deactivate Employee',
        message: `Are you sure you want to deactivate <strong>${employee.firstName} ${employee.lastName}</strong>?<br><br>This action will:
                  <ul>
                    <li>Set the employee status to "Inactive"</li>
                    <li>Revoke access to company systems</li>
                    <li>Require manager approval to reactivate</li>
                  </ul>`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        type: 'danger',
        icon: 'person_off'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.showSuccessMessage(`${employee.firstName} ${employee.lastName} has been deactivated`);
        this.loadEmployees();
      }
    });
  }

  private convertToEmployee(localEmployee: LocalEmployee): Employee {
    return {
      id: localEmployee.id,
      userName: localEmployee.email,
      email: localEmployee.email,
      firstName: localEmployee.firstName,
      lastName: localEmployee.lastName,
      phoneNumber: localEmployee.phoneNumber,
      department: localEmployee.department,
      position: localEmployee.position,
      manager: localEmployee.manager,
      managerId: '',
      hireDate: localEmployee.hireDate,
      status: localEmployee.status,
      roles: ['Employee'],
      emergencyContact: localEmployee.emergencyContact,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Quick Action Methods
  filterByOnLeave(): void {
    this.selectedStatus = 'On Leave';
    this.applyFilters();
  }

  manageSettings(): void {
    this.showInfoMessage('HR settings feature coming soon!');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.selectedPosition = '';
    this.applyFilters();
  }

  exportToExcel(): void {
    this.showInfoMessage('Export functionality coming soon!');
  }

  bulkUpdate(): void {
    this.showInfoMessage('Bulk update feature coming soon!');
  }

  getDepartmentInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  // Utility methods for snackbar messages
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}