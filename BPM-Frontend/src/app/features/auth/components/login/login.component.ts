import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { UserLoginDto } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-login',
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
    <mat-card class="login-card">
      <mat-card-header>
        <mat-card-title>Welcome Back</mat-card-title>
        <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username or Email</mat-label>
            <input 
              matInput 
              formControlName="userName" 
              placeholder="Enter your username or email"
              autocomplete="username">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="loginForm.get('userName')?.hasError('required')">
              Username is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input 
              matInput 
              [type]="hidePassword ? 'password' : 'text'" 
              formControlName="password"
              placeholder="Enter your password"
              autocomplete="current-password">
            <button 
              mat-icon-button 
              matSuffix 
              type="button"
              (click)="hidePassword = !hidePassword"
              [attr.aria-label]="'Hide password'"
              [attr.aria-pressed]="hidePassword">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>

          <div class="form-options">
            <mat-checkbox formControlName="rememberMe" color="primary">
              Remember me
            </mat-checkbox>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>

          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            class="login-button full-width"
            [disabled]="loginForm.invalid || isLoading">
            <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading">Signing In...</span>
          </button>
        </form>
      </mat-card-content>
      
      <mat-card-actions class="card-actions">
        <p class="signup-text">
          Don't have an account? 
          <a routerLink="/auth/register" class="signup-link">Sign up here</a>
        </p>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
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
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData: UserLoginDto = {
        userName: this.loginForm.value.userName,
        password: this.loginForm.value.password
      };

      this.authService.login(loginData)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (response) => {
            if (response.IsAuthSuccessful) {
              this.snackBar.open('Login successful!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.router.navigate(['/dashboard']);
            } else {
              this.snackBar.open(response.ErrorMessage || 'Login failed', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            this.snackBar.open('An error occurred during login. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }
}