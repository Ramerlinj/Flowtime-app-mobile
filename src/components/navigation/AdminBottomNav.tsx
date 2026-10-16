import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';

export type AdminTab = 'home' | 'servicios' | 'clientes' | 'perfil' | 'ajustes';

interface AdminBottomNavProps {
  currentTab: AdminTab;
}

export function AdminBottomNav({ currentTab }: AdminBottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  const handleTabPress = (tab: AdminTab) => {
    if (tab === currentTab) return;
    if (tab === 'home') {
      router.push('/admin');
    } else if (tab === 'servicios') {
      router.push('/admin/services');
    } else if (tab === 'clientes') {
      router.push('/admin/clients');
    } else if (tab === 'perfil') {
      router.push('/admin/profile');
    } else if (tab === 'ajustes') {
      router.push('/admin/settings');
    }
  };

  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopColor: isDark ? '#2C2C2E' : '#E8E4DC',
        },
      ]}>
      {/* Tab 1: Home */}
      <TouchableOpacity
        onPress={() => handleTabPress('home')}
        activeOpacity={0.7}
        style={styles.navTab}>
        {currentTab === 'home' && <View style={styles.activeIndicator} />}
        <Ionicons
          name={currentTab === 'home' ? 'home' : 'home-outline'}
          size={22}
          color={currentTab === 'home' ? '#BA8609' : colors.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            currentTab === 'home'
              ? styles.navLabelActive
              : { color: colors.textSecondary },
          ]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Servicios */}
      <TouchableOpacity
        onPress={() => handleTabPress('servicios')}
        activeOpacity={0.7}
        style={styles.navTab}>
        {currentTab === 'servicios' && <View style={styles.activeIndicator} />}
        <Ionicons
          name={currentTab === 'servicios' ? 'clipboard' : 'clipboard-outline'}
          size={22}
          color={currentTab === 'servicios' ? '#BA8609' : colors.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            currentTab === 'servicios'
              ? styles.navLabelActive
              : { color: colors.textSecondary },
          ]}>
          Servicios
        </Text>
      </TouchableOpacity>

      {/* Tab 3: Clientes */}
      <TouchableOpacity
        onPress={() => handleTabPress('clientes')}
        activeOpacity={0.7}
        style={styles.navTab}>
        {currentTab === 'clientes' && <View style={styles.activeIndicator} />}
        <Ionicons
          name={currentTab === 'clientes' ? 'people' : 'people-outline'}
          size={22}
          color={currentTab === 'clientes' ? '#BA8609' : colors.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            currentTab === 'clientes'
              ? styles.navLabelActive
              : { color: colors.textSecondary },
          ]}>
          Clientes
        </Text>
      </TouchableOpacity>

      {/* Tab 4: Perfil */}
      <TouchableOpacity
        onPress={() => handleTabPress('perfil')}
        activeOpacity={0.7}
        style={styles.navTab}>
        {currentTab === 'perfil' && <View style={styles.activeIndicator} />}
        <Ionicons
          name={currentTab === 'perfil' ? 'storefront' : 'storefront-outline'}
          size={22}
          color={currentTab === 'perfil' ? '#BA8609' : colors.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            currentTab === 'perfil'
              ? styles.navLabelActive
              : { color: colors.textSecondary },
          ]}>
          Perfil
        </Text>
      </TouchableOpacity>

      {/* Tab 5: Ajustes */}
      <TouchableOpacity
        onPress={() => handleTabPress('ajustes')}
        activeOpacity={0.7}
        style={styles.navTab}>
        {currentTab === 'ajustes' && <View style={styles.activeIndicator} />}
        <Ionicons
          name={currentTab === 'ajustes' ? 'settings' : 'settings-outline'}
          size={21}
          color={currentTab === 'ajustes' ? '#BA8609' : colors.textSecondary}
        />
        <Text
          style={[
            styles.navLabel,
            currentTab === 'ajustes'
              ? styles.navLabelActive
              : { color: colors.textSecondary },
          ]}>
          Ajustes
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    zIndex: 90,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 60,
    height: 2.5,
    backgroundColor: '#BA8609',
    borderRadius: 1.5,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#BA8609',
    fontWeight: '700',
  },
});
