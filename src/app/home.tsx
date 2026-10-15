import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  HeaderLogo,
  DarkModeToggle,
  FlowButton,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <DarkModeToggle />
      <HeaderLogo />

      {/* Tarjeta de Perfil / Bienvenida */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.card },
          Shadows.drop,
        ]}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: colors.successText }]} />
          <Text style={[styles.statusText, { color: colors.successText }]}>
            Sesión activa
          </Text>
        </View>

        <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
          {user?.name || 'Administrador Flowtime'}
        </Text>

        <Text style={[styles.emailText, { color: colors.textSecondary }]}>
          {user?.email || 'admin@gmail.com'}
        </Text>

        <View style={[styles.badge, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="star" size={13} color={colors.goldText} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: colors.goldText }]}>
            Plan Premium Flowtime
          </Text>
        </View>
      </View>

      {/* Tarjetas de Información / Métricas */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.card },
          Shadows.drop,
        ]}>
        <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
          Configuración UI Completa
        </Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          Has ingresado correctamente con las credenciales de prueba. El sistema de diseño nativo con StyleSheet y tokens de Flowtime está listo.
        </Text>

        <View style={styles.tokenList}>
          <View style={styles.tokenRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.goldText} style={styles.tokenIcon} />
            <Text style={[styles.tokenItem, { color: colors.textPrimary }]}>
              Fondo Gradiente: 0% #F5E8C7 ➔ 100% #FFFFFF
            </Text>
          </View>
          <View style={styles.tokenRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.goldText} style={styles.tokenIcon} />
            <Text style={[styles.tokenItem, { color: colors.textPrimary }]}>
              Cards Blancas: #F4F4F6 con Drop Shadow
            </Text>
          </View>
          <View style={styles.tokenRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.goldText} style={styles.tokenIcon} />
            <Text style={[styles.tokenItem, { color: colors.textPrimary }]}>
              Inputs: #D9D9D9 en cápsula redondeada
            </Text>
          </View>
          <View style={styles.tokenRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.goldText} style={styles.tokenIcon} />
            <Text style={[styles.tokenItem, { color: colors.textPrimary }]}>
              Botones Premium: Gradiente Dorado
            </Text>
          </View>
        </View>
      </View>

      {/* Botón para Cerrar Sesión */}
      <FlowButton
        title="Cerrar sesión"
        variant="darkGradient"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.smallBold,
  },
  welcomeTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  emailText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    ...Typography.smallBold,
  },
  infoCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.xl,
  },
  cardSectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  tokenList: {
    gap: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    marginRight: 8,
  },
  tokenItem: {
    ...Typography.smallMedium,
    flex: 1,
  },
  logoutButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});
