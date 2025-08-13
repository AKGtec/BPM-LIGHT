import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-requests-not-found',
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
            <mat-icon>assignment_late</mat-icon>
          </div>
          <h1>Request Not Found</h1>
          <p>The request you're looking for doesn't exist or you don't have permission to view it.</p>
          <div class="suggestions">
            <h3>What you can do:</h3>
            <ul>
              <li>Check if the request ID is correct</li>
              <li>Verify you have the necessary permissions</li>
              <li>Browse your requests from the main list</li>
              <li>Create a new request if needed</li>
            </ul>
          </div>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/requests">
              <mat-icon>list</mat-icon>
              View All Requests
            </button>
            <button mat-raised-button color="accent" routerLink="/requests/new">
              <mat-icon>add</mat-icon>
              New Request
            </button>
            <button mat-button routerLink="/dashboard">
              <mat-icon>home</mat-icon>
              Dashboard
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
      color: #ff6b6b;
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
export class RequestsNotFoundComponent {
  constructor() {}
}
