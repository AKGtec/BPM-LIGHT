import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { UserService } from '../../../../core/services/user.service';
import { UserDto } from '../../../../core/models';

@Component({
  selector: 'app-manage-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="manage-roles-dialog">
      <h2 mat-dialog-title>
        <mat-icon>admin_panel_settings</mat-icon>
        Manage Roles: {{ getUserName() }}
      </h2>

      <mat-dialog-content>
        <div class="user-info">
          <p><strong>User:</strong> {{ getFullName() }}</p>
          <p><strong>Email:</strong> {{ getUserEmail() }}</p>
        </div>

        <div class="current-roles">
          <h3>Current Roles</h3>
          <div class="roles-chips" *ngIf="currentRoles.length > 0">
            <mat-chip-set>
              <mat-chip *ngFor="let role of currentRoles" [class]="getRoleClass(role)">
                {{ role }}
              </mat-chip>
            </mat-chip-set>
          </div>
          <p *ngIf="currentRoles.length === 0" class="no-roles">No roles assigned</p>
        </div>

        <div class="role-selection">
          <h3>Available Roles</h3>
          <div class="roles-list">
            <mat-checkbox 
              *ngFor="let role of availableRoles" 
              [value]="role"
              [checked]="selectedRoles.includes(role)"
              (change)="onRoleChange($event, role)"
              class="role-checkbox">
              <span class="role-name">{{ role }}</span>
              <span class="role-description">{{ getRoleDescription(role) }}</span>
            </mat-checkbox>
          </div>
        </div>

        <div class="changes-summary" *ngIf="hasChanges()">
          <h4>Changes to be applied:</h4>
          <div class="changes-list">
            <div *ngIf="getRolesToAdd().length > 0" class="add-roles">
              <strong>Add roles:</strong>
              <mat-chip-set>
                <mat-chip *ngFor="let role of getRolesToAdd()" class="role-add">
                  + {{ role }}
                </mat-chip>
              </mat-chip-set>
            </div>
            <div *ngIf="getRolesToRemove().length > 0" class="remove-roles">
              <strong>Remove roles:</strong>
              <mat-chip-set>
                <mat-chip *ngFor="let role of getRolesToRemove()" class="role-remove">
                  - {{ role }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isUpdating">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onUpdateRoles()" 
          [disabled]="!hasChanges() || isUpdating">
          <mat-spinner diameter="20" *ngIf="isUpdating"></mat-spinner>
          <span *ngIf="!isUpdating">Update Roles</span>
          <span *ngIf="isUpdating">Updating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .manage-roles-dialog {
      width: 500px;
      max-width: 90vw;
    }

    .user-info {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .user-info p {
      margin: 0.5rem 0;
    }

    .current-roles, .role-selection {
      margin-bottom: 1.5rem;
    }

    .current-roles h3, .role-selection h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .roles-chips {
      margin-bottom: 1rem;
    }

    .no-roles {
      color: #666;
      font-style: italic;
    }

    .roles-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .role-checkbox {
      margin-bottom: 0.5rem;
    }

    .role-name {
      font-weight: 500;
      display: block;
    }

    .role-description {
      font-size: 0.85em;
      color: #666;
      display: block;
      margin-left: 1rem;
    }

    .changes-summary {
      background: #e3f2fd;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #2196f3;
    }

    .changes-summary h4 {
      margin: 0 0 1rem 0;
      color: #1976d2;
    }

    .changes-list > div {
      margin-bottom: 0.5rem;
    }

    .role-add {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .role-remove {
      background-color: #f44336 !important;
      color: white !important;
    }

    .role-employee { background-color: #2196f3; color: white; }
    .role-manager { background-color: #ff9800; color: white; }
    .role-hr { background-color: #9c27b0; color: white; }
    .role-admin { background-color: #f44336; color: white; }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      color: #1976d2;
    }

    mat-dialog-actions {
      padding: 1rem 0 0 0;
    }

    @media (max-width: 768px) {
      .manage-roles-dialog {
        width: 95vw;
      }
    }
  `]
})
export class ManageRolesDialogComponent implements OnInit {
  isUpdating = false;
  availableRoles = ['Employee', 'Manager', 'HR', 'Admin'];
  currentRoles: string[] = [];
  selectedRoles: string[] = [];
  user: UserDto;

  private roleDescriptions: { [key: string]: string } = {
    'Employee': 'Basic user access with request submission capabilities',
    'Manager': 'Can approve/reject requests and manage team members',
    'HR': 'Human resources access with employee management capabilities',
    'Admin': 'Full system administration access'
  };

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ManageRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserDto }
  ) {
    this.user = data.user;
  }

  ngOnInit(): void {
    this.initializeRoles();
  }

  private initializeRoles(): void {
    this.currentRoles = [...(this.user.roles || this.user.Roles || [])];
    this.selectedRoles = [...this.currentRoles];
  }

  getUserName(): string {
    return this.user.userName || this.user.UserName || '';
  }

  getFullName(): string {
    const firstName = this.user.firstName || this.user.FirstName || '';
    const lastName = this.user.lastName || this.user.LastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  getUserEmail(): string {
    return this.user.email || this.user.Email || '';
  }

  getRoleClass(role: string): string {
    return `role-${role.toLowerCase()}`;
  }

  getRoleDescription(role: string): string {
    return this.roleDescriptions[role] || '';
  }

  onRoleChange(event: any, role: string): void {
    if (event.checked) {
      if (!this.selectedRoles.includes(role)) {
        this.selectedRoles.push(role);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  hasChanges(): boolean {
    return JSON.stringify(this.currentRoles.sort()) !== JSON.stringify(this.selectedRoles.sort());
  }

  getRolesToAdd(): string[] {
    return this.selectedRoles.filter(role => !this.currentRoles.includes(role));
  }

  getRolesToRemove(): string[] {
    return this.currentRoles.filter(role => !this.selectedRoles.includes(role));
  }

  onUpdateRoles(): void {
    if (this.hasChanges()) {
      this.isUpdating = true;
      const userId = this.user.id || this.user.Id || '';

      // For now, we'll use the updateUser method to update roles
      // In a real implementation, you might have separate endpoints for role management
      const updateData = {
        roles: this.selectedRoles
      };

      this.userService.updateUser(userId, updateData).subscribe({
        next: (user) => {
          this.snackBar.open('User roles updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(user);
        },
        error: (error) => {
          console.error('Error updating user roles:', error);
          this.snackBar.open('Error updating user roles. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isUpdating = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
