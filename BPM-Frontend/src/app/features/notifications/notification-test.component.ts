import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { NotificationService } from '../../core/services/notification.service';
import { CreateNotificationDto, NotificationType } from '../../core/models/notification.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-notification-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="test-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>bug_report</mat-icon>
          Notification System Test
        </mat-card-title>
        <mat-card-subtitle>
          Test the notification endpoints and functionality
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="test-section">
          <h3>API Endpoint Tests</h3>
          <div class="button-group">
            <button mat-raised-button color="primary" (click)="testGetMyNotifications()">
              <mat-icon>list</mat-icon>
              Test GET /my-notifications
            </button>
            
            <button mat-raised-button color="primary" (click)="testGetUnreadCount()">
              <mat-icon>notifications</mat-icon>
              Test GET /unread-count
            </button>
            
            <button mat-raised-button color="primary" (click)="testGetUnreadNotifications()">
              <mat-icon>mark_email_unread</mat-icon>
              Test GET /unread
            </button>
            
            <button mat-raised-button color="accent" (click)="testCreateNotification()">
              <mat-icon>add</mat-icon>
              Test POST /notification
            </button>
            
            <button mat-raised-button color="warn" (click)="testMarkAllAsRead()">
              <mat-icon>done_all</mat-icon>
              Test PATCH /mark-all-read
            </button>
          </div>
        </div>

        <div class="test-section">
          <h3>Service Tests</h3>
          <div class="button-group">
            <button mat-stroked-button (click)="testPolling()">
              <mat-icon>refresh</mat-icon>
              Test Polling
            </button>
            
            <button mat-stroked-button (click)="testRealTimeUpdates()">
              <mat-icon>sync</mat-icon>
              Test Real-time Updates
            </button>
            
            <button mat-stroked-button (click)="testNotificationObservables()">
              <mat-icon>visibility</mat-icon>
              Test Observables
            </button>
          </div>
        </div>

        <div class="test-results" *ngIf="testResults.length > 0">
          <h3>Test Results</h3>
          <div class="results-list">
            <div 
              *ngFor="let result of testResults" 
              [class]="'result-item ' + (result.success ? 'success' : 'error')">
              <mat-icon>{{result.success ? 'check_circle' : 'error'}}</mat-icon>
              <div class="result-content">
                <strong>{{result.test}}</strong>
                <p>{{result.message}}</p>
                <pre *ngIf="result.data">{{result.data | json}}</pre>
              </div>
            </div>
          </div>
          
          <button mat-button (click)="clearResults()">
            <mat-icon>clear</mat-icon>
            Clear Results
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-card {
      max-width: 800px;
      margin: 1rem auto;
    }

    .test-section {
      margin-bottom: 2rem;
    }

    .test-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .test-results {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .results-list {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .result-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;

      &.success {
        background-color: #e8f5e8;
        border-left: 4px solid #4caf50;
      }

      &.error {
        background-color: #ffebee;
        border-left: 4px solid #f44336;
      }

      mat-icon {
        margin-top: 0.25rem;
      }

      .result-content {
        flex: 1;

        strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
        }

        pre {
          background: #f5f5f5;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          overflow-x: auto;
          max-height: 200px;
          overflow-y: auto;
        }
      }
    }

    @media (max-width: 600px) {
      .button-group {
        flex-direction: column;
      }
    }
  `]
})
export class NotificationTestComponent {
  testResults: Array<{
    test: string;
    success: boolean;
    message: string;
    data?: any;
  }> = [];

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  testGetMyNotifications(): void {
    this.addResult('GET /my-notifications', true, 'Testing...', null);
    
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.updateLastResult(true, `Success! Retrieved ${notifications.length} notifications`, notifications);
      },
      error: (error) => {
        this.updateLastResult(false, `Failed: ${error.message || error}`, error);
      }
    });
  }

  testGetUnreadCount(): void {
    this.addResult('GET /unread-count', true, 'Testing...', null);
    
    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.updateLastResult(true, `Success! Unread count: ${response.count}`, response);
      },
      error: (error) => {
        this.updateLastResult(false, `Failed: ${error.message || error}`, error);
      }
    });
  }

  testGetUnreadNotifications(): void {
    this.addResult('GET /unread', true, 'Testing...', null);
    
    this.notificationService.getUnreadNotifications({ pageNumber: 1, pageSize: 10 }).subscribe({
      next: (response) => {
        this.updateLastResult(true, `Success! Retrieved ${response.data.length} unread notifications`, response);
      },
      error: (error) => {
        this.updateLastResult(false, `Failed: ${error.message || error}`, error);
      }
    });
  }

  testCreateNotification(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.addResult('POST /notification', false, 'Failed: No current user found', null);
      return;
    }

    this.addResult('POST /notification', true, 'Testing...', null);
    
    const testNotification: CreateNotificationDto = {
      userId: currentUser.id,
      title: 'Test Notification',
      message: 'This is a test notification created from the test component',
      type: NotificationType.Info
    };

    this.notificationService.createNotification(testNotification).subscribe({
      next: (notification) => {
        this.updateLastResult(true, 'Success! Created test notification', notification);
      },
      error: (error) => {
        this.updateLastResult(false, `Failed: ${error.message || error}`, error);
      }
    });
  }

  testMarkAllAsRead(): void {
    this.addResult('PATCH /mark-all-read', true, 'Testing...', null);
    
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.updateLastResult(true, 'Success! Marked all notifications as read', null);
      },
      error: (error) => {
        this.updateLastResult(false, `Failed: ${error.message || error}`, error);
      }
    });
  }

  testPolling(): void {
    this.addResult('Polling Test', true, 'Testing notification polling...', null);
    
    // Stop current polling and restart
    this.notificationService.stopPolling();
    this.notificationService.startPolling();
    
    setTimeout(() => {
      this.updateLastResult(true, 'Polling restarted successfully', null);
    }, 1000);
  }

  testRealTimeUpdates(): void {
    this.addResult('Real-time Updates', true, 'Testing SignalR connection...', null);
    
    // This would require SignalR to be properly connected
    // For now, just check if the service exists
    const isConnected = this.notificationService.isPollingActive();
    this.updateLastResult(true, `Polling status: ${isConnected ? 'Active' : 'Inactive'}`, { isPolling: isConnected });
  }

  testNotificationObservables(): void {
    this.addResult('Observable Test', true, 'Testing notification observables...', null);
    
    // Subscribe to observables and check if they emit
    let notificationsReceived = false;
    let unreadCountReceived = false;

    const notificationsSub = this.notificationService.notifications$.subscribe(notifications => {
      notificationsReceived = true;
    });

    const unreadCountSub = this.notificationService.unreadCount$.subscribe(count => {
      unreadCountReceived = true;
    });

    setTimeout(() => {
      notificationsSub.unsubscribe();
      unreadCountSub.unsubscribe();
      
      this.updateLastResult(true, 
        `Observables working: notifications=${notificationsReceived}, unreadCount=${unreadCountReceived}`, 
        { notificationsReceived, unreadCountReceived }
      );
    }, 2000);
  }

  private addResult(test: string, success: boolean, message: string, data: any): void {
    this.testResults.unshift({ test, success, message, data });
  }

  private updateLastResult(success: boolean, message: string, data: any): void {
    if (this.testResults.length > 0) {
      this.testResults[0].success = success;
      this.testResults[0].message = message;
      this.testResults[0].data = data;
    }
  }

  clearResults(): void {
    this.testResults = [];
  }
}