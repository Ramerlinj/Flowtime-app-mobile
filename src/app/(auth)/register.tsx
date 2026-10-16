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

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { register, loginWithGoogle, isLoading } = useAuth();

  // Campos limpios al inicio
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Errores individuales por campo
  const [nameError, setNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleRegister = async () => {
    setGeneralError(null);

    // 1. Sanitizar campos
    const cleanName = Validators.sanitize(name);
    const cleanLastName = Validators.sanitize(lastName);
    const cleanEmail = Validators.sanitize(email);

    // 2. Validar cada campo
    const nErr = Validators.validateName(cleanName, 'nombre');
    const lnErr = Validators.validateName(cleanLastName, 'apellido');
    const eErr = Validators.validateEmail(cleanEmail);
    const pErr = Validators.validatePassword(password);
    const cpErr = Validators.validatePasswordMatch(password, confirmPassword);

    setNameError(nErr);
    setLastNameError(lnErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (nErr || lnErr || eErr || pErr || cpErr) {
      return;
    }

    try {
      await register({
        name: cleanName,
        lastName: cleanLastName,
        email: cleanEmail,
        password,
        confirmPassword,
      });
      router.push('/(auth)/select-role');
    } catch (error: any) {
      setGeneralError(
        error.message || 'No se pudo crear la cuenta. Por favor intenta de nuevo.'
      );
    }
  };

  const handleGoogleRegister = async () => {
    setGeneralError(null);
    try {
      await loginWithGoogle();
      router.push('/(auth)/select-role');
    } catch (error: any) {
      setGeneralError(
        error.message || 'Error al conectar con Google. Por favor intenta de nuevo.'
      );
    }
  };

  return (
    <ScreenContainer header={<HeaderLogo />}>
      {/* Título de la pantalla */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Crea una cuenta
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
          placeholder="Nombre"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(null);
            if (generalError) setGeneralError(null);
          }}
          autoCapitalize="words"
          autoCorrect={false}
          errorMessage={nameError}
        />

        <FlowInput
          placeholder="Apellido"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            if (lastNameError) setLastNameError(null);
            if (generalError) setGeneralError(null);
          }}
          autoCapitalize="words"
          autoCorrect={false}
          errorMessage={lastNameError}
        />

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

        <FlowInput
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError(null);
            if (generalError) setGeneralError(null);
          }}
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          errorMessage={confirmPasswordError}
        />

        {/* Botón Principal Dorado "Crear" */}
        <FlowButton
          title="Crear cuenta"
          variant="goldGradient"
          loading={isLoading}
          disabled={isLoading}
          onPress={handleRegister}
          style={styles.createButton}
        />

        {/* Separador */}
        <Divider style={styles.divider} />

        {/* Botón de Google */}
        <GoogleButton
          loading={isLoading}
          disabled={isLoading}
          onPress={handleGoogleRegister}
          style={styles.googleButton}
        />

        {/* Enlace para volver a iniciar sesión */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ¿Ya tienes una cuenta?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}>
            <Text style={[styles.footerLink, { color: colors.textPrimary }]}>
              Inicia sesión
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
  createButton: {
    marginTop: Spacing.base,
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
