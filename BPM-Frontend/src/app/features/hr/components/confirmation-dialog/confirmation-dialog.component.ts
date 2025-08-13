import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog" [class]="'dialog-' + (data.type || 'info')">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon [class]="'icon-' + (data.type || 'info')">
          {{data.icon || getDefaultIcon()}}
        </mat-icon>
        {{data.title}}
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <p [innerHTML]="data.message"></p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close="false">
          {{data.cancelText || 'Cancel'}}
        </button>
        <button mat-raised-button 
                [color]="getButtonColor()" 
                mat-dialog-close="true">
          {{data.confirmText || 'Confirm'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      margin: 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-content {
      padding: 1.5rem;
    }

    .dialog-content p {
      margin: 0;
      line-height: 1.5;
      color: #666;
    }

    /* Dialog Type Styles */
    .dialog-warning .dialog-title {
      background-color: #fff8e1;
      color: #f57c00;
      border-bottom-color: #ffcc02;
    }

    .dialog-danger .dialog-title {
      background-color: #ffebee;
      color: #d32f2f;
      border-bottom-color: #f44336;
    }

    .dialog-info .dialog-title {
      background-color: #e3f2fd;
      color: #1976d2;
      border-bottom-color: #2196f3;
    }

    /* Icon Styles */
    .icon-warning {
      color: #ff9800;
    }

    .icon-danger {
      color: #f44336;
    }

    .icon-info {
      color: #2196f3;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .confirmation-dialog {
        min-width: 90vw;
      }

      mat-dialog-actions {
        flex-direction: column-reverse;
      }

      mat-dialog-actions button {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmationDialogData
  ) {}

  getDefaultIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'warning':
        return 'accent';
      case 'danger':
        return 'warn';
      case 'info':
      default:
        return 'primary';
    }
  }
}
