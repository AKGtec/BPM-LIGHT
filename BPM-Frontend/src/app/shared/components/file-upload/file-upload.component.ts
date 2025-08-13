import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { FileUploadService, FileUploadOptions, UploadedFile } from '../../../core/services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="file-upload-container">
      <!-- Upload Area -->
      <div 
        class="upload-area"
        [class.dragover]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput
          type="file"
          [multiple]="allowMultiple"
          [accept]="acceptedTypes"
          (change)="onFileSelected($event)"
          style="display: none;">

        <div class="upload-content">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <h3>{{uploadText}}</h3>
          <p>{{uploadSubtext}}</p>
          <button mat-raised-button color="primary" type="button">
            <mat-icon>attach_file</mat-icon>
            Choose Files
          </button>
        </div>
      </div>

      <!-- Upload Progress -->
      <div *ngIf="uploadProgress.length > 0" class="upload-progress">
        <h4>Upload Progress</h4>
        <div *ngFor="let progress of uploadProgress" class="progress-item">
          <div class="progress-info">
            <span class="file-name">{{progress.fileName}}</span>
            <span class="progress-percentage">{{progress.progress}}%</span>
          </div>
          <mat-progress-bar 
            mode="determinate" 
            [value]="progress.progress"
            [color]="getProgressColor(progress.status)">
          </mat-progress-bar>
          <div *ngIf="progress.error" class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{progress.error}}</span>
          </div>
        </div>
      </div>

      <!-- Uploaded Files -->
      <div *ngIf="uploadedFiles.length > 0" class="uploaded-files">
        <h4>Uploaded Files</h4>
        <div *ngFor="let file of uploadedFiles" class="file-item">
          <div class="file-info">
            <mat-icon>{{getFileIcon(file.mimeType)}}</mat-icon>
            <div class="file-details">
              <span class="file-name">{{file.originalFileName}}</span>
              <span class="file-size">{{formatFileSize(file.fileSize)}}</span>
            </div>
          </div>
          <div class="file-actions">
            <button mat-icon-button (click)="downloadFile(file)" matTooltip="Download">
              <mat-icon>download</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="removeFile(file)" matTooltip="Remove">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- File Constraints -->
      <div *ngIf="showConstraints" class="file-constraints">
        <small>
          <strong>File Requirements:</strong>
          <span *ngIf="options.maxFileSize">Max size: {{formatFileSize(options.maxFileSize)}}</span>
          <span *ngIf="options.allowedTypes">Allowed types: {{options.allowedTypes.join(', ')}}</span>
          <span *ngIf="options.maxFiles">Max files: {{options.maxFiles}}</span>
        </small>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: #2196f3;
      background-color: #e3f2fd;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .upload-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #666;
    }

    .upload-area:hover .upload-icon,
    .upload-area.dragover .upload-icon {
      color: #2196f3;
    }

    .upload-area h3 {
      margin: 0;
      color: #333;
    }

    .upload-area p {
      margin: 0;
      color: #666;
    }

    .upload-progress {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .upload-progress h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .progress-item {
      margin-bottom: 1rem;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .file-name {
      font-weight: 500;
    }

    .progress-percentage {
      color: #666;
      font-size: 0.9rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f44336;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .uploaded-files {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .uploaded-files h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background-color: white;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .file-details {
      display: flex;
      flex-direction: column;
    }

    .file-name {
      font-weight: 500;
    }

    .file-size {
      color: #666;
      font-size: 0.8rem;
    }

    .file-actions {
      display: flex;
      gap: 0.5rem;
    }

    .file-constraints {
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #e3f2fd;
      border-radius: 4px;
    }

    .file-constraints small {
      color: #1976d2;
    }

    .file-constraints span {
      display: block;
      margin-left: 1rem;
    }

    @media (max-width: 768px) {
      .upload-area {
        padding: 1rem;
      }

      .upload-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
      }

      .file-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .file-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class FileUploadComponent implements OnDestroy {
  @Input() allowMultiple = false;
  @Input() options: FileUploadOptions = {};
  @Input() uploadText = 'Drag and drop files here';
  @Input() uploadSubtext = 'or click to browse';
  @Input() showConstraints = true;
  @Input() relatedEntityId?: string;
  @Input() relatedEntityType?: string;

  @Output() filesUploaded = new EventEmitter<UploadedFile[]>();
  @Output() fileRemoved = new EventEmitter<UploadedFile>();
  @Output() uploadError = new EventEmitter<string>();

  private readonly destroy$ = new Subject<void>();

  isDragOver = false;
  uploadProgress: any[] = [];
  uploadedFiles: UploadedFile[] = [];

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly snackBar: MatSnackBar
  ) {
    // Subscribe to upload progress
    this.fileUploadService.uploadProgress$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(progress => {
      const existingIndex = this.uploadProgress.findIndex(p => p.fileName === progress.fileName);
      if (existingIndex >= 0) {
        this.uploadProgress[existingIndex] = progress;
      } else {
        this.uploadProgress.push(progress);
      }

      // Remove completed uploads after a delay
      if (progress.status === 'completed') {
        setTimeout(() => {
          this.uploadProgress = this.uploadProgress.filter(p => p.fileName !== progress.fileName);
        }, 2000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get acceptedTypes(): string {
    return this.options.allowedTypes?.join(',') || '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files || []);
    this.handleFiles(files);
    
    // Reset the input
    event.target.value = '';
  }

  private handleFiles(files: File[]): void {
    if (!this.allowMultiple && files.length > 1) {
      this.snackBar.open('Only one file is allowed', 'Close', { duration: 3000 });
      return;
    }

    if (this.options.maxFiles && files.length > this.options.maxFiles) {
      this.snackBar.open(`Maximum ${this.options.maxFiles} files allowed`, 'Close', { duration: 3000 });
      return;
    }

    files.forEach(file => this.uploadFile(file));
  }

  private uploadFile(file: File): void {
    try {
      this.fileUploadService.uploadFile(
        file, 
        this.options, 
        this.relatedEntityId, 
        this.relatedEntityType
      ).subscribe({
        next: (uploadedFile) => {
          this.uploadedFiles.push(uploadedFile);
          this.filesUploaded.emit([uploadedFile]);
          this.snackBar.open(`${file.name} uploaded successfully`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          const errorMessage = error.message || 'Upload failed';
          this.uploadError.emit(errorMessage);
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } catch (error: any) {
      this.uploadError.emit(error.message);
      this.snackBar.open(error.message, 'Close', { duration: 5000 });
    }
  }

  downloadFile(file: UploadedFile): void {
    this.fileUploadService.downloadFile(file.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalFileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.snackBar.open('Download failed', 'Close', { duration: 3000 });
      }
    });
  }

  removeFile(file: UploadedFile): void {
    this.fileUploadService.deleteFile(file.id).subscribe({
      next: () => {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
        this.fileRemoved.emit(file);
        this.snackBar.open('File removed', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to remove file', 'Close', { duration: 3000 });
      }
    });
  }

  getProgressColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'completed': return 'primary';
      case 'error': return 'warn';
      default: return 'accent';
    }
  }

  getFileIcon(mimeType: string): string {
    return this.fileUploadService.getFileIcon(mimeType);
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }
}
