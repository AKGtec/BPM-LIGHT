import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { UserService } from '../../../../core/services/user.service';
import { Employee, UserDto } from '../../../../core/models';

interface AssignManagerData {
  employee: Employee;
}

@Component({
  selector: 'app-assign-manager-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="assign-manager-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>supervisor_account</mat-icon>
        Assign Manager
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <!-- Loading State -->
          <div *ngIf="isLoadingManagers" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading managers...</p>
          </div>

          <!-- Content -->
          <div *ngIf="!isLoadingManagers">
            <div class="employee-info">
              <div class="employee-avatar">
                {{getInitials(data.employee.firstName, data.employee.lastName)}}
              </div>
              <div class="employee-details">
                <h3>{{data.employee.firstName}} {{data.employee.lastName}}</h3>
                <p>{{data.employee.position}} - {{data.employee.department}}</p>
                <p class="current-manager" *ngIf="data.employee.manager">
                  Current Manager: <strong>{{data.employee.manager}}</strong>
                </p>
                <p class="current-manager" *ngIf="!data.employee.manager">
                  <em>No manager assigned</em>
                </p>
              </div>
            </div>

            <form [formGroup]="managerForm" class="manager-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Manager</mat-label>
                <mat-select formControlName="managerId" required>
                  <mat-option value="">No Manager</mat-option>
                  <mat-option *ngFor="let manager of availableManagers" [value]="manager.id || manager.Id">
                    <div class="manager-option">
                      <div class="manager-avatar">
                        {{getInitials(manager.firstName || manager.FirstName || '', manager.lastName || manager.LastName || '')}}
                      </div>
                      <div class="manager-info">
                        <span class="manager-name">
                          {{(manager.firstName || manager.FirstName)}} {{(manager.lastName || manager.LastName)}}
                        </span>
                        <small class="manager-email">{{manager.email || manager.Email}}</small>
                      </div>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="managerForm.get('managerId')?.hasError('required')">
                  Manager selection is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reason for Assignment</mat-label>
                <textarea matInput 
                          formControlName="reason" 
                          rows="3" 
                          placeholder="Please provide a reason for this manager assignment...">
                </textarea>
                <mat-error *ngIf="managerForm.get('reason')?.hasError('required')">
                  Reason is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Effective Date</mat-label>
                <input matInput 
                       type="date" 
                       formControlName="effectiveDate"
                       [min]="today">
              </mat-form-field>
            </form>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="isSubmitting">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="assignManager()" 
                [disabled]="!managerForm.valid || isSubmitting || isLoadingManagers">
          <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          {{isSubmitting ? 'Assigning...' : 'Assign Manager'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .assign-manager-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      margin: 0;
    }

    .dialog-content {
      padding: 1.5rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .employee-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .employee-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .employee-details h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
    }

    .employee-details p {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .current-manager {
      font-weight: 500;
    }

    .manager-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .manager-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .manager-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .manager-info {
      display: flex;
      flex-direction: column;
    }

    .manager-name {
      font-weight: 500;
      font-size: 0.9rem;
    }

    .manager-email {
      color: #666;
      font-size: 0.8rem;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .assign-manager-dialog {
        min-width: 90vw;
      }

      .employee-info {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AssignManagerDialogComponent implements OnInit {
  managerForm: FormGroup;
  availableManagers: UserDto[] = [];
  isLoadingManagers = false;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<AssignManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: AssignManagerData,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {
    this.managerForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadManagers();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      managerId: ['', [Validators.required]],
      reason: ['', [Validators.required]],
      effectiveDate: [this.today]
    });
  }

  private loadManagers(): void {
    this.isLoadingManagers = true;
    this.userService.getManagers().subscribe({
      next: (managers) => {
        // Filter out the current employee from the managers list
        this.availableManagers = managers.filter(manager => 
          (manager.id || manager.Id) !== this.data.employee.id
        );
        this.isLoadingManagers = false;
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.isLoadingManagers = false;
        this.snackBar.open('Error loading managers. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  assignManager(): void {
    if (this.managerForm.valid) {
      this.isSubmitting = true;

      const assignmentData = {
        managerId: this.managerForm.value.managerId,
        reason: this.managerForm.value.reason,
        effectiveDate: this.managerForm.value.effectiveDate
      };

      // Simulate API call - replace with actual service call
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Manager assigned successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(assignmentData);
      }, 1500);
    }
  }
}
