import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-policy-management',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="policy-management">
      <div class="header">
        <h1>
          <mat-icon>policy</mat-icon>
          Policy Management
        </h1>
        <p>Manage company policies and procedures</p>
      </div>

      <mat-card class="placeholder-card">
        <mat-card-content>
          <div class="placeholder-content">
            <mat-icon class="large-icon">policy</mat-icon>
            <h2>Policy Management Module</h2>
            <p>Company policy management system coming soon.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .policy-management {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin: 0 0 0.5rem 0;
      color: #2e7d32;
      font-size: 2rem;
    }

    .placeholder-content {
      text-align: center;
      padding: 3rem;
    }

    .large-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #4caf50;
      margin-bottom: 1rem;
    }
  `]
})
export class PolicyManagementComponent {}