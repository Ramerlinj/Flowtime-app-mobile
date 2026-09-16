import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, BrandColors } from '@/theme/colors';
import { BorderRadius, Layout, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export type ButtonVariant = 'goldGradient' | 'darkGradient' | 'goldFlat' | 'clientGradient';

interface FlowButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function FlowButton({
  title,
  onPress,
  variant = 'goldGradient',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  children,
}: FlowButtonProps) {
  const isGradient = variant !== 'goldFlat';

  const getGradientProps = () => {
    switch (variant) {
      case 'darkGradient':
        return {
          colors: Gradients.darkButton,
          locations: Gradients.darkButtonLocations,
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        };
      case 'clientGradient':
        return {
          colors: Gradients.clientButton,
          locations: Gradients.clientButtonLocations,
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        };
      case 'goldGradient':
      default:
        return {
          colors: Gradients.goldPremium,
          locations: Gradients.goldPremiumLocations,
          start: { x: 0, y: 0.5 },
          end: { x: 1, y: 0.5 },
        };
    }
  };

  const getShadow = () => {
    switch (variant) {
      case 'goldGradient':
        return Shadows.goldButtonDrop;
      case 'darkGradient':
        return Shadows.darkButtonDrop;
      default:
        return Shadows.drop;
    }
  };

  const content = (
    <View style={styles.innerContent}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'goldFlat' ? '#1C1C1C' : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title ? (
            <Text
              style={[
                styles.title,
                variant === 'goldFlat' ? styles.titleDark : styles.titleLight,
                textStyle,
              ]}>
              {title}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
      style={[
        styles.touchable,
        getShadow(),
        disabled && styles.disabled,
        style,
      ]}>
      {isGradient ? (
        <LinearGradient
          {...getGradientProps()}
          style={styles.gradientContainer}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.gradientContainer,
            { backgroundColor: BrandColors.goldFlat },
          ]}>
          {content}
        </View>
      )}
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
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.button,
  },
  titleLight: {
    color: '#FFFFFF',
  },
  titleDark: {
    color: '#1C1C1C',
  },
  disabled: {
    opacity: 0.6,
  },
});
