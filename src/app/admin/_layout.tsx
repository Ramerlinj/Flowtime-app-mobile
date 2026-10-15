import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="services" />
      <Stack.Screen name="clients" />
      <Stack.Screen name="client/[id]" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
