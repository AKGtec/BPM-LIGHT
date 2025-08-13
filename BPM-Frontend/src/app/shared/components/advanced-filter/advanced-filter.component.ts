import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: { value: any; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface FilterValue {
  [key: string]: any;
}

@Component({
  selector: 'app-advanced-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatExpansionModule,
    MatCheckboxModule
  ],
  template: `
    <mat-expansion-panel class="filter-panel" [expanded]="expanded">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon>filter_list</mat-icon>
          Advanced Filters
        </mat-panel-title>
        <mat-panel-description>
          {{getActiveFiltersCount()}} filter(s) active
        </mat-panel-description>
      </mat-expansion-panel-header>

      <form [formGroup]="filterForm" class="filter-form">
        <div class="filter-grid">
          <div *ngFor="let field of fields" class="filter-field">
            <!-- Text Input -->
            <mat-form-field *ngIf="field.type === 'text'" appearance="outline">
              <mat-label>{{field.label}}</mat-label>
              <input matInput [formControlName]="field.key" [placeholder]="field.placeholder || ''">
            </mat-form-field>

            <!-- Number Input -->
            <mat-form-field *ngIf="field.type === 'number'" appearance="outline">
              <mat-label>{{field.label}}</mat-label>
              <input matInput type="number" [formControlName]="field.key" 
                     [min]="field.min" [max]="field.max" [placeholder]="field.placeholder || ''">
            </mat-form-field>

            <!-- Select -->
            <mat-form-field *ngIf="field.type === 'select'" appearance="outline">
              <mat-label>{{field.label}}</mat-label>
              <mat-select [formControlName]="field.key">
                <mat-option value="">All</mat-option>
                <mat-option *ngFor="let option of field.options" [value]="option.value">
                  {{option.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Multi-select -->
            <mat-form-field *ngIf="field.type === 'multiselect'" appearance="outline">
              <mat-label>{{field.label}}</mat-label>
              <mat-select [formControlName]="field.key" multiple>
                <mat-option *ngFor="let option of field.options" [value]="option.value">
                  {{option.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Date -->
            <mat-form-field *ngIf="field.type === 'date'" appearance="outline">
              <mat-label>{{field.label}}</mat-label>
              <input matInput [matDatepicker]="picker" [formControlName]="field.key">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <!-- Date Range -->
            <div *ngIf="field.type === 'daterange'" class="date-range">
              <mat-form-field appearance="outline">
                <mat-label>{{field.label}} From</mat-label>
                <input matInput [matDatepicker]="startPicker" [formControlName]="field.key + '_start'">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{field.label}} To</mat-label>
                <input matInput [matDatepicker]="endPicker" [formControlName]="field.key + '_end'">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Boolean -->
            <div *ngIf="field.type === 'boolean'" class="boolean-field">
              <mat-checkbox [formControlName]="field.key">
                {{field.label}}
              </mat-checkbox>
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div *ngIf="getActiveFilters().length > 0" class="active-filters">
          <h4>Active Filters:</h4>
          <mat-chip-set>
            <mat-chip *ngFor="let filter of getActiveFilters()" 
                      (removed)="removeFilter(filter.key)"
                      [removable]="true">
              {{filter.label}}: {{filter.displayValue}}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-set>
        </div>

        <!-- Action Buttons -->
        <div class="filter-actions">
          <button type="button" mat-raised-button color="primary" (click)="applyFilters()">
            <mat-icon>search</mat-icon>
            Apply Filters
          </button>
          <button type="button" mat-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
            Clear All
          </button>
          <button type="button" mat-button (click)="saveFilterPreset()" *ngIf="allowPresets">
            <mat-icon>bookmark</mat-icon>
            Save Preset
          </button>
        </div>

        <!-- Filter Presets -->
        <div *ngIf="allowPresets && filterPresets.length > 0" class="filter-presets">
          <h4>Saved Presets:</h4>
          <div class="preset-chips">
            <mat-chip *ngFor="let preset of filterPresets" 
                      (click)="loadFilterPreset(preset)"
                      class="preset-chip">
              {{preset.name}}
              <mat-icon matChipRemove (click)="deleteFilterPreset(preset); $event.stopPropagation()">
                cancel
              </mat-icon>
            </mat-chip>
          </div>
        </div>
      </form>
    </mat-expansion-panel>
  `,
  styles: [`
    .filter-panel {
      margin-bottom: 1rem;
    }

    .filter-form {
      padding: 1rem 0;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
    }

    .date-range {
      display: flex;
      gap: 1rem;
    }

    .boolean-field {
      display: flex;
      align-items: center;
      height: 56px; /* Match mat-form-field height */
    }

    .active-filters {
      margin: 1rem 0;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .active-filters h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1rem;
    }

    .filter-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .filter-presets {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #e3f2fd;
      border-radius: 8px;
    }

    .filter-presets h4 {
      margin: 0 0 1rem 0;
      color: #1976d2;
      font-size: 1rem;
    }

    .preset-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .preset-chip {
      cursor: pointer;
      background-color: #2196f3;
      color: white;
    }

    .preset-chip:hover {
      background-color: #1976d2;
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .filter-grid {
        grid-template-columns: 1fr;
      }

      .date-range {
        flex-direction: column;
      }

      .filter-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdvancedFilterComponent implements OnInit {
  @Input() fields: FilterField[] = [];
  @Input() initialValues: FilterValue = {};
  @Input() expanded = false;
  @Input() allowPresets = false;

  @Output() filtersChanged = new EventEmitter<FilterValue>();
  @Output() filtersCleared = new EventEmitter<void>();

  filterForm!: FormGroup;
  filterPresets: { name: string; filters: FilterValue }[] = [];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFilterPresets();
  }

  private initializeForm(): void {
    const formControls: any = {};
    
    this.fields.forEach(field => {
      if (field.type === 'daterange') {
        formControls[field.key + '_start'] = [this.initialValues[field.key + '_start'] || null];
        formControls[field.key + '_end'] = [this.initialValues[field.key + '_end'] || null];
      } else {
        formControls[field.key] = [this.initialValues[field.key] || this.getDefaultValue(field.type)];
      }
    });

    this.filterForm = this.fb.group(formControls);
  }

  private getDefaultValue(type: string): any {
    switch (type) {
      case 'multiselect': return [];
      case 'boolean': return false;
      case 'number': return null;
      default: return '';
    }
  }

  applyFilters(): void {
    const filterValues = this.getFilterValues();
    this.filtersChanged.emit(filterValues);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.fields.forEach(field => {
      if (field.type === 'daterange') {
        this.filterForm.get(field.key + '_start')?.setValue(null);
        this.filterForm.get(field.key + '_end')?.setValue(null);
      } else {
        this.filterForm.get(field.key)?.setValue(this.getDefaultValue(field.type));
      }
    });
    this.filtersCleared.emit();
  }

  removeFilter(key: string): void {
    if (key.endsWith('_start') || key.endsWith('_end')) {
      this.filterForm.get(key)?.setValue(null);
    } else {
      this.filterForm.get(key)?.setValue(this.getDefaultValue(this.getFieldType(key)));
    }
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    return this.getActiveFilters().length;
  }

  getActiveFilters(): { key: string; label: string; displayValue: string }[] {
    const activeFilters: { key: string; label: string; displayValue: string }[] = [];
    const formValue = this.filterForm.value;

    this.fields.forEach(field => {
      if (field.type === 'daterange') {
        const startValue = formValue[field.key + '_start'];
        const endValue = formValue[field.key + '_end'];
        if (startValue || endValue) {
          const startStr = startValue ? new Date(startValue).toLocaleDateString() : 'Any';
          const endStr = endValue ? new Date(endValue).toLocaleDateString() : 'Any';
          activeFilters.push({
            key: field.key,
            label: field.label,
            displayValue: `${startStr} - ${endStr}`
          });
        }
      } else {
        const value = formValue[field.key];
        if (this.hasValue(value, field.type)) {
          activeFilters.push({
            key: field.key,
            label: field.label,
            displayValue: this.getDisplayValue(value, field)
          });
        }
      }
    });

    return activeFilters;
  }

  private hasValue(value: any, type: string): boolean {
    if (value === null || value === undefined) return false;
    if (type === 'text' || type === 'select') return value !== '';
    if (type === 'multiselect') return Array.isArray(value) && value.length > 0;
    if (type === 'boolean') return value === true;
    if (type === 'number') return value !== null && value !== '';
    if (type === 'date') return value !== null;
    return false;
  }

  private getDisplayValue(value: any, field: FilterField): string {
    if (field.type === 'select' || field.type === 'multiselect') {
      if (Array.isArray(value)) {
        return value.map(v => {
          const option = field.options?.find(opt => opt.value === v);
          return option ? option.label : v;
        }).join(', ');
      } else {
        const option = field.options?.find(opt => opt.value === value);
        return option ? option.label : value;
      }
    }
    if (field.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    if (field.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value.toString();
  }

  private getFieldType(key: string): string {
    const field = this.fields.find(f => f.key === key || key.startsWith(f.key + '_'));
    return field ? field.type : 'text';
  }

  private getFilterValues(): FilterValue {
    const formValue = this.filterForm.value;
    const filterValues: FilterValue = {};

    this.fields.forEach(field => {
      if (field.type === 'daterange') {
        const startValue = formValue[field.key + '_start'];
        const endValue = formValue[field.key + '_end'];
        if (startValue) filterValues[field.key + '_start'] = startValue;
        if (endValue) filterValues[field.key + '_end'] = endValue;
      } else {
        const value = formValue[field.key];
        if (this.hasValue(value, field.type)) {
          filterValues[field.key] = value;
        }
      }
    });

    return filterValues;
  }

  saveFilterPreset(): void {
    const name = prompt('Enter a name for this filter preset:');
    if (name) {
      const filters = this.getFilterValues();
      const preset = { name, filters };
      this.filterPresets.push(preset);
      this.saveFilterPresets();
    }
  }

  loadFilterPreset(preset: { name: string; filters: FilterValue }): void {
    this.clearFilters();
    Object.keys(preset.filters).forEach(key => {
      const control = this.filterForm.get(key);
      if (control) {
        control.setValue(preset.filters[key]);
      }
    });
    this.applyFilters();
  }

  deleteFilterPreset(preset: { name: string; filters: FilterValue }): void {
    this.filterPresets = this.filterPresets.filter(p => p !== preset);
    this.saveFilterPresets();
  }

  private loadFilterPresets(): void {
    const saved = localStorage.getItem('filter-presets');
    if (saved) {
      try {
        this.filterPresets = JSON.parse(saved);
      } catch (error) {
        console.warn('Failed to load filter presets:', error);
        this.filterPresets = [];
      }
    }
  }

  private saveFilterPresets(): void {
    localStorage.setItem('filter-presets', JSON.stringify(this.filterPresets));
  }
}
