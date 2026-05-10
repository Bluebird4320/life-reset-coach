import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../components/Card';
import { FutureCompassCard } from '../components/FutureCompassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import type { DailyLog } from '../types';
import { loadTodayLog } from '../utils/storage';

export default function ResultScreen() {
  const [log, setLog] = useState<DailyLog | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadTodayLog().then(setLog);
    }, [])
  );

  if (!log) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const actionLabel: Record<string, string> = {
    done: '✅ 完了！',
    partial: '🌓 途中まで',
    not_done: '😔 できず',
  };
  const actionPoints: Record<string, number> = { done: 25, partial: 10, not_done: -20 };

  const desiredPts = log.desiredActionsDone.length * 10;
  const avoidPts = log.avoidActionsDone.length * 15;
  const tomorrowPts = log.tomorrowFix.trim() ? 10 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>今日の振り返り結果</Text>
        </View>

        <FutureCompassCard score={log.score} />

        {/* スコア内訳 */}
        <Card>
          <Text style={styles.breakdownTitle}>📊 スコア内訳</Text>
          <View style={styles.breakdownRows}>
            <BreakdownRow label="初期値" points={50} sign="none" />
            <BreakdownRow
              label={`今日のアクション（${actionLabel[log.actionCompleted]}）`}
              points={actionPoints[log.actionCompleted]}
              sign={actionPoints[log.actionCompleted] >= 0 ? 'plus' : 'minus'}
            />
            {log.desiredActionsDone.length > 0 && (
              <BreakdownRow
                label={`理想行動 ${log.desiredActionsDone.length}個 × +10`}
                points={desiredPts}
                sign="plus"
              />
            )}
            {log.avoidActionsDone.length > 0 && (
              <BreakdownRow
                label={`避けるべき行動 ${log.avoidActionsDone.length}個 × -15`}
                points={-avoidPts}
                sign="minus"
              />
            )}
            {tomorrowPts > 0 && (
              <BreakdownRow label="明日の修正点を記入" points={tomorrowPts} sign="plus" />
            )}
            <View style={styles.divider} />
            <BreakdownRow label="合計" points={log.score} sign="total" />
          </View>
        </Card>

        {/* 今日の行動まとめ */}
        {(log.desiredActionsDone.length > 0 || log.avoidActionsDone.length > 0) && (
          <Card style={styles.summaryCard}>
            {log.desiredActionsDone.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>✅ できた理想行動</Text>
                {log.desiredActionsDone.map((a) => (
                  <Text key={a} style={styles.summaryItem}>· {a}</Text>
                ))}
              </View>
            )}
            {log.avoidActionsDone.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={[styles.summaryLabel, { color: '#E05C5C' }]}>
                  ⚠️ やってしまった行動
                </Text>
                {log.avoidActionsDone.map((a) => (
                  <Text key={a} style={[styles.summaryItem, { color: '#E05C5C' }]}>· {a}</Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* 明日の修正点 */}
        {log.tomorrowFix ? (
          <Card style={styles.tomorrowCard}>
            <Text style={styles.tomorrowLabel}>🔧 明日の修正点</Text>
            <Text style={styles.tomorrowText}>{log.tomorrowFix}</Text>
          </Card>
        ) : null}

        <PrimaryButton
          label="ホームへ戻る"
          onPress={() => router.replace('/home')}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function BreakdownRow({
  label,
  points,
  sign,
}: {
  label: string;
  points: number;
  sign: 'plus' | 'minus' | 'none' | 'total';
}) {
  const isTotal = sign === 'total';
  const color =
    sign === 'plus' ? '#4A90E2' : sign === 'minus' ? '#E05C5C' : '#5A5A7A';
  const pointsText =
    sign === 'none'
      ? `${points}`
      : sign === 'plus'
      ? `+${points}`
      : sign === 'minus'
      ? `${points}`
      : `${points}点`;

  return (
    <View style={[rowStyles.row, isTotal && rowStyles.totalRow]}>
      <Text style={[rowStyles.label, isTotal && rowStyles.totalLabel]}>{label}</Text>
      <Text style={[rowStyles.points, { color: isTotal ? '#1A1A2E' : color }, isTotal && rowStyles.totalPoints]}>
        {pointsText}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  totalRow: { paddingTop: 10 },
  label: { fontSize: 14, color: '#5A5A7A', flex: 1, paddingRight: 8 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  points: { fontSize: 15, fontWeight: '700' },
  totalPoints: { fontSize: 20, fontWeight: '800' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: '#8A8A9A' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  header: { alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  breakdownTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  breakdownRows: { gap: 2 },
  divider: { height: 1, backgroundColor: '#E8E8F0', marginVertical: 8 },
  summaryCard: { gap: 14 },
  summarySection: { gap: 6 },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: '#4A90E2' },
  summaryItem: { fontSize: 14, color: '#2C2C3E', paddingLeft: 4 },
  tomorrowCard: { backgroundColor: '#F0FFF4', gap: 6 },
  tomorrowLabel: { fontSize: 13, fontWeight: '700', color: '#38A169' },
  tomorrowText: { fontSize: 15, color: '#2C2C3E', lineHeight: 22 },
  button: { marginTop: 8 },
});
