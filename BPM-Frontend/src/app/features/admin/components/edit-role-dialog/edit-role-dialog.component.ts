import { Component, Inject, OnInit } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

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
  selector: 'app-edit-role-dialog',
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
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="edit-role-dialog">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Edit Role: {{ originalRole.name }}
      </h2>

      <mat-dialog-content>
        <mat-tab-group>
          <!-- Basic Information Tab -->
          <mat-tab label="Basic Information">
            <div class="tab-content">
              <form [formGroup]="roleForm" class="role-form">
                <div class="form-section">
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
                             placeholder="Enter role description" rows="4"></textarea>
                    <mat-error *ngIf="roleForm.get('description')?.hasError('required')">
                      Description is required
                    </mat-error>
                  </mat-form-field>

                  <div class="role-info">
                    <div class="info-item">
                      <mat-icon>people</mat-icon>
                      <span>{{ originalRole.userCount }} users currently assigned to this role</span>
                    </div>
                    <div class="info-item" *ngIf="originalRole.name === 'Admin'">
                      <mat-icon color="warn">warning</mat-icon>
                      <span class="warning-text">Admin role cannot be deleted and has special restrictions</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </mat-tab>

          <!-- Permissions Tab -->
          <mat-tab label="Permissions">
            <div class="tab-content">
              <div class="permissions-header">
                <h3>Role Permissions</h3>
                <p class="permissions-note">Select the permissions this role should have:</p>
                
                <div class="permission-stats">
                  <span class="stat">
                    <strong>{{ selectedPermissions.length }}</strong> of {{ getTotalPermissions() }} permissions selected
                  </span>
                  <button mat-button color="primary" (click)="selectAllPermissions()" 
                          *ngIf="selectedPermissions.length < getTotalPermissions()">
                    Select All
                  </button>
                  <button mat-button color="warn" (click)="clearAllPermissions()" 
                          *ngIf="selectedPermissions.length > 0">
                    Clear All
                  </button>
                </div>
              </div>

              <div class="permissions-container">
                <div *ngFor="let category of permissionCategories" class="permission-category">
                  <div class="category-header">
                    <h4>
                      <mat-icon>{{ getCategoryIcon(category.name) }}</mat-icon>
                      {{ category.name }}
                    </h4>
                    <div class="category-actions">
                      <span class="category-count">
                        {{ getCategorySelectedCount(category) }}/{{ category.permissions.length }}
                      </span>
                      <button type="button" mat-button 
                              (click)="toggleCategoryPermissions(category)"
                              class="select-all-btn">
                        {{ areAllCategoryPermissionsSelected(category) ? 'Deselect All' : 'Select All' }}
                      </button>
                    </div>
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
            </div>
          </mat-tab>

          <!-- Changes Summary Tab -->
          <mat-tab label="Changes Summary" [disabled]="!hasChanges()">
            <div class="tab-content">
              <div class="changes-summary">
                <h3>Summary of Changes</h3>
                
                <div class="changes-section" *ngIf="hasBasicInfoChanges()">
                  <h4>
                    <mat-icon>info</mat-icon>
                    Basic Information Changes
                  </h4>
                  <div class="change-item" *ngIf="roleForm.value.name !== originalRole.name">
                    <span class="change-label">Name:</span>
                    <span class="change-old">{{ originalRole.name }}</span>
                    <mat-icon>arrow_forward</mat-icon>
                    <span class="change-new">{{ roleForm.value.name }}</span>
                  </div>
                  <div class="change-item" *ngIf="roleForm.value.description !== originalRole.description">
                    <span class="change-label">Description:</span>
                    <span class="change-old">{{ originalRole.description }}</span>
                    <mat-icon>arrow_forward</mat-icon>
                    <span class="change-new">{{ roleForm.value.description }}</span>
                  </div>
                </div>

                <div class="changes-section" *ngIf="getPermissionsToAdd().length > 0">
                  <h4>
                    <mat-icon color="primary">add_circle</mat-icon>
                    Permissions to Add ({{ getPermissionsToAdd().length }})
                  </h4>
                  <div class="permission-changes">
                    <span *ngFor="let permission of getPermissionsToAdd()" class="permission-add">
                      + {{ getPermissionName(permission) }}
                    </span>
                  </div>
                </div>

                <div class="changes-section" *ngIf="getPermissionsToRemove().length > 0">
                  <h4>
                    <mat-icon color="warn">remove_circle</mat-icon>
                    Permissions to Remove ({{ getPermissionsToRemove().length }})
                  </h4>
                  <div class="permission-changes">
                    <span *ngFor="let permission of getPermissionsToRemove()" class="permission-remove">
                      - {{ getPermissionName(permission) }}
                    </span>
                  </div>
                </div>

                <div class="no-changes" *ngIf="!hasChanges()">
                  <mat-icon>info</mat-icon>
                  <p>No changes have been made to this role.</p>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isUpdating">
          Cancel
        </button>
        <button mat-raised-button color="primary" 
                (click)="onUpdate()"
                [disabled]="roleForm.invalid || selectedPermissions.length === 0 || !hasChanges() || isUpdating">
          <mat-spinner diameter="20" *ngIf="isUpdating"></mat-spinner>
          <span *ngIf="!isUpdating">Update Role</span>
          <span *ngIf="isUpdating">Updating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-role-dialog {
      width: 700px;
      max-height: 80vh;
    }

    .tab-content {
      padding: 1rem 0;
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .warning-text {
      color: #f57c00;
      font-weight: 500;
    }

    .permissions-header {
      margin-bottom: 1rem;
    }

    .permissions-header h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .permissions-note {
      color: #666;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .permission-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .stat {
      color: #333;
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .category-count {
      color: #666;
      font-size: 0.9rem;
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

    .changes-summary {
      padding: 1rem;
    }

    .changes-summary h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .changes-section {
      margin-bottom: 1.5rem;
    }

    .changes-section h4 {
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
    }

    .change-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .change-label {
      font-weight: 500;
      min-width: 100px;
    }

    .change-old {
      color: #f44336;
      text-decoration: line-through;
    }

    .change-new {
      color: #4caf50;
      font-weight: 500;
    }

    .permission-changes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .permission-add {
      background-color: #e8f5e8;
      color: #2e7d32;
      padding: 0.25rem 0.5rem;
      border-radius: 16px;
      font-size: 0.8rem;
    }

    .permission-remove {
      background-color: #ffebee;
      color: #d32f2f;
      padding: 0.25rem 0.5rem;
      border-radius: 16px;
      font-size: 0.8rem;
    }

    .no-changes {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-changes mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    mat-dialog-actions {
      padding: 1rem 0 0 0;
      margin: 0;
    }

    @media (max-width: 768px) {
      .edit-role-dialog {
        width: 95vw;
        max-width: none;
      }

      .category-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .permission-stats {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class EditRoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  isUpdating = false;
  selectedPermissions: string[] = [];
  originalRole: Role;

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
    private dialogRef: MatDialogRef<EditRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: Role }
  ) {
    this.originalRole = data.role;
    this.roleForm = this.fb.group({
      name: [this.originalRole.name, [Validators.required, Validators.minLength(2)]],
      description: [this.originalRole.description, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.selectedPermissions = [...this.originalRole.permissions];
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
      this.selectedPermissions = this.selectedPermissions.filter(
        id => !categoryPermissionIds.includes(id)
      );
    } else {
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

  getCategorySelectedCount(category: PermissionCategory): number {
    const categoryPermissionIds = category.permissions.map(p => p.id);
    return categoryPermissionIds.filter(id => this.selectedPermissions.includes(id)).length;
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

  selectAllPermissions(): void {
    this.selectedPermissions = this.permissionCategories
      .flatMap(category => category.permissions.map(p => p.id));
  }

  clearAllPermissions(): void {
    this.selectedPermissions = [];
  }

  getTotalPermissions(): number {
    return this.permissionCategories
      .reduce((total, category) => total + category.permissions.length, 0);
  }

  hasChanges(): boolean {
    return this.hasBasicInfoChanges() || this.hasPermissionChanges();
  }

  hasBasicInfoChanges(): boolean {
    return this.roleForm.value.name !== this.originalRole.name ||
           this.roleForm.value.description !== this.originalRole.description;
  }

  hasPermissionChanges(): boolean {
    const originalPermissions = [...this.originalRole.permissions].sort();
    const currentPermissions = [...this.selectedPermissions].sort();
    return JSON.stringify(originalPermissions) !== JSON.stringify(currentPermissions);
  }

  getPermissionsToAdd(): string[] {
    return this.selectedPermissions.filter(permission => 
      !this.originalRole.permissions.includes(permission)
    );
  }

  getPermissionsToRemove(): string[] {
    return this.originalRole.permissions.filter(permission => 
      !this.selectedPermissions.includes(permission)
    );
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

  onUpdate(): void {
    if (this.roleForm.valid && this.selectedPermissions.length > 0 && this.hasChanges()) {
      this.isUpdating = true;

      const roleData = {
        id: this.originalRole.id,
        name: this.roleForm.value.name,
        description: this.roleForm.value.description,
        permissions: this.selectedPermissions,
        userCount: this.originalRole.userCount
      };

      // Simulate API call
      setTimeout(() => {
        this.isUpdating = false;
        this.snackBar.open('Role updated successfully!', 'Close', {
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