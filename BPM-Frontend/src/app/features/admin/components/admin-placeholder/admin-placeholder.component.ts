import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <i class="fas fa-cog"></i>
        </div>
        <h1>Admin Module</h1>
        <p>This module will contain administrative functionality including:</p>
        <ul>
          <li>User management</li>
          <li>Role assignment</li>
          <li>System configuration</li>
          <li>Workflow designer</li>
          <li>Reports and analytics</li>
          <li>System monitoring</li>
        </ul>
        <div class="admin-actions">
          <a href="#" class="btn btn-outline-primary">
            <i class="fas fa-users"></i>
            Manage Users
          </a>
          <a href="#" class="btn btn-outline-secondary">
            <i class="fas fa-project-diagram"></i>
            Workflow Designer
          </a>
          <a href="#" class="btn btn-outline-info">
            <i class="fas fa-chart-bar"></i>
            Reports
          </a>
        </div>
        <a routerLink="/dashboard" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i>
          Back to Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 20px;
    }

    .placeholder-content {
      background: white;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 100%;
    }

    .placeholder-icon {
      font-size: 4rem;
      color: #667eea;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 15px;
    }

    p {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    ul {
      text-align: left;
      margin: 20px 0;
      padding-left: 20px;
    }

    li {
      color: #666;
      margin-bottom: 10px;
    }

    .admin-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin: 30px 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 2px solid;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
      margin-top: 20px;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-outline-primary {
      background: transparent;
      color: #667eea;
      border-color: #667eea;
    }

    .btn-outline-primary:hover {
      background: #667eea;
      color: white;
    }

    .btn-outline-secondary {
      background: transparent;
      color: #6c757d;
      border-color: #6c757d;
    }

    .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

    .btn-outline-info {
      background: transparent;
      color: #17a2b8;
      border-color: #17a2b8;
    }

    .btn-outline-info:hover {
      background: #17a2b8;
      color: white;
    }

    @media (max-width: 768px) {
      .admin-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class AdminPlaceholderComponent {}
