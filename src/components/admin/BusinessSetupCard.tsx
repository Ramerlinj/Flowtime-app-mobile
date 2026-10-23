import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Business } from '@/api/types';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

interface Props {
  business: Business | null;
  onPressSetup: () => void;
}

export function BusinessSetupCard({ business, onPressSetup }: Props) {
  const { colors, isDark } = useAppTheme();

  // Calcular porcentaje completado
  let completedCount = 0;
  if (business?.nombre_comercial) completedCount += 1;
  if (business?.telefono || business?.direccion) completedCount += 1;
  if (business?.descripcion) completedCount += 1;
  if (business?.instagram || business?.tiktok) completedCount += 1;
  if (business?.foto_portada || business?.foto_perfil) completedCount += 1;

  const totalSteps = 5;
  const isComplete = completedCount >= 4 && Boolean(business?.nombre_comercial);
  const percentage = Math.round((completedCount / totalSteps) * 100);

  if (isComplete) {
    return (
      <View
        style={[
          styles.verifiedCard,
          { backgroundColor: isDark ? '#1C1914' : '#F7F3EB' },
          Shadows.drop,
        ]}>
        <View style={styles.verifiedRow}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark-sharp" size={16} color="#1C1C1C" />
          </View>
          <View style={styles.verifiedTextCol}>
            <Text style={[styles.verifiedTitle, { color: colors.textPrimary }]}>
              Negocio Configurado y Listo
            </Text>
            <Text style={[styles.verifiedSub, { color: colors.textSecondary }]}>
              {business?.nombre_comercial || 'Tu local'} está activo y disponible para recibir citas.
            </Text>
          </View>
          <TouchableOpacity
            onPress={onPressSetup}
            activeOpacity={0.8}
            style={styles.editPill}>
            <Text style={styles.editPillText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1F1B14' : '#FAF5EC' },
        Shadows.drop,
      ]}>
      <View style={styles.topRow}>
        <View style={styles.iconBadge}>
          <Ionicons name="construct-outline" size={20} color="#BA8609" />
        </View>
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Guía de Configuración
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {completedCount === 0
              ? 'Configura tu negocio para comenzar a recibir reservas'
              : `${completedCount} de ${totalSteps} pasos completados (${percentage}%)`}
          </Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={['#BA8609', '#F3DA80', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${Math.max(percentage, 12)}%` }]}
        />
      </View>

      {/* Botón de acción */}
      <TouchableOpacity
        onPress={onPressSetup}
        activeOpacity={0.88}
        style={styles.actionBtnWrapper}>
        <LinearGradient
          colors={['#BA8609', '#F3DA80', '#D4AF37']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.actionBtn, Shadows.goldButtonDrop]}>
          <Text style={styles.actionBtnText}>
            {completedCount === 0 ? 'Comenzar Guía de Configuración' : 'Completar Perfil del Negocio'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#1C1C1C" style={{ marginLeft: 6 }} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.35)',
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(186,134,9,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  actionBtnWrapper: {
    width: '100%',
  },
  actionBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  verifiedCard: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(24,142,28,0.3)',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTextCol: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  verifiedSub: {
    fontSize: 12,
    marginTop: 2,
  },
  editPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA8609',
  },
});
