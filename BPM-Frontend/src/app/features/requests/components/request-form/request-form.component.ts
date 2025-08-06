import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RequestFormComponent implements OnInit {
  requestForm!: FormGroup;
  requestType: string = '';

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.requestType = params.get('type') || '';
      this.initForm();
    });
  }

  initForm(): void {
    // This is a placeholder. In a real application, you would fetch form configurations
    // based on the requestType from a service or backend.
    switch (this.requestType) {
      case 'leave':
        this.requestForm = this.fb.group({
          startDate: ['', Validators.required],
          endDate: ['', Validators.required],
          reason: ['', Validators.required],
        });
        break;
      case 'expense':
        this.requestForm = this.fb.group({
          amount: ['', [Validators.required, Validators.min(0)]],
          description: ['', Validators.required],
          receipt: [null],
        });
        break;
      case 'training':
        this.requestForm = this.fb.group({
          courseName: ['', Validators.required],
          provider: ['', Validators.required],
          startDate: ['', Validators.required],
        });
        break;
      case 'it-ticket':
        this.requestForm = this.fb.group({
          issue: ['', Validators.required],
          priority: ['', Validators.required],
        });
        break;
      case 'profile-update':
        this.requestForm = this.fb.group({
          fieldToUpdate: ['', Validators.required],
          newValue: ['', Validators.required],
        });
        break;
      default:
        this.requestForm = this.fb.group({}); // Empty form for unknown types
        console.warn(`Unknown request type: ${this.requestType}`);
        break;
    }
  }

  onSubmit(): void {
    if (this.requestForm.valid) {
      console.log('Form Submitted!', this.requestForm.value);
      // Here you would typically send the form data to a service
    } else {
      console.log('Form is invalid');
    }
  }
}
