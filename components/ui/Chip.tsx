import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  selectedColor?: string;
};

export function Chip({
  label,
  selected = false,
  onPress,
  selectedColor = Colors.primary,
}: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected && { backgroundColor: selectedColor, borderColor: selectedColor },
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});
