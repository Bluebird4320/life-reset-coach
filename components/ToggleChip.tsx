import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  selectedColor?: string;
};

export function ToggleChip({ label, selected, onPress, selectedColor = '#4A90E2' }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && { backgroundColor: selectedColor, borderColor: selectedColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {selected ? '✓ ' : ''}{label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#D0D0E0',
    backgroundColor: '#FFFFFF',
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
