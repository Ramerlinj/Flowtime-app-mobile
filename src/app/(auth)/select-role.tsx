import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ScreenContainer,
  HeaderLogo,
  DarkModeToggle,
} from '@/components/common';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export default function SelectRoleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { login } = useAuth();

  const handleSelectRole = async (role: 'professional' | 'client') => {
    // Si queremos simular login con el rol seleccionado:
    await login({
      email: 'admin@gmail.com',
      password: 'admin123',
    });
    router.replace('/home');
  };

  return (
    <ScreenContainer>
      {/* Botón superior derecho para Modo Oscuro */}
      <DarkModeToggle />

      {/* Logotipo Flowtime */}
      <HeaderLogo />

      {/* Título de la pantalla */}
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        ¿Cómo vas a usar Flowtime?
      </Text>

      <View style={styles.cardsContainer}>
        {/* Tarjeta 1: Soy Profesional / Negocio */}
        <TouchableOpacity
          onPress={() => handleSelectRole('professional')}
          activeOpacity={0.88}
          style={[styles.cardTouchable, Shadows.goldButtonDrop]}>
          <LinearGradient
            colors={Gradients.goldPremium}
            locations={Gradients.goldPremiumLocations}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.cardGradient}>
            <Text style={styles.goldCardTitle}>
              Soy Profesional / Negocio
            </Text>
            <Text style={styles.goldCardDescription}>
              Quiero gestionar mi agenda, mis empleados y controlar los ingresos de mi negocio.
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Tarjeta 2: Soy Cliente */}
        <TouchableOpacity
          onPress={() => handleSelectRole('client')}
          activeOpacity={0.88}
          style={[styles.cardTouchable, Shadows.drop]}>
          <LinearGradient
            colors={Gradients.clientButton}
            locations={Gradients.clientButtonLocations}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.cardGradient}>
            <Text style={styles.clientCardTitle}>
              Soy Cliente
            </Text>
            <Text style={styles.clientCardDescription}>
              Quiero buscar barberías o salones, agendar mis citas y ver mis reservas.
            </Text>
          </LinearGradient>
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
    gap: Spacing.xl,
  },
  cardTouchable: {
    width: '100%',
    borderRadius: BorderRadius.card,
  },
  cardGradient: {
    width: '100%',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 135,
  },
  goldCardTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  goldCardDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
  clientCardTitle: {
    ...Typography.h3,
    color: '#1C1C1C',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  clientCardDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#1C1C1C',
    textAlign: 'center',
  },
});
