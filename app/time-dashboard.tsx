import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { SimpleBarChart, type BarChartItem } from '../components/SimpleBarChart';
import type { DailyActionLog } from '../types';
import {
  formatMinutes,
  getDayLabel,
  getLastNDays,
  getLast12Months,
  getMonthLabel,
  getTodayKey,
} from '../utils/date';
import { getActionLogs } from '../utils/storage';

type Period = '1day' | '1week' | '1month' | '1year';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1day', label: '1日' },
  { key: '1week', label: '1週間' },
  { key: '1month', label: '1ヶ月' },
  { key: '1year', label: '1年' },
];

const STATUS_LABEL: Record<string, string> = {
  done: '✅ できた',
  partial: '🌓 少しできた',
  not_done: '😔 できなかった',
};

export default function TimeDashboardScreen() {
  const [period, setPeriod] = useState<Period>('1week');
  const [logs, setLogs] = useState<DailyActionLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      getActionLogs().then(setLogs);
    }, [])
  );

  const stats = computeStats(logs, period);
  const chartData = computeChartData(logs, period);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton />

        <View style={styles.header}>
          <Text style={styles.title}>⏱ 未来に使った時間</Text>
          <Text style={styles.subtitle}>行動に投資した時間を積み上げよう</Text>
        </View>

        {/* 期間タブ */}
        <View style={styles.tabs}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.tab, period === p.key && styles.tabActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, period === p.key && styles.tabLabelActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 集計カード */}
        <Card>
          {period === '1day' ? (
            <DayStats logs={logs} />
          ) : (
            <View style={styles.statsGrid}>
              <StatItem label="合計時間" value={formatMinutes(stats.totalMinutes)} />
              <StatItem label="平均時間" value={formatMinutes(stats.avgMinutes)} />
              <StatItem label="記録日数" value={`${stats.activeDays}日`} />
            </View>
          )}
        </Card>

        {/* 棒グラフ */}
        {period !== '1day' && (
          <Card>
            <Text style={styles.chartTitle}>
              {period === '1year' ? '月別' : '日別'}の行動時間
            </Text>
            <SimpleBarChart data={chartData} />
          </Card>
        )}

        {/* ログ一覧 */}
        <Card>
          <Text style={styles.listTitle}>記録一覧</Text>
          <LogList logs={getLogsForPeriod(logs, period)} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── サブコンポーネント ─────────────────────────────────────────

