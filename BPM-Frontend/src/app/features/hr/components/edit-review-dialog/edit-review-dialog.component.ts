import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { 
  PerformanceReviewService, 
  PerformanceReview,
  UpdatePerformanceReviewDto,
  ReviewType, 
  ReviewPriority 
} from '../../../../core/services/performance-review.service';
import { UserService, UserProfileDto } from '../../../../core/services/user.service';
import { UserDto } from '../../../../core/models';

@Component({
  selector: 'app-edit-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCardModule
  ],
  template: `
    <div class="edit-review-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>edit</mat-icon>
        Edit Performance Review
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <!-- Loading State -->
          <div *ngIf="isLoadingEmployees" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading employees...</p>
          </div>

          <!-- Form -->
          <form [formGroup]="reviewForm" class="review-form" *ngIf="!isLoadingEmployees">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Review Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter review title">
                <mat-error *ngIf="reviewForm.get('title')?.hasError('required')">
                  Review title is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Employee</mat-label>
                <mat-select formControlName="employeeId" (selectionChange)="onEmployeeChange($event)">
                  <mat-option *ngFor="let employee of employees" [value]="getEmployeeId(employee)">
                    {{ getEmployeeName(employee) }} - {{ getEmployeeEmail(employee) }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="reviewForm.get('employeeId')?.hasError('required')">
                  Please select an employee
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Review Type</mat-label>
                <mat-select formControlName="reviewType">
                  <mat-option [value]="ReviewType.Annual">Annual Review</mat-option>
                  <mat-option [value]="ReviewType.Quarterly">Quarterly Review</mat-option>
                  <mat-option [value]="ReviewType.Probationary">Probationary Review</mat-option>
                  <mat-option [value]="ReviewType.Project">Project Review</mat-option>
                  <mat-option [value]="ReviewType.ThreeSixty">360-Degree Review</mat-option>
                  <mat-option [value]="ReviewType.MidYear">Mid-Year Review</mat-option>
                </mat-select>
                <mat-error *ngIf="reviewForm.get('reviewType')?.hasError('required')">
                  Please select a review type
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Due Date</mat-label>
                <input matInput [matDatepicker]="dueDatePicker" formControlName="dueDate">
                <mat-datepicker-toggle matSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #dueDatePicker></mat-datepicker>
                <mat-error *ngIf="reviewForm.get('dueDate')?.hasError('required')">
                  Due date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority">
                  <mat-option [value]="ReviewPriority.Low">Low</mat-option>
                  <mat-option [value]="ReviewPriority.Medium">Medium</mat-option>
                  <mat-option [value]="ReviewPriority.High">High</mat-option>
                  <mat-option [value]="ReviewPriority.Critical">Critical</mat-option>
                </mat-select>
                <mat-error *ngIf="reviewForm.get('priority')?.hasError('required')">
                  Please select a priority
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" 
                         placeholder="Enter review description"></textarea>
                <mat-error *ngIf="reviewForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Goals Section -->
            <div class="goals-section">
              <div class="section-header">
                <h3>Performance Goals</h3>
                <button mat-button color="primary" type="button" (click)="addGoal()">
                  <mat-icon>add</mat-icon>
                  Add Goal
                </button>
              </div>

              <div formArrayName="goals" class="goals-list">
                <div *ngFor="let goal of goalsArray.controls; let i = index" 
                     [formGroupName]="i" class="goal-item">
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Goal {{ i + 1 }}</mat-card-title>
                      <button mat-icon-button color="warn" type="button" 
                              (click)="removeGoal(i)" [disabled]="goalsArray.length <= 1">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-card-header>
                    <mat-card-content>
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Goal Description</mat-label>
                        <textarea matInput formControlName="description" rows="3" 
                                 placeholder="Describe the performance goal..."></textarea>
                        <mat-error *ngIf="goal.get('description')?.hasError('required')">
                          Goal description is required
                        </mat-error>
                      </mat-form-field>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>

            <!-- Selected Employee Info -->
            <mat-card *ngIf="selectedEmployee" class="employee-info-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>person</mat-icon>
                  Employee Information
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="employee-details">
                  <p><strong>Name:</strong> {{ getEmployeeName(selectedEmployee) }}</p>
                  <p><strong>Email:</strong> {{ getEmployeeEmail(selectedEmployee) }}</p>
                  <p *ngIf="getEmployeeDepartment(selectedEmployee)">
                    <strong>Department:</strong> {{ getEmployeeDepartment(selectedEmployee) }}
                  </p>
                  <p *ngIf="getEmployeePhone(selectedEmployee)">
                    <strong>Phone:</strong> {{ getEmployeePhone(selectedEmployee) }}
                  </p>
                </div>
              </mat-card-content>
            </mat-card>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isSubmitting">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSave()" 
                [disabled]="reviewForm.invalid || isSubmitting">
          <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
          <span *ngIf="!isSubmitting">Update Review</span>
          <span *ngIf="isSubmitting">Updating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .edit-review-dialog {
      width: 100%;
      max-width: 800px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
      margin: 0;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-content {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #666;
    }

    .loading-container p {
      margin-top: 1rem;
    }

    .review-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 0.5rem);
    }

    .goals-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-header h3 {
      margin: 0;
      color: #1976d2;
      font-weight: 600;
    }

    .goals-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .goal-item mat-card {
      border: 1px solid #e0e0e0;
    }

    .goal-item mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f5f5f5;
      padding: 1rem;
    }

    .goal-item mat-card-title {
      margin: 0;
      font-size: 1rem;
      color: #333;
    }

    .employee-info-card {
      margin-top: 1rem;
      background-color: #f5f5f5;
    }

    .employee-info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1976d2;
    }

    .employee-details p {
      margin: 0.5rem 0;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .form-row {
        flex-direction: column;
      }

      .half-width {
        width: 100%;
      }

      .dialog-content {
        padding: 1rem;
      }
    }
  `]
})
export class EditReviewDialogComponent implements OnInit {
  reviewForm: FormGroup;
  employees: (UserDto | UserProfileDto)[] = [];
  selectedEmployee: UserDto | UserProfileDto | null = null;
  isLoadingEmployees = false;
  isSubmitting = false;

