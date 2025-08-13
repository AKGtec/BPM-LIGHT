import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

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
  selector: 'app-send-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule
  ],
  template: `
    <div class="send-message-dialog">
      <h2 mat-dialog-title>
        <mat-icon>message</mat-icon>
        Send Message to {{data.member.firstName}} {{data.member.lastName}}
      </h2>

      <div mat-dialog-content>
        <div class="recipient-info">
          <div class="recipient-avatar">
            {{data.member.firstName.charAt(0)}}{{data.member.lastName.charAt(0)}}
          </div>
          <div class="recipient-details">
            <h4>{{data.member.firstName}} {{data.member.lastName}}</h4>
            <p>{{data.member.email}}</p>
            <mat-chip class="position-chip">{{data.member.position}}</mat-chip>
          </div>
        </div>

        <form [formGroup]="messageForm" class="message-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="general">General Message</mat-option>
              <mat-option value="feedback">Feedback</mat-option>
              <mat-option value="task-update">Task Update</mat-option>
              <mat-option value="meeting-request">Meeting Request</mat-option>
              <mat-option value="urgent">Urgent</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Subject</mat-label>
            <input matInput formControlName="subject" placeholder="Enter message subject">
            <mat-error *ngIf="messageForm.get('subject')?.hasError('required')">
              Subject is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message</mat-label>
            <textarea matInput 
                     formControlName="message" 
                     rows="6" 
                     placeholder="Type your message here..."></textarea>
            <mat-hint>{{messageForm.get('message')?.value?.length || 0}}/1000 characters</mat-hint>
            <mat-error *ngIf="messageForm.get('message')?.hasError('required')">
              Message is required
            </mat-error>
            <mat-error *ngIf="messageForm.get('message')?.hasError('maxlength')">
              Message cannot exceed 1000 characters
            </mat-error>
          </mat-form-field>

          <div class="message-options">
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="low">Low</mat-option>
                <mat-option value="normal">Normal</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="urgent">Urgent</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="delivery-options">
              <label class="option-label">Delivery Options:</label>
              <div class="checkbox-group">
                <label class="checkbox-item">
                  <input type="checkbox" formControlName="sendEmail">
                  <span>Send Email Notification</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" formControlName="requireResponse">
                  <span>Require Response</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button (click)="saveDraft()" [disabled]="messageForm.invalid">
          <mat-icon>save</mat-icon>
          Save Draft
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="sendMessage()"
                [disabled]="messageForm.invalid">
          <mat-icon>send</mat-icon>
          Send Message
        </button>
      </div>
    </div>
  `,
  styles: [`
    .send-message-dialog {
      width: 100%;
      max-width: 500px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      color: #1976d2;
    }

    .recipient-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .recipient-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
    }

    .recipient-details h4 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .recipient-details p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .position-chip {
      background: #e3f2fd;
      color: #1976d2;
      font-size: 0.8rem;
    }

    .message-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .message-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;
    }

    .delivery-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .option-label {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      color: #666;
    }

    .checkbox-item input[type="checkbox"] {
      margin: 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      padding: 20px 0 0 0 !important;
      margin: 20px 0 0 0;
      border-top: 1px solid #e0e0e0;
    }

    .dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 600px) {
      .message-options {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SendMessageDialogComponent {
  messageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SendMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: TeamMember }
  ) {
    this.messageForm = this.fb.group({
      type: ['general', Validators.required],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(1000)]],
      priority: ['normal', Validators.required],
      sendEmail: [true],
      requireResponse: [false]
    });
  }

  saveDraft(): void {
    if (this.messageForm.valid) {
      const messageData = {
        ...this.messageForm.value,
        recipientId: this.data.member.id,
        recipientName: `${this.data.member.firstName} ${this.data.member.lastName}`,
        recipientEmail: this.data.member.email,
        senderId: 'current-manager', // This would come from auth service
        createdDate: new Date(),
        status: 'draft'
      };

      // Close dialog with draft data
      this.dialogRef.close({ action: 'draft', data: messageData });
    }
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const messageData = {
        ...this.messageForm.value,
        recipientId: this.data.member.id,
        recipientName: `${this.data.member.firstName} ${this.data.member.lastName}`,
        recipientEmail: this.data.member.email,
        senderId: 'current-manager', // This would come from auth service
        sentDate: new Date(),
        status: 'sent'
      };

      // Close dialog with message data
      this.dialogRef.close({ action: 'send', data: messageData });
    }
  }
}
