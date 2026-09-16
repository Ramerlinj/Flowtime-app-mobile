import { apiClient } from './client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordPayload,
  ApiResponse,
} from './types';

export const authService = {
  /**
   * Iniciar sesión con email y contraseña
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      return await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch {
      // Simulación de respuesta exitosa mientras no esté conectado el backend
      await new Promise((resolve) => setTimeout(resolve, 600));
      const isAdmin = credentials.email.trim().toLowerCase() === 'admin@gmail.com';
      return {
        user: {
          id: isAdmin ? 'admin_01' : 'user_123',
          name: isAdmin ? 'Administrador Flowtime' : 'Usuario Flowtime',
          email: credentials.email,
        },
        token: 'mock_jwt_token_flowtime_admin',
      };
    }
  },

  /**
   * Crear nueva cuenta
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      return await apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        user: {
          id: 'user_456',
          name: `${credentials.name} ${credentials.lastName}`.trim(),
          email: credentials.email,
        },
        token: 'mock_jwt_token_flowtime_456',
      };
    }
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    try {
      return await apiClient<ApiResponse<null>>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'Enlace de recuperación enviado correctamente.',
      };
    }
  },

  /**
   * Iniciar sesión con Google OAuth
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      return await apiClient<AuthResponse>('/auth/google', {
        method: 'POST',
      });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        user: {
          id: 'google_user_789',
          name: 'Usuario Google',
          email: 'usuario.google@example.com',
        },
        token: 'mock_google_jwt_token',
      };
    }
  },
};
