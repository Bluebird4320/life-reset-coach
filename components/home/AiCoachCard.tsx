import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';

type AiCoachCardProps = {
  message: string;
  loading?: boolean;
};

export function AiCoachCard({ message, loading }: AiCoachCardProps) {
  if (!loading && !message) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.headerLabel}>🤖 AIコーチより</Text>
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>フィードバックを生成中...</Text>
        </View>
      ) : (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryMid,
  },
  headerLabel: {
    ...Typography.label,
    color: Colors.primary,
  },
  message: {
    ...Typography.body,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.caption,
  },
});
