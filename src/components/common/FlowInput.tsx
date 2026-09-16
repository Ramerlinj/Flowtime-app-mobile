import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export interface FlowInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function FlowInput({
  containerStyle,
  isPassword = false,
  secureTextEntry,
  placeholder,
  value,
  onChangeText,
  ...rest
}: FlowInputProps) {
  const { colors, isDark } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);

  const shouldHideText = isPassword ? !showPassword : secureTextEntry;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBackground,
        },
        Shadows.drop,
        containerStyle,
      ]}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={shouldHideText}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            color: colors.textPrimary,
          },
        ]}
        {...rest}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.eyeButton}>
          <Text style={[styles.eyeText, { color: colors.placeholder }]}>
            {showPassword ? 'Ocultar' : 'Ver'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Layout.inputHeight,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.xs + 2,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.input,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    ...Typography.smallMedium,
  },
});
