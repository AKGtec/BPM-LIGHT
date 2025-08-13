import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>dashboard</mat-icon>
          </div>
          <h1>Dashboard Not Found</h1>
          <p>The dashboard you're looking for doesn't exist or you don't have access to it.</p>
          <div class="suggestions">
            <h3>Available Dashboards:</h3>
            <ul>
              <li>Main Dashboard - Overview of your activities and quick actions</li>
              <li>Employee Dashboard - Personal request tracking and statistics</li>
              <li>Manager Dashboard - Team management and approval workflows</li>
              <li>HR Dashboard - Request processing and employee management</li>
              <li>Reporting Dashboard - Analytics and business insights</li>
            </ul>
          </div>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon>
              Main Dashboard
            </button>
            <button mat-raised-button color="accent" routerLink="/dashboard/employee">
              <mat-icon>person</mat-icon>
              Employee Dashboard
            </button>
            <button mat-button routerLink="/requests">
              <mat-icon>assignment</mat-icon>
              My Requests
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .not-found-card {
      max-width: 600px;
      text-align: center;
      padding: 2rem;
    }

    .error-icon {
      margin-bottom: 1rem;
    }

    .error-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #2196f3;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.6;
      font-size: 1.1rem;
    }

    .suggestions {
      text-align: left;
      margin: 2rem 0;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .suggestions h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .suggestions ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .suggestions li {
      color: #666;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    }

    @media (max-width: 480px) {
      .actions {
        flex-direction: column;
      }
      
      .not-found-card {
        padding: 1rem;
      }
      
      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardNotFoundComponent {
  constructor() {}
}
