import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WorkflowService } from './core/services/workflow.service';
import { AuthService } from './core/services/auth.service';
import { WorkflowDto, PaginationParams, UserLoginDto } from './core/models';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-debug-workflows',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Debug Workflows API</h2>
      
      <button (click)="testWorkflowsAPI()" style="margin-bottom: 20px; padding: 10px;">
        Test Workflows API
      </button>

      <button (click)="testLoginAPI()" style="margin-bottom: 20px; padding: 10px; margin-left: 10px;">
        Test Login API
      </button>

      <button (click)="testRawLoginAPI()" style="margin-bottom: 20px; padding: 10px; margin-left: 10px;">
        Test Raw Login API
      </button>
      
      <div *ngIf="loading">Loading...</div>
      
      <div *ngIf="error" style="color: red; margin-bottom: 20px;">
        <h3>Error:</h3>
        <pre>{{ error | json }}</pre>
      </div>
      
      <div *ngIf="workflows.length > 0">
        <h3>Workflows ({{ totalCount }} total):</h3>
        <div *ngFor="let workflow of workflows" style="border: 1px solid #ccc; margin: 10px 0; padding: 10px;">
          <h4>{{ workflow.name }}</h4>
          <p><strong>ID:</strong> {{ workflow.id }}</p>
          <p><strong>Description:</strong> {{ workflow.description || 'No description' }}</p>
          <p><strong>Version:</strong> {{ workflow.version }}</p>
          <p><strong>Active:</strong> {{ workflow.isActive ? 'Yes' : 'No' }}</p>
          <p><strong>Created:</strong> {{ workflow.createdAt | date:'medium' }}</p>
          <p><strong>Steps:</strong> {{ workflow.steps.length }}</p>
        </div>
      </div>
      
      <div *ngIf="!loading && workflows.length === 0 && !error">
        <p>No workflows found.</p>
      </div>
      
      <div style="margin-top: 20px;">
        <h3>Authentication Info:</h3>
        <p><strong>Has Token:</strong> {{ hasToken ? 'Yes' : 'No' }}</p>
        <p><strong>Is Authenticated:</strong> {{ isAuthenticated ? 'Yes' : 'No' }}</p>
        <p><strong>Current User:</strong> {{ currentUser?.email || 'None' }}</p>
      </div>

      <div style="margin-top: 20px;">
        <h3>Raw API Response:</h3>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">{{ rawResponse | json }}</pre>
      </div>
    </div>
  `
})
export class DebugWorkflowsComponent implements OnInit {
  workflows: WorkflowDto[] = [];
  loading = false;
  error: any = null;
  totalCount = 0;
  rawResponse: any = null;
  hasToken = false;
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    // Check authentication status
    this.hasToken = !!this.authService.getToken();
    this.authService.isAuthenticated$.subscribe(auth => this.isAuthenticated = auth);
    this.authService.currentUser$.subscribe(user => this.currentUser = user);

    this.testWorkflowsAPI();
  }

  testWorkflowsAPI(): void {
    this.loading = true;
    this.error = null;
    this.workflows = [];
    this.rawResponse = null;

    const params: PaginationParams = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };

    console.log('Testing workflows API with params:', params);

    this.workflowService.getWorkflows(params).subscribe({
      next: (response) => {
        console.log('Workflows API response:', response);
        this.workflows = response.data;
        this.totalCount = response.totalCount;
        this.rawResponse = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Workflows API error:', error);
        this.error = error;
        this.loading = false;
      }
    });
  }

  testLoginAPI(): void {
    console.log('Testing login API directly...');

    const loginData: UserLoginDto = {
      userName: 'admin',
      password: 'Admin@123' // Use your actual password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Direct login API response:', response);
        console.log('isAuthSuccessful:', response.isAuthSuccessful);
        console.log('errorMessage:', response.errorMessage);
        console.log('token:', response.token);
        console.log('user:', response.user);

        alert(`Login API Response:
isAuthSuccessful: ${response.isAuthSuccessful}
errorMessage: ${response.errorMessage}
token: ${response.token ? 'Present' : 'Missing'}
user: ${response.user ? 'Present' : 'Missing'}`);
      },
      error: (error) => {
        console.error('Direct login API error:', error);
        alert(`Login API Error: ${JSON.stringify(error)}`);
      }
    });
  }

  testRawLoginAPI(): void {
    console.log('Testing raw login API...');

    const loginData = {
      userName: 'admin',
      password: 'Admin@123' // Use your actual password
    };

    const url = `${environment.apiUrl}/api/Authentication/login`;
    console.log('Making request to:', url);

    this.http.post(url, loginData).subscribe({
      next: (response: any) => {
        console.log('Raw HTTP response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));

        // Check each property individually
        console.log('isAuthSuccessful:', response.isAuthSuccessful, typeof response.isAuthSuccessful);
        console.log('errorMessage:', response.errorMessage, typeof response.errorMessage);
        console.log('token:', response.token ? 'Present' : 'Missing');
        console.log('user:', response.user ? 'Present' : 'Missing');

        alert(`Raw HTTP Response:
Type: ${typeof response}
Keys: ${Object.keys(response).join(', ')}
isAuthSuccessful: ${response.isAuthSuccessful} (${typeof response.isAuthSuccessful})
errorMessage: ${response.errorMessage}
token: ${response.token ? 'Present' : 'Missing'}
user: ${response.user ? 'Present' : 'Missing'}`);
      },
      error: (error) => {
        console.error('Raw HTTP error:', error);
        alert(`Raw HTTP Error: ${JSON.stringify(error)}`);
      }
    });
  }
}
