import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-hr-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>people</mat-icon>
          </div>
          <h1>HR Page Not Found</h1>
          <p>The HR page you're looking for doesn't exist or has been moved.</p>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/dashboard/hr">
              <mat-icon>dashboard</mat-icon>
              HR Dashboard
            </button>
            <button mat-raised-button color="accent" routerLink="/hr/employees">
              <mat-icon>badge</mat-icon>
              Employee Management
            </button>
            <button mat-button routerLink="/dashboard">
              <mat-icon>home</mat-icon>
              Main Dashboard
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
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      padding: 2rem;
    }

    .not-found-card {
      max-width: 500px;
      text-align: center;
      padding: 2rem;
    }

    .error-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 2rem;
    }
  `]
})
export class HRNotFoundComponent {}