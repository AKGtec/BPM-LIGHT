import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { UserService } from '../../../../core/services/user.service';
import { UserRegistrationDto, UserDto } from '../../../../core/models';

@Component({
  selector: 'app-create-employee-dialog',
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
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="create-employee-dialog">
      <h2 mat-dialog-title>
        <mat-icon>person_add</mat-icon>
        Create New Employee
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <!-- Loading State -->
          <div *ngIf="isLoadingManagers" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading managers...</p>
          </div>

          <!-- Form -->
          <form [formGroup]="employeeForm" *ngIf="!isLoadingManagers">
            <!-- Personal Information Section -->
            <div class="form-section">
              <h3>Personal Information</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" required>
                  <mat-error *ngIf="employeeForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" required>
                  <mat-error *ngIf="employeeForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" required>
                  <mat-error *ngIf="employeeForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="employeeForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber">
                </mat-form-field>
              </div>
            </div>

            <!-- Employment Information Section -->
            <div class="form-section">
              <h3>Employment Information</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="userName" required>
                  <mat-error *ngIf="employeeForm.get('userName')?.hasError('required')">
                    Username is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Department</mat-label>
                  <mat-select formControlName="department">
                    <mat-option *ngFor="let dept of departments" [value]="dept">
                      {{dept}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Position</mat-label>
                  <input matInput formControlName="position">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Manager</mat-label>
                  <mat-select formControlName="managerId">
                    <mat-option value="">No Manager</mat-option>
                    <mat-option *ngFor="let manager of managers" [value]="manager.id || manager.Id">
                      {{(manager.firstName || manager.FirstName)}} {{(manager.lastName || manager.LastName)}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Hire Date</mat-label>
                  <input matInput [matDatepicker]="hireDatePicker" formControlName="hireDate">
                  <mat-datepicker-toggle matSuffix [for]="hireDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #hireDatePicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Emergency Contact</mat-label>
                  <input matInput formControlName="emergencyContact">
                </mat-form-field>
              </div>
            </div>

            <!-- Security Section -->
            <div class="form-section">
              <h3>Security & Access</h3>
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" required>
                  <mat-error *ngIf="employeeForm.get('password')?.hasError('required')">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="employeeForm.get('password')?.hasError('minlength')">
                    Password must be at least 6 characters
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="roles-section">
                <label>Roles</label>
                <div class="roles-checkboxes">
                  <mat-checkbox *ngFor="let role of availableRoles" 
                               [checked]="isRoleSelected(role)"
                               (change)="toggleRole(role, $event.checked)">
                    {{role}}
                  </mat-checkbox>
                </div>
              </div>
            </div>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="isSubmitting">Cancel</button>
        <button mat-raised-button color="primary" 
                (click)="createEmployee()" 
                [disabled]="!employeeForm.valid || isSubmitting">
          <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          {{isSubmitting ? 'Creating...' : 'Create Employee'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-employee-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .loading-container p {
      margin-top: 1rem;
      color: #666;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .form-section:last-child {
      border-bottom: none;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-row mat-form-field {
      width: 100%;
    }

    .roles-section {
      margin-top: 1rem;
    }

    .roles-section label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #666;
    }

    .roles-checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .create-employee-dialog {
        min-width: 90vw;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CreateEmployeeDialogComponent implements OnInit {
  employeeForm: FormGroup;
  managers: UserDto[] = [];
  isLoadingManagers = false;
  isSubmitting = false;

  departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  availableRoles = ['Employee', 'Manager', 'HR', 'Admin'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<CreateEmployeeDialogComponent>,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {
    this.employeeForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadManagers();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      userName: ['', [Validators.required]],
      department: [''],
      position: [''],
      managerId: [''],
      hireDate: [new Date()],
      emergencyContact: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roles: [['Employee']] // Default to Employee role
    });
  }

  private loadManagers(): void {
    this.isLoadingManagers = true;
    this.userService.getManagers().subscribe({
      next: (managers) => {
        this.managers = managers;
        this.isLoadingManagers = false;
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.isLoadingManagers = false;
      }
    });
  }

  isRoleSelected(role: string): boolean {
    const roles = this.employeeForm.get('roles')?.value || [];
    return roles.includes(role);
  }

  toggleRole(role: string, checked: boolean): void {
    const roles = this.employeeForm.get('roles')?.value || [];
    if (checked) {
      if (!roles.includes(role)) {
        roles.push(role);
      }
    } else {
      const index = roles.indexOf(role);
      if (index > -1) {
        roles.splice(index, 1);
      }
    }
    this.employeeForm.patchValue({ roles });
  }

  createEmployee(): void {
    if (this.employeeForm.valid) {
      this.isSubmitting = true;
      const formValue = this.employeeForm.value;

      const userRegistrationDto: UserRegistrationDto = {
        userName: formValue.userName,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phoneNumber: formValue.phoneNumber,
        password: formValue.password,
        confirmPassword: formValue.password // Use same password for confirmation
      };

      this.userService.createUser(userRegistrationDto).subscribe({
        next: (result) => {
          this.snackBar.open('Employee created successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error creating employee:', error);
          this.snackBar.open('Failed to create employee. Please try again.', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    }
  }
}
