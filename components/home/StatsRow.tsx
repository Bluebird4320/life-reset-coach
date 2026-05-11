import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type StatItem = {
  label: string;
  value: string;
  emoji: string;
};

type StatsRowProps = {
  items: StatItem[];
};

export function StatsRow({ items }: StatsRowProps) {
  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emoji: { fontSize: 20 },
  value: {
    ...Typography.bigNumber,
    fontSize: 18,
  },
  label: {
    ...Typography.caption,
    textAlign: 'center',
  },
});
