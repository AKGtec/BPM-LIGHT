import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserDto,
  UpdateUserDto,
  UserRegistrationDto,
  PaginatedResponse,
  PaginationParams
} from '../models';
import { environment } from '../../../environments/environment';



export interface UserProfileDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  department?: string;
  manager?: string;
  roles: string[];
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDto {
  userId: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/api/Authentication`;

  constructor(private readonly http: HttpClient) {}

  // User CRUD operations
  getUsers(params?: PaginationParams): Observable<UserDto[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<UserDto[]>(`${this.API_URL}/users`, { params: httpParams });
  }

  getUserById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API_URL}/users/${id}`);
  }

  getUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.API_URL}/profile`);
  }

  // Note: User creation, update, and deletion might need to be implemented in your backend
  createUser(user: UserRegistrationDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.API_URL}/register`, user);
  }

  updateUser(id: string, user: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.API_URL}/users/${id}`, user);
  }

  // Update current user's profile
  updateProfile(profileData: UpdateUserDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/profile`, profileData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  // User management operations
  activateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivateUser(id: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/deactivate`, {});
  }

  // Role management - based on your backend endpoints
  assignRole(userId: string, roleName: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/users/${userId}/roles/${roleName}`, {});
  }

  removeRole(userId: string, roleName: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${userId}/roles/${roleName}`);
  }

  getUserRoles(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/users/${userId}/roles`);
  }

  // Password management
  changePassword(userId: string, passwordData: ChangePasswordDto): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${userId}/change-password`, passwordData);
  }

  resetPassword(passwordData: ResetPasswordDto): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/reset-password`, passwordData);
  }

  // User search and filtering
  getUsersByRole(role: string, params?: PaginationParams): Observable<PaginatedResponse<UserDto>> {
    let httpParams = new HttpParams().set('role', role);
    
    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<UserDto>>(`${this.API_URL}/by-role`, { params: httpParams });
  }

  getUsersByDepartment(departmentId: string, params?: PaginationParams): Observable<PaginatedResponse<UserDto>> {
    let httpParams = new HttpParams().set('departmentId', departmentId);
    
    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http.get<PaginatedResponse<UserDto>>(`${this.API_URL}/by-department`, { params: httpParams });
  }

  getManagers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.API_URL}/managers`);
  }

  // User statistics
  // getUserStats(): Observable<{
  //   totalUsers: number;
  //   activeUsers: number;
  //   usersByRole: { [role: string]: number };
  //   usersByDepartment: { [department: string]: number };
  //   recentLogins: number;
  // }> {
  //   return this.http.get<any>(`${this.API_URL}/stats`);
  // }

  // Profile picture upload
  uploadProfilePicture(userId: string, file: File): Observable<{ profilePictureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ profilePictureUrl: string }>(`${this.API_URL}/${userId}/profile-picture`, formData);
  }

  // Bulk operations
  bulkUpdateUsers(userIds: string[], updateData: Partial<UpdateUserDto>): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/bulk-update`, { userIds, updateData });
  }

  bulkDeleteUsers(userIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/bulk-delete`, { body: { userIds } });
  }

  // Import/Export
  exportUsers(format: 'csv' | 'excel' = 'excel'): Observable<Blob> {
    return this.http.get(`${this.API_URL}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  importUsers(file: File): Observable<{
    successCount: number;
    errorCount: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<any>(`${this.API_URL}/import`, formData);
  }

  // User activity
  getUserActivity(userId: string, days: number = 30): Observable<{
    loginHistory: { date: Date; ipAddress: string }[];
    requestActivity: { date: Date; requestCount: number }[];
    lastActivity: Date;
  }> {
    return this.http.get<any>(`${this.API_URL}/${userId}/activity`, {
      params: { days: days.toString() }
    });
  }
}
