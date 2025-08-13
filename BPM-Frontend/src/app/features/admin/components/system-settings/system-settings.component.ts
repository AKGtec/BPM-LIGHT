import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="system-settings-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>settings</mat-icon>
            System Settings
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group>
            <!-- General Settings -->
            <mat-tab label="General">
              <div class="tab-content">
                <form [formGroup]="generalForm" (ngSubmit)="saveGeneralSettings()">
                  <div class="settings-section">
                    <h3>Application Settings</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Application Name</mat-label>
                        <input matInput formControlName="applicationName">
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Company Name</mat-label>
                        <input matInput formControlName="companyName">
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Default Language</mat-label>
                        <mat-select formControlName="defaultLanguage">
                          <mat-option value="en">English</mat-option>
                          <mat-option value="fr">French</mat-option>
                          <mat-option value="es">Spanish</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Timezone</mat-label>
                        <mat-select formControlName="timezone">
                          <mat-option value="UTC">UTC</mat-option>
                          <mat-option value="America/New_York">Eastern Time</mat-option>
                          <mat-option value="America/Los_Angeles">Pacific Time</mat-option>
                          <mat-option value="Europe/London">London</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="maintenanceMode">
                        Maintenance Mode
                      </mat-slide-toggle>
                      <p class="toggle-description">Enable maintenance mode to prevent user access during updates</p>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="settings-section">
                    <h3>Security Settings</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Session Timeout (minutes)</mat-label>
                        <input matInput type="number" formControlName="sessionTimeout" min="5" max="480">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Password Min Length</mat-label>
                        <input matInput type="number" formControlName="passwordMinLength" min="6" max="20">
                      </mat-form-field>
                    </div>

                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="requirePasswordComplexity">
                        Require Password Complexity
                      </mat-slide-toggle>
                      <p class="toggle-description">Require uppercase, lowercase, numbers, and special characters</p>
                    </div>

                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="enableTwoFactor">
                        Enable Two-Factor Authentication
                      </mat-slide-toggle>
                      <p class="toggle-description">Require 2FA for all admin users</p>
                    </div>
                  </div>

                  <div class="actions">
                    <button type="submit" mat-raised-button color="primary">
                      <mat-icon>save</mat-icon>
                      Save General Settings
                    </button>
                  </div>
                </form>
              </div>
            </mat-tab>

            <!-- Notification Settings -->
            <mat-tab label="Notifications">
              <div class="tab-content">
                <form [formGroup]="notificationForm" (ngSubmit)="saveNotificationSettings()">
                  <div class="settings-section">
                    <h3>Email Notifications</h3>
                    
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>SMTP Server</mat-label>
                        <input matInput formControlName="smtpServer">
                      </mat-form-field>
                    </div>

                    <div class="form-row">
                      <mat-form-field appearance="outline">
                        <mat-label>SMTP Port</mat-label>
                        <input matInput type="number" formControlName="smtpPort">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>From Email</mat-label>
                        <input matInput type="email" formControlName="fromEmail">
                      </mat-form-field>
                    </div>

                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="enableEmailNotifications">
                        Enable Email Notifications
                      </mat-slide-toggle>
                      <p class="toggle-description">Send email notifications for workflow events</p>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="settings-section">
                    <h3>System Notifications</h3>
                    
                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="notifyOnRequestSubmission">
                        Request Submission
                      </mat-slide-toggle>
                      <p class="toggle-description">Notify managers when new requests are submitted</p>
                    </div>

                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="notifyOnRequestApproval">
                        Request Approval
                      </mat-slide-toggle>
                      <p class="toggle-description">Notify requesters when their requests are approved/rejected</p>
                    </div>

                    <div class="toggle-section">
                      <mat-slide-toggle formControlName="notifyOnOverdueRequests">
                        Overdue Requests
                      </mat-slide-toggle>
                      <p class="toggle-description">Send reminders for overdue approval requests</p>
                    </div>
                  </div>

                  <div class="actions">
                    <button type="submit" mat-raised-button color="primary">
                      <mat-icon>save</mat-icon>
                      Save Notification Settings
                    </button>
                  </div>
                </form>
              </div>
            </mat-tab>

            <!-- Backup & Maintenance -->
            <mat-tab label="Backup">
              <div class="tab-content">
                <div class="settings-section">
                  <h3>Database Backup</h3>
                  
                  <div class="backup-info">
                    <p><strong>Last Backup:</strong> {{lastBackupDate | date:'full'}}</p>
                    <p><strong>Backup Size:</strong> {{lastBackupSize}}</p>
                    <p><strong>Status:</strong> <span class="backup-status success">Healthy</span></p>
                  </div>

                  <div class="backup-actions">
                    <button mat-raised-button color="primary" (click)="createBackup()">
                      <mat-icon>backup</mat-icon>
                      Create Backup Now
                    </button>
                    <button mat-button (click)="downloadBackup()">
                      <mat-icon>download</mat-icon>
                      Download Latest Backup
                    </button>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="settings-section">
                  <h3>System Maintenance</h3>
                  
                  <div class="maintenance-actions">
                    <button mat-raised-button (click)="clearCache()">
                      <mat-icon>clear_all</mat-icon>
                      Clear Cache
                    </button>
                    <button mat-raised-button (click)="optimizeDatabase()">
                      <mat-icon>tune</mat-icon>
                      Optimize Database
                    </button>
                    <button mat-raised-button color="warn" (click)="restartSystem()">
                      <mat-icon>restart_alt</mat-icon>
                      Restart System
                    </button>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .system-settings-container {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab-content {
      padding: 1rem 0;
    }

    .settings-section {
      margin-bottom: 2rem;
    }

    .settings-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .toggle-section {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .toggle-description {
      margin: 0.5rem 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .backup-info {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .backup-info p {
      margin: 0.5rem 0;
    }

    .backup-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .backup-status.success {
      background-color: #d4edda;
      color: #155724;
    }

    .backup-actions,
    .maintenance-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }

      .backup-actions,
      .maintenance-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  generalForm!: FormGroup;
  notificationForm!: FormGroup;
  
  lastBackupDate = new Date();
  lastBackupSize = '2.3 GB';

  constructor(
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  initForms(): void {
    this.generalForm = this.fb.group({
      applicationName: ['BPM Light', Validators.required],
      companyName: ['Your Company', Validators.required],
      defaultLanguage: ['en'],
      timezone: ['UTC'],
      maintenanceMode: [false],
      sessionTimeout: [60, [Validators.min(5), Validators.max(480)]],
      passwordMinLength: [8, [Validators.min(6), Validators.max(20)]],
      requirePasswordComplexity: [true],
      enableTwoFactor: [false]
    });

    this.notificationForm = this.fb.group({
      smtpServer: ['smtp.company.com'],
      smtpPort: [587],
      fromEmail: ['noreply@company.com', Validators.email],
      enableEmailNotifications: [true],
      notifyOnRequestSubmission: [true],
      notifyOnRequestApproval: [true],
      notifyOnOverdueRequests: [true]
    });
  }

  loadSettings(): void {
    // In a real application, load settings from the backend
    console.log('Loading system settings...');
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      this.snackBar.open('General settings saved successfully', 'Close', { duration: 3000 });
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationForm.valid) {
      this.snackBar.open('Notification settings saved successfully', 'Close', { duration: 3000 });
    }
  }

  createBackup(): void {
    this.snackBar.open('Creating backup...', 'Close', { duration: 3000 });
  }

  downloadBackup(): void {
    this.snackBar.open('Downloading backup...', 'Close', { duration: 3000 });
  }

  clearCache(): void {
    this.snackBar.open('Cache cleared successfully', 'Close', { duration: 3000 });
  }

  optimizeDatabase(): void {
    this.snackBar.open('Database optimization started', 'Close', { duration: 3000 });
  }

  restartSystem(): void {
    this.snackBar.open('System restart initiated', 'Close', { duration: 3000 });
  }
}
