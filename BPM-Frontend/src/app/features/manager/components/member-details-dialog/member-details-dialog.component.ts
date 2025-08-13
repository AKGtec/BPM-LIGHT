import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  phoneNumber?: string;
  lastActivity?: Date;
  performanceRating?: number;
}

@Component({
  selector: 'app-member-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="member-details-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="member-avatar">
          {{data.member.firstName.charAt(0)}}{{data.member.lastName.charAt(0)}}
        </div>
        <div class="member-info">
          <h2>{{data.member.firstName}} {{data.member.lastName}}</h2>
          <p class="member-position">{{data.member.position}} • {{data.member.department}}</p>
        </div>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <div class="details-grid">
          <div class="detail-item">
            <mat-icon>email</mat-icon>
            <div class="detail-content">
              <label>Email</label>
              <span>{{data.member.email}}</span>
            </div>
          </div>

          <div class="detail-item" *ngIf="data.member.phoneNumber">
            <mat-icon>phone</mat-icon>
            <div class="detail-content">
              <label>Phone</label>
              <span>{{data.member.phoneNumber}}</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>business</mat-icon>
            <div class="detail-content">
              <label>Department</label>
              <span>{{data.member.department}}</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>work</mat-icon>
            <div class="detail-content">
              <label>Position</label>
              <span>{{data.member.position}}</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>event</mat-icon>
            <div class="detail-content">
              <label>Hire Date</label>
              <span>{{data.member.hireDate | date:'mediumDate'}}</span>
            </div>
          </div>

          <div class="detail-item">
            <mat-icon>info</mat-icon>
            <div class="detail-content">
              <label>Status</label>
              <mat-chip [class]="getStatusClass(data.member.status)">
                {{data.member.status}}
              </mat-chip>
            </div>
          </div>

          <div class="detail-item" *ngIf="data.member.performanceRating">
            <mat-icon>star</mat-icon>
            <div class="detail-content">
              <label>Performance Rating</label>
              <div class="rating-display">
                <span class="rating-value">{{data.member.performanceRating}}/5</span>
                <div class="stars">
                  <mat-icon *ngFor="let star of getStarArray()" 
                           [class.filled]="star <= data.member.performanceRating!">star</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-item" *ngIf="data.member.lastActivity">
            <mat-icon>schedule</mat-icon>
            <div class="detail-content">
              <label>Last Activity</label>
              <span>{{data.member.lastActivity | date:'medium'}}</span>
            </div>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="editMember()">
          <mat-icon>edit</mat-icon>
          Edit Member
        </button>
      </div>
    </div>
  `,
  styles: [`
    .member-details-dialog {
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 !important;
      margin: 0 0 16px 0;
    }

    .member-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .member-info h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .member-position {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .dialog-content {
      padding: 0 !important;
    }

    .details-grid {
      display: grid;
      gap: 20px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .detail-item mat-icon {
      color: #1976d2;
      margin-top: 2px;
    }

    .detail-content {
      flex: 1;
    }

    .detail-content label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }

    .detail-content span {
      color: #666;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-on-leave {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .rating-value {
      font-weight: 500;
      color: #333;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ddd;
    }

    .stars mat-icon.filled {
      color: #ffc107;
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px 0 0 0 !important;
      margin: 16px 0 0 0;
      border-top: 1px solid #e0e0e0;
    }

    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class MemberDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MemberDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: TeamMember }
  ) {}

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  editMember(): void {
    // Close dialog and return edit action
    this.dialogRef.close({ action: 'edit', member: this.data.member });
  }
}
