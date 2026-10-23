import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  HeaderLogo,
  FlowInput,
  FlowButton,
  GoogleButton,
  Divider,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Validators } from '@/utils/validators';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { login, loginWithGoogle, isLoading } = useAuth();

  // Campos limpios al inicio
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados de error por campo y error general en pantalla
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Limpiar error previo
    setGeneralError(null);

    // 1. Sanitizar y validar email
    const cleanEmail = Validators.sanitize(email);
    const emailErr = Validators.validateEmail(cleanEmail);
    const passErr = Validators.validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passErr);

    if (emailErr || passErr) {
      return;
    }

    try {
      await login({ email: cleanEmail, password });
      router.replace('/');
    } catch (error: any) {
      // Mostrar mensaje de error directamente en pantalla en lugar de modal
      setGeneralError(
        error.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      );
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError(null);
    try {
      await loginWithGoogle();
      router.replace('/');
    } catch (error: any) {
      setGeneralError(
        error.message || 'Error al autenticar con Google. Intenta nuevamente.'
      );
    }
  };

  return (
    <ScreenContainer header={<HeaderLogo />}>
      {/* Título de la pantalla */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Iniciar Sesión
      </Text>

      {/* Formulario */}
      <View style={styles.formContainer}>
        {/* Banner de error general visible en pantalla */}
        {generalError && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: isDark ? 'rgba(231, 76, 60, 0.15)' : '#FDE8E8',
                borderColor: isDark ? 'rgba(231, 76, 60, 0.4)' : '#F98080',
              },
            ]}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={isDark ? '#FF6B6B' : '#E02424'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.errorBannerText,
                { color: isDark ? '#FF8787' : '#9B1C1C' },
              ]}>
              {generalError}
            </Text>
          </View>
        )}

        <FlowInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(null);
            if (generalError) setGeneralError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          errorMessage={emailError}
        />

        <FlowInput
          placeholder="Contraseña"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(null);
            if (generalError) setGeneralError(null);
          }}
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          errorMessage={passwordError}
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
          disabled={isLoading}
          onPress={handleLogin}
          style={styles.loginButton}
        />

        {/* Separador */}
        <Divider style={styles.divider} />

        {/* Botón de Google con degradado oscuro */}
        <GoogleButton
          loading={isLoading}
          disabled={isLoading}
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
  errorBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    ...Typography.smallMedium,
    flex: 1,
    lineHeight: 18,
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
