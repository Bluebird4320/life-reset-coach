import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  selectedColor?: string;
};

export function ChoiceChip({
  label,
  selected,
  onPress,
  selectedColor = '#4A90E2',
}: ChoiceChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { backgroundColor: selectedColor, borderColor: selectedColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {selected ? '✓ ' : ''}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#D0D0E0',
    backgroundColor: '#F5F7FF',
  },
  label: {
    fontSize: 14,
    color: '#5A5A7A',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
