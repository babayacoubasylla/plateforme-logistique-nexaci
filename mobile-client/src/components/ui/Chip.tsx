import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ChipProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Chip({ label, onPress, disabled, style, textStyle }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, disabled && styles.chipDisabled, style]}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff'
  },
  chipDisabled: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb'
  },
  text: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  textDisabled: {
    color: '#9ca3af'
  }
});
