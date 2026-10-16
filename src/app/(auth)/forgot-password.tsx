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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async () => {
    setGeneralError(null);
    const cleanEmail = Validators.sanitize(email);
    const err = Validators.validateEmail(cleanEmail);

    setEmailError(err);
    if (err) return;

    setLoading(true);
    try {
      await authService.requestPasswordReset({ email: cleanEmail });
      setSent(true);
    } catch (error: any) {
      setGeneralError(
        error.message || 'No fue posible enviar el correo de recuperación. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer header={<HeaderLogo />}>
      {/* Título */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Recuperar contraseña
      </Text>

      {/* Mensaje de éxito si ya fue enviado */}
      {sent ? (
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={56}
            color={colors.successText}
            style={{ marginBottom: Spacing.md }}
          />
          <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
            ¡Correo enviado!
          </Text>
          <Text style={[styles.successDescription, { color: colors.textSecondary }]}>
            Hemos enviado un enlace a {email} con instrucciones para restablecer tu contraseña. Revisa también tu carpeta de spam.
          </Text>
          <FlowButton
            title="Volver a iniciar sesión"
            variant="goldGradient"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.backToLoginButton}
          />
        </View>
      ) : (
        /* Formulario */
        <View style={styles.formContainer}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para restablecer tu contraseña.
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

          <FlowButton
            title="Enviar enlace"
            variant="goldGradient"
            loading={loading}
            disabled={loading}
            onPress={handleSendLink}
            style={styles.sendButton}
          />

          {/* Enlace para volver */}
          <TouchableOpacity
            onPress={() => router.back()}
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
  sendButton: {
    marginTop: Spacing.sm,
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
