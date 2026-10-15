import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  HeaderLogo,
  DarkModeToggle,
  FlowInput,
  FlowButton,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { authService } from '@/api/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async () => {
    if (!email.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset({ email: email.trim() });
      setSent(true);
      Alert.alert('Éxito', 'Se ha enviado un enlace de recuperación a tu correo.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Botón superior derecho para Modo Oscuro */}
      <DarkModeToggle />

      {/* Logotipo Flowtime */}
      <HeaderLogo />

      {/* Título */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Recuperar contraseña
      </Text>

      {/* Formulario */}
      <View style={styles.formContainer}>
        <FlowInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {/* Botón Enviar Enlace */}
        <FlowButton
          title="Enviar enlace"
          variant="goldGradient"
          loading={loading}
          onPress={handleSendLink}
          style={styles.sendButton}
        />

        {/* Instrucción informativa */}
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Revisa tu bandeja del correo electrónico
        </Text>

        {/* Reenviar código */}
        <TouchableOpacity
          onPress={handleSendLink}
          activeOpacity={0.7}
          style={styles.resendButton}>
          <Text style={[styles.resendText, { color: colors.textPrimary }]}>
            Reenviar código
          </Text>
        </TouchableOpacity>

        {/* Volver a Iniciar Sesión */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={14} color={colors.goldText} style={{ marginRight: 6 }} />
          <Text style={[styles.backText, { color: colors.goldText }]}>
            Volver a Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sendButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  infoText: {
    ...Typography.small,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  resendButton: {
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  resendText: {
    ...Typography.bodyMedium,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: Spacing.sm,
  },
  backText: {
    ...Typography.smallBold,
    textAlign: 'center',
  },
});
