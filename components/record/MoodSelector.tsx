import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export type Mood = 'good' | 'normal' | 'bad';

type MoodOption = { value: Mood; label: string; emoji: string };

const MOODS: MoodOption[] = [
  { value: 'good', label: '良い', emoji: '😊' },
  { value: 'normal', label: '普通', emoji: '😐' },
  { value: 'bad', label: '悪い', emoji: '😔' },
];

type MoodSelectorProps = {
  value: Mood | null;
  onChange: (mood: Mood) => void;
};

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>気分</Text>
      <View style={styles.row}>
        {MOODS.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.btn, value === m.value && styles.btnActive]}
            onPress={() => onChange(m.value)}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={[styles.moodLabel, value === m.value && styles.moodLabelActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  label: { ...Typography.cardTitle },
  row: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  emoji: { fontSize: 24 },
  moodLabel: { ...Typography.caption, fontWeight: '600', color: Colors.textMuted },
  moodLabelActive: { color: '#FFFFFF' },
});
