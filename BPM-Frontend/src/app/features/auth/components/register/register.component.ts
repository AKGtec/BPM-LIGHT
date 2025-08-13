import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';
import { UserRegistrationDto } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="register-card">
      <mat-card-header>
        <mat-card-title>Create Account</mat-card-title>
        <mat-card-subtitle>Join our platform today</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="name-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>First Name</mat-label>
              <input 
                matInput 
                formControlName="firstName" 
                placeholder="Enter first name"
                autocomplete="given-name">
              <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                First name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Last Name</mat-label>
              <input 
                matInput 
                formControlName="lastName" 
                placeholder="Enter last name"
                autocomplete="family-name">
              <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                Last name is required
              </mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input 
              matInput 
              formControlName="userName" 
              placeholder="Choose a username"
              autocomplete="username">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="registerForm.get('userName')?.hasError('required')">
              Username is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('userName')?.hasError('minlength')">
              Username must be at least 3 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input 
              matInput 
              formControlName="email" 
              placeholder="Enter your email"
              autocomplete="email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
              Please enter a valid email
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone Number</mat-label>
            <input 
              matInput 
              formControlName="phoneNumber" 
              placeholder="Enter phone number (optional)"
              autocomplete="tel">
            <mat-icon matSuffix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              [type]="hidePassword ? 'password' : 'text'" 
              formControlName="password"
              placeholder="Create a password"
              autocomplete="new-password">
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="hidePassword = !hidePassword">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
              Password must be at least 8 characters
            </mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
              Password must contain at least one uppercase, lowercase, number and special character
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm Password</mat-label>
            <input 
              matInput 
              [type]="hideConfirmPassword ? 'password' : 'text'" 
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              autocomplete="new-password">
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="hideConfirmPassword = !hideConfirmPassword">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
              Please confirm your password
            </mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
              Passwords do not match
            </mat-error>
          </mat-form-field>

          <div class="terms-section">
            <mat-checkbox formControlName="acceptTerms" color="primary">
              I agree to the <a href="#" class="terms-link">Terms of Service</a> and 
              <a href="#" class="terms-link">Privacy Policy</a>
            </mat-checkbox>
            <mat-error *ngIf="registerForm.get('acceptTerms')?.hasError('required') && registerForm.get('acceptTerms')?.touched">
              You must accept the terms and conditions
            </mat-error>
          </div>

          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            class="register-button full-width"
            [disabled]="registerForm.invalid || isLoading">
            <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            <span *ngIf="!isLoading">Create Account</span>
            <span *ngIf="isLoading">Creating Account...</span>
          </button>
        </form>
      </mat-card-content>
      
      <mat-card-actions class="card-actions">
        <p class="signin-text">
          Already have an account? 
          <a routerLink="/auth/login" class="signin-link">Sign in here</a>
        </p>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const registrationData: UserRegistrationDto = {
        userName: this.registerForm.value.userName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        phoneNumber: this.registerForm.value.phoneNumber || undefined
      };

      this.authService.register(registrationData)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (response) => {
            // Handle both property naming conventions (capital and lowercase)
            const isAuthSuccessful = response.IsAuthSuccessful ?? response.isAuthSuccessful;
            const errorMessage = response.ErrorMessage || response.errorMessage;

            if (isAuthSuccessful) {
              this.snackBar.open('Registration successful! Please sign in.', 'Close', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
              this.router.navigate(['/auth/login']);
            } else {
              this.snackBar.open(errorMessage || 'Registration failed', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Registration error:', error);
            this.snackBar.open('An error occurred during registration. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
}