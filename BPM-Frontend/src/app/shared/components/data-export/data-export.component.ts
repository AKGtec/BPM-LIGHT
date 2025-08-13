import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ExportColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean';
  format?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  columns: string[];
  includeHeaders: boolean;
  dateFormat?: string;
  filename?: string;
}

@Component({
  selector: 'app-data-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <button mat-button [matMenuTriggerFor]="exportMenu" [disabled]="isExporting">
      <mat-icon>download</mat-icon>
      <span *ngIf="!isExporting">Export</span>
      <mat-spinner *ngIf="isExporting" diameter="20"></mat-spinner>
    </button>

    <mat-menu #exportMenu="matMenu">
      <button mat-menu-item (click)="quickExport('csv')">
        <mat-icon>table_chart</mat-icon>
        <span>Export as CSV</span>
      </button>
      <button mat-menu-item (click)="quickExport('excel')">
        <mat-icon>description</mat-icon>
        <span>Export as Excel</span>
      </button>
      <button mat-menu-item (click)="quickExport('pdf')">
        <mat-icon>picture_as_pdf</mat-icon>
        <span>Export as PDF</span>
      </button>
      <button mat-menu-item (click)="quickExport('json')">
        <mat-icon>code</mat-icon>
        <span>Export as JSON</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="openAdvancedExport()">
        <mat-icon>settings</mat-icon>
        <span>Advanced Export...</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    button[disabled] {
      opacity: 0.6;
    }
  `]
})
export class DataExportComponent {
  @Input() data: any[] = [];
  @Input() columns: ExportColumn[] = [];
  @Input() defaultFilename = 'export';
  @Input() allowAdvancedOptions = true;

  @Output() exportStarted = new EventEmitter<ExportOptions>();
  @Output() exportCompleted = new EventEmitter<void>();
  @Output() exportError = new EventEmitter<string>();

  isExporting = false;

  constructor(
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}

  quickExport(format: 'csv' | 'excel' | 'pdf' | 'json'): void {
    const options: ExportOptions = {
      format,
      columns: this.columns.map(col => col.key),
      includeHeaders: true,
      filename: `${this.defaultFilename}.${format}`
    };

    this.performExport(options);
  }

  openAdvancedExport(): void {
    const dialogRef = this.dialog.open(AdvancedExportDialogComponent, {
      width: '600px',
      data: {
        columns: this.columns,
        defaultFilename: this.defaultFilename
      }
    });

    dialogRef.afterClosed().subscribe(options => {
      if (options) {
        this.performExport(options);
      }
    });
  }

  private performExport(options: ExportOptions): void {
    this.isExporting = true;
    this.exportStarted.emit(options);

    try {
      switch (options.format) {
        case 'csv':
          this.exportToCsv(options);
          break;
        case 'excel':
          this.exportToExcel(options);
          break;
        case 'pdf':
          this.exportToPdf(options);
          break;
        case 'json':
          this.exportToJson(options);
          break;
      }
    } catch (error: any) {
      this.handleExportError(error.message || 'Export failed');
    }
  }

  private exportToCsv(options: ExportOptions): void {
    const selectedColumns = this.columns.filter(col => options.columns.includes(col.key));
    let csvContent = '';

    // Add headers
    if (options.includeHeaders) {
      csvContent += selectedColumns.map(col => this.escapeCsvValue(col.label)).join(',') + '\n';
    }

    // Add data rows
    this.data.forEach(row => {
      const values = selectedColumns.map(col => {
        const value = row[col.key];
        return this.escapeCsvValue(this.formatValue(value, col));
      });
      csvContent += values.join(',') + '\n';
    });

    this.downloadFile(csvContent, options.filename || 'export.csv', 'text/csv');
  }

  private exportToJson(options: ExportOptions): void {
    const selectedColumns = this.columns.filter(col => options.columns.includes(col.key));
    const exportData = this.data.map(row => {
      const exportRow: any = {};
      selectedColumns.forEach(col => {
        exportRow[col.key] = this.formatValue(row[col.key], col);
      });
      return exportRow;
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, options.filename || 'export.json', 'application/json');
  }

  private exportToExcel(options: ExportOptions): void {
    // This would typically use a library like SheetJS
    // For now, we'll create a simple HTML table that Excel can import
    const selectedColumns = this.columns.filter(col => options.columns.includes(col.key));
    let htmlContent = '<table>';

    // Add headers
    if (options.includeHeaders) {
      htmlContent += '<tr>';
      selectedColumns.forEach(col => {
        htmlContent += `<th>${col.label}</th>`;
      });
      htmlContent += '</tr>';
    }

    // Add data rows
    this.data.forEach(row => {
      htmlContent += '<tr>';
      selectedColumns.forEach(col => {
        const value = this.formatValue(row[col.key], col);
        htmlContent += `<td>${value}</td>`;
      });
      htmlContent += '</tr>';
    });

    htmlContent += '</table>';
    this.downloadFile(htmlContent, options.filename || 'export.xls', 'application/vnd.ms-excel');
  }

  private exportToPdf(options: ExportOptions): void {
    // This would typically use a library like jsPDF
    // For now, we'll show a message that PDF export requires additional setup
    this.snackBar.open('PDF export requires additional setup. Please use CSV or Excel for now.', 'Close', { 
      duration: 5000 
    });
    this.isExporting = false;
    return;
  }

  private formatValue(value: any, column: ExportColumn): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (column.type) {
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return new Date(value).toLocaleDateString();
      
      case 'boolean':
        return value ? 'Yes' : 'No';
      
      case 'number':
        return typeof value === 'number' ? value.toString() : value;
      
      default:
        return value.toString();
    }
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    this.isExporting = false;
    this.exportCompleted.emit();
    this.snackBar.open('Export completed successfully', 'Close', { duration: 3000 });
  }

  private handleExportError(message: string): void {
    this.isExporting = false;
    this.exportError.emit(message);
    this.snackBar.open(`Export failed: ${message}`, 'Close', { duration: 5000 });
  }
}

// Advanced Export Dialog Component
@Component({
  selector: 'app-advanced-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Advanced Export Options</h2>
    
    <mat-dialog-content>
      <div class="export-options">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Export Format</mat-label>
          <mat-select [(ngModel)]="selectedFormat">
            <mat-option value="csv">CSV</mat-option>
            <mat-option value="excel">Excel</mat-option>
            <mat-option value="pdf">PDF</mat-option>
            <mat-option value="json">JSON</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Filename</mat-label>
          <input matInput [(ngModel)]="filename" placeholder="Enter filename">
        </mat-form-field>

        <div class="checkbox-section">
          <mat-checkbox [(ngModel)]="includeHeaders">
            Include column headers
          </mat-checkbox>
        </div>

        <div class="columns-section">
          <h3>Select Columns to Export:</h3>
          <div class="columns-list">
            <mat-checkbox 
              *ngFor="let column of data.columns" 
              [(ngModel)]="column.selected"
              class="column-checkbox">
              {{column.label}}
            </mat-checkbox>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="export()" [disabled]="!isValid()">
        Export
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .export-options {
      min-width: 500px;
      padding: 1rem 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .checkbox-section {
      margin: 1rem 0;
    }

    .columns-section {
      margin-top: 1rem;
    }

    .columns-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .columns-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 1rem;
    }

    .column-checkbox {
      margin-bottom: 0.5rem;
    }
  `]
})
export class AdvancedExportDialogComponent {
  selectedFormat: 'csv' | 'excel' | 'pdf' | 'json' = 'csv';
  filename = '';
  includeHeaders = true;

  constructor(
    public dialogRef: any,
    public data: any
  ) {
    this.filename = data.defaultFilename;
    // Mark all columns as selected by default
    this.data.columns.forEach((col: any) => col.selected = true);
  }

  export(): void {
    const selectedColumns = this.data.columns
      .filter((col: any) => col.selected)
      .map((col: any) => col.key);

    const options: ExportOptions = {
      format: this.selectedFormat,
      columns: selectedColumns,
      includeHeaders: this.includeHeaders,
      filename: this.filename + '.' + this.selectedFormat
    };

    this.dialogRef.close(options);
  }

  isValid(): boolean {
    return this.filename.trim() !== '' && 
           this.data.columns.some((col: any) => col.selected);
  }
}
