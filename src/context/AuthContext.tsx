import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/api/types';
import { authService } from '@/api/auth.service';
import { setAuthToken } from '@/api/client';
import { supabase } from '@/api/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar sesión persistente al iniciar la app
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const initialUser = await authService.getInitialSession();
        if (isMounted) {
          setUser(initialUser);
        }
      } catch (e) {
        console.warn('[Flowtime Auth] Error al cargar sesión:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    // Escuchar cambios de estado en Supabase Auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthToken(session.access_token);
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const profile = await authService.getProfile(session.user.id);
            if (isMounted) {
              setUser({
                id: session.user.id,
                name: profile?.name || session.user.user_metadata?.nombre || 'Usuario Flowtime',
                lastName: profile?.lastName || session.user.user_metadata?.apellido || '',
                email: session.user.email || '',
                role: profile?.role || (session.user.user_metadata?.rol as any) || 'CLIENTE',
                avatarUrl: profile?.avatarUrl || session.user.user_metadata?.avatar_url,
                phone: profile?.phone,
                createdAt: session.user.created_at,
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthToken(null);
          if (isMounted) {
            setUser(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setAuthToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      setAuthToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle();
      setUser(response.user);
      setAuthToken(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const profile = await authService.getProfile(user.id);
    if (profile) {
      setUser((prev) => (prev ? { ...prev, ...profile } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
