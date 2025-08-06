import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-icon-test',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="icon-test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Icon Test Page</mat-card-title>
          <mat-card-subtitle>Testing Material Icons across different platforms</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="icon-grid">
            <div class="icon-section">
              <h3>Material Icons (Standard)</h3>
              <div class="icon-row">
                <mat-icon>home</mat-icon>
                <mat-icon>dashboard</mat-icon>
                <mat-icon>person</mat-icon>
                <mat-icon>settings</mat-icon>
                <mat-icon>notifications</mat-icon>
                <mat-icon>business</mat-icon>
                <mat-icon>assignment</mat-icon>
                <mat-icon>account_circle</mat-icon>
              </div>
            </div>

            <div class="icon-section">
              <h3>Material Icons in Buttons</h3>
              <div class="button-row">
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  Add New
                </button>
                <button mat-raised-button color="accent">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-raised-button color="warn">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
                <button mat-icon-button>
                  <mat-icon>more_vert</mat-icon>
                </button>
              </div>
            </div>

            <div class="icon-section">
              <h3>Navigation Icons</h3>
              <div class="icon-row">
                <mat-icon>menu</mat-icon>
                <mat-icon>arrow_back</mat-icon>
                <mat-icon>arrow_forward</mat-icon>
                <mat-icon>expand_more</mat-icon>
                <mat-icon>expand_less</mat-icon>
                <mat-icon>close</mat-icon>
                <mat-icon>search</mat-icon>
                <mat-icon>filter_list</mat-icon>
              </div>
            </div>

            <div class="icon-section">
              <h3>Status Icons</h3>
              <div class="icon-row">
                <mat-icon class="success-icon">check_circle</mat-icon>
                <mat-icon class="warning-icon">warning</mat-icon>
                <mat-icon class="error-icon">error</mat-icon>
                <mat-icon class="info-icon">info</mat-icon>
                <mat-icon>pending</mat-icon>
                <mat-icon>schedule</mat-icon>
                <mat-icon>done</mat-icon>
                <mat-icon>cancel</mat-icon>
              </div>
            </div>

            <div class="icon-section">
              <h3>Business Process Icons</h3>
              <div class="icon-row">
                <mat-icon>work</mat-icon>
                <mat-icon>assignment_turned_in</mat-icon>
                <mat-icon>approval</mat-icon>
                <mat-icon>supervisor_account</mat-icon>
                <mat-icon>people</mat-icon>
                <mat-icon>analytics</mat-icon>
                <mat-icon>account_tree</mat-icon>
                <mat-icon>timeline</mat-icon>
              </div>
            </div>

            <div class="icon-section">
              <h3>Different Sizes</h3>
              <div class="icon-row">
                <mat-icon class="icon-18">home</mat-icon>
                <mat-icon class="icon-24">home</mat-icon>
                <mat-icon class="icon-36">home</mat-icon>
                <mat-icon class="icon-48">home</mat-icon>
              </div>
            </div>

            <div class="icon-section">
              <h3>Raw HTML Icons (Fallback Test)</h3>
              <div class="icon-row">
                <i class="material-icons">home</i>
                <i class="material-icons">dashboard</i>
                <i class="material-icons">person</i>
                <i class="material-icons">settings</i>
              </div>
            </div>

            <div class="icon-section">
              <h3>MDI Icons (Alternative)</h3>
              <div class="icon-row">
                <i class="mdi mdi-home"></i>
                <i class="mdi mdi-view-dashboard"></i>
                <i class="mdi mdi-account"></i>
                <i class="mdi mdi-cog"></i>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .icon-test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .icon-grid {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .icon-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }

    .icon-section h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-weight: 500;
    }

    .icon-row {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .button-row {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .icon-18 {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
    }

    .icon-24 {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
    }

    .icon-36 {
      font-size: 36px !important;
      width: 36px !important;
      height: 36px !important;
    }

    .icon-48 {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
    }

    .success-icon {
      color: #4caf50;
    }

    .warning-icon {
      color: #ff9800;
    }

    .error-icon {
      color: #f44336;
    }

    .info-icon {
      color: #2196f3;
    }

    .material-icons {
      font-size: 24px;
      color: #666;
    }

    .mdi {
      font-size: 24px;
      color: #666;
    }

    @media (max-width: 768px) {
      .icon-row,
      .button-row {
        gap: 10px;
      }
      
      .icon-test-container {
        padding: 10px;
      }
    }
  `]
})
export class IconTestComponent { }