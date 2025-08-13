import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { UserDto, PaginationParams, PaginatedResponse } from '../../../../core/models';
import { UserService } from '../../../../core/services/user.service';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { ManageRolesDialogComponent } from '../manage-roles-dialog/manage-roles-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="user-management-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            User Management
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
              <mat-icon>person_add</mat-icon>
              Add User
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filters -->
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search users...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select [(ngModel)]="selectedRole" (selectionChange)="onFilterChange()">
                <mat-option value="">All Roles</mat-option>
                <mat-option value="Employee">Employee</mat-option>
                <mat-option value="Manager">Manager</mat-option>
                <mat-option value="HR">HR</mat-option>
                <mat-option value="Admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
          </div>

          <!-- Users Table -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="users" class="users-table">
              <!-- Avatar Column -->
              <ng-container matColumnDef="avatar">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-avatar">
                    {{getInitials(user.firstName, user.lastName)}}
                  </div>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">
                  <div class="user-info">
                    <strong>{{getFullName(user)}}</strong>
                    <small>{{getUserName(user)}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let user">{{getUserEmail(user)}}</td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let user">{{getUserPhone(user) || 'N/A'}}</td>
              </ng-container>

              <!-- Roles Column -->
              <ng-container matColumnDef="roles">
                <th mat-header-cell *matHeaderCellDef>Roles</th>
                <td mat-cell *matCellDef="let user">
                  <div class="roles-container">
                    <mat-chip *ngFor="let role of getUserRoles(user)" [class]="getRoleClass(role)">
                      {{role}}
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <div class="action-buttons">
                    <button mat-icon-button (click)="editUser(user)" matTooltip="Edit User">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="manageRoles(user)" matTooltip="Manage Roles">
                      <mat-icon>admin_panel_settings</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteUser(user)" matTooltip="Delete User">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="user-row"></tr>
            </table>

            <!-- No Data Message -->
            <div *ngIf="users.length === 0" class="no-data">
              <mat-icon>people_outline</mat-icon>
              <h3>No users found</h3>
              <p>No users match your current search criteria.</p>
            </div>
          </div>

          <!-- Pagination -->
          <mat-paginator
            *ngIf="!loading && totalCount > 0"
            [length]="totalCount"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            [pageIndex]="currentPage - 1"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-management-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .user-row:hover {
      background-color: #f5f5f5;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #2196f3;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-info strong {
      font-size: 0.95rem;
    }

    .user-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .roles-container {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .role-employee {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-manager {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .role-hr {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .role-admin {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
      }

      .filters mat-form-field {
        min-width: 100%;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  users: UserDto[] = [];
  displayedColumns: string[] = ['avatar', 'name', 'email', 'phone', 'roles', 'actions'];
  loading = false;

  // Pagination
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;

  // Filters
  searchTerm = '';
  selectedRole = '';

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly userService: UserService
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;

    // Build pagination parameters
    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      sortBy: 'userName', // Default sort by username
      sortDirection: 'asc'
    };

    // Load users from backend based on filter
    if (this.selectedRole) {
      // Load users by role (returns PaginatedResponse)
      this.userService.getUsersByRole(this.selectedRole, params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.users = response.data;
            this.totalCount = response.totalCount;
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error loading users by role:', error);
            this.handleLoadError();
          }
        });
    } else {
      // Load all users (returns UserDto[])
      this.userService.getUsers(params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (users: UserDto[]) => {
            this.users = users;
            this.totalCount = users.length; // Note: This should ideally come from a paginated response
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error loading users:', error);
            this.handleLoadError();
          }
        });
    }
  }

  private handleLoadError(): void {
    this.snackBar.open('Error loading users. Please try again.', 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

    // Fallback to mock data on error
   // this.users = this.getMockUsers();
    this.totalCount = this.users.length;
    this.loading = false;
  }

  // getMockUsers(): UserDto[] {
  //   return [
  //     {
  //       Id: '1',
  //       UserName: 'john.doe',
  //       Email: 'john.doe@company.com',
  //       FirstName: 'John',
  //       LastName: 'Doe',
  //       PhoneNumber: '+1-555-0123',
  //       Roles: ['Employee']
  //     },
  //     {
  //       Id: '2',
  //       UserName: 'jane.smith',
  //       Email: 'jane.smith@company.com',
  //       FirstName: 'Jane',
  //       LastName: 'Smith',
  //       PhoneNumber: '+1-555-0124',
  //       Roles: ['Manager']
  //     },
  //     {
  //       Id: '3',
  //       UserName: 'admin',
  //       Email: 'admin@company.com',
  //       FirstName: 'System',
  //       LastName: 'Administrator',
  //       PhoneNumber: '+1-555-0100',
  //       Roles: ['Admin']
  //     }
  //   ];
  // }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getFullName(user: UserDto): string {
    const firstName =  user.firstName || '';
    const lastName =  user.lastName || '';
    const userName = user.userName || '';
    return `${firstName} ${lastName}`.trim() || userName;
  }

  // Helper methods to handle both property naming conventions
  getUserName(user: UserDto): string {
    return  user.userName || '';
  }

  getUserEmail(user: UserDto): string {
    return user.email || '';
  }

  getUserPhone(user: UserDto): string {
    return  user.phoneNumber || '';
  }

  getUserRoles(user: UserDto): string[] {
    return user.roles || [];
  }

  getUserId(user: UserDto): string {
    return  user.id || '';
  }

  getRoleClass(role: string): string {
    return `role-${role.toLowerCase()}`;
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User was created successfully, reload the users list
        this.loadUsers();
      }
    });
  }

  editUser(user: UserDto): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User was updated successfully, reload the users list
        this.loadUsers();
      }
    });
  }

  manageRoles(user: UserDto): void {
    const dialogRef = this.dialog.open(ManageRolesDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User roles were updated successfully, reload the users list
        this.loadUsers();
      }
    });
  }

  deleteUser(user: UserDto): void {
    const userName = this.getUserName(user);
    const userId = this.getUserId(user);

    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`);

    if (confirmed) {
      this.userService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`User "${userName}" deleted successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            // Reload users to reflect the change
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            this.snackBar.open(`Error deleting user "${userName}". Please try again.`, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
}
