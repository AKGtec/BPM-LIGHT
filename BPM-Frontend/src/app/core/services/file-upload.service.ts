import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

export interface FileUploadOptions {
  allowedTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  generateThumbnail?: boolean;
  folder?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private readonly API_URL = `${environment.apiUrl}/api/file`;
  private uploadProgressSubject = new Subject<FileUploadProgress>();

  constructor(private readonly http: HttpClient) {}

  get uploadProgress$(): Observable<FileUploadProgress> {
    return this.uploadProgressSubject.asObservable();
  }

  // Single file upload with progress tracking
  uploadFile(
    file: File, 
    options: FileUploadOptions = {},
    relatedEntityId?: string,
    relatedEntityType?: string
  ): Observable<UploadedFile> {
    // Validate file before upload
    const validationError = this.validateFile(file, options);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (relatedEntityId) {
      formData.append('relatedEntityId', relatedEntityId);
    }
    
    if (relatedEntityType) {
      formData.append('relatedEntityType', relatedEntityType);
    }
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.generateThumbnail) {
      formData.append('generateThumbnail', 'true');
    }

    const uploadRequest = new HttpRequest('POST', this.API_URL, formData, {
      reportProgress: true
    });

    return this.http.request<UploadedFile>(uploadRequest).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressSubject.next({
                fileName: file.name,
                progress,
                status: 'uploading'
              });
            }
            break;
          
          case HttpEventType.Response:
            this.uploadProgressSubject.next({
              fileName: file.name,
              progress: 100,
              status: 'completed'
            });
            return event.body as UploadedFile;
        }
        return null as any;
      }),
      filter(result => result !== null)
    );
  }

  // Multiple files upload
  uploadMultipleFiles(
    files: File[], 
    options: FileUploadOptions = {},
    relatedEntityId?: string,
    relatedEntityType?: string
  ): Observable<UploadedFile[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      const validationError = this.validateFile(file, options);
      if (validationError) {
        throw new Error(`File ${file.name}: ${validationError}`);
      }
      formData.append(`files`, file);
    });
    
    if (relatedEntityId) {
      formData.append('relatedEntityId', relatedEntityId);
    }
    
    if (relatedEntityType) {
      formData.append('relatedEntityType', relatedEntityType);
    }
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.generateThumbnail) {
      formData.append('generateThumbnail', 'true');
    }

    const uploadRequest = new HttpRequest('POST', `${this.API_URL}/multiple`, formData, {
      reportProgress: true
    });

    return this.http.request<UploadedFile[]>(uploadRequest).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressSubject.next({
                fileName: `${files.length} files`,
                progress,
                status: 'uploading'
              });
            }
            break;
          
          case HttpEventType.Response:
            this.uploadProgressSubject.next({
              fileName: `${files.length} files`,
              progress: 100,
              status: 'completed'
            });
            return event.body as UploadedFile[];
        }
        return null as any;
      }),
      filter(result => result !== null)
    );
  }

  // Get file information
  getFile(fileId: string): Observable<UploadedFile> {
    return this.http.get<UploadedFile>(`${this.API_URL}/${fileId}`);
  }

  // Get files by entity
  getFilesByEntity(entityId: string, entityType: string): Observable<UploadedFile[]> {
    return this.http.get<UploadedFile[]>(`${this.API_URL}/entity/${entityType}/${entityId}`);
  }

  // Download file
  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  // Delete file
  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${fileId}`);
  }

  // Get download URL
  getDownloadUrl(fileId: string): string {
    return `${this.API_URL}/${fileId}/download`;
  }

  // Get thumbnail URL
  getThumbnailUrl(fileId: string): string {
    return `${this.API_URL}/${fileId}/thumbnail`;
  }

  // Validate file before upload
  private validateFile(file: File, options: FileUploadOptions): string | null {
    // Check file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      const maxSizeMB = Math.round(options.maxFileSize / (1024 * 1024));
      return `File size exceeds maximum allowed size of ${maxSizeMB}MB`;
    }

    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      const isAllowed = options.allowedTypes.some(type => {
        if (type.startsWith('.')) {
          // Extension check
          return fileExtension === type.substring(1);
        } else if (type.includes('/')) {
          // MIME type check
          return mimeType === type || mimeType.startsWith(type.split('/')[0] + '/');
        } else {
          // Category check (image, document, etc.)
          switch (type.toLowerCase()) {
            case 'image':
              return mimeType.startsWith('image/');
            case 'document':
              return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType);
            case 'spreadsheet':
              return ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(mimeType);
            case 'video':
              return mimeType.startsWith('video/');
            case 'audio':
              return mimeType.startsWith('audio/');
            default:
              return false;
          }
        }
      });

      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`;
      }
    }

    return null;
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'movie';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    if (mimeType === 'application/pdf') return 'picture_as_pdf';
    if (mimeType.includes('word')) return 'description';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'slideshow';
    if (mimeType.startsWith('text/')) return 'text_snippet';
    return 'insert_drive_file';
  }
}
