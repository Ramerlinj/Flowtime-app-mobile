import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { colors } = useAppTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.goldText} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'PROFESIONAL' || user.role === 'ADMIN') {
      return <Redirect href="/admin" />;
    }
    if (user.role === 'CLIENTE') {
      return <Redirect href="/client" />;
    }
    return <Redirect href="/(auth)/select-role" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
