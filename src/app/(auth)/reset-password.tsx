import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  HeaderLogo,
  FlowInput,
  FlowButton,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { authService } from '@/api/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Validators } from '@/utils/validators';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async () => {
    setGeneralError(null);

    const pErr = Validators.validatePassword(password);
    const cpErr = Validators.validatePasswordMatch(password, confirmPassword);

    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (pErr || cpErr) return;

    setLoading(true);
    try {
      await authService.updatePassword(password);
      setSuccess(true);
    } catch (error: any) {
      setGeneralError(
        error.message || 'No fue posible actualizar la contraseña. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer header={<HeaderLogo />}>
      {/* Título */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Nueva contraseña
      </Text>

      {success ? (
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={56}
            color={colors.successText}
            style={{ marginBottom: Spacing.md }}
          />
          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
            ¡Contraseña actualizada!
          </Text>
          <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
            Tu contraseña se ha cambiado exitosamente. Ya puedes iniciar sesión con tu nueva clave.
          </Text>
          <FlowButton
            title="Ir a Iniciar Sesión"
            variant="goldGradient"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backToLoginButton}
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa tu nueva contraseña para asegurar tu cuenta de FlowTime.
          </Text>

          {/* Banner de error visible en pantalla */}
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
            placeholder="Nueva contraseña"
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
            placeholder="Confirmar nueva contraseña"
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

          <FlowButton
            title="Guardar contraseña"
            variant="goldGradient"
            loading={loading}
            disabled={loading}
            onPress={handleUpdatePassword}
            style={styles.saveButton}
          />

          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
            style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={14}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
              Volver a Iniciar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
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
  saveButton: {
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    ...Typography.small,
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  successTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  successDescription: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  backToLoginButton: {
    width: '100%',
  },
});
