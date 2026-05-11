import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChartWeekly } from '../../components/report/BarChartWeekly';
import { CalendarHeatmap } from '../../components/report/CalendarHeatmap';
import { TabSelector } from '../../components/report/TabSelector';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { calcStreak } from '../../hooks/useStreak';
import { getDayLabel, getLastNDays } from '../../lib/dateUtils';
import { useRecordStore } from '../../store/recordStore';

type PeriodTab = 'day' | 'week' | 'month' | 'year';

const TABS = [
  { key: 'day', label: '日' },
  { key: 'week', label: '週' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
];

export default function ReportScreen() {
  const [activeTab, setActiveTab] = useState<PeriodTab>('week');
  const { allRecords, fetchAllRecords } = useRecordStore();

  useFocusEffect(
    useCallback(() => {
      fetchAllRecords();
    }, [])
  );

  const streak = calcStreak(allRecords);

  // 週集計
  const last7 = getLastNDays(7);
  const weekData = last7.map((date) => {
    const rec = allRecords.find((r) => r.date === date);
    return {
      label: getDayLabel(date),
      minutes: rec ? Math.floor((rec.elapsedSeconds ?? 0) / 60) : 0,
    };
  });

  const weekRecords = allRecords.filter((r) => last7.includes(r.date));
  const totalMinutesWeek = weekRecords.reduce(
    (sum, r) => sum + Math.floor((r.elapsedSeconds ?? 0) / 60),
    0
  );
  const activeDaysWeek = weekRecords.filter((r) => r.elapsedSeconds && r.elapsedSeconds > 0).length;
  const doneCountWeek = weekRecords.filter((r) => r.status === 'done' || r.status === 'partial').length;
  const achieveRateWeek = weekRecords.length > 0
    ? Math.round((doneCountWeek / weekRecords.length) * 100)
    : 0;

  // カレンダー用（直近30日）
  const last30 = getLastNDays(30);
  const calendarDays = last30.map((date) => {
    const rec = allRecords.find((r) => r.date === date);
    return {
      date,
      status: rec
        ? (rec.status as 'done' | 'partial' | 'failed')
        : ('empty' as const),
    };
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>レポート</Text>

        {/* 期間タブ */}
        <TabSelector
          tabs={TABS}
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k as PeriodTab)}
        />

        {/* 週タブ（Phase 1 完全実装） */}
        {activeTab === 'week' && (
          <>
            {/* サマリーカード */}
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>今週のサマリー</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem label="達成日数" value={`${activeDaysWeek}日`} emoji="📅" />
                <SummaryItem label="累計時間" value={`${totalMinutesWeek}分`} emoji="⏱" />
                <SummaryItem label="達成率" value={`${achieveRateWeek}%`} emoji="🎯" />
                <SummaryItem label="連続日数" value={`${streak.current}日`} emoji="🔥" />
              </View>
            </Card>

            {/* 棒グラフ */}
            <Card>
              <Text style={styles.chartTitle}>曜日別の実施時間（分）</Text>
              <BarChartWeekly data={weekData} />
            </Card>

            {/* ヒートマップ（直近30日） */}
            <Card>
              <Text style={styles.chartTitle}>直近30日の記録</Text>
              <CalendarHeatmap days={calendarDays} />
            </Card>
          </>
        )}

        {/* 日・月・年タブは Phase 2 以降で実装 */}
        {activeTab !== 'week' && (
          <Card style={styles.todoCard}>
            <Text style={styles.todoText}>
              📋 この期間のレポートは近日公開予定です
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={summaryStyles.item}>
      <Text style={summaryStyles.emoji}>{emoji}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 18 },
  value: { ...Typography.bigNumber, fontSize: 20 },
  label: { ...Typography.caption },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  title: { ...Typography.screenTitle },
  summaryCard: { gap: Spacing.md },
  summaryTitle: { ...Typography.cardTitle },
  summaryGrid: { flexDirection: 'row', gap: Spacing.sm },
  chartTitle: { ...Typography.cardTitle, marginBottom: Spacing.sm },
  todoCard: { alignItems: 'center', paddingVertical: Spacing.xxl },
  todoText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});
