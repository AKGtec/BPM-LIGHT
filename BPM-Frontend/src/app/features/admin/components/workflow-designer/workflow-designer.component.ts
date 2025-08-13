import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'condition' | 'action';
  assignedRole: string;
  order: number;
  conditions?: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  requestType: string;
  isActive: boolean;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt?: Date;
}

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
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './workflow-designer.component.html',
  styleUrls: ['./workflow-designer.component.scss'],
})
export class WorkflowDesignerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  workflows: Workflow[] = [];
  selectedWorkflow: Workflow | null = null;
  loading = false;

  displayedColumns: string[] = ['name', 'requestType', 'steps', 'status', 'actions'];

  workflowForm: FormGroup;
  stepForm: FormGroup;

  requestTypes = [
    { value: 'leave', label: 'Leave Request' },
    { value: 'expense', label: 'Expense Report' },
    { value: 'training', label: 'Training Request' },
    { value: 'equipment', label: 'Equipment Request' },
    { value: 'travel', label: 'Travel Request' }
  ];

  stepTypes = [
    { value: 'approval', label: 'Approval Step' },
    { value: 'notification', label: 'Notification' },
    { value: 'condition', label: 'Conditional Step' },
    { value: 'action', label: 'Automated Action' }
  ];

  availableRoles = [
    { value: 'Employee', label: 'Employee' },
    { value: 'Manager', label: 'Manager' },
    { value: 'HR', label: 'HR Department' },
    { value: 'Admin', label: 'Administrator' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.workflowForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      requestType: ['', [Validators.required]],
      isActive: [true]
    });

    this.stepForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      assignedRole: ['', [Validators.required]],
      order: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadWorkflows();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkflows(): void {
    this.loading = true;

    // Mock data - in real app, this would call a service
    setTimeout(() => {
      this.workflows = [
        {
          id: '1',
          name: 'Leave Request Workflow',
          description: 'Standard leave request approval process',
          requestType: 'leave',
          isActive: true,
          steps: [
            {
              id: '1',
              name: 'Manager Approval',
              type: 'approval',
              assignedRole: 'Manager',
              order: 1
            },
            {
              id: '2',
              name: 'HR Review',
              type: 'approval',
              assignedRole: 'HR',
              order: 2
            }
          ],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-01')
        },
        {
          id: '2',
          name: 'Expense Report Workflow',
          description: 'Expense report approval and processing',
          requestType: 'expense',
          isActive: true,
          steps: [
            {
              id: '3',
              name: 'Manager Review',
              type: 'approval',
              assignedRole: 'Manager',
              order: 1
            },
            {
              id: '4',
              name: 'Finance Approval',
              type: 'approval',
              assignedRole: 'Admin',
              order: 2
            }
          ],
          createdAt: new Date('2024-01-20')
        }
      ];
      this.loading = false;
    }, 1000);
  }

  createWorkflow(): void {
    this.selectedWorkflow = null;
    this.workflowForm.reset({
      isActive: true
    });
  }

  editWorkflow(workflow: Workflow): void {
    this.selectedWorkflow = workflow;
    this.workflowForm.patchValue({
      name: workflow.name,
      description: workflow.description,
      requestType: workflow.requestType,
      isActive: workflow.isActive
    });
  }

  saveWorkflow(): void {
    if (this.workflowForm.valid) {
      const formValue = this.workflowForm.value;

      if (this.selectedWorkflow) {
        // Update existing workflow
        this.selectedWorkflow.name = formValue.name;
        this.selectedWorkflow.description = formValue.description;
        this.selectedWorkflow.requestType = formValue.requestType;
        this.selectedWorkflow.isActive = formValue.isActive;
        this.selectedWorkflow.updatedAt = new Date();

        this.snackBar.open('Workflow updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        // Create new workflow
        const newWorkflow: Workflow = {
          id: Date.now().toString(),
          name: formValue.name,
          description: formValue.description,
          requestType: formValue.requestType,
          isActive: formValue.isActive,
          steps: [],
          createdAt: new Date()
        };

        this.workflows.push(newWorkflow);
        this.selectedWorkflow = newWorkflow;

        this.snackBar.open('Workflow created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    }
  }

  deleteWorkflow(workflow: Workflow): void {
    const confirmed = confirm(`Are you sure you want to delete the workflow "${workflow.name}"?`);

    if (confirmed) {
      this.workflows = this.workflows.filter(w => w.id !== workflow.id);
      if (this.selectedWorkflow?.id === workflow.id) {
        this.selectedWorkflow = null;
        this.workflowForm.reset();
      }

      this.snackBar.open('Workflow deleted successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  toggleWorkflowStatus(workflow: Workflow): void {
    workflow.isActive = !workflow.isActive;
    workflow.updatedAt = new Date();

    const status = workflow.isActive ? 'activated' : 'deactivated';
    this.snackBar.open(`Workflow ${status} successfully`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  addStep(): void {
    if (this.stepForm.valid && this.selectedWorkflow) {
      const formValue = this.stepForm.value;

      const newStep: WorkflowStep = {
        id: Date.now().toString(),
        name: formValue.name,
        type: formValue.type,
        assignedRole: formValue.assignedRole,
        order: formValue.order
      };

      this.selectedWorkflow.steps.push(newStep);
      this.selectedWorkflow.steps.sort((a, b) => a.order - b.order);
      this.selectedWorkflow.updatedAt = new Date();

      this.stepForm.reset();

      this.snackBar.open('Step added successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  removeStep(step: WorkflowStep): void {
    if (this.selectedWorkflow) {
      this.selectedWorkflow.steps = this.selectedWorkflow.steps.filter(s => s.id !== step.id);
      this.selectedWorkflow.updatedAt = new Date();

      this.snackBar.open('Step removed successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  getRequestTypeLabel(type: string): string {
    const requestType = this.requestTypes.find(rt => rt.value === type);
    return requestType ? requestType.label : type;
  }

  getStepTypeLabel(type: string): string {
    const stepType = this.stepTypes.find(st => st.value === type);
    return stepType ? stepType.label : type;
  }

  getRoleLabel(role: string): string {
    const roleObj = this.availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  trackByStepId(index: number, step: WorkflowStep): string {
    return step.id;
  }
}
