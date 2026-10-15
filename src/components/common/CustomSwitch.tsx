import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  disabled?: boolean;
}

export function CustomSwitch({
  value,
  onValueChange,
  activeColor = '#C8942A',
  inactiveColor = '#9E9E9E',
  disabled = false,
}: CustomSwitchProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={[
        styles.track,
        { backgroundColor: value ? activeColor : inactiveColor },
        disabled && { opacity: 0.5 },
      ]}>
      <View
        style={[
          styles.thumb,
          value ? styles.thumbRight : styles.thumbLeft,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  thumbLeft: {
    alignSelf: 'flex-start',
  },
  thumbRight: {
    alignSelf: 'flex-end',
  },
});