  // Expose enums to template
  ReviewType = ReviewType;
  ReviewPriority = ReviewPriority;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { review: PerformanceReview },
    private performanceReviewService: PerformanceReviewService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.populateForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      employeeId: ['', Validators.required],
      reviewType: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: [ReviewPriority.Medium, Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      goals: this.fb.array([this.createGoalFormGroup()])
    });
  }

  private createGoalFormGroup(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required]
    });
  }

  private populateForm(): void {
    if (this.data.review) {
      const review = this.data.review;
      
      this.reviewForm.patchValue({
        title: review.title,
        employeeId: review.employeeId,
        reviewType: review.reviewType,
        dueDate: new Date(review.dueDate),
        priority: review.priority,
        description: review.description
      });

      // Populate goals
      const goalsArray = this.goalsArray;
      goalsArray.clear();
      
      if (review.goals && review.goals.length > 0) {
        review.goals.forEach(goalDescription => {
          goalsArray.push(this.fb.group({
            description: [goalDescription, Validators.required]
          }));
        });
      } else {
        // Add at least one empty goal
        goalsArray.push(this.createGoalFormGroup());
      }
    }
  }

  get goalsArray(): FormArray {
    return this.reviewForm.get('goals') as FormArray;
  }

  addGoal(): void {
    this.goalsArray.push(this.createGoalFormGroup());
  }

  removeGoal(index: number): void {
    if (this.goalsArray.length > 1) {
      this.goalsArray.removeAt(index);
    }
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    
    this.userService.getUsers().subscribe({
      next: (users: UserDto[]) => {
        this.employees = users;
        this.isLoadingEmployees = false;
        
        // Set selected employee if editing
        if (this.data.review) {
          this.selectedEmployee = this.employees.find(emp => 
            this.getEmployeeId(emp) === this.data.review.employeeId
          ) || null;
        }
      },
      error: (error: any) => {
        console.error('Error loading employees:', error);
        this.isLoadingEmployees = false;
        this.snackBar.open('Error loading employees. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onEmployeeChange(event: any): void {
    const employeeId = event.value;
    this.selectedEmployee = this.employees.find(emp => this.getEmployeeId(emp) === employeeId) || null;
  }

  // Helper methods to handle both UserDto and UserProfileDto property naming conventions
  getEmployeeId(employee: UserDto | UserProfileDto): string {
    if ('Id' in employee && employee.Id) {
      return employee.Id;
    }
    return employee.id || '';
  }

  getEmployeeName(employee: UserDto | UserProfileDto): string {
    const firstName = ('FirstName' in employee && employee.FirstName) || employee.firstName || '';
    const lastName = ('LastName' in employee && employee.LastName) || employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || employee.userName || ('UserName' in employee && employee.UserName) || 'Unknown';
  }

  getEmployeeEmail(employee: UserDto | UserProfileDto): string {
    return ('Email' in employee && employee.Email) || employee.email || '';
  }

  getEmployeeDepartment(employee: UserDto | UserProfileDto): string {
    // Only UserProfileDto has department property
    return ('department' in employee && employee.department) || '';
  }

  getEmployeePhone(employee: UserDto | UserProfileDto): string {
    return ('PhoneNumber' in employee && employee.PhoneNumber) || employee.phoneNumber || '';
  }

  onSave(): void {
    if (this.reviewForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValue = this.reviewForm.value;
      
      // Extract goals as string array
      const goals = this.goalsArray.controls
        .map(control => control.get('description')?.value)
        .filter(goal => goal && goal.trim() !== '');
      
      const updateDto: UpdatePerformanceReviewDto = {
        title: formValue.title,
        reviewType: formValue.reviewType,
        dueDate: formValue.dueDate,
        priority: formValue.priority,
        description: formValue.description,
        goals: goals.length > 0 ? goals : undefined
      };

      this.performanceReviewService.updatePerformanceReview(this.data.review.id, updateDto).subscribe({
        next: (updatedReview) => {
          this.isSubmitting = false;
          this.dialogRef.close(updatedReview);
        },
        error: (error) => {
          console.error('Error updating performance review:', error);
          this.isSubmitting = false;
          this.snackBar.open('Error updating performance review. Please try again.', 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}