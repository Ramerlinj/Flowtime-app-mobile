import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export interface FlowInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  errorMessage?: string | null;
}

export function FlowInput({
  containerStyle,
  isPassword = false,
  secureTextEntry,
  errorMessage,
  placeholder,
  value,
  onChangeText,
  ...rest
}: FlowInputProps) {
  const { colors } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);

  const shouldHideText = isPassword ? !showPassword : secureTextEntry;
  const hasError = !!errorMessage;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.inputBackground,
            borderColor: hasError ? '#E74C3C' : 'transparent',
            borderWidth: hasError ? 1.5 : 0,
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
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.placeholder}
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: Spacing.xs,
  },
  container: {
    width: '100%',
    height: Layout.inputHeight,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
  errorText: {
    ...Typography.small,
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
    marginLeft: Spacing.lg,
  },
});
