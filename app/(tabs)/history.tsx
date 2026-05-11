import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatDateJa, formatSeconds } from '../../lib/dateUtils';
import { useRecordStore } from '../../store/recordStore';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  done: { label: 'できた ✅', color: Colors.success },
  partial: { label: '一部できた 🌓', color: Colors.warning },
  failed: { label: 'できなかった 😔', color: Colors.danger },
};

const MOOD_EMOJI: Record<string, string> = {
  good: '😊 良い',
  normal: '😐 普通',
  bad: '😔 悪い',
};

export default function HistoryScreen() {
  const { allRecords, fetchAllRecords } = useRecordStore();

  useFocusEffect(
    useCallback(() => {
      fetchAllRecords();
    }, [])
  );

  if (allRecords.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>まだ記録がありません</Text>
          <Text style={styles.emptyHint}>
            毎日の行動を記録して{'\n'}あなたの成長を確認しましょう
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>記録一覧</Text>
        <Text style={styles.count}>{allRecords.length}件</Text>

        {allRecords.map((rec) => {
          const statusInfo = STATUS_MAP[rec.status] ?? { label: rec.status, color: Colors.textMuted };
          return (
            <Card key={rec.id} style={styles.card}>
              {/* 日付 + 達成状態 */}
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{formatDateJa(rec.date)}</Text>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>

              {/* メタ情報 */}
              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>
                  ⏱ {formatSeconds(rec.elapsedSeconds ?? 0)}
                </Text>
                {rec.mood ? (
                  <Text style={styles.metaItem}>{MOOD_EMOJI[rec.mood] ?? rec.mood}</Text>
                ) : null}
              </View>

              {/* メモ */}
              {rec.memo ? (
                <Text style={styles.memo} numberOfLines={3}>
                  {rec.memo}
                </Text>
              ) : null}

              {/* 明日のアクション */}
              {rec.nextAction ? (
                <View style={styles.nextBox}>
                  <Text style={styles.nextLabel}>明日 →</Text>
                  <Text style={styles.nextText} numberOfLines={2}>
                    {rec.nextAction}
                  </Text>
                </View>
              ) : null}

              {/* AIコーチ */}
              {rec.aiCoachMsg ? (
                <View style={styles.aiBox}>
                  <Text style={styles.aiLabel}>🤖 AIコーチ</Text>
                  <Text style={styles.aiMsg} numberOfLines={3}>
                    {rec.aiCoachMsg}
                  </Text>
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  title: { ...Typography.screenTitle },
  count: { ...Typography.caption, marginTop: -Spacing.sm },
  card: { gap: Spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: { ...Typography.cardTitle, fontSize: 13 },
  statusText: { fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: Spacing.lg },
  metaItem: { ...Typography.caption },
  memo: { ...Typography.body, lineHeight: 22 },
  nextBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  nextLabel: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  nextText: { ...Typography.body, flex: 1 },
  aiBox: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiLabel: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  aiMsg: { ...Typography.body, lineHeight: 20 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { ...Typography.screenTitle, textAlign: 'center' },
  emptyHint: { ...Typography.body, textAlign: 'center', lineHeight: 24, color: Colors.textMuted },
});
