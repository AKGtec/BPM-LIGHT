import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  phoneNumber?: string;
  lastActivity?: Date;
  performanceRating?: number;
}

@Component({
  selector: 'app-edit-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule
  ],
  template: `
    <div class="edit-member-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="header-content">
          <mat-icon>edit</mat-icon>
          <h2>Edit Team Member</h2>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <form [formGroup]="editForm" class="edit-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" placeholder="Enter first name">
              <mat-error *ngIf="editForm.get('firstName')?.hasError('required')">
                First name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" placeholder="Enter last name">
              <mat-error *ngIf="editForm.get('lastName')?.hasError('required')">
                Last name is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email address">
            <mat-error *ngIf="editForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="editForm.get('email')?.hasError('email')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber" placeholder="Enter phone number">
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department">
                <mat-option value="Human Resources">Human Resources</mat-option>
                <mat-option value="Engineering">Engineering</mat-option>
                <mat-option value="Marketing">Marketing</mat-option>
                <mat-option value="Sales">Sales</mat-option>
                <mat-option value="Finance">Finance</mat-option>
                <mat-option value="Operations">Operations</mat-option>
                <mat-option value="IT">IT</mat-option>
                <mat-option value="Legal">Legal</mat-option>
              </mat-select>
              <mat-error *ngIf="editForm.get('department')?.hasError('required')">
                Department is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Position</mat-label>
              <input matInput formControlName="position" placeholder="Enter position">
              <mat-error *ngIf="editForm.get('position')?.hasError('required')">
                Position is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Inactive">Inactive</mat-option>
                <mat-option value="On Leave">On Leave</mat-option>
              </mat-select>
              <mat-error *ngIf="editForm.get('status')?.hasError('required')">
                Status is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Hire Date</mat-label>
              <input matInput [matDatepicker]="hireDatePicker" formControlName="hireDate">
              <mat-datepicker-toggle matSuffix [for]="hireDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #hireDatePicker></mat-datepicker>
              <mat-error *ngIf="editForm.get('hireDate')?.hasError('required')">
                Hire date is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Performance Rating</mat-label>
            <mat-select formControlName="performanceRating">
              <mat-option [value]="null">No Rating</mat-option>
              <mat-option [value]="1">1 - Poor</mat-option>
              <mat-option [value]="2">2 - Below Average</mat-option>
              <mat-option [value]="3">3 - Average</mat-option>
              <mat-option [value]="4">4 - Good</mat-option>
              <mat-option [value]="5">5 - Excellent</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="editForm.invalid || isSubmitting"
                (click)="saveMember()">
          <mat-icon>save</mat-icon>
          {{isSubmitting ? 'Saving...' : 'Save Changes'}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .edit-member-dialog {
      max-width: 600px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 !important;
      margin: 0 0 24px 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .header-content mat-icon {
      color: #1976d2;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .dialog-content {
      padding: 0 !important;
      max-height: 70vh;
      overflow-y: auto;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      padding: 24px 0 0 0 !important;
      margin: 24px 0 0 0;
      border-top: 1px solid #e0e0e0;
    }

    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .mat-mdc-form-field-error {
      font-size: 0.75rem;
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class EditMemberDialogComponent implements OnInit {
  editForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: TeamMember }
  ) {
    this.editForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      department: ['', Validators.required],
      position: ['', Validators.required],
      status: ['', Validators.required],
      hireDate: ['', Validators.required],
      performanceRating: [null]
    });
  }

  private populateForm(): void {
    if (this.data.member) {
      this.editForm.patchValue({
        firstName: this.data.member.firstName,
        lastName: this.data.member.lastName,
        email: this.data.member.email,
        phoneNumber: this.data.member.phoneNumber || '',
        department: this.data.member.department,
        position: this.data.member.position,
        status: this.data.member.status,
        hireDate: this.data.member.hireDate,
        performanceRating: this.data.member.performanceRating || null
      });
    }
  }

  saveMember(): void {
    if (this.editForm.valid) {
      this.isSubmitting = true;
      
      const updatedMember: TeamMember = {
        ...this.data.member,
        ...this.editForm.value
      };

      // Simulate API call delay
      setTimeout(() => {
        this.isSubmitting = false;
        this.dialogRef.close({ 
          action: 'save', 
          member: updatedMember 
        });
      }, 1000);
    }
  }
}