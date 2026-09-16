import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';

export function DarkModeToggle() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <View style={[styles.outerWrapper, { top: Math.max(insets.top, 12) + 6 }]}>
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.8}
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}>
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </Text>
        <View style={[styles.indicatorDot, isDark ? styles.indicatorDotDark : styles.indicatorDotLight]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    right: Spacing.xl,
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    gap: 6,
  },
  containerLight: {
    backgroundColor: '#26221A',
    borderWidth: 1,
    borderColor: '#3D372A',
  },
  containerDark: {
    backgroundColor: '#3E382A',
    borderWidth: 1,
    borderColor: '#F3DA80',
  },
  label: {
    ...Typography.toggle,
  },
  labelLight: {
    color: '#F4F4F6',
  },
  labelDark: {
    color: '#F3DA80',
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indicatorDotLight: {
    backgroundColor: '#E5A93B',
  },
  indicatorDotDark: {
    backgroundColor: '#F3DA80',
  },
});
