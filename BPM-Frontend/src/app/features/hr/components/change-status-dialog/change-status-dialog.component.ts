import { Component, Inject } from '@angular/core';
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

import { UserService } from '../../../../core/services/user.service';
import { Employee } from '../../../../core/models';

interface ChangeStatusData {
  employee: Employee;
}

@Component({
  selector: 'app-change-status-dialog',
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
    MatSnackBarModule
  ],
  template: `
    <div class="change-status-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>swap_horiz</mat-icon>
        Change Employee Status
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <div class="employee-info">
            <div class="employee-avatar">
              {{getInitials(data.employee.firstName, data.employee.lastName)}}
            </div>
            <div class="employee-details">
              <h3>{{data.employee.firstName}} {{data.employee.lastName}}</h3>
              <p>{{data.employee.position}} - {{data.employee.department}}</p>
              <p class="current-status">
                Current Status: 
                <span [class]="getStatusClass(data.employee.status)">
                  {{data.employee.status}}
                </span>
              </p>
            </div>
          </div>

          <form [formGroup]="statusForm" class="status-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Status</mat-label>
              <mat-select formControlName="status" required>
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Inactive">Inactive</mat-option>
                <mat-option value="On Leave">On Leave</mat-option>
              </mat-select>
              <mat-error *ngIf="statusForm.get('status')?.hasError('required')">
                Status is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason for Change</mat-label>
              <textarea matInput 
                        formControlName="reason" 
                        rows="3" 
                        placeholder="Please provide a reason for the status change...">
              </textarea>
              <mat-error *ngIf="statusForm.get('reason')?.hasError('required')">
                Reason is required
              </mat-error>
            </mat-form-field>

            <div class="effective-date" *ngIf="statusForm.get('status')?.value === 'On Leave'">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Start Date</mat-label>
                <input matInput 
                       type="date" 
                       formControlName="startDate">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>End Date</mat-label>
                <input matInput 
                       type="date" 
                       formControlName="endDate">
              </mat-form-field>
            </div>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="isSubmitting">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="changeStatus()" 
                [disabled]="!statusForm.valid || isSubmitting">
          <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isSubmitting">save</mat-icon>
          {{isSubmitting ? 'Updating...' : 'Update Status'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .change-status-dialog {
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

    .current-status {
      font-weight: 500;
    }

    .current-status span {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-on-leave {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .status-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .effective-date {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .change-status-dialog {
        min-width: 90vw;
      }

      .employee-info {
        flex-direction: column;
        text-align: center;
      }

      .effective-date {
        flex-direction: column;
      }
    }
  `]
})
export class ChangeStatusDialogComponent {
  statusForm: FormGroup;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<ChangeStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ChangeStatusData,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {
    this.statusForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      status: ['', [Validators.required]],
      reason: ['', [Validators.required]],
      startDate: [''],
      endDate: ['']
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  changeStatus(): void {
    if (this.statusForm.valid) {
      this.isSubmitting = true;

      const statusData = {
        status: this.statusForm.value.status,
        reason: this.statusForm.value.reason,
        startDate: this.statusForm.value.startDate,
        endDate: this.statusForm.value.endDate
      };

      // Simulate API call - replace with actual service call
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Employee status updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(statusData);
      }, 1500);
    }
  }
}
