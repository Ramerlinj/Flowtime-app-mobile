import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';

interface Props {
  size?: number;
  avatarUrl?: string | null;
  name?: string | null;
  lastName?: string | null;
  style?: StyleProp<ViewStyle>;
  borderWidth?: number;
  borderColor?: string;
  showBadge?: boolean;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
}

export function UserAvatar({
  size = 44,
  avatarUrl,
  name,
  lastName,
  style,
  borderWidth = 1.5,
  borderColor = '#BA8609',
  showBadge = false,
  badgeIcon = 'checkmark-circle',
}: Props) {
  const { isDark } = useAppTheme();

  // Generar iniciales
  const firstLetter = (name || '').trim().charAt(0).toUpperCase();
  const secondLetter = (lastName || '').trim().charAt(0).toUpperCase();
  const initials = `${firstLetter}${secondLetter}`.trim() || 'U';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
  };

  const fontSize = Math.max(Math.round(size * 0.38), 11);

  if (avatarUrl && avatarUrl.trim().length > 0) {
    return (
      <View style={[styles.wrapper, containerStyle, style]}>
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
        />
        {showBadge && (
          <View style={[styles.badge, { bottom: -2, right: -2 }]}>
            <Ionicons name={badgeIcon} size={Math.round(size * 0.32)} color="#188E1C" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, containerStyle, style]}>
      <LinearGradient
        colors={isDark ? ['#3A311D', '#1F1A10'] : ['#FDEFC7', '#EED89E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}>
        {initials !== 'U' ? (
          <Text style={[styles.initialsText, { fontSize, color: isDark ? '#F5DE91' : '#6A4D0B' }]}>
            {initials}
          </Text>
        ) : (
          <Ionicons
            name="person"
            size={Math.round(size * 0.52)}
            color={isDark ? '#BA8609' : '#8A6715'}
          />
        )}
      </LinearGradient>
      {showBadge && (
        <View style={[styles.badge, { bottom: -2, right: -2 }]}>
          <Ionicons name={badgeIcon} size={Math.round(size * 0.32)} color="#188E1C" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#2A2A2E',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
  },
});
