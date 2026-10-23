import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordPayload,
  ApiResponse,
  User,
} from './types';

WebBrowser.maybeCompleteAuthSession();

/**
 * Servicio de autenticación conectado directamente a Supabase Auth.
 */
export const authService = {
  /**
   * Obtener perfil del usuario autenticado desde public.profiles
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.nombre,
        lastName: data.apellido,
        email: '',
        role: data.rol,
        phone: data.telefono,
        avatarUrl: data.foto_perfil,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Actualizar campos del perfil en public.profiles
   */
  async updateProfile(
    userId: string,
    updates: {
      name?: string;
      lastName?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      role?: any;
    }
  ): Promise<User | null> {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbUpdates.nombre = updates.name.trim();
    if (updates.lastName !== undefined) dbUpdates.apellido = updates.lastName.trim();
    if (updates.phone !== undefined) dbUpdates.telefono = updates.phone;
    if (updates.avatarUrl !== undefined) dbUpdates.foto_perfil = updates.avatarUrl;
    if (updates.role !== undefined) dbUpdates.rol = updates.role;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !data) {
      // Si el perfil no existía, crear con upsert
      const { data: upsertData, error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nombre: updates.name || '',
          apellido: updates.lastName || '',
          telefono: updates.phone || null,
          foto_perfil: updates.avatarUrl || null,
          rol: updates.role || 'CLIENTE',
        })
        .select('*')
        .single();

      if (upsertErr || !upsertData) {
        throw new Error(upsertErr?.message || error?.message || 'Error al actualizar perfil.');
      }

      return {
        id: upsertData.id,
        name: upsertData.nombre,
        lastName: upsertData.apellido,
        email: '',
        role: upsertData.rol,
        phone: upsertData.telefono,
        avatarUrl: upsertData.foto_perfil,
        createdAt: upsertData.created_at,
      };
    }

    return {
      id: data.id,
      name: data.nombre,
      lastName: data.apellido,
      email: '',
      role: data.rol,
      phone: data.telefono,
      avatarUrl: data.foto_perfil,
      createdAt: data.created_at,
    };
  },

  /**
   * Iniciar sesión con email y contraseña en Supabase
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Por favor confirma tu correo electrónico antes de continuar.');
      }
      throw new Error(error.message || 'Error al iniciar sesión.');
    }

    if (!data.user || !data.session) {
      throw new Error('No se pudo establecer la sesión.');
    }

    // Obtener detalles adicionales del perfil si existen
    const profile = await this.getProfile(data.user.id);

    const user: User = {
      id: data.user.id,
      name: profile?.name || data.user.user_metadata?.nombre || 'Usuario Flowtime',
      lastName: profile?.lastName || data.user.user_metadata?.apellido || '',
      email: data.user.email || credentials.email,
      role: profile?.role || (data.user.user_metadata?.rol as any) || 'CLIENTE',
      avatarUrl: profile?.avatarUrl || data.user.user_metadata?.avatar_url,
      phone: profile?.phone,
      createdAt: data.user.created_at,
    };

    return {
      user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },

  /**
   * Crear nueva cuenta en Supabase Auth
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email.trim(),
      password: credentials.password,
      options: {
        data: {
          nombre: credentials.name.trim(),
          apellido: credentials.lastName.trim(),
          name: `${credentials.name} ${credentials.lastName}`.trim(),
          rol: credentials.role || 'CLIENTE',
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        throw new Error('Este correo electrónico ya está registrado.');
      }
      if (msg.includes('rate') || msg.includes('over_email_send_rate_limit')) {
        throw new Error(
          'Límite de correos alcanzado. Para desarrollo, desactiva "Confirm email" en tu panel de Supabase (Authentication > Providers > Email).'
        );
      }
      throw new Error(error.message || 'Error al crear la cuenta.');
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario.');
    }

    const user: User = {
      id: data.user.id,
      name: credentials.name,
      lastName: credentials.lastName,
      email: data.user.email || credentials.email,
      role: credentials.role || 'CLIENTE',
      createdAt: data.user.created_at,
    };

    return {
      user,
      token: data.session?.access_token || '',
      refreshToken: data.session?.refresh_token,
    };
  },

  /**
   * Solicitar recuperación de contraseña vía correo
   */
  async requestPasswordReset(payload: ForgotPasswordPayload): Promise<ApiResponse<null>> {
    const { error } = await supabase.auth.resetPasswordForEmail(payload.email.trim());

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('rate') || msg.includes('over_email_send_rate_limit')) {
        throw new Error(
          'Límite de correos alcanzado. Espera unos minutos antes de volver a solicitarlo.'
        );
      }
      throw new Error(error.message || 'Error al solicitar recuperación de contraseña.');
    }

    return {
      success: true,
      message: 'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
    };
  },

  /**
   * Actualizar o restablecer contraseña
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || 'No fue posible actualizar la contraseña.');
    }
  },

  /**
   * Iniciar sesión o registrarse con Google OAuth
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const redirectUrl = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('unsupported provider') || msg.includes('not enabled')) {
          throw new Error(
            'El proveedor de Google no está activado en tu Supabase. Ve a Authentication > Providers > Google y actívalo con tus credenciales de Google Cloud.'
          );
        }
        if (msg.includes('redirect_to') || msg.includes('not allowed')) {
          throw new Error(
            'URL de redirección no permitida en Supabase. Agrega "flowtimeappmobile://*" y "exp://*" en Authentication > URL Configuration > Redirect URLs.'
          );
        }
        throw new Error(error.message || 'Error al iniciar sesión con Google.');
      }

      // En plataforma Web, el navegador gestiona la redirección directa
      if (Platform.OS === 'web') {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData.session?.user;
        return {
          user: {
            id: sessionUser?.id || '',
            name: sessionUser?.user_metadata?.full_name || 'Usuario Google',
            email: sessionUser?.email || '',
            avatarUrl: sessionUser?.user_metadata?.avatar_url,
          },
          token: sessionData.session?.access_token || '',
          refreshToken: sessionData.session?.refresh_token,
        };
      }

      if (!data?.url) {
        throw new Error('No se recibió la URL de autenticación de Supabase/Google.');
      }

      // Abrir sesión en el navegador nativo
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Inicio de sesión cancelado.');
      }

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const params: Record<string, string> = {};

        // Extraer parámetros tanto de query (?code=...) como de hash (#access_token=...)
        const queryMatch = url.match(/\?([^#]*)/);
        if (queryMatch && queryMatch[1]) {
          queryMatch[1].split('&').forEach((p) => {
            const [k, v] = p.split('=');
            if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
          });
        }

        const hashMatch = url.match(/#(.*)/);
        if (hashMatch && hashMatch[1]) {
          const hashContent = hashMatch[1].split('?')[0];
          hashContent.split('&').forEach((p) => {
            const [k, v] = p.split('=');
            if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
          });
        }

        if (params.error || params.error_description) {
          const errDetail = params.error_description || params.error;
          if (errDetail.includes('access_denied')) {
            throw new Error('Acceso cancelado por el usuario en Google.');
          }
          throw new Error(errDetail || 'Error en la respuesta de Google.');
        }

        if (params.access_token && params.refresh_token) {
          const { error: sessionErr } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (sessionErr) throw sessionErr;
        } else if (params.code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(
            params.code
          );
          if (exchangeErr) throw exchangeErr;
        }
      }

      // Obtener la sesión resultante tras el intercambio
      const { data: finalSession, error: finalSessionErr } = await supabase.auth.getSession();
      if (finalSessionErr || !finalSession.session?.user) {
        throw new Error('No se pudo establecer la sesión con Google.');
      }

      const userObj = finalSession.session.user;
      const profile = await this.getProfile(userObj.id);

      const user: User = {
        id: userObj.id,
        name:
          profile?.name ||
          userObj.user_metadata?.full_name ||
          userObj.user_metadata?.name ||
          'Usuario Google',
        lastName:
          profile?.lastName ||
          userObj.user_metadata?.family_name ||
          '',
        email: userObj.email || '',
        role: profile?.role || (userObj.user_metadata?.rol as any) || 'CLIENTE',
        avatarUrl: profile?.avatarUrl || userObj.user_metadata?.avatar_url,
        phone: profile?.phone,
        createdAt: userObj.created_at,
      };

      return {
        user,
        token: finalSession.session.access_token,
        refreshToken: finalSession.session.refresh_token,
      };
    } catch (e: any) {
      if (e.message?.includes('cancel') || e.message?.includes('dismiss')) {
        throw new Error('Inicio de sesión cancelado.');
      }
      throw new Error(e.message || 'Error al conectar con Google.');
    }
  },

  /**
   * Cerrar sesión en Supabase
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Obtener sesión activa al arrancar la app
   */
  async getInitialSession(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        return null;
      }

      const u = data.session.user;
      const profile = await this.getProfile(u.id);

      return {
        id: u.id,
        name: profile?.name || u.user_metadata?.nombre || 'Usuario Flowtime',
        lastName: profile?.lastName || u.user_metadata?.apellido || '',
        email: u.email || '',
        role: profile?.role || (u.user_metadata?.rol as any) || 'CLIENTE',
        avatarUrl: profile?.avatarUrl || u.user_metadata?.avatar_url,
        phone: profile?.phone,
        createdAt: u.created_at,
      };
    } catch {
      return null;
    }
  },
};
