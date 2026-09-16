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

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { register, loginWithGoogle, isLoading } = useAuth();

  const [name, setName] = useState('Carlos');
  const [lastName, setLastName] = useState('Pérez');
  const [email, setEmail] = useState('carlos@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('admin123');

  const handleRegister = async () => {
    if (!name.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      router.push('/(auth)/select-role');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      router.push('/(auth)/select-role');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al conectar con Google');
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
        Crea una cuenta
      </Text>

      {/* Formulario */}
      <View style={styles.formContainer}>
        <FlowInput
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <FlowInput
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />

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

        <FlowInput
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
        />

        {/* Botón Principal Dorado "Crear" */}
        <FlowButton
          title="Crear"
          variant="goldGradient"
          loading={isLoading}
          onPress={handleRegister}
          style={styles.createButton}
        />

        {/* Separador */}
        <Divider style={styles.divider} />

        {/* Botón de Google */}
        <GoogleButton
          loading={isLoading}
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
