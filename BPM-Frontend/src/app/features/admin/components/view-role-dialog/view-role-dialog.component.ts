import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PermissionInfo {
  id: string;
  name: string;
  category: string;
  description?: string;
}

@Component({
  selector: 'app-view-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule
  ],
  template: `
    <div class="view-role-dialog">
      <h2 mat-dialog-title>
        <mat-icon>visibility</mat-icon>
        Role Details: {{ role.name }}
      </h2>

      <mat-dialog-content>
        <div class="role-details">
          <!-- Basic Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>info</mat-icon>
                Basic Information
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <label>Role Name:</label>
                  <span class="role-name">{{ role.name }}</span>
                </div>
                <div class="info-item">
                  <label>Description:</label>
                  <span>{{ role.description }}</span>
                </div>
                <div class="info-item">
                  <label>Users Assigned:</label>
                  <span class="user-count">{{ role.userCount }} users</span>
                </div>
                <div class="info-item" *ngIf="role.createdAt">
                  <label>Created:</label>
                  <span>{{ role.createdAt | date:'medium' }}</span>
                </div>
                <div class="info-item" *ngIf="role.updatedAt">
                  <label>Last Updated:</label>
                  <span>{{ role.updatedAt | date:'medium' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-divider></mat-divider>

          <!-- Permissions -->
          <mat-card class="permissions-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>security</mat-icon>
                Permissions ({{ role.permissions.length }})
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="permissions-container">
                <div *ngFor="let category of getPermissionsByCategory()" class="permission-category">
                  <h4 class="category-title">
                    <mat-icon>{{ getCategoryIcon(category.name) }}</mat-icon>
                    {{ category.name }}
                    <span class="category-count">({{ category.permissions.length }})</span>
                  </h4>
                  
                  <div class="permissions-list">
                    <div *ngFor="let permission of category.permissions" class="permission-item">
                      <mat-icon class="permission-icon">check_circle</mat-icon>
                      <div class="permission-info">
                        <span class="permission-name">{{ permission.name }}</span>
                        <span class="permission-description" *ngIf="permission.description">
                          {{ permission.description }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div *ngIf="role.permissions.length === 0" class="no-permissions">
                  <mat-icon>warning</mat-icon>
                  <p>No permissions assigned to this role</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Permission Summary -->
          <mat-card class="summary-card" *ngIf="role.permissions.length > 0">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>summarize</mat-icon>
                Permission Summary
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="permission-chips">
                <mat-chip *ngFor="let permission of role.permissions" 
                         [class]="getPermissionChipClass(permission)">
                  {{ getPermissionDisplayName(permission) }}
                </mat-chip>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          Close
        </button>
        <button mat-raised-button color="primary" (click)="onEdit()">
          <mat-icon>edit</mat-icon>
          Edit Role
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .view-role-dialog {
      width: 700px;
      max-height: 80vh;
    }

    .role-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-card, .permissions-card, .summary-card {
      margin: 0;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item span {
      color: #333;
    }

    .role-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: #1976d2;
    }

    .user-count {
      font-weight: 500;
      color: #4caf50;
    }

    .permissions-container {
      max-height: 400px;
      overflow-y: auto;
    }

    .permission-category {
      margin-bottom: 1.5rem;
    }

    .permission-category:last-child {
      margin-bottom: 0;
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1rem 0;
      color: #1976d2;
      font-size: 1rem;
      font-weight: 500;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e3f2fd;
    }

    .category-count {
      color: #666;
      font-size: 0.8rem;
      font-weight: normal;
    }

    .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-left: 1rem;
    }

    .permission-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .permission-icon {
      color: #4caf50;
      font-size: 1.2rem;
      margin-top: 0.1rem;
    }

    .permission-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .permission-name {
      font-weight: 500;
      color: #333;
    }

    .permission-description {
      font-size: 0.8rem;
      color: #666;
      line-height: 1.3;
    }

    .no-permissions {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-permissions mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #ff9800;
      margin-bottom: 1rem;
    }

    .permission-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .permission-chip-user {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .permission-chip-request {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .permission-chip-workflow {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .permission-chip-system {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .permission-chip-report {
      background-color: #fce4ec;
      color: #c2185b;
    }

    .permission-chip-default {
      background-color: #f5f5f5;
      color: #666;
    }

    mat-dialog-actions {
      padding: 1rem 0 0 0;
      margin: 0;
    }

    @media (max-width: 768px) {
      .view-role-dialog {
        width: 95vw;
        max-width: none;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .permissions-container {
        max-height: 300px;
      }
    }
  `]
})
export class ViewRoleDialogComponent {
  role: Role;

