import { Component, Inject } from '@angular/core';
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
  selector: 'app-assign-task-dialog',
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
    MatNativeDateModule
  ],
  template: `
    <div class="assign-task-dialog">
      <h2 mat-dialog-title>
        <mat-icon>assignment_add</mat-icon>
        Assign Task to {{data.member.firstName}} {{data.member.lastName}}
      </h2>

      <div mat-dialog-content>
        <form [formGroup]="taskForm" class="task-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Task Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter task title">
            <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
              Task title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput 
                     formControlName="description" 
                     rows="4" 
                     placeholder="Describe the task details..."></textarea>
            <mat-error *ngIf="taskForm.get('description')?.hasError('required')">
              Task description is required
            </mat-error>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="low">Low</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="urgent">Urgent</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="development">Development</mat-option>
                <mat-option value="testing">Testing</mat-option>
                <mat-option value="documentation">Documentation</mat-option>
                <mat-option value="review">Review</mat-option>
                <mat-option value="meeting">Meeting</mat-option>
                <mat-option value="training">Training</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Due Date</mat-label>
              <input matInput 
                     [matDatepicker]="dueDatePicker" 
                     formControlName="dueDate"
                     readonly>
              <mat-datepicker-toggle matSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #dueDatePicker></mat-datepicker>
              <mat-error *ngIf="taskForm.get('dueDate')?.hasError('required')">
                Due date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estimated Hours</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="estimatedHours" 
                     min="0.5" 
                     step="0.5"
                     placeholder="0.0">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Notes</mat-label>
            <textarea matInput 
                     formControlName="notes" 
                     rows="3" 
                     placeholder="Any additional instructions or notes..."></textarea>
          </mat-form-field>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button 
                color="primary" 
                (click)="assignTask()"
                [disabled]="taskForm.invalid">
          <mat-icon>assignment_add</mat-icon>
          Assign Task
        </button>
      </div>
    </div>
  `,
  styles: [`
    .assign-task-dialog {
      width: 100%;
      max-width: 500px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      color: #1976d2;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      padding: 20px 0 0 0 !important;
      margin: 20px 0 0 0;
      border-top: 1px solid #e0e0e0;
    }

    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssignTaskDialogComponent {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AssignTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: TeamMember }
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['medium', Validators.required],
      category: ['development', Validators.required],
      dueDate: ['', Validators.required],
      estimatedHours: [1],
      notes: ['']
    });
  }

  assignTask(): void {
    if (this.taskForm.valid) {
      const taskData = {
        ...this.taskForm.value,
        assignedTo: this.data.member.id,
        assignedToName: `${this.data.member.firstName} ${this.data.member.lastName}`,
        assignedBy: 'current-manager', // This would come from auth service
        assignedDate: new Date(),
        status: 'assigned'
      };

      // Close dialog with task data
      this.dialogRef.close(taskData);
    }
  }
}
