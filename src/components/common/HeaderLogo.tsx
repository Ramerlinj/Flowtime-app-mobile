import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

interface HeaderLogoProps {
  width?: number;
  height?: number;
  style?: object;
}

export function HeaderLogo({ width = 220, height = 64, style }: HeaderLogoProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('@/assets/images/flowtime-logo.png')}
        style={{ width, height }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
