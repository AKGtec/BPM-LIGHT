import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../../../core/services/user.service';
import { UserDto, UpdateUserDto } from '../../../../core/models';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="edit-user-dialog">
      <h2 mat-dialog-title>
        <mat-icon>edit</mat-icon>
        Edit User: {{ user.firstName }} {{ user.lastName }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="userForm" class="user-form">
          <!-- Personal Information -->
          <div class="form-section">
            <h3>Personal Information</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="userName" placeholder="Enter username">
                <mat-error *ngIf="userForm.get('userName')?.hasError('required')">
                  Username is required
                </mat-error>
                <mat-error *ngIf="userForm.get('userName')?.hasError('minlength')">
                  Username must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="Enter email">
                <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="Enter phone number (optional)">
            </mat-form-field>
          </div>

          <!-- Roles -->
          <div class="form-section">
            <h3>User Roles</h3>
            <div class="roles-selection">
              <mat-checkbox 
                *ngFor="let role of availableRoles" 
                [value]="role"
                [checked]="selectedRoles.includes(role)"
                (change)="onRoleChange($event, role)"
                class="role-checkbox">
                {{ role }}
              </mat-checkbox>
            </div>
            <mat-error *ngIf="selectedRoles.length === 0 && userForm.touched">
              Please select at least one role
            </mat-error>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isUpdating">
          Cancel
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onUpdateUser()" 
          [disabled]="userForm.invalid || selectedRoles.length === 0 || isUpdating">
          <mat-spinner diameter="20" *ngIf="isUpdating"></mat-spinner>
          <span *ngIf="!isUpdating">Update User</span>
          <span *ngIf="isUpdating">Updating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-user-dialog {
      width: 600px;
      max-width: 90vw;
    }

    .user-form {
      padding: 1rem 0;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .roles-selection {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .role-checkbox {
      margin-bottom: 0.5rem;
    }

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
      .edit-user-dialog {
        width: 95vw;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class EditUserDialogComponent implements OnInit {
  userForm!: FormGroup;
  isUpdating = false;
  availableRoles = ['Employee', 'Manager', 'HR', 'Admin'];
  selectedRoles: string[] = [];
  user: UserDto;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserDto }
  ) {
    this.user = data.user;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });
  }

  private populateForm(): void {
    this.userForm.patchValue({
      firstName: this.user.firstName || this.user.FirstName || '',
      lastName: this.user.lastName || this.user.LastName || '',
      userName: this.user.userName || this.user.UserName || '',
      email: this.user.email || this.user.Email || '',
      phoneNumber: this.user.phoneNumber || this.user.PhoneNumber || ''
    });

    // Set selected roles
    this.selectedRoles = [...(this.user.roles || this.user.Roles || [])];
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

  onUpdateUser(): void {
    if (this.userForm.valid && this.selectedRoles.length > 0) {
      this.isUpdating = true;

      const updateUserData: UpdateUserDto = {
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        userName: this.userForm.value.userName,
        email: this.userForm.value.email,
        phoneNumber: this.userForm.value.phoneNumber || undefined,
        roles: this.selectedRoles
      };

      const userId = this.user.id || this.user.Id || '';

      this.userService.updateUser(userId, updateUserData).subscribe({
        next: (user) => {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(user);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error updating user. Please try again.', 'Close', {
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
