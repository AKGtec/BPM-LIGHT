import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { WorkflowService } from '../../../../core/services/workflow.service';
import {
  WorkflowDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  CreateWorkflowStepDto,
} from '../../../../core/models';

@Component({
  selector: 'app-workflow-designer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <div class="workflow-designer-container">
      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <!-- Designer Form -->
      <div *ngIf="!loading">
        <form [formGroup]="workflowForm" (ngSubmit)="onSubmit()">
          <!-- Workflow Basic Info -->
          <mat-card class="workflow-info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>settings</mat-icon>
                {{ isEditMode ? 'Edit Workflow' : 'Create New Workflow' }}
              </mat-card-title>
            </mat-card-header>

            <mat-card-content>
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Workflow Name</mat-label>
                  <input
                    matInput
                    formControlName="name"
                    placeholder="Enter workflow name"
                  />
                  <mat-error
                    *ngIf="workflowForm.get('name')?.hasError('required')"
                  >
                    Workflow name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea
                    matInput
                    formControlName="description"
                    rows="3"
                    placeholder="Describe this workflow"
                  ></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Version</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="version"
                    min="1"
                  />
                </mat-form-field>

                <mat-checkbox formControlName="isActive">
                  Active Workflow
                </mat-checkbox>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Workflow Steps -->
          <mat-card class="workflow-steps-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>timeline</mat-icon>
                Workflow Steps
              </mat-card-title>
              <div class="header-actions">
                <button
                  type="button"
                  mat-raised-button
                  color="accent"
                  (click)="addStep()"
                >
                  <mat-icon>add</mat-icon>
                  Add Step
                </button>
              </div>
            </mat-card-header>

            <mat-card-content>
              <div formArrayName="steps">
                <div
                  *ngFor="let stepControl of stepsArray.controls; let i = index"
                  [formGroupName]="i"
                  class="step-item"
                >
                  <div class="step-header">
                    <h4>Step {{ i + 1 }}</h4>
                    <button
                      type="button"
                      mat-icon-button
                      color="warn"
                      (click)="removeStep(i)"
                      [disabled]="stepsArray.length <= 1"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="step-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Step Name</mat-label>
                        <input
                          matInput
                          formControlName="stepName"
                          placeholder="Enter step name"
                        />
                        <mat-error
                          *ngIf="
                            stepControl.get('stepName')?.hasError('required')
                          "
                        >
                          Step name is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Order</mat-label>
                        <input
                          matInput
                          type="number"
                          formControlName="order"
                          min="1"
                          [value]="i + 1"
                          readonly
                        />
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Responsible Role</mat-label>
                        <mat-select formControlName="responsibleRole">
                          <mat-option value="Employee">Employee</mat-option>
                          <mat-option value="Manager">Manager</mat-option>
                          <mat-option value="HR">HR</mat-option>
                          <mat-option value="Admin">Admin</mat-option>
                        </mat-select>
                        <mat-error
                          *ngIf="
                            stepControl
                              .get('responsibleRole')
                              ?.hasError('required')
                          "
                        >
                          Responsible role is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Due in Hours (Optional)</mat-label>
                        <input
                          matInput
                          type="number"
                          formControlName="dueInHours"
                          min="1"
                          placeholder="24"
                        />
                      </mat-form-field>
                    </div>
                  </div>

                  <mat-divider *ngIf="i < stepsArray.length - 1"></mat-divider>
                </div>

                <div *ngIf="stepsArray.length === 0" class="no-steps">
                  <mat-icon>info</mat-icon>
                  <p>
                    No steps added yet. Click "Add Step" to create your first
                    workflow step.
                  </p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="actions-section">
            <button type="button" mat-button routerLink="/workflows">
              <mat-icon>cancel</mat-icon>
              Cancel
            </button>
            <button
              type="submit"
              mat-raised-button
              color="primary"
              [disabled]="workflowForm.invalid || isSubmitting"
            >
              <mat-icon>save</mat-icon>
              {{ isEditMode ? 'Update Workflow' : 'Create Workflow' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .workflow-designer-container {
        padding: 1rem;
        max-width: 1000px;
        margin: 0 auto;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }

      .workflow-info-card,
      .workflow-steps-card {
        margin-bottom: 1rem;
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: flex-start;
      }

      .full-width {
        width: 100%;
      }

      .step-item {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background-color: #fafafa;
      }

      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .step-header h4 {
        margin: 0;
        color: #333;
      }

      .step-form {
        background-color: white;
        padding: 1rem;
        border-radius: 4px;
      }

      .no-steps {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .no-steps mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        margin-bottom: 0.5rem;
        color: #ff9800;
      }

      .actions-section {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 8px;
        margin-top: 1rem;
      }

      @media (max-width: 768px) {
        .form-row {
          flex-direction: column;
        }

        .actions-section {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class WorkflowDesignerComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  workflowForm!: FormGroup;
  loading = false;
  isSubmitting = false;
  isEditMode = false;
  workflowId?: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly workflowService: WorkflowService,
    private readonly snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.workflowId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.workflowId;

    if (this.isEditMode) {
      this.loadWorkflow();
    } else {
      this.addStep(); // Add initial step for new workflows
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get stepsArray(): FormArray {
    return this.workflowForm.get('steps') as FormArray;
  }

  initForm(): void {
    this.workflowForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      version: [1, [Validators.required, Validators.min(1)]],
      isActive: [true],
      steps: this.fb.array([]),
    });
  }

  createStepFormGroup(step?: any): FormGroup {
    return this.fb.group({
      stepName: [step?.stepName || '', Validators.required],
      order: [step?.order || this.stepsArray.length + 1],
      responsibleRole: [step?.responsibleRole || '', Validators.required],
      dueInHours: [step?.dueInHours || null],
    });
  }

  addStep(): void {
    const stepGroup = this.createStepFormGroup();
    this.stepsArray.push(stepGroup);
    this.updateStepOrders();
  }

  removeStep(index: number): void {
    if (this.stepsArray.length > 1) {
      this.stepsArray.removeAt(index);
      this.updateStepOrders();
    }
  }

  updateStepOrders(): void {
    this.stepsArray.controls.forEach((control, index) => {
      control.get('order')?.setValue(index + 1);
    });
  }

  loadWorkflow(): void {
    if (!this.workflowId) return;

    this.loading = true;
    this.workflowService
      .getWorkflowWithSteps(this.workflowId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workflow) => {
          this.populateForm(workflow);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading workflow:', error);
          this.snackBar.open('Error loading workflow', 'Close', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
  }

  populateForm(workflow: WorkflowDto): void {
    this.workflowForm.patchValue({
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      isActive: workflow.isActive,
    });

    // Clear existing steps
    while (this.stepsArray.length !== 0) {
      this.stepsArray.removeAt(0);
    }

    // Add workflow steps
    if (workflow.steps && workflow.steps.length > 0) {
      const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order);
      sortedSteps.forEach((step) => {
        this.stepsArray.push(this.createStepFormGroup(step));
      });
    } else {
      this.addStep(); // Add at least one step
    }
  }

  onSubmit(): void {
    if (this.workflowForm.invalid) {
      this.markFormGroupTouched(this.workflowForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.workflowForm.value;

    const steps: CreateWorkflowStepDto[] = formValue.steps.map(
      (step: any, index: number) => ({
        stepName: step.stepName,
        order: index + 1,
        responsibleRole: step.responsibleRole,
        dueInHours: step.dueInHours || undefined,
      })
    );

    if (this.isEditMode && this.workflowId) {
      const updateData: UpdateWorkflowDto = {
        name: formValue.name,
        description: formValue.description,
        version: formValue.version,
        isActive: formValue.isActive,
      };

      this.workflowService
        .updateWorkflow(this.workflowId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Workflow updated successfully!', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/workflows']);
          },
          error: (error) => {
            console.error('Error updating workflow:', error);
            this.snackBar.open('Error updating workflow', 'Close', {
              duration: 3000,
            });
            this.isSubmitting = false;
          },
        });
    } else {
      const createData: CreateWorkflowDto = {
        name: formValue.name,
        description: formValue.description,
        version: formValue.version,
        isActive: formValue.isActive,
        steps: steps,
      };

      this.workflowService
        .createWorkflow(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Workflow created successfully!', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/workflows']);
          },
          error: (error) => {
            console.error('Error creating workflow:', error);
            this.snackBar.open('Error creating workflow', 'Close', {
              duration: 3000,
            });
            this.isSubmitting = false;
          },
        });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }
}
