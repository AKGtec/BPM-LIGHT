import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { RequestService } from '../../../../core/services/request.service';
import { WorkflowService } from '../../../../core/services/workflow.service';
import { CreateRequestDto, RequestDto, RequestType, WorkflowDto, PaginationParams } from '../../../../core/models';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule]
})
export class RequestFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  requestForm!: FormGroup;
  requestType: string = '';
  requestId: string | null = null;
  isEditMode = false;
  isSubmitting = false;
  availableWorkflows: WorkflowDto[] = [];
  loading = false;
  existingRequest: RequestDto | null = null;

  // Make RequestType enum available in template
  RequestType = RequestType;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private workflowService: WorkflowService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.requestType = params.get('type') || '';
      this.requestId = params.get('id');
      this.isEditMode = !!this.requestId;

      if (this.isEditMode) {
        this.loadExistingRequest();
      } else {
        this.loadWorkflows();
      }
    });
  }

  loadExistingRequest(): void {
    if (!this.requestId) return;

    this.loading = true;
    this.requestService.getRequestById(this.requestId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (request) => {
        this.existingRequest = request;
        this.requestType = this.getRequestTypeRoute(request.type);
        this.loadWorkflows();
      },
      error: (error) => {
        console.error('Error loading request:', error);
        this.snackBar.open('Error loading request for editing', 'Close', { duration: 3000 });
        this.router.navigate(['/requests']);
      }
    });
  }

  getRequestTypeRoute(type: RequestType): string {
    switch (type) {
      case RequestType.Leave: return 'leave';
      case RequestType.Expense: return 'expense';
      case RequestType.Training: return 'training';
      case RequestType.ITSupport: return 'it-ticket';
      case RequestType.ProfileUpdate: return 'profile-update';
      default: return 'leave';
    }
  }

  loadWorkflows(): void {
    this.loading = true;
    console.log('Loading workflows for request type:', this.requestType);

    // Try to get active workflows first, fallback to all workflows
    this.workflowService.getActiveWorkflows().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (workflows) => {
        console.log('Loaded active workflows:', workflows);
        this.availableWorkflows = workflows || [];
        this.initForm();
        this.loading = false;

        if (this.availableWorkflows.length === 0) {
          console.log('No active workflows found, trying to load all workflows...');
          this.loadAllWorkflows();
        }
      },
      error: (error) => {
        console.error('Error loading active workflows:', error);
        console.log('Falling back to loading all workflows...');
        this.loadAllWorkflows();
      }
    });
  }

  private loadAllWorkflows(): void {
    const params = { pageNumber: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' as const };

    this.workflowService.getWorkflows(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Loaded all workflows:', response);
        // Filter for active workflows
        this.availableWorkflows = (response.data || []).filter(w => w.isActive);
        console.log('Filtered active workflows:', this.availableWorkflows);
        this.initForm();
        this.loading = false;

        if (this.availableWorkflows.length === 0) {
          this.snackBar.open('Warning: No active workflows available. Request creation may fail.', 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('Error loading all workflows:', error);
        this.availableWorkflows = [];
        this.snackBar.open('Error loading workflows. Request creation may fail.', 'Close', { duration: 5000 });
        this.initForm();
        this.loading = false;
      }
    });
  }

  initForm(): void {
    // Base form with common fields for all request types
    const baseForm = {
      requestType: [this.isEditMode ? this.getRequestTypeEnum(this.requestType) : '', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required]
    };

    // Add request type specific fields
    switch (this.requestType) {
      case 'leave':
        this.requestForm = this.fb.group({
          ...baseForm,
          startDate: ['', Validators.required],
          endDate: ['', Validators.required]
        });
        break;
      case 'expense':
        this.requestForm = this.fb.group({
          ...baseForm,
          amount: ['', [Validators.required, Validators.min(0.01)]],
          receipt: [null]
        });
        break;
      case 'training':
        this.requestForm = this.fb.group({
          ...baseForm,
          courseName: ['', Validators.required],
          provider: ['', Validators.required],
          startDate: ['', Validators.required]
        });
        break;
      case 'it-ticket':
        this.requestForm = this.fb.group({
          ...baseForm,
          issue: ['', Validators.required],
          priority: ['', Validators.required]
        });
        break;
      case 'profile-update':
        this.requestForm = this.fb.group({
          ...baseForm,
          fieldToUpdate: ['', Validators.required],
          newValue: ['', Validators.required]
        });
        break;
      default:
        // Base form for when no type is selected or unknown types
        this.requestForm = this.fb.group(baseForm);
        if (this.requestType && this.requestType !== '') {
          console.warn(`Unknown request type: ${this.requestType}`);
        }
        break;
    }

    // Populate form with existing data in edit mode
    if (this.isEditMode && this.existingRequest) {
      this.populateFormWithExistingData();
    }
  }

  onRequestTypeChange(event: any): void {
    const selectedType = parseInt(event.target.value);
    if (selectedType) {
      this.requestType = this.getRequestTypeRoute(selectedType);
      // Rebuild the form with the new request type specific fields
      this.initForm();
      // Re-populate common fields that user might have already filled
      const currentTitle = this.requestForm.get('title')?.value;
      const currentDescription = this.requestForm.get('description')?.value;
      if (currentTitle) this.requestForm.get('title')?.setValue(currentTitle);
      if (currentDescription) this.requestForm.get('description')?.setValue(currentDescription);
      this.requestForm.get('requestType')?.setValue(selectedType);
    }
  }

  populateFormWithExistingData(): void {
    if (!this.existingRequest) return;

    // Populate common fields
    this.requestForm.patchValue({
      title: this.existingRequest.title,
      description: this.existingRequest.description
    });

    // Note: Request type specific fields would need to be extracted from
    // the request data or stored separately. For now, we'll just populate
    // the common fields. In a real implementation, you'd need to store
    // the original form data or extract it from the request.
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      const workflowId = this.getDefaultWorkflowId();

      // Validate that we have a valid workflow ID
      if (!workflowId || workflowId === '00000000-0000-0000-0000-000000000000') {
        this.snackBar.open('Error: No valid workflow found for this request type. Please contact administrator.', 'Close', { duration: 5000 });
        return;
      }

      this.isSubmitting = true;
      console.log('Available workflows:', this.availableWorkflows);
      console.log('Selected workflow ID:', workflowId);

      const requestData: CreateRequestDto = {
        type: this.requestForm.value.requestType || this.getRequestTypeEnum(this.requestType),
        title: this.requestForm.value.title,
        description: this.requestForm.value.description,
        workflowId: workflowId
      };

      console.log('Sending request data:', requestData);
      console.log('Request data as JSON:', JSON.stringify(requestData, null, 2));

      if (this.isEditMode && this.requestId) {
        // Update existing request
        const updateData = {
          type: requestData.type,
          title: requestData.title,
          description: requestData.description,
          status: this.existingRequest?.status || 0 // Keep existing status
        };

        this.requestService.updateRequest(this.requestId, updateData).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (response) => {
            console.log('Request updated successfully:', response);
            this.snackBar.open('Request updated successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/requests/details', this.requestId]);
          },
          error: (error) => {
            console.error('Error updating request:', error);
            this.handleSubmitError(error);
          }
        });
      } else {
        // Create new request
        this.requestService.createRequest(requestData).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (response) => {
            console.log('Request created successfully:', response);
            this.snackBar.open('Request submitted successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/requests']);
          },
          error: (error) => {
            console.error('Error creating request:', error);
            this.handleSubmitError(error);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.requestForm);
    }
  }

  private handleSubmitError(error: any): void {
    console.error('Full error object:', error);
    console.error('Error status:', error.status);
    console.error('Error statusText:', error.statusText);
    console.error('Error error:', error.error);
    console.error('Error message:', error.message);

    // Try to extract more detailed error information
    let errorMessage = 'Error processing request. Please try again.';
    let debugInfo = '';

    if (error.error) {
      if (typeof error.error === 'string') {
        debugInfo = error.error;
        if (error.error.includes('Error mapping types')) {
          errorMessage = 'Backend AutoMapper configuration error detected.';
        } else {
          errorMessage = error.error;
        }
      } else if (typeof error.error === 'object') {
        debugInfo = JSON.stringify(error.error, null, 2);
        errorMessage = 'Validation or server error occurred.';
      }
    } else if (error.status === 500) {
      errorMessage = 'Internal server error occurred.';
    }

    console.log('Debug info:', debugInfo);
    console.log('Final error message:', errorMessage);

    // Show detailed error in console for debugging
    console.group('🔍 REQUEST DEBUGGING INFO');
    console.log('Request Type:', this.requestType);
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('Available Workflows:', this.availableWorkflows);
    console.log('Error Response:', error);
    console.groupEnd();

    this.snackBar.open(errorMessage, 'Close', { duration: 8000 });
    this.isSubmitting = false;
  }

  private getRequestTypeEnum(type: string): RequestType {
    switch (type) {
      case 'leave': return RequestType.Leave;
      case 'expense': return RequestType.Expense;
      case 'training': return RequestType.Training;
      case 'it-ticket': return RequestType.ITSupport;
      case 'profile-update': return RequestType.ProfileUpdate;
      default: return RequestType.Leave;
    }
  }



  private getDefaultWorkflowId(): string {
    console.log('Getting workflow ID for request type:', this.requestType);
    console.log('Available workflows:', this.availableWorkflows.map(w => ({ id: w.id, name: w.name })));

    // Map request types to workflow names (try multiple variations)
    const workflowMapping: { [key: string]: string[] } = {
      'leave': ['Leave Request Workflow', 'Leave Workflow', 'Leave'],
      'expense': ['Expense Request Workflow', 'Expense Workflow', 'Expense'],
      'training': ['Training Request Workflow', 'Training Workflow', 'Training'],
      'it-ticket': ['IT Support Workflow', 'IT Workflow', 'ITSupport'],
      'profile-update': ['Profile Update Workflow', 'Profile Workflow', 'ProfileUpdate']
    };

    const possibleNames = workflowMapping[this.requestType] || [];

    // Try to find workflow by name (case-insensitive)
    for (const name of possibleNames) {
      const workflow = this.availableWorkflows.find(w =>
        w.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(w.name.toLowerCase())
      );
      if (workflow) {
        console.log('Found matching workflow:', workflow.name, 'ID:', workflow.id);
        return workflow.id;
      }
    }

    // Fallback to first available workflow
    if (this.availableWorkflows.length > 0) {
      console.log('Using fallback workflow:', this.availableWorkflows[0].name, 'ID:', this.availableWorkflows[0].id);
      return this.availableWorkflows[0].id;
    }

    // Last resort - this should trigger an error
    console.error('No workflows available! This will likely cause a backend error.');
    return '00000000-0000-0000-0000-000000000000';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
