import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { 
  UserLoginDto, 
  UserRegistrationDto, 
  AuthResponseDto, 
  UserDto 
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/Authentication`;
  private readonly TOKEN_KEY = 'bpm_token';
  private readonly USER_KEY = 'bpm_user';
  
  private readonly currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public redirectUrl: string | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  login(credentials: UserLoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Handle both property naming conventions (capital and lowercase)
          const isAuthSuccessful = response.IsAuthSuccessful ?? response.isAuthSuccessful;
          const token = response.Token || response.token;
          const user = response.User || response.user;

          if (isAuthSuccessful && token && user) {
            this.setToken(token);
            this.setUser(user);
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  register(userData: UserRegistrationDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/register`, userData);
  }

  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/change-password`, passwordData);
  }

  logout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    const userRoles = user?.roles || [];
    return userRoles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    const userRoles = user?.roles || [];
    if (userRoles.length === 0) return false;
    return roles.some(role => userRoles.includes(role));
  }

  // Get the appropriate dashboard route based on user roles
  getDashboardRoute(): string {
    const user = this.getCurrentUser();
    // Handle both property naming conventions (capital and lowercase)
    const userRoles = user?.Roles || user?.roles || [];

    // Debug logging
    console.log('User object:', user);
    console.log('User roles detected:', userRoles);

    if (userRoles.length === 0) {
      console.log('No roles found, defaulting to employee dashboard');
      return '/dashboard/employee'; // Default to employee dashboard
    }

    // Priority order: Admin > HR > Manager > Employee
    if (userRoles.includes('Admin')) {
      console.log('Admin role detected, redirecting to reporting dashboard');
      return '/dashboard/reporting'; // Admin gets reporting dashboard
    }

    if (userRoles.includes('HR')) {
      console.log('HR role detected, redirecting to HR dashboard');
      return '/dashboard/hr';
    }

    if (userRoles.includes('Manager')) {
      console.log('Manager role detected, redirecting to manager dashboard');
      return '/dashboard/manager';
    }

    // Default to employee dashboard for any other role or Employee role
    console.log('No specific role matched, defaulting to employee dashboard');
    return '/dashboard/employee';
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  refreshUserProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API_URL}/profile`)
      .pipe(
        tap(user => {
          this.setUser(user);
          this.currentUserSubject.next(user);
        })
      );
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.warn('Could not save token to localStorage:', error);
    }
  }

  private setUser(user: UserDto): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Could not save user to localStorage:', error);
    }
  }

  private getStoredUser(): UserDto | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  private clearAuthData(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.warn('Could not clear auth data from localStorage:', error);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}