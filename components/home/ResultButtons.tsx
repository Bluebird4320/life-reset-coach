import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export type ActionStatus = 'done' | 'partial' | 'failed';

type ResultOption = {
  value: ActionStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
};

const OPTIONS: ResultOption[] = [
  { value: 'done', label: 'できた', emoji: '✅', color: Colors.success, bgColor: '#F1FBF2' },
  { value: 'partial', label: '一部できた', emoji: '🌓', color: Colors.warning, bgColor: '#FFF8EC' },
  { value: 'failed', label: 'できなかった', emoji: '😔', color: Colors.danger, bgColor: '#FEF2F2' },
];

type ResultButtonsProps = {
  onSelect: (status: ActionStatus) => void;
};

export function ResultButtons({ onSelect }: ResultButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>今日の結果は？</Text>
      <View style={styles.row}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.btn, { backgroundColor: opt.bgColor, borderColor: opt.color }]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.85}
          >
            <Text style={styles.emoji}>{opt.emoji}</Text>
            <Text style={[styles.btnLabel, { color: opt.color }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  label: {
    ...Typography.label,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
  },
  emoji: { fontSize: 22 },
  btnLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