function DayStats({ logs }: { logs: DailyActionLog[] }) {
  const today = getTodayKey();
  const todayLog = logs.find((l) => l.date === today);

  if (!todayLog) {
    return (
      <View style={styles.noDataWrap}>
        <Text style={styles.noDataText}>今日の記録はまだありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.dayStats}>
      <Text style={styles.dayAction}>{todayLog.actionTitle}</Text>
      <View style={styles.dayRow}>
        <Text style={styles.dayLabel}>達成状況</Text>
        <Text style={styles.dayValue}>{STATUS_LABEL[todayLog.status]}</Text>
      </View>
      <View style={styles.dayRow}>
        <Text style={styles.dayLabel}>予定</Text>
        <Text style={styles.dayValue}>{formatMinutes(todayLog.plannedMinutes)}</Text>
      </View>
      <View style={styles.dayRow}>
        <Text style={styles.dayLabel}>実績</Text>
        <Text style={[styles.dayValue, { color: '#4A90E2', fontWeight: '700' }]}>
          {formatMinutes(todayLog.actualMinutes)}
        </Text>
      </View>
      <View style={styles.dayRow}>
        <Text style={styles.dayLabel}>スコア</Text>
        <Text style={styles.dayValue}>{todayLog.score}点</Text>
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LogList({ logs }: { logs: DailyActionLog[] }) {
  if (logs.length === 0) {
    return (
      <View style={styles.noDataWrap}>
        <Text style={styles.noDataText}>この期間の記録はありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.logList}>
      {logs.map((log) => (
        <View key={log.id} style={styles.logItem}>
          <View style={styles.logHeader}>
            <Text style={styles.logDate}>{formatDate(log.date)}</Text>
            <Text style={styles.logScore}>{log.score}点</Text>
          </View>
          <Text style={styles.logAction} numberOfLines={2}>
            {log.actionTitle}
          </Text>
          <View style={styles.logMeta}>
            <Text style={styles.logStatus}>{STATUS_LABEL[log.status]}</Text>
            <Text style={styles.logMinutes}>
              {formatMinutes(log.actualMinutes)}
              {log.plannedMinutes > 0 ? ` / 予定${formatMinutes(log.plannedMinutes)}` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── 集計ロジック ───────────────────────────────────────────────

function computeStats(
  logs: DailyActionLog[],
  period: Period
): { totalMinutes: number; avgMinutes: number; activeDays: number } {
  const filtered = getLogsForPeriod(logs, period);
  const totalMinutes = filtered.reduce((s, l) => s + l.actualMinutes, 0);
  const activeDays = filtered.filter((l) => l.actualMinutes > 0).length;
  const daysCount = filtered.length || 1;
  const avgMinutes = Math.round(totalMinutes / daysCount);
  return { totalMinutes, avgMinutes, activeDays };
}

function getLogsForPeriod(logs: DailyActionLog[], period: Period): DailyActionLog[] {
  if (period === '1day') {
    const today = getTodayKey();
    return logs.filter((l) => l.date === today);
  }
  if (period === '1week') {
    const days = new Set(getLastNDays(7));
    return logs.filter((l) => days.has(l.date));
  }
  if (period === '1month') {
    const days = new Set(getLastNDays(30));
    return logs.filter((l) => days.has(l.date));
  }
  // 1year
  const months = getLast12Months();
  return logs.filter((l) => months.some((m) => l.date.startsWith(m)));
}

function computeChartData(logs: DailyActionLog[], period: Period): BarChartItem[] {
  if (period === '1day') return [];

  if (period === '1week') {
    return getLastNDays(7).map((d) => ({
      label: getDayLabel(d),
      value: logs.find((l) => l.date === d)?.actualMinutes ?? 0,
    }));
  }

  if (period === '1month') {
    return getLastNDays(30).map((d) => {
      const day = parseInt(d.split('-')[2], 10);
      return {
        label: `${day}日`,
        value: logs.find((l) => l.date === d)?.actualMinutes ?? 0,
      };
    });
  }

  // 1year: monthly totals
  return getLast12Months().map((m) => ({
    label: getMonthLabel(m),
    value: logs
      .filter((l) => l.date.startsWith(m))
      .reduce((s, l) => s + l.actualMinutes, 0),
  }));
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

// ── スタイル ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FF' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  header: { gap: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#8A8A9A' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#EEEEF6',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#8A8A9A' },
  tabLabelActive: { color: '#4A90E2' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#4A90E2' },
  statLabel: { fontSize: 12, color: '#8A8A9A' },
  dayStats: { gap: 10 },
  dayAction: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', lineHeight: 24 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayLabel: { fontSize: 14, color: '#8A8A9A' },
  dayValue: { fontSize: 14, color: '#2C2C3E' },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#5A5A7A', marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#5A5A7A', marginBottom: 12 },
  noDataWrap: { paddingVertical: 16, alignItems: 'center' },
  noDataText: { fontSize: 14, color: '#A0A0B8' },
  logList: { gap: 12 },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F8',
    paddingBottom: 12,
    gap: 4,
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  logDate: { fontSize: 12, color: '#8A8A9A' },
  logScore: { fontSize: 12, fontWeight: '700', color: '#4A90E2' },
  logAction: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  logMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  logStatus: { fontSize: 12, color: '#5A5A7A' },
  logMinutes: { fontSize: 12, color: '#4A90E2', fontWeight: '600' },
});
