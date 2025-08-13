import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateRoleDialogComponent } from '../create-role-dialog/create-role-dialog.component';
import { ViewRoleDialogComponent } from '../view-role-dialog/view-role-dialog.component';
import { EditRoleDialogComponent } from '../edit-role-dialog/edit-role-dialog.component';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="role-management-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>admin_panel_settings</mat-icon>
            Role Management
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createRole()">
              <mat-icon>add</mat-icon>
              Create Role
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="roles" class="roles-table">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Role Name</th>
                <td mat-cell *matCellDef="let role">
                  <div class="role-info">
                    <strong>{{role.name}}</strong>
                    <small>{{role.description}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Permissions Column -->
              <ng-container matColumnDef="permissions">
                <th mat-header-cell *matHeaderCellDef>Permissions</th>
                <td mat-cell *matCellDef="let role">
                  <div class="permissions-container">
                    <mat-chip *ngFor="let permission of role.permissions.slice(0, 3)" class="permission-chip">
                      {{getPermissionDisplayName(permission)}}
                    </mat-chip>
                    <span *ngIf="role.permissions.length > 3" class="more-permissions">
                      +{{role.permissions.length - 3}} more
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- User Count Column -->
              <ng-container matColumnDef="userCount">
                <th mat-header-cell *matHeaderCellDef>Users</th>
                <td mat-cell *matCellDef="let role">
                  <span class="user-count">{{role.userCount}} users</span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let role">
                  <div class="action-buttons">
                    <button mat-icon-button (click)="editRole(role)" matTooltip="Edit Role">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="viewPermissions(role)" matTooltip="View Permissions">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteRole(role)" 
                            [disabled]="role.name === 'Admin'" matTooltip="Delete Role">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="role-row"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Permissions Overview -->
      <mat-card class="permissions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Available Permissions
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="permissions-grid">
            <div *ngFor="let category of permissionCategories" class="permission-category">
              <h4>{{category.name}}</h4>
              <div class="permission-list">
                <mat-chip *ngFor="let permission of category.permissions" class="permission-chip">
                  {{permission}}
                </mat-chip>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .role-management-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 1rem;
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

    .table-container {
      overflow-x: auto;
    }

    .roles-table {
      width: 100%;
    }

    .role-row:hover {
      background-color: #f5f5f5;
    }

    .role-info {
      display: flex;
      flex-direction: column;
    }

    .role-info strong {
      font-size: 1rem;
    }

    .role-info small {
      color: #666;
      font-size: 0.8rem;
    }

    .permissions-container {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .permission-chip {
      background-color: #e3f2fd;
      color: #1976d2;
      font-size: 0.75rem;
    }

    .more-permissions {
      color: #666;
      font-size: 0.8rem;
      font-style: italic;
    }

    .user-count {
      color: #666;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .permission-category {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .permission-category h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .permission-list {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .permissions-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  displayedColumns: string[] = ['name', 'permissions', 'userCount', 'actions'];
  
  permissionCategories = [
    {
      name: 'User Management',
      permissions: ['Create User', 'Edit User', 'Delete User', 'View Users']
    },
    {
      name: 'Request Management',
      permissions: ['Create Request', 'Approve Request', 'Reject Request', 'View All Requests']
    },
    {
      name: 'Workflow Management',
      permissions: ['Create Workflow', 'Edit Workflow', 'Delete Workflow', 'Manage Steps']
    },
    {
      name: 'System Administration',
      permissions: ['System Settings', 'View Logs', 'Backup Data', 'Manage Roles']
    }
  ];

  private permissionDisplayMap: { [key: string]: string } = {
    'user.create': 'Create User',
    'user.edit': 'Edit User',
    'user.delete': 'Delete User',
    'user.view': 'View Users',
    'user.roles': 'Manage User Roles',
    'request.create': 'Create Request',
    'request.approve': 'Approve Request',
    'request.reject': 'Reject Request',
    'request.view.all': 'View All Requests',
    'request.view.own': 'View Own Requests',
    'workflow.create': 'Create Workflow',
    'workflow.edit': 'Edit Workflow',
    'workflow.delete': 'Delete Workflow',
    'workflow.steps': 'Manage Steps',
    'system.settings': 'System Settings',
    'system.logs': 'View Logs',
    'system.backup': 'Backup Data',
    'role.manage': 'Manage Roles',
    'report.view': 'View Reports',
    'report.create': 'Create Reports',
    'report.export': 'Export Reports'
  };

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    // Mock data for demonstration with proper permission IDs
    this.roles = [
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access',
        permissions: ['user.create', 'user.edit', 'user.delete', 'user.view', 'system.settings', 'system.logs', 'role.manage'],
        userCount: 2
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Team management and approval rights',
        permissions: ['request.approve', 'request.reject', 'request.view.all', 'request.create'],
        userCount: 5
      },
      {
        id: '3',
        name: 'HR',
        description: 'Human resources management',
        permissions: ['user.view', 'request.create', 'request.approve', 'request.view.all'],
        userCount: 3
      },
      {
        id: '4',
        name: 'Employee',
        description: 'Basic user access',
        permissions: ['request.create', 'request.view.own'],
        userCount: 25
      }
    ];
  }

  createRole(): void {
    const dialogRef = this.dialog.open(CreateRoleDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add the new role to the list
        const newRole: Role = {
          id: (this.roles.length + 1).toString(),
          name: result.name,
          description: result.description,
          permissions: result.permissions,
          userCount: 0
        };
        this.roles.push(newRole);
        this.snackBar.open('Role created successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  editRole(role: Role): void {
    const dialogRef = this.dialog.open(EditRoleDialogComponent, {
      width: '700px',
      maxHeight: '80vh',
      disableClose: true,
      data: { role: role }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the role in the list
        const index = this.roles.findIndex(r => r.id === result.id);
        if (index !== -1) {
          this.roles[index] = result;
          this.snackBar.open('Role updated successfully!', 'Close', { duration: 3000 });
        }
      }
    });
  }

  viewPermissions(role: Role): void {
    const dialogRef = this.dialog.open(ViewRoleDialogComponent, {
      width: '700px',
      maxHeight: '80vh',
      data: { role: role }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        // If user clicked edit from view dialog, open edit dialog
        this.editRole(result.role);
      }
    });
  }

  deleteRole(role: Role): void {
    if (role.name === 'Admin') {
      this.snackBar.open('Cannot delete Admin role', 'Close', { duration: 3000 });
      return;
    }

    // In a real application, you would show a confirmation dialog
    if (confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      const index = this.roles.findIndex(r => r.id === role.id);
      if (index !== -1) {
        this.roles.splice(index, 1);
        this.snackBar.open(`Role "${role.name}" deleted successfully!`, 'Close', { duration: 3000 });
      }
    }
  }

  getPermissionDisplayName(permissionId: string): string {
    return this.permissionDisplayMap[permissionId] || permissionId;
  }
}
