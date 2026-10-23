import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { CustomSwitch } from '@/components/common/CustomSwitch';
import { AdminBottomNav } from '@/components/navigation/AdminBottomNav';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const { showConfirm } = useAlert();

  // Estados de configuración del negocio
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [clientReminders, setClientReminders] = useState(true);
  const [slotInterval, setSlotInterval] = useState('30 min');

  const handleLogout = () => {
    showConfirm(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      async () => {
        await logout();
        router.replace('/(auth)/login');
      },
      {
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
        isDestructive: true,
      }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Fondo Gradiente Principal */}
      <LinearGradient
        colors={isDark ? Gradients.backgroundDark : Gradients.backgroundLight}
        locations={isDark ? Gradients.backgroundDarkLocations : Gradients.backgroundLightLocations}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 12,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Configuración
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Gestiona las preferencias de tu negocio y tu cuenta
          </Text>
        </View>

        {/* Tarjeta de Cuenta */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.accountRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, { color: colors.textPrimary }]}>
                {user?.name || 'Administrador Flowtime'}
              </Text>
              <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
                {user?.email || 'admin@flowtime.app'}
              </Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#BA8609" style={{ marginRight: 4 }} />
                <Text style={styles.roleBadgeText}>ADMIN / NEGOCIO</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Apariencia */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Apariencia
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={20}
                  color="#BA8609"
                />
              </View>
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Modo Oscuro
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {isDark ? 'Tema oscuro activado' : 'Tema claro (predeterminado)'}
                </Text>
              </View>
            </View>
            <CustomSwitch value={isDark} onValueChange={toggleTheme} activeColor="#BA8609" />
          </View>
        </View>

        {/* Sección: Gestión de Reservas */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Gestión de Citas
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={20} color="#BA8609" />
              </View>
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Confirmación automática
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Aprobar citas automáticamente al recibirlas
                </Text>
              </View>
            </View>
            <CustomSwitch
              value={autoConfirm}
              onValueChange={setAutoConfirm}
              activeColor="#BA8609"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#BA8609" />
              </View>
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Intervalo entre citas
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Tiempo base entre turnos
                </Text>
              </View>
            </View>
            <View style={styles.pillsRow}>
              {['15 min', '30 min', '45 min'].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSlotInterval(item)}
                  style={[
                    styles.intervalPill,
                    slotInterval === item && styles.intervalPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.intervalPillText,
                      slotInterval === item
                        ? styles.intervalPillTextActive
                        : { color: colors.textSecondary },
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="cash-outline" size={20} color="#BA8609" />
              </View>
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Moneda predeterminada
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Tarifa base para los cobros
                </Text>
              </View>
            </View>
            <View style={styles.currencyToggle}>
              <TouchableOpacity
                onPress={() => setCurrency('DOP')}
                style={[
                  styles.currencyOption,
                  currency === 'DOP' && styles.currencyOptionActive,
                ]}>
                <Text
                  style={[
                    styles.currencyText,
                    currency === 'DOP'
                      ? styles.currencyTextActive
                      : { color: colors.textSecondary },
                  ]}>
                  DOP (RD$)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCurrency('USD')}
                style={[
                  styles.currencyOption,
                  currency === 'USD' && styles.currencyOptionActive,
                ]}>
                <Text
                  style={[
                    styles.currencyText,
                    currency === 'USD'
                      ? styles.currencyTextActive
                      : { color: colors.textSecondary },
                  ]}>
                  USD ($)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sección: Notificaciones */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Notificaciones y Alertas
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#BA8609" />
              </View>
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Alertas de nuevas reservas
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Recibir aviso inmediato al agendarse una cita
                </Text>
              </View>
            </View>
            <CustomSwitch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              activeColor="#BA8609"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-unread-outline" size={20} color="#BA8609" />
              </View>
              <View style={styles.settingTextWrapper}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Recordatorios a clientes
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Avisar 2 horas antes de la cita
                </Text>
              </View>
            </View>
            <CustomSwitch
              value={clientReminders}
              onValueChange={setClientReminders}
              activeColor="#BA8609"
            />
          </View>
        </View>

        {/* Sección: Seguridad y Cuenta */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Seguridad y Sesión
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/reset-password')}
            activeOpacity={0.7}
            style={styles.actionRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconContainer}>
                <Ionicons name="key-outline" size={20} color="#BA8609" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Cambiar contraseña
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={styles.actionRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.12)' }]}>
                <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
              </View>
              <Text style={[styles.settingLabel, { color: '#E74C3C', fontWeight: '700' }]}>
                Cerrar sesión
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#E74C3C" />
          </TouchableOpacity>
        </View>

        {/* Pie de versión */}
        <View style={styles.versionFooter}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            FlowTime Business v1.0.0
          </Text>
          <Text style={[styles.copyrightText, { color: colors.placeholder }]}>
            Desarrollado para República Dominicana
          </Text>
        </View>
      </ScrollView>

      {/* Barra de navegación inferior con el tab Ajustes activo */}
      <AdminBottomNav currentTab="ajustes" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...Typography.body,
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    width: '100%',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#BA8609',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    ...Typography.h3,
    fontSize: 17,
    fontWeight: '700',
  },
  accountEmail: {
    ...Typography.small,
    marginTop: 1,
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(186, 134, 9, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#BA8609',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs + 2,
    marginLeft: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(186, 134, 9, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingTextWrapper: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    fontSize: 14.5,
    fontWeight: '600',
  },
  settingDescription: {
    ...Typography.small,
    fontSize: 11.5,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  intervalPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  intervalPillActive: {
    backgroundColor: '#BA8609',
  },
  intervalPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  intervalPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: BorderRadius.pill,
    padding: 2,
  },
  currencyOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
  },
  currencyOptionActive: {
    backgroundColor: '#BA8609',
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  currencyTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 11,
    marginTop: 2,
  },
});
