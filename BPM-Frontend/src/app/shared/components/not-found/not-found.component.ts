import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="action-buttons">
          <a routerLink="/dashboard" class="btn btn-primary">
            <i class="fas fa-home"></i>
            Go to Dashboard
          </a>
          <button onclick="history.back()" class="btn btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .not-found-content {
      background: white;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .error-code {
      font-size: 6rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 20px;
      line-height: 1;
    }

    h1 {
      color: #333;
      font-size: 2rem;
      margin-bottom: 15px;
    }

    p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      transition: transform 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 2px solid #e9ecef;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn-primary:hover {
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    @media (max-width: 480px) {
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class NotFoundComponent {}
