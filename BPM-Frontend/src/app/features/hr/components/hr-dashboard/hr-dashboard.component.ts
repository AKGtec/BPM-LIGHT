import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="hr-dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1><i class="fas fa-user-tie"></i> HR Dashboard</h1>
          <p>Human Resources management and oversight</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="card-icon reports">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="card-content">
            <h3>Reports & Analytics</h3>
            <p>View comprehensive leave reports and statistics</p>
            <a routerLink="/hr/reports" class="btn btn-primary">
              <i class="fas fa-arrow-right"></i>
              View Reports
            </a>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-icon leave">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="card-content">
            <h3>Leave Management</h3>
            <p>Manage employee leave requests and balances</p>
            <a routerLink="/hr/leave-management" class="btn btn-primary">
              <i class="fas fa-arrow-right"></i>
              Manage Leaves
            </a>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-icon employees">
            <i class="fas fa-users"></i>
          </div>
          <div class="card-content">
            <h3>Employee Management</h3>
            <p>Manage employee profiles and information</p>
            <a routerLink="/hr/employees" class="btn btn-primary">
              <i class="fas fa-arrow-right"></i>
              Manage Employees
            </a>
          </div>
        </div>

        <div class="dashboard-card">
          <div class="card-icon settings">
            <i class="fas fa-cog"></i>
          </div>
          <div class="card-content">
            <h3>HR Settings</h3>
            <p>Configure HR policies and leave types</p>
            <a href="#" class="btn btn-primary">
              <i class="fas fa-arrow-right"></i>
              Settings
            </a>
          </div>
        </div>
      </div>

      <div class="back-section">
        <a routerLink="/dashboard" class="btn btn-outline-secondary">
          <i class="fas fa-arrow-left"></i>
          Back to Main Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .hr-dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background-color: #f8f9fa;
      min-height: 100vh;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;

      h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        font-weight: 700;

        i {
          margin-right: 15px;
        }
      }

      p {
        font-size: 1.2rem;
        opacity: 0.9;
        margin: 0;
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .dashboard-card {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .card-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;

        i {
          font-size: 2rem;
          color: white;
        }

        &.reports {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.leave {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.employees {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.settings {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }

      .card-content {
        h3 {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 15px;
        }

        p {
          color: #666;
          margin-bottom: 25px;
          line-height: 1.6;
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

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
        }
      }
    }

    .back-section {
      text-align: center;
      margin-top: 30px;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 24px;
        background: transparent;
        color: #6c757d;
        text-decoration: none;
        border: 2px solid #6c757d;
        border-radius: 5px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          background: #6c757d;
          color: white;
        }
      }
    }

    @media (max-width: 768px) {
      .hr-dashboard-container {
        padding: 15px;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HRDashboardComponent {}
