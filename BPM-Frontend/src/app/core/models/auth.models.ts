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
  IsAuthSuccessful: boolean;
  ErrorMessage?: string;
  Token?: string;
  TokenExpiration?: Date;
  User?: UserDto;
}

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: string[];
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
