import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-manager-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <div class="not-found-content">
            <mat-icon class="not-found-icon">supervisor_account</mat-icon>
            <h1>Manager Page Not Found</h1>
            <p>The manager page you're looking for doesn't exist or has been moved.</p>
            
            <div class="available-pages">
              <h3>Available Manager Pages:</h3>
              <div class="page-links">
                <a mat-raised-button color="primary" routerLink="/manager/team-management">
                  <mat-icon>people</mat-icon>
                  Team Management
                </a>
                <a mat-raised-button color="primary" routerLink="/manager/team-reports">
                  <mat-icon>analytics</mat-icon>
                  Team Reports
                </a>
                <a mat-stroked-button routerLink="/dashboard/manager">
                  <mat-icon>dashboard</mat-icon>
                  Manager Dashboard
                </a>
              </div>
            </div>
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
      min-height: 60vh;
      padding: 24px;
    }

    .not-found-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }

    .not-found-content {
      padding: 32px 24px;
    }

    .not-found-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      color: #1976d2;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 2rem;
      font-weight: 500;
    }

    p {
      margin: 0 0 32px 0;
      color: #666;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .available-pages h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .page-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .page-links a {
      min-width: 200px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    @media (min-width: 600px) {
      .page-links {
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  `]
})
export class ManagerNotFoundComponent { }
