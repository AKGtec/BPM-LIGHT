import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-requests-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="placeholder-container">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <h1>Requests Module</h1>
        <p>This module will contain all request management functionality including:</p>
        <ul>
          <li>Create new requests</li>
          <li>View my requests</li>
          <li>Approve/reject requests (for managers)</li>
          <li>Request history and tracking</li>
        </ul>
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

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      transition: transform 0.3s ease;
      margin-top: 20px;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
  `]
})
export class RequestsPlaceholderComponent {}
