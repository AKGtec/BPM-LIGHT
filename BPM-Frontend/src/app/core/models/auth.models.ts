export interface UserRegistrationDto {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UserLoginDto {
  userName: string;
  password: string;
}

export interface AuthResponseDto {
  // Backend returns properties with capital letters
  IsAuthSuccessful?: boolean;
  ErrorMessage?: string;
  Token?: string;
  TokenExpiration?: Date;
  User?: UserDto;

  // Keep lowercase versions for backward compatibility
  isAuthSuccessful?: boolean;
  errorMessage?: string;
  token?: string;
  tokenExpiration?: Date;
  user?: UserDto;
}

export interface UserDto {
  // Backend returns properties with capital letters
  Id?: string;
  UserName?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  PhoneNumber?: string;
  Roles?: string[];

  // Keep lowercase versions for backward compatibility
  id?: string;
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: string[];
}

export interface CreateUserDto {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  roles: string[];
}

export interface UpdateUserDto {
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: string[];
}

// Employee-specific interfaces for HR management
export interface Employee {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  manager?: string;
  managerId?: string;
  hireDate?: Date;
  status: 'Active' | 'Inactive' | 'On Leave';
  roles: string[];
  profilePicture?: string;
  emergencyContact?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateEmployeeDto {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  department?: string;
  position?: string;
  managerId?: string;
  hireDate?: string;
  roles: string[];
  emergencyContact?: string;
}

export interface UpdateEmployeeDto {
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  managerId?: string;
  hireDate?: string;
  roles?: string[];
  emergencyContact?: string;
  status?: 'Active' | 'Inactive' | 'On Leave';
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
