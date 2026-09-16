import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Layout, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { GoogleIcon } from './GoogleIcon';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function GoogleButton({
  onPress,
  disabled = false,
  loading = false,
  style,
}: GoogleButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
      style={[
        styles.touchable,
        Shadows.darkButtonDrop,
        disabled && styles.disabled,
        style,
      ]}>
      <LinearGradient
        colors={Gradients.darkButton}
        locations={Gradients.darkButtonLocations}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.iconWrapper}>
            <GoogleIcon size={26} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    height: Layout.buttonHeight,
    borderRadius: BorderRadius.pill,
    marginVertical: Spacing.sm,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
