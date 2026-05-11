import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type VisionCardProps = {
  vision: string;
  categoryEmoji: string;
  categoryLabel: string;
  streakDays: number;
};

export function VisionCard({
  vision,
  categoryEmoji,
  categoryLabel,
  streakDays,
}: VisionCardProps) {
  return (
    <LinearGradient
      colors={[Colors.gradStart, Colors.gradEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.category}>
          {categoryEmoji} {categoryLabel}
        </Text>
        {streakDays > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streakDays}日連続</Text>
          </View>
        )}
      </View>
      <Text style={styles.vision} numberOfLines={3}>
        {vision}
      </Text>
      <Text style={styles.subLabel}>あなたが目指す未来</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vision: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  subLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
});
