import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  HeaderLogo,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export default function SelectRoleScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { user, logout, updateProfile } = useAuth();
  const [savingRole, setSavingRole] = useState(false);

  const handleSelectAdmin = async () => {
    if (savingRole) return;
    try {
      setSavingRole(true);
      if (user?.id) {
        await updateProfile({ role: 'ADMIN' });
      }
    } catch (e) {
      console.warn('[SelectRole] Error al actualizar rol:', e);
    } finally {
      setSavingRole(false);
      router.replace('/admin');
    }
  };

  const handleSelectClient = async () => {
    if (savingRole) return;
    try {
      setSavingRole(true);
      if (user?.id) {
        await updateProfile({ role: 'CLIENTE' });
      }
    } catch (e) {
      console.warn('[SelectRole] Error al actualizar rol:', e);
    } finally {
      setSavingRole(false);
      router.replace('/client');
    }
  };

  const handleBackToLogin = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer header={<HeaderLogo />}>
      {/* Título de la pantalla */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        ¿Cómo vas a usar Flowtime?
      </Text>

      <View style={styles.cardsContainer}>
        {/* Tarjeta 1: Soy Profesional / Negocio (Admin) */}
        <TouchableOpacity
          onPress={handleSelectAdmin}
          disabled={savingRole}
          activeOpacity={0.88}
          style={[styles.cardTouchable, Shadows.goldButtonDrop, savingRole && { opacity: 0.6 }]}>
          <LinearGradient
            colors={['#BA8609', '#F4DD89', '#CFA930']}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goldCard}>
            <View style={styles.badgeRow}>
              <View style={styles.goldBadge}>
                <Ionicons name="briefcase" size={12} color="#FFFFFF" style={styles.badgeIcon} />
                <Text style={styles.goldBadgeText}>ADMIN / NEGOCIO</Text>
              </View>
            </View>
            <Text style={styles.goldCardTitle}>Soy Profesional / Negocio</Text>
            <Text style={styles.goldCardDescription}>
              Quiero gestionar mi agenda, mis empleados y controlar los ingresos de mi negocio.
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tarjeta 2: Soy Cliente (Usuario) */}
        <TouchableOpacity
          onPress={handleSelectClient}
          disabled={savingRole}
          activeOpacity={0.88}
          style={[styles.cardTouchable, Shadows.drop, savingRole && { opacity: 0.6 }]}>
          <LinearGradient
            colors={
              isDark
                ? ['#2C2C30', '#222226', '#1A1A1D']
                : ['#FFFFFF', '#EAEAEF', '#D0D0D6']
            }
            locations={[0, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.clientCard,
              {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.clientBadge,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' },
                ]}>
                <Ionicons
                  name="person"
                  size={12}
                  color={isDark ? '#F3DA80' : '#4A4A4E'}
                  style={styles.badgeIcon}
                />
                <Text
                  style={[
                    styles.clientBadgeText,
                    { color: isDark ? '#F3DA80' : '#4A4A4E' },
                  ]}>
                  CLIENTE / USUARIO
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.clientCardTitle,
                { color: isDark ? '#FFFFFF' : '#1C1C1C' },
              ]}>
              Soy Cliente
            </Text>
            <Text
              style={[
                styles.clientCardDescription,
                { color: isDark ? '#C7C7CC' : '#3A3A3C' },
              ]}>
              Quiero buscar barberías o salones, agendar mis citas y ver mis reservas.
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Enlace para volver o cerrar sesión */}
        <TouchableOpacity
          onPress={handleBackToLogin}
          activeOpacity={0.7}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>
            Cambiar de cuenta / Volver al login
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
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  cardsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  cardTouchable: {
    width: '100%',
    borderRadius: BorderRadius.card,
  },
  goldCard: {
    width: '100%',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 145,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  clientCard: {
    width: '100%',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 145,
    borderWidth: 1,
  },
  badgeRow: {
    marginBottom: Spacing.xs,
  },
  badgeIcon: {
    marginRight: 4,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  goldBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  clientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  clientBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  goldCardTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  goldCardDescription: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
  clientCardTitle: {
    ...Typography.h2,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  clientCardDescription: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    ...Typography.small,
  },
});
