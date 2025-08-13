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
import { UserRegistrationDto } from '../../../../core/models';

@Component({
  selector: 'app-create-user-dialog',
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
    <div class="create-user-dialog">
      <h2 mat-dialog-title>
        <mat-icon>person_add</mat-icon>
        Create New User
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

          <!-- Security -->
          <div class="form-section">
            <h3>Security</h3>
            
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="Enter password">
                <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('pattern')">
                  Password must contain uppercase, lowercase, number and special character
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirm Password</mat-label>
                <input matInput type="password" formControlName="confirmPassword" placeholder="Confirm password">
                <mat-error *ngIf="userForm.get('confirmPassword')?.hasError('required')">
                  Please confirm your password
                </mat-error>
                <mat-error *ngIf="userForm.hasError('passwordMismatch') && userForm.get('confirmPassword')?.touched">
                  Passwords do not match
                </mat-error>
              </mat-form-field>
            </div>
          </div>

          <!-- Roles -->
          <div class="form-section">
            <h3>User Roles (Optional)</h3>
            <p class="roles-note">Note: Roles can be assigned after user creation through the "Manage Roles" option.</p>
            <div class="roles-selection">
              <mat-checkbox
                *ngFor="let role of availableRoles"
                [value]="role"
                (change)="onRoleChange($event, role)"
                class="role-checkbox">
                {{ role }}
              </mat-checkbox>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isCreating">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onCreateUser()"
          [disabled]="userForm.invalid || isCreating">
          <mat-spinner diameter="20" *ngIf="isCreating"></mat-spinner>
          <span *ngIf="!isCreating">Create User</span>
          <span *ngIf="isCreating">Creating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-user-dialog {
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

    .roles-note {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      font-style: italic;
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
      .create-user-dialog {
        width: 95vw;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class CreateUserDialogComponent implements OnInit {
  userForm!: FormGroup;
  isCreating = false;
  availableRoles = ['Employee', 'Manager', 'HR', 'Admin'];
  selectedRoles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Component initialization
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
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

  onCreateUser(): void {
    if (this.userForm.valid) {
      this.isCreating = true;

      const registrationData: UserRegistrationDto = {
        userName: this.userForm.value.userName,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        confirmPassword: this.userForm.value.confirmPassword,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        phoneNumber: this.userForm.value.phoneNumber || ''
      };

      this.userService.createUser(registrationData).subscribe({
        next: (user) => {
          // After user is created, assign roles if any were selected
          if (this.selectedRoles.length > 0) {
            this.assignRolesToUser(user, this.selectedRoles);
          } else {
            this.snackBar.open('User created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(user);
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          let errorMessage = 'Error creating user. Please try again.';

          // Handle specific validation errors
          if (error.error && typeof error.error === 'object') {
            const errors = [];
            for (const [, messages] of Object.entries(error.error)) {
              if (Array.isArray(messages)) {
                errors.push(...messages);
              } else {
                errors.push(messages);
              }
            }
            if (errors.length > 0) {
              errorMessage = errors.join('. ');
            }
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isCreating = false;
        }
      });
    }
  }

  private assignRolesToUser(user: any, roles: string[]): void {
    // For now, we'll just show success since role assignment might need separate API calls
    // In a real implementation, you would call role assignment endpoints here
    this.snackBar.open('User created successfully! Note: Role assignment may need to be done separately.', 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar']
    });
    this.dialogRef.close(user);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
