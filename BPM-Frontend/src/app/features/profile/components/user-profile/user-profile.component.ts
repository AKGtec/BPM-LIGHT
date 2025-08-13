import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { UserDto } from '../../../../core/models/auth.models';

interface ProfileStats {
  profileCompletion: number;
  lastLogin: Date;
  accountAge: number;
  securityScore: number;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  action: () => void;
  color: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatRippleModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: UserDto | null = null;
  isLoading = false;
  isUpdating = false;
  isChangingPassword = false;

  profileStats: ProfileStats = {
    profileCompletion: 85,
    lastLogin: new Date(),
    accountAge: 245,
    securityScore: 92
  };

  quickActions: QuickAction[] = [
    {
      icon: 'edit',
      title: 'Edit Profile',
      description: 'Update your information',
      action: () => this.scrollToProfileForm(),
      color: 'primary'
    },
    {
      icon: 'lock',
      title: 'Change Password',
      description: 'Update your security',
      action: () => this.scrollToPasswordForm(),
      color: 'accent'
    },
    {
      icon: 'security',
      title: 'Security Settings',
      description: 'Manage your account security',
      action: () => this.openSecuritySettings(),
      color: 'warn'
    },
    {
      icon: 'download',
      title: 'Export Data',
      description: 'Download your data',
      action: () => this.exportUserData(),
      color: 'primary'
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.updateProfileStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordStrengthValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    if (!valid) {
      return { passwordStrength: true };
    }
    return null;
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          if (user) {
            this.profileForm.patchValue({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              userName: user.userName || '',
              email: user.email || '',
              phoneNumber: user.phoneNumber || ''
            });
            this.calculateProfileCompletion();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.showErrorMessage('Error loading profile');
          this.isLoading = false;
        }
      });
  }

  private updateProfileStats(): void {
    this.profileStats = {
      profileCompletion: this.calculateProfileCompletion(),
      lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time within last 24h
      accountAge: Math.floor(Math.random() * 500) + 100, // Random days between 100-600
      securityScore: Math.floor(Math.random() * 20) + 80 // Random score between 80-100
    };
  }

  private calculateProfileCompletion(): number {
    if (!this.currentUser) return 0;

    const fields = [
      this.currentUser.firstName,
      this.currentUser.lastName,
      this.currentUser.userName,
      this.currentUser.email,
      this.currentUser.phoneNumber
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isUpdating = true;

      const updateData = this.profileForm.value;

      this.userService.updateProfile(updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Profile updated successfully');
            this.updateProfileStats();
            this.isUpdating = false;
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.handleUpdateError(error);
            this.isUpdating = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid && this.currentUser) {
      this.isChangingPassword = true;
      
      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
        confirmPassword: this.passwordForm.value.confirmPassword
      };
      
      this.authService.changePassword(passwordData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Password changed successfully');
            this.resetPasswordForm();
            this.isChangingPassword = false;
            this.updateSecurityScore();
          },
          error: (error: any) => {
            console.error('Error changing password:', error);
            this.showErrorMessage('Error changing password');
            this.isChangingPassword = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  private handleUpdateError(error: any): void {
    if (error.status === 405) {
      this.showErrorMessage('Profile update is not available yet. Please contact your administrator.');
    } else if (error.status === 403) {
      this.showErrorMessage('You do not have permission to update this profile.');
    } else {
      this.showErrorMessage('Error updating profile. Please try again later.');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private updateSecurityScore(): void {
    this.profileStats.securityScore = Math.min(100, this.profileStats.securityScore + 5);
  }

  resetForm(): void {
    this.profileForm.reset();
    this.loadUserProfile();
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'Admin': 'warn',
      'Manager': 'accent',
      'HR': 'primary',
      'Employee': 'primary'
    };
    return colors[role] || 'primary';
  }

  getPasswordStrength(): number {
    const password = this.passwordForm.get('newPassword')?.value || '';
    if (password.length === 0) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[#?!@$%^&*-]/.test(password)) strength += 25;

    return strength;
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return '';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return '#ef4444';
    if (strength <= 50) return '#f59e0b';
    if (strength <= 75) return '#3b82f6';
    return '#10b981';
  }

  // Quick Actions
  scrollToProfileForm(): void {
    document.querySelector('mat-tab-group')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToPasswordForm(): void {
    // Switch to password tab and scroll
    document.querySelector('mat-tab-group')?.scrollIntoView({ behavior: 'smooth' });
  }

  openSecuritySettings(): void {
    this.showInfoMessage('Security settings feature coming soon!');
  }

  exportUserData(): void {
    this.showInfoMessage('Data export feature coming soon!');
  }

  // Utility methods for snackbar messages
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}