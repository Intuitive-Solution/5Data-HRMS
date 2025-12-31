/**
 * Authentication & Authorization Types
 */

export type UserRole = 
  | 'employee'
  | 'reporting_manager'
  | 'project_lead'
  | 'project_manager'
  | 'hr_user'
  | 'finance_user'
  | 'system_admin';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: UserRole[];
  is_active: boolean;
  picture?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

