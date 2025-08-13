import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

import { Employee } from '../../../../core/models';

@Component({
  selector: 'app-employee-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="employee-details-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <div class="title-content">
          <div class="employee-avatar">
            {{getInitials(employee.firstName, employee.lastName)}}
          </div>
          <div class="title-info">
            <span>{{employee.firstName}} {{employee.lastName}}</span>
            <small>{{employee.position}} - {{employee.department}}</small>
          </div>
        </div>
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <mat-tab-group>
            <!-- Personal Information Tab -->
            <mat-tab label="Personal Info">
              <div class="tab-content">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>person</mat-icon>
                      Personal Information
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-grid">
                      <div class="info-item">
                        <label>Full Name</label>
                        <span>{{employee.firstName}} {{employee.lastName}}</span>
                      </div>
                      <div class="info-item">
                        <label>Email</label>
                        <span>{{employee.email}}</span>
                      </div>
                      <div class="info-item">
                        <label>Phone Number</label>
                        <span>{{employee.phoneNumber || 'Not provided'}}</span>
                      </div>
                      <div class="info-item">
                        <label>Emergency Contact</label>
                        <span>{{employee.emergencyContact || 'Not provided'}}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Employment Information Tab -->
            <mat-tab label="Employment">
              <div class="tab-content">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>work</mat-icon>
                      Employment Details
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-grid">
                      <div class="info-item">
                        <label>Employee ID</label>
                        <span>{{employee.id}}</span>
                      </div>
                      <div class="info-item">
                        <label>Department</label>
                        <span>{{employee.department}}</span>
                      </div>
                      <div class="info-item">
                        <label>Position</label>
                        <span>{{employee.position}}</span>
                      </div>
                      <div class="info-item">
                        <label>Manager</label>
                        <span>{{employee.manager || 'Not assigned'}}</span>
                      </div>
                      <div class="info-item">
                        <label>Hire Date</label>
                        <span>{{employee.hireDate | date:'mediumDate'}}</span>
                      </div>
                      <div class="info-item">
                        <label>Status</label>
                        <mat-chip [class]="getStatusClass(employee.status)">
                          {{employee.status}}
                        </mat-chip>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Roles & Permissions Tab -->
            <mat-tab label="Roles">
              <div class="tab-content">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>admin_panel_settings</mat-icon>
                      Roles & Permissions
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="roles-section">
                      <div class="info-item">
                        <label>Assigned Roles</label>
                        <div class="roles-chips">
                          <mat-chip *ngFor="let role of employee.roles" class="role-chip">
                            {{role}}
                          </mat-chip>
                          <span *ngIf="employee.roles.length === 0" class="no-roles">
                            No roles assigned
                          </span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>

            <!-- Activity Tab -->
            <mat-tab label="Activity">
              <div class="tab-content">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon>history</mat-icon>
                      Recent Activity
                    </mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-grid">
                      <div class="info-item">
                        <label>Last Login</label>
                        <span>{{employee.lastLoginAt ? (employee.lastLoginAt | date:'medium') : 'Never'}}</span>
                      </div>
                      <div class="info-item">
                        <label>Account Created</label>
                        <span>{{employee.createdAt | date:'mediumDate'}}</span>
                      </div>
                      <div class="info-item">
                        <label>Last Updated</label>
                        <span>{{employee.updatedAt ? (employee.updatedAt | date:'medium') : 'Never'}}</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="editEmployee()">
          <mat-icon>edit</mat-icon>
          Edit Employee
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .employee-details-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    .dialog-title {
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .title-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .employee-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.5rem;
    }

    .title-info {
      display: flex;
      flex-direction: column;
    }

    .title-info span {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
    }

    .title-info small {
      color: #666;
      margin-top: 0.25rem;
    }

    .dialog-content {
      padding: 0;
      max-height: 70vh;
      overflow-y: auto;
    }

    .tab-content {
      padding: 1.5rem;
    }

    .info-card {
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      font-size: 1rem;
      color: #333;
    }

    .roles-section {
      margin-top: 1rem;
    }

    .roles-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .role-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .no-roles {
      color: #999;
      font-style: italic;
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

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class EmployeeDetailsDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<EmployeeDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly employee: Employee
  ) {}

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  editEmployee(): void {
    this.dialogRef.close({ action: 'edit', employee: this.employee });
  }
}
