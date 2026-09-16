export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
