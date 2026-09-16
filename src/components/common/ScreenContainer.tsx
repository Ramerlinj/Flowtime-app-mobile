import React from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradients } from '@/theme/colors';
import { Layout, Spacing } from '@/theme/spacing';
import { useAppTheme } from '@/context/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function ScreenContainer({ children, scrollable = true }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const gradientColors = isDark ? Gradients.backgroundDark : Gradients.backgroundLight;
  const gradientLocations = isDark ? Gradients.backgroundDarkLocations : Gradients.backgroundLightLocations;

  const content = (
    <View style={[styles.innerContent, { maxWidth: Layout.maxContentWidth }]}>
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={gradientColors}
      locations={gradientLocations}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradientContainer}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top, 16) + 40,
                paddingBottom: Math.max(insets.bottom, 20) + Spacing.base,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.nonScrollContent,
              {
                paddingTop: Math.max(insets.top, 16) + 40,
                paddingBottom: Math.max(insets.bottom, 20) + Spacing.base,
              },
            ]}>
            {content}
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  nonScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  innerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
