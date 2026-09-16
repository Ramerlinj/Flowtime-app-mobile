import { Platform } from 'react-native';
import { Colors as FlowColors, BrandColors } from '@/theme/colors';

export const Colors = {
  light: {
    text: FlowColors.light.textPrimary,
    background: FlowColors.light.background,
    backgroundElement: FlowColors.light.card,
    backgroundSelected: BrandColors.selected,
    textSecondary: FlowColors.light.textSecondary,
    gold: BrandColors.goldText,
    success: BrandColors.successGreen,
  },
  dark: {
    text: FlowColors.dark.textPrimary,
    background: FlowColors.dark.background,
    backgroundElement: FlowColors.dark.card,
    backgroundSelected: FlowColors.dark.selected,
    textSecondary: FlowColors.dark.textSecondary,
    gold: FlowColors.dark.goldText,
    success: FlowColors.dark.successText,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    rounded: '"SF Pro Rounded", "Hiragino Maru Gothic ProN", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
