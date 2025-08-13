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
  CreatePerformanceReviewDto,
  ReviewType, 
  ReviewPriority 
} from '../../../../core/services/performance-review.service';
import { UserService, UserProfileDto } from '../../../../core/services/user.service';
import { UserDto } from '../../../../core/models';



@Component({
  selector: 'app-create-review-dialog',
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
    <div class="create-review-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>add_circle</mat-icon>
        Create Performance Review
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
                  <mat-option *ngFor="let employee of employees" [value]="employee.id || employee.Id">
                    {{ (employee.firstName || employee.FirstName) }} {{ (employee.lastName || employee.LastName) }} - {{ (employee.email || employee.Email) }}
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
                <input matInput [matDatepicker]="duePicker" formControlName="dueDate">
                <mat-datepicker-toggle matIconSuffix [for]="duePicker"></mat-datepicker-toggle>
                <mat-datepicker #duePicker></mat-datepicker>
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
                <mat-label>Review Description</mat-label>
                <textarea matInput formControlName="description" 
                         placeholder="Enter review description and objectives" rows="4"></textarea>
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
                        <textarea matInput formControlName="description" 
                                 placeholder="Describe the goal and success criteria" rows="2"></textarea>
                      </mat-form-field>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>

            <!-- Selected Employee Info -->
            <div class="employee-info" *ngIf="selectedEmployee">
              <h4>Selected Employee Information</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name:</label>
                  <span>{{ (selectedEmployee.firstName || selectedEmployee.FirstName) }} {{ (selectedEmployee.lastName || selectedEmployee.LastName) }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ (selectedEmployee.email || selectedEmployee.Email) }}</span>
                </div>
                <div class="info-item">
                  <label>Username:</label>
                  <span>{{ (selectedEmployee.userName || selectedEmployee.UserName) }}</span>
                </div>
                <div class="info-item">
                  <label>Phone:</label>
                  <span>{{ (selectedEmployee.phoneNumber || selectedEmployee.PhoneNumber) || 'Not specified' }}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="isCreating">
          Cancel
        </button>
        <button mat-raised-button color="primary" 
                (click)="onCreate()"
                [disabled]="reviewForm.invalid || isCreating || isLoadingEmployees">
          <mat-spinner diameter="20" *ngIf="isCreating"></mat-spinner>
          <span *ngIf="!isCreating">Create Review</span>
          <span *ngIf="isCreating">Creating...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-review-dialog {
      width: 900px;
      max-width: 95vw;
      max-height: 90vh;
      overflow: hidden;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      padding: 1.5rem 0 1rem 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
    }

    .dialog-title mat-icon {
      color: #007bff;
      font-size: 1.75rem;
      width: 1.75rem;
      height: 1.75rem;
    }

    .dialog-content {
      padding: 1.5rem 0;
      min-height: 400px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
    }

    .loading-container p {
      color: #666;
      margin: 0;
    }

    .review-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0 0.5rem;
    }

    .form-row {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 0.75rem);
      min-width: 200px;
    }

    .employee-info {
      width: 100%;
      padding: 1.5rem;
      background-color: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
      margin-top: 0.5rem;
    }

    .employee-info h4 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item span {
      color: #333;
    }

    .goals-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0 0.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 2px solid #e9ecef;
    }

    .section-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .goals-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .goal-item mat-card {
      margin: 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .goal-item mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    .goal-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0.5rem;
    }

    .weight-slider {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .weight-slider label {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .criteria-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0 0.5rem;
    }

    .criteria-section h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e9ecef;
    }

    .criteria-note {
      color: #666;
      font-style: italic;
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .criteria-category {
      margin-bottom: 1.5rem;
    }

    .category-weight {
      color: #666;
      font-size: 0.9rem;
      font-weight: normal;
    }

    .criteria-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .criterion-item {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .criterion-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .criterion-info p {
      margin: 0 0 0.5rem 0;
      color: #666;
    }

    .max-score {
      color: #1976d2;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .no-template {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-template mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .settings-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 0 0.5rem;
    }

    .settings-section h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e9ecef;
    }

    .settings-group {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      background-color: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .settings-group h4 {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    mat-dialog-actions {
      padding: 1.5rem 0 0 0;
      margin: 0;
      border-top: 1px solid #e9ecef;
      background-color: #f8f9fa;
      gap: 1rem;
    }

    mat-dialog-actions button {
      min-width: 100px;
    }

    /* Scrollbar styling for dialog content */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    @media (max-width: 768px) {
      .create-review-dialog {
        width: 95vw;
        max-width: none;
        height: 90vh;
      }

      .dialog-content {
        max-height: 60vh;
        padding: 1rem 0;
      }

      .form-row {
        flex-direction: column;
        gap: 1rem;
      }

      .half-width {
        width: 100%;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .goals-list {
        max-height: 300px;
      }

      mat-dialog-actions {
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      mat-dialog-actions button {
        min-width: 80px;
        flex: 1;
      }
    }

    @media (max-width: 480px) {
      .create-review-dialog {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }

      .dialog-content {
        max-height: 55vh;
      }

      .review-form,
      .goals-section,
      .criteria-section,
      .settings-section {
        padding: 0;
      }
    }
  `]
})
export class CreateReviewDialogComponent implements OnInit {
  reviewForm: FormGroup;
  isCreating = false;
  isLoadingEmployees = false;
  selectedEmployee: UserDto | null = null;
  employees: UserDto[] = [];

  // Expose enums to template
  ReviewType = ReviewType;
  ReviewPriority = ReviewPriority;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateReviewDialogComponent>,
    private performanceReviewService: PerformanceReviewService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required]],
      employeeId: ['', [Validators.required]],
      reviewType: [ReviewType.Annual, [Validators.required]],
      dueDate: ['', [Validators.required]],
      priority: [ReviewPriority.Medium, [Validators.required]],
      description: [''],
      goals: this.fb.array([this.createGoalFormGroup()])
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    
    // Watch for employee selection changes
    this.reviewForm.get('employeeId')?.valueChanges.subscribe(employeeId => {
      this.selectedEmployee = this.employees.find(emp => 
        (emp.id || emp.Id) === employeeId
      ) || null;
    });
  }

  private loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.userService.getUsers().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.isLoadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.snackBar.open('Failed to load employees', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingEmployees = false;
      }
    });
  }

  get goalsArray(): FormArray {
    return this.reviewForm.get('goals') as FormArray;
  }

  createGoalFormGroup(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required]]
    });
  }

  addGoal(): void {
    this.goalsArray.push(this.createGoalFormGroup());
  }

  removeGoal(index: number): void {
    if (this.goalsArray.length > 1) {
      this.goalsArray.removeAt(index);
    }
  }

  onEmployeeChange(event: any): void {
    const employeeId = event.value;
    this.selectedEmployee = this.employees.find(emp => 
      (emp.id || emp.Id) === employeeId
    ) || null;
  }

  onCreate(): void {
    if (this.reviewForm.valid) {
      this.isCreating = true;

      // Extract goals as string array
      const goals = this.goalsArray.controls
        .map(control => control.get('description')?.value)
        .filter(goal => goal && goal.trim() !== '');

      // Format date for backend
      const dueDate = new Date(this.reviewForm.get('dueDate')?.value);
      const formattedDueDate = dueDate.toISOString();

      const createReviewDto: CreatePerformanceReviewDto = {
        title: this.reviewForm.get('title')?.value,
        employeeId: this.reviewForm.get('employeeId')?.value,
        reviewType: this.reviewForm.get('reviewType')?.value,
        dueDate: formattedDueDate,
        priority: this.reviewForm.get('priority')?.value,
        description: this.reviewForm.get('description')?.value || undefined,
        goals: goals.length > 0 ? goals : undefined
      };

      this.performanceReviewService.createPerformanceReview(createReviewDto).subscribe({
        next: (createdReview) => {
          this.isCreating = false;
          this.snackBar.open('Performance review created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(createdReview);
        },
        error: (error) => {
          console.error('Error creating performance review:', error);
          this.isCreating = false;
          this.snackBar.open('Failed to create performance review. Please try again.', 'Close', {
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