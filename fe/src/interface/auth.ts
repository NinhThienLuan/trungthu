/** Contracts for the backend auth and user DTOs. No client implementation lives here. */
export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'PLATFORM_ADMIN';

export interface UserResponse {
  id: string; // UUID
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  storeName: string | null;
  address: string | null;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserResponse;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  storeName?: string | null;
}
export interface GoogleLoginRequest { idToken: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; newPassword: string; }
export interface ChangePasswordRequest { oldPassword: string; newPassword: string; }
export interface RefreshTokenRequest { refreshToken: string; }
