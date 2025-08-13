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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

// Import dialog components
import { MemberDetailsDialogComponent } from '../member-details-dialog/member-details-dialog.component';
import { EditMemberDialogComponent } from '../edit-member-dialog/edit-member-dialog.component';
import { AssignTaskDialogComponent } from '../assign-task-dialog/assign-task-dialog.component';
import { SendMessageDialogComponent } from '../send-message-dialog/send-message-dialog.component';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  phoneNumber?: string;
  lastActivity?: Date;
  performanceRating?: number;
  role?: string;
  avatar?: string;
}

interface ActivityItem {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-team-management',
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
    MatProgressSpinnerModule,
    MatRippleModule,
    MatBadgeModule
  ],
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  teamMembers: TeamMember[] = [];
  filteredTeamMembers: TeamMember[] = [];
  searchTerm = '';
  statusFilter = '';
  departmentFilter = '';
  isLoading = false;

  displayedColumns: string[] = ['name', 'position', 'status', 'performance', 'lastActivity', 'actions'];

  // Recent activities data
  recentActivities: ActivityItem[] = [
    {
      icon: 'person_add',
      title: 'New team member joined',
      subtitle: 'Sarah Johnson joined Marketing',
      time: '2 hours ago',
      color: 'primary'
    },
    {
      icon: 'check_circle',
      title: 'Performance review completed',
      subtitle: 'John Doe - Engineering',
      time: '4 hours ago',
      color: 'accent'
    },
    {
      icon: 'schedule',
      title: 'Leave request approved',
      subtitle: 'Emily Davis - 3 days vacation',
      time: '6 hours ago',
      color: 'warn'
    },
    {
      icon: 'assignment_turned_in',
      title: 'Task completed',
      subtitle: 'Project Alpha milestone reached',
      time: '1 day ago',
      color: 'primary'
    }
  ];

  // Department list for filtering
  departments: string[] = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.showErrorMessage('Unable to load team members: User not authenticated');
      this.isLoading = false;
      return;
    }

    // Load both HR and Employee roles
    const employeeRequest = this.userService.getUsersByRole('Employee', { pageNumber: 1, pageSize: 100 });
    const hrRequest = this.userService.getUsersByRole('HR', { pageNumber: 1, pageSize: 100 });

    forkJoin({
      employees: employeeRequest,
      hrUsers: hrRequest
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const employees = response.employees.data || response.employees || [];
          const hrUsers = response.hrUsers.data || response.hrUsers || [];
          const allTeamMembers = [...employees, ...hrUsers];

          this.teamMembers = allTeamMembers.map(user => this.mapUserToTeamMember(user));
          this.filteredTeamMembers = [...this.teamMembers];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading team members:', error);
          this.handleLoadingError();
        }
      });
  }

  private handleLoadingError(): void {
    // Fallback to getUsers() if getUsersByRole fails
    this.userService.getUsers({ pageNumber: 1, pageSize: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          const teamMembers = users.filter(user => {
            const roles = user.Roles || user.roles || [];
            return (roles.includes('Employee') || roles.includes('HR')) &&
                   !roles.includes('Admin') &&
                   !roles.includes('Manager');
          });
          this.teamMembers = teamMembers.map(user => this.mapUserToTeamMember(user));
          this.filteredTeamMembers = [...this.teamMembers];
          this.isLoading = false;
        },
        error: (fallbackError) => {
          console.error('Error loading users as fallback:', fallbackError);
          this.showErrorMessage('Failed to load team members. Please try again.');
          this.isLoading = false;
          this.teamMembers = [];
          this.filteredTeamMembers = [];
        }
      });
  }

  private mapUserToTeamMember(user: any): TeamMember {
    const roles = user.Roles || user.roles || [];
    const primaryRole = roles.find((role: string) => role === 'HR') || roles[0] || 'Employee';
    
    return {
      id: user.Id || user.id || '',
      firstName: user.FirstName || user.firstName || '',
      lastName: user.LastName || user.lastName || '',
      email: user.Email || user.email || '',
      department: user.Department || user.department || this.getRandomDepartment(),
      position: user.Position || user.position || this.getPositionByRole(primaryRole),
      hireDate: user.HireDate ? new Date(user.HireDate) : (user.hireDate ? new Date(user.hireDate) : new Date()),
      status: user.Status || user.status || 'Active',
      phoneNumber: user.PhoneNumber || user.phoneNumber,
      lastActivity: user.LastLoginAt ? new Date(user.LastLoginAt) : (user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)),
      performanceRating: user.PerformanceRating || user.performanceRating || Math.floor(Math.random() * 3) + 3,
      role: primaryRole,
      avatar: this.generateAvatar(user.FirstName || user.firstName || '', user.LastName || user.lastName || '')
    };
  }

  private getRandomDepartment(): string {
    return this.departments[Math.floor(Math.random() * this.departments.length)];
  }

  private getPositionByRole(role: string): string {
    const positions = {
      'HR': ['HR Specialist', 'HR Manager', 'Recruiter', 'HR Coordinator'],
      'Employee': ['Software Developer', 'Marketing Specialist', 'Sales Representative', 'Data Analyst', 'Designer']
    };
    const rolePositions = positions[role as keyof typeof positions] || positions['Employee'];
    return rolePositions[Math.floor(Math.random() * rolePositions.length)];
  }

  private generateAvatar(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  applyFilters(): void {
    this.filteredTeamMembers = this.teamMembers.filter(member => {
      const matchesSearch = !this.searchTerm || 
        member.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || member.status === this.statusFilter;
      const matchesDepartment = !this.departmentFilter || member.department === this.departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }

  getActiveMembers(): number {
    return this.teamMembers.filter(member => member.status === 'Active').length;
  }

  getOnLeaveMembers(): number {
    return this.teamMembers.filter(member => member.status === 'On Leave').length;
  }

  getInactiveMembers(): number {
    return this.teamMembers.filter(member => member.status === 'Inactive').length;
  }

  getAverageRating(): string {
    const ratings = this.teamMembers
      .filter(member => member.performanceRating)
      .map(member => member.performanceRating!);
    
    if (ratings.length === 0) return 'N/A';
    
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return average.toFixed(1);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getAvatarColor(index: number): string {
    const colors = ['primary', 'accent', 'warn', 'secondary'];
    return colors[index % colors.length];
  }

  // Dialog methods
  viewMemberDetails(member: TeamMember): void {
    const dialogRef = this.dialog.open(MemberDetailsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editMember(member);
      }
    });
  }

  editMember(member: TeamMember): void {
    const dialogRef = this.dialog.open(EditMemberDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'save') {
        const index = this.teamMembers.findIndex(m => m.id === member.id);
        if (index !== -1) {
          this.teamMembers[index] = result.member;
          this.applyFilters();
        }
        this.showSuccessMessage(`${result.member.firstName} ${result.member.lastName} has been updated successfully`);
      }
    });
  }

  viewMemberRequests(member: TeamMember): void {
    this.router.navigate(['/requests'], {
      queryParams: {
        initiatorId: member.id,
        initiatorName: `${member.firstName} ${member.lastName}`
      }
    });
  }

  assignTask(member: TeamMember): void {
    const dialogRef = this.dialog.open(AssignTaskDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Task assigned:', result);
        this.showSuccessMessage(`Task "${result.title}" assigned to ${member.firstName} ${member.lastName}`);
      }
    });
  }

  sendMessage(member: TeamMember): void {
    const dialogRef = this.dialog.open(SendMessageDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'send') {
          console.log('Message sent:', result.data);
          this.showSuccessMessage(`Message sent to ${member.firstName} ${member.lastName}`);
        } else if (result.action === 'draft') {
          console.log('Message saved as draft:', result.data);
          this.showInfoMessage('Message saved as draft');
        }
      }
    });
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
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  // Quick action methods
  addNewMember(): void {
    // Navigate to add member page or open dialog
    this.router.navigate(['/admin/users/add']);
  }

  exportTeamData(): void {
    // Implement export functionality
    this.showInfoMessage('Exporting team data...');
  }

  viewAllRequests(): void {
    this.router.navigate(['/requests']);
  }

  openTeamSettings(): void {
    this.router.navigate(['/admin/team-settings']);
  }
}