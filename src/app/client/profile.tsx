import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

const USER_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80';

export default function ClientProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
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
        {/* Cabecera con Botón de Regreso */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Perfil</Text>
        </View>

        {/* Card 1: Mi Perfil */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={[
            styles.card,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Text style={[styles.cardHeaderSmall, { color: colors.textPrimary }]}>Mi perfil</Text>
          <View style={styles.profileInfoRow}>
            <Image source={{ uri: USER_AVATAR }} style={styles.avatarLarge} />
            <View style={styles.profileTextCol}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>Carlos Ramirez</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>carlos.r@email.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* Card 2: Modo Oscuro */}
        <View
          style={[
            styles.card,
            styles.rowBetween,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Text style={[styles.optionLabel, { color: colors.textPrimary }]}>Modo oscuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#2C2C2E', true: '#C89C25' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#2C2C2E"
          />
        </View>

        {/* Card 3: Menú de Navegación del Usuario */}
        <View
          style={[
            styles.card,
            styles.groupedCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <TouchableOpacity style={styles.menuRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Mis reservas</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Ionicons name="heart-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Favoritos</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Mensajes</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Configuración</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
          </TouchableOpacity>
        </View>

        {/* Card 4: Soporte y Términos */}
        <View
          style={[
            styles.card,
            styles.groupedCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <TouchableOpacity style={styles.menuRow}>
            <Feather name="arrow-up-right" size={18} color={colors.textPrimary} style={styles.legalIcon} />
            <Text style={[styles.legalLabel, { color: colors.textPrimary }]}>Términos y Condiciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Feather name="arrow-up-right" size={18} color={colors.textPrimary} style={styles.legalIcon} />
            <Text style={[styles.legalLabel, { color: colors.textPrimary }]}>Póliticas de Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <Feather name="arrow-up-right" size={18} color={colors.textPrimary} style={styles.legalIcon} />
            <Text style={[styles.legalLabel, { color: colors.textPrimary }]}>Soporte</Text>
          </TouchableOpacity>
        </View>

        {/* Card 5: Cerrar Sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={[
            styles.logoutCard,
            { backgroundColor: colors.card },
            Shadows.drop,
          ]}>
          <Ionicons name="log-out-outline" size={20} color={colors.textPrimary} style={styles.logoutIcon} />
          <Text style={[styles.logoutText, { color: colors.textPrimary }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de Navegación Inferior (Cliente) */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            paddingBottom: Math.max(insets.bottom, 10),
            borderTopColor: colors.divider,
          },
        ]}>
        <TouchableOpacity onPress={() => router.replace('/client')} style={styles.navTab}>
          <Ionicons name="home-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/client')} style={styles.navTab}>
          <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/client')} style={styles.navTab}>
          <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.navLabel, { color: colors.textSecondary }]}>Actividad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab}>
          <View style={styles.activeTabIndicator} />
          <Image source={{ uri: USER_AVATAR }} style={styles.navAvatarIconActive} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: 8,
  },
  backButton: {
    paddingRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
  },
  cardHeaderSmall: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  profileTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  groupedCard: {
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIcon: {
    width: 28,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  legalIcon: {
    width: 28,
  },
  legalLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    paddingVertical: 16,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  activeTabIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#C89C25',
  },
  navAvatarIconActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C89C25',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#C89C25',
    fontWeight: '700',
  },
});
