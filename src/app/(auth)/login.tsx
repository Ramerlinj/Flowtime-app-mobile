import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  HeaderLogo,
  DarkModeToggle,
  FlowInput,
  FlowButton,
  GoogleButton,
  Divider,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { login, loginWithGoogle, isLoading } = useAuth();

  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(auth)/select-role');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.replace('/(auth)/select-role');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar con Google');
    }
  };

  return (
    <ScreenContainer>
      {/* Botón superior derecho para Modo Oscuro */}
      <DarkModeToggle />

      {/* Logotipo Flowtime */}
      <HeaderLogo />

      {/* Título de la pantalla */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Iniciar Sesión
      </Text>

      {/* Formulario */}
      <View style={styles.formContainer}>
        <FlowInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <FlowInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          activeOpacity={0.7}
          style={styles.forgotPasswordButton}>
          <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>
            ¿Olvidaste la contraseña?
          </Text>
        </TouchableOpacity>

        {/* Botón Principal Dorado */}
        <FlowButton
          title="Iniciar sesión"
          variant="goldGradient"
          loading={isLoading}
          onPress={handleLogin}
          style={styles.loginButton}
        />

        {/* Separador */}
        <Divider style={styles.divider} />

        {/* Botón de Google con degradado oscuro */}
        <GoogleButton
          loading={isLoading}
          onPress={handleGoogleLogin}
          style={styles.googleButton}
        />

        {/* Enlace al registro */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ¿No tienes una cuenta?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.7}>
            <Text style={[styles.footerLink, { color: colors.textPrimary }]}>
              Crea una cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
    paddingVertical: Spacing.xs,
  },
  forgotPasswordText: {
    ...Typography.small,
  },
  loginButton: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  divider: {
    marginVertical: Spacing.sm,
  },
  googleButton: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  footerText: {
    ...Typography.small,
  },
  footerLink: {
    ...Typography.smallBold,
  },
});
