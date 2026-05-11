import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Card } from '../ui/Card';

type ActionCardProps = {
  title: string;
  targetMinutes: number;
  elapsedSeconds?: number;
};

export function ActionCard({ title, targetMinutes, elapsedSeconds }: ActionCardProps) {
  const elapsedMin = Math.floor((elapsedSeconds ?? 0) / 60);

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionLabel}>⚡ 今日の最低限アクション</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>目標時間</Text>
          <Text style={styles.metaValue}>{targetMinutes}分</Text>
        </View>
        {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>実施済み</Text>
            <Text style={[styles.metaValue, styles.elapsed]}>{elapsedMin}分</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.label,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primaryDark,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.xs,
  },
  metaItem: { gap: 2 },
  metaLabel: {
    ...Typography.caption,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  elapsed: { color: Colors.primary },
});
