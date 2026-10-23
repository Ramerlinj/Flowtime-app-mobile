import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Gradients } from '@/theme/colors';
import { BorderRadius, Spacing } from '@/theme/spacing';
import { Typography } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface FlowAlertModalProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  dismissible?: boolean;
}

export function FlowAlertModal({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'Aceptar',
  cancelText,
  isDestructive = false,
  onConfirm,
  onCancel,
  dismissible = true,
}: FlowAlertModalProps) {
  const { colors, isDark } = useAppTheme();

  if (!visible) return null;

  const showCancel = Boolean(cancelText || type === 'confirm');

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle' as const,
          color: '#2ECC71',
          bg: isDark ? 'rgba(46, 204, 113, 0.15)' : 'rgba(46, 204, 113, 0.12)',
        };
      case 'error':
        return {
          name: 'alert-circle' as const,
          color: '#EF4444',
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.12)',
        };
      case 'warning':
        return {
          name: 'warning' as const,
          color: '#F59E0B',
          bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)',
        };
      case 'confirm':
        return {
          name: 'help-circle' as const,
          color: isDestructive ? '#EF4444' : '#D4AF37',
          bg: isDestructive
            ? isDark
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(239, 68, 68, 0.12)'
            : isDark
              ? 'rgba(212, 175, 55, 0.15)'
              : 'rgba(212, 175, 55, 0.12)',
        };
      case 'info':
      default:
        return {
          name: 'information-circle' as const,
          color: '#D4AF37',
          bg: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.12)',
        };
    }
  };

  const iconConfig = getIconConfig();

  const handleBackdropPress = () => {
    if (dismissible) {
      if (showCancel && onCancel) {
        onCancel();
      } else {
        onConfirm();
      }
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (dismissible) {
          if (showCancel && onCancel) onCancel();
          else onConfirm();
        }
      }}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
            },
            Shadows.drop,
          ]}>
          {/* Badge Icono Superior */}
          <View style={[styles.iconBadge, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name} size={36} color={iconConfig.color} />
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>

          {/* Mensaje descriptivo */}
          {message ? (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}

          {/* Contenedor de Botones de Acción */}
          <View style={styles.actionsContainer}>
            {showCancel && (
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.7}
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F2F2F7',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E5EA',
                  },
                ]}>
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: isDark ? '#D1D1D6' : '#636366' },
                  ]}>
                  {cancelText || 'Cancelar'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              style={[
                styles.confirmButtonWrapper,
                showCancel ? { flex: 1 } : { width: '100%' },
              ]}>
              {isDestructive ? (
                <View style={[styles.confirmButton, styles.destructiveButton]}>
                  <Text style={styles.destructiveButtonText}>{confirmText}</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={Gradients.goldPremium}
                  locations={Gradients.goldPremiumLocations}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.confirmButton, Shadows.goldButtonDrop]}>
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  confirmButtonWrapper: {
    height: 48,
  },
  confirmButton: {
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  confirmButtonText: {
    ...Typography.bodyBold,
    color: '#121214',
    fontWeight: '700',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  destructiveButtonText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