  private permissionMap: { [key: string]: PermissionInfo } = {
    'user.create': { id: 'user.create', name: 'Create User', category: 'User Management', description: 'Create new user accounts' },
    'user.edit': { id: 'user.edit', name: 'Edit User', category: 'User Management', description: 'Modify user information' },
    'user.delete': { id: 'user.delete', name: 'Delete User', category: 'User Management', description: 'Remove user accounts' },
    'user.view': { id: 'user.view', name: 'View Users', category: 'User Management', description: 'View user information' },
    'user.roles': { id: 'user.roles', name: 'Manage User Roles', category: 'User Management', description: 'Assign and remove user roles' },
    'request.create': { id: 'request.create', name: 'Create Request', category: 'Request Management', description: 'Submit new requests' },
    'request.approve': { id: 'request.approve', name: 'Approve Request', category: 'Request Management', description: 'Approve pending requests' },
    'request.reject': { id: 'request.reject', name: 'Reject Request', category: 'Request Management', description: 'Reject pending requests' },
    'request.view.all': { id: 'request.view.all', name: 'View All Requests', category: 'Request Management', description: 'View all system requests' },
    'request.view.own': { id: 'request.view.own', name: 'View Own Requests', category: 'Request Management', description: 'View own submitted requests' },
    'workflow.create': { id: 'workflow.create', name: 'Create Workflow', category: 'Workflow Management', description: 'Create new workflows' },
    'workflow.edit': { id: 'workflow.edit', name: 'Edit Workflow', category: 'Workflow Management', description: 'Modify existing workflows' },
    'workflow.delete': { id: 'workflow.delete', name: 'Delete Workflow', category: 'Workflow Management', description: 'Remove workflows' },
    'workflow.steps': { id: 'workflow.steps', name: 'Manage Steps', category: 'Workflow Management', description: 'Add/remove workflow steps' },
    'system.settings': { id: 'system.settings', name: 'System Settings', category: 'System Administration', description: 'Configure system settings' },
    'system.logs': { id: 'system.logs', name: 'View Logs', category: 'System Administration', description: 'Access system logs' },
    'system.backup': { id: 'system.backup', name: 'Backup Data', category: 'System Administration', description: 'Create system backups' },
    'role.manage': { id: 'role.manage', name: 'Manage Roles', category: 'System Administration', description: 'Create and modify roles' },
    'report.view': { id: 'report.view', name: 'View Reports', category: 'Reporting', description: 'Access system reports' },
    'report.create': { id: 'report.create', name: 'Create Reports', category: 'Reporting', description: 'Generate custom reports' },
    'report.export': { id: 'report.export', name: 'Export Reports', category: 'Reporting', description: 'Export reports to various formats' }
  };

  constructor(
    private dialogRef: MatDialogRef<ViewRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: Role }
  ) {
    this.role = data.role;
  }

  getPermissionsByCategory(): { name: string; permissions: PermissionInfo[] }[] {
    const categories: { [key: string]: PermissionInfo[] } = {};

    this.role.permissions.forEach(permissionId => {
      const permission = this.permissionMap[permissionId];
      if (permission) {
        if (!categories[permission.category]) {
          categories[permission.category] = [];
        }
        categories[permission.category].push(permission);
      }
    });

    return Object.keys(categories).map(categoryName => ({
      name: categoryName,
      permissions: categories[categoryName]
    }));
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'User Management': 'people',
      'Request Management': 'assignment',
      'Workflow Management': 'account_tree',
      'System Administration': 'settings',
      'Reporting': 'analytics'
    };
    return iconMap[categoryName] || 'folder';
  }

  getPermissionDisplayName(permissionId: string): string {
    const permission = this.permissionMap[permissionId];
    return permission ? permission.name : permissionId;
  }

  getPermissionChipClass(permissionId: string): string {
    const permission = this.permissionMap[permissionId];
    if (!permission) return 'permission-chip-default';

    const categoryClassMap: { [key: string]: string } = {
      'User Management': 'permission-chip-user',
      'Request Management': 'permission-chip-request',
      'Workflow Management': 'permission-chip-workflow',
      'System Administration': 'permission-chip-system',
      'Reporting': 'permission-chip-report'
    };

    return categoryClassMap[permission.category] || 'permission-chip-default';
  }

  onEdit(): void {
    this.dialogRef.close({ action: 'edit', role: this.role });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}