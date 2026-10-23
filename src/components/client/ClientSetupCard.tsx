import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { User } from '@/api/types';
import { Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

interface Props {
  user: User | null;
  onPressSetup: () => void;
}

export function ClientSetupCard({ user, onPressSetup }: Props) {
  const { colors, isDark } = useAppTheme();

  // Calcular progreso de perfil
  let completedCount = 0;
  if (user?.name && user.name.trim().length > 0) completedCount += 1;
  if (user?.lastName && user.lastName.trim().length > 0) completedCount += 1;
  if (user?.phone && user.phone.trim().length > 0) completedCount += 1;
  if (user?.avatarUrl && user.avatarUrl.trim().length > 0) completedCount += 1;

  const totalSteps = 4;
  const isComplete = completedCount >= 3 && Boolean(user?.phone);
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
              Perfil Completo y Listo
            </Text>
            <Text style={[styles.verifiedSub, { color: colors.textSecondary }]}>
              Tu cuenta está lista para reservar servicios y recibir confirmaciones.
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
          <Ionicons name="person-circle-outline" size={22} color="#BA8609" />
        </View>
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Configuración de Perfil
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {completedCount === 0
              ? 'Configura tu número y datos para agendar tus citas'
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
          style={[styles.progressBar, { width: `${Math.max(percentage, 15)}%` }]}
        />
      </View>

      {/* Botón de acción */}
      <TouchableOpacity
        onPress={onPressSetup}
        activeOpacity={0.88}
        style={styles.actionBtnWrapper}>
        <LinearGradient
          colors={['#BA8609', '#F3DA80', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.actionBtn, Shadows.goldButtonDrop]}>
          <Ionicons name="sparkles" size={15} color="#1C1C1C" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>
            {completedCount === 0 ? 'Completar Mi Perfil' : 'Continuar Configuración'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(186, 134, 9, 0.25)',
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(186, 134, 9, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(186, 134, 9, 0.15)',
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  actionBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionBtn: {
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  verifiedCard: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 142, 28, 0.25)',
    marginVertical: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3DA80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTextCol: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  verifiedSub: {
    fontSize: 11,
    marginTop: 1,
  },
  editPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(186, 134, 9, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(186, 134, 9, 0.3)',
  },
  editPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#BA8609',
  },
});
