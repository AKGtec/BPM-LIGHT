import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-create-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="create-role-dialog">
      <h2 mat-dialog-title>
        <mat-icon>add_circle</mat-icon>
        Create New Role
      </h2>

      <mat-dialog-content>
        <form [formGroup]="roleForm" class="role-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h3>Basic Information</h3>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter role name">
              <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
                Role name is required
              </mat-error>
              <mat-error *ngIf="roleForm.get('name')?.hasError('minlength')">
                Role name must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" 
                       placeholder="Enter role description" rows="3"></textarea>
              <mat-error *ngIf="roleForm.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-divider></mat-divider>

          <!-- Permissions -->
          <div class="form-section">
            <h3>Permissions</h3>
            <p class="permissions-note">Select the permissions this role should have:</p>
            
            <div class="permissions-container">
              <div *ngFor="let category of permissionCategories" class="permission-category">
                <div class="category-header">
                  <h4>{{ category.name }}</h4>
                  <button type="button" mat-button 
                          (click)="toggleCategoryPermissions(category)"
                          class="select-all-btn">
                    {{ areAllCategoryPermissionsSelected(category) ? 'Deselect All' : 'Select All' }}
                  </button>
                </div>
                
                <div class="permissions-list">
                  <mat-checkbox 
                    *ngFor="let permission of category.permissions"
                    [value]="permission.id"
                    [checked]="selectedPermissions.includes(permission.id)"
                    (change)="onPermissionChange($event, permission.id)"
                    class="permission-checkbox">
                    <div class="permission-info">
                      <span class="permission-name">{{ permission.name }}</span>
                      <span class="permission-description" *ngIf="permission.description">
                        {{ permission.description }}
                      </span>
                    </div>
                  </mat-checkbox>
                </div>
              </div>
            </div>

            <div class="selected-permissions-summary" *ngIf="selectedPermissions.length > 0">
              <h4>Selected Permissions ({{ selectedPermissions.length }})</h4>
              <div class="selected-permissions-list">
                <span *ngFor="let permissionId of selectedPermissions" class="selected-permission">
                  {{ getPermissionName(permissionId) }}
                </span>
              </div>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isCreating">
          Cancel
        </button>
        <button mat-raised-button color="primary" 
                (click)="onCreate()"
                [disabled]="roleForm.invalid || selectedPermissions.length === 0 || isCreating">
          <mat-spinner diameter="20" *ngIf="isCreating"></mat-spinner>
          <span *ngIf="!isCreating">Create Role</span>
          <span *ngIf="isCreating">Creating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-role-dialog {
      width: 600px;
      max-height: 80vh;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .full-width {
      width: 100%;
    }

    .permissions-note {
      color: #666;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .permissions-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
    }

    .permission-category {
      margin-bottom: 1.5rem;
    }

    .permission-category:last-child {
      margin-bottom: 0;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .category-header h4 {
      margin: 0;
      color: #1976d2;
      font-size: 1rem;
    }

    .select-all-btn {
      font-size: 0.8rem;
      min-width: auto;
      padding: 0 8px;
    }

    .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .permission-checkbox {
      margin: 0;
    }

    .permission-info {
      display: flex;
      flex-direction: column;
    }

    .permission-name {
      font-weight: 500;
    }

    .permission-description {
      font-size: 0.8rem;
      color: #666;
      margin-top: 0.2rem;
    }

    .selected-permissions-summary {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .selected-permissions-summary h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .selected-permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .selected-permission {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 16px;
      font-size: 0.8rem;
    }

    mat-dialog-actions {
      padding: 1rem 0 0 0;
      margin: 0;
    }

    @media (max-width: 768px) {
      .create-role-dialog {
        width: 95vw;
        max-width: none;
      }

      .category-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class CreateRoleDialogComponent {
  roleForm: FormGroup;
  isCreating = false;
  selectedPermissions: string[] = [];

  permissionCategories: PermissionCategory[] = [
    {
      name: 'User Management',
      permissions: [
        { id: 'user.create', name: 'Create User', category: 'User Management', description: 'Create new user accounts' },
        { id: 'user.edit', name: 'Edit User', category: 'User Management', description: 'Modify user information' },
        { id: 'user.delete', name: 'Delete User', category: 'User Management', description: 'Remove user accounts' },
        { id: 'user.view', name: 'View Users', category: 'User Management', description: 'View user information' },
        { id: 'user.roles', name: 'Manage User Roles', category: 'User Management', description: 'Assign and remove user roles' }
      ]
    },
    {
      name: 'Request Management',
      permissions: [
        { id: 'request.create', name: 'Create Request', category: 'Request Management', description: 'Submit new requests' },
        { id: 'request.approve', name: 'Approve Request', category: 'Request Management', description: 'Approve pending requests' },
        { id: 'request.reject', name: 'Reject Request', category: 'Request Management', description: 'Reject pending requests' },
        { id: 'request.view.all', name: 'View All Requests', category: 'Request Management', description: 'View all system requests' },
        { id: 'request.view.own', name: 'View Own Requests', category: 'Request Management', description: 'View own submitted requests' }
      ]
    },
    {
      name: 'Workflow Management',
      permissions: [
        { id: 'workflow.create', name: 'Create Workflow', category: 'Workflow Management', description: 'Create new workflows' },
        { id: 'workflow.edit', name: 'Edit Workflow', category: 'Workflow Management', description: 'Modify existing workflows' },
        { id: 'workflow.delete', name: 'Delete Workflow', category: 'Workflow Management', description: 'Remove workflows' },
        { id: 'workflow.steps', name: 'Manage Steps', category: 'Workflow Management', description: 'Add/remove workflow steps' }
      ]
    },
    {
      name: 'System Administration',
      permissions: [
        { id: 'system.settings', name: 'System Settings', category: 'System Administration', description: 'Configure system settings' },
        { id: 'system.logs', name: 'View Logs', category: 'System Administration', description: 'Access system logs' },
        { id: 'system.backup', name: 'Backup Data', category: 'System Administration', description: 'Create system backups' },
        { id: 'role.manage', name: 'Manage Roles', category: 'System Administration', description: 'Create and modify roles' }
      ]
    },
    {
      name: 'Reporting',
      permissions: [
        { id: 'report.view', name: 'View Reports', category: 'Reporting', description: 'Access system reports' },
        { id: 'report.create', name: 'Create Reports', category: 'Reporting', description: 'Generate custom reports' },
        { id: 'report.export', name: 'Export Reports', category: 'Reporting', description: 'Export reports to various formats' }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]]
    });
  }

  onPermissionChange(event: any, permissionId: string): void {
    if (event.checked) {
      if (!this.selectedPermissions.includes(permissionId)) {
        this.selectedPermissions.push(permissionId);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(id => id !== permissionId);
    }
  }

  toggleCategoryPermissions(category: PermissionCategory): void {
    const categoryPermissionIds = category.permissions.map(p => p.id);
    const allSelected = this.areAllCategoryPermissionsSelected(category);

    if (allSelected) {
      // Remove all category permissions
      this.selectedPermissions = this.selectedPermissions.filter(
        id => !categoryPermissionIds.includes(id)
      );
    } else {
      // Add all category permissions
      categoryPermissionIds.forEach(id => {
        if (!this.selectedPermissions.includes(id)) {
          this.selectedPermissions.push(id);
        }
      });
    }
  }

  areAllCategoryPermissionsSelected(category: PermissionCategory): boolean {
    const categoryPermissionIds = category.permissions.map(p => p.id);
    return categoryPermissionIds.every(id => this.selectedPermissions.includes(id));
  }

  getPermissionName(permissionId: string): string {
    for (const category of this.permissionCategories) {
      const permission = category.permissions.find(p => p.id === permissionId);
      if (permission) {
        return permission.name;
      }
    }
    return permissionId;
  }

  onCreate(): void {
    if (this.roleForm.valid && this.selectedPermissions.length > 0) {
      this.isCreating = true;

      const roleData = {
        name: this.roleForm.value.name,
        description: this.roleForm.value.description,
        permissions: this.selectedPermissions
      };

      // Simulate API call
      setTimeout(() => {
        this.isCreating = false;
        this.snackBar.open('Role created successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(roleData);
      }, 1500);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}