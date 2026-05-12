import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { BarChartWeekly } from '../../components/report/BarChartWeekly';
import { CalendarHeatmap } from '../../components/report/CalendarHeatmap';
import { TabSelector } from '../../components/report/TabSelector';
import { AiCoachCard } from '../../components/home/AiCoachCard';
import { Card } from '../../components/ui/Card';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { calcStreak } from '../../hooks/useStreak';
import {
  formatMinutes,
  getDayLabel,
  getLastNDays,
  getCurrentMonthDays,
  groupDaysByWeek,
  getCurrentYearMonths,
  getMonthLabel,
  getCurrentMonthTitle,
  getCurrentYearTitle,
  getTodayKey,
  formatDateJa,
} from '../../lib/dateUtils';
import { useActionStore } from '../../store/actionStore';
import { useRecordStore } from '../../store/recordStore';

type PeriodTab = 'day' | 'week' | 'month' | 'year';

const TABS = [
  { key: 'day', label: '日' },
  { key: 'week', label: '週' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
];

const STATUS_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  done: { label: 'できた', emoji: '✅', color: Colors.success },
  partial: { label: '一部できた', emoji: '🌓', color: Colors.warning },
  failed: { label: 'できなかった', emoji: '😔', color: Colors.danger },
};

const MOOD_MAP: Record<string, { label: string; emoji: string }> = {
  good: { label: '良い', emoji: '😊' },
  normal: { label: '普通', emoji: '😐' },
  bad: { label: '悪い', emoji: '😔' },
};

export default function ReportScreen() {
  const [activeTab, setActiveTab] = useState<PeriodTab>('week');
  const { allRecords, fetchAllRecords } = useRecordStore();
  const { todayAction, fetchTodayAction } = useActionStore();

  const todayStr = getTodayKey();

  useFocusEffect(
    useCallback(() => {
      fetchAllRecords();
      fetchTodayAction(todayStr);
    }, [todayStr])
  );

  const streak = calcStreak(allRecords);

  // ── 日タブ用データ ──────────────────────────────────────
  const todayRec = allRecords.find((r) => r.date === todayStr) ?? null;

  // ── 週タブ用データ ──────────────────────────────────────
  const last7 = getLastNDays(7);
  const weekData = last7.map((date) => {
    const rec = allRecords.find((r) => r.date === date);
    return { label: getDayLabel(date), minutes: rec ? Math.floor((rec.elapsedSeconds ?? 0) / 60) : 0 };
  });
  const weekRecords = allRecords.filter((r) => last7.includes(r.date));
  const totalMinutesWeek = weekRecords.reduce((s, r) => s + Math.floor((r.elapsedSeconds ?? 0) / 60), 0);
  const activeDaysWeek = weekRecords.filter((r) => (r.elapsedSeconds ?? 0) > 0).length;
  const doneCountWeek = weekRecords.filter((r) => r.status === 'done' || r.status === 'partial').length;
  const achieveRateWeek = weekRecords.length > 0 ? Math.round((doneCountWeek / weekRecords.length) * 100) : 0;
  const last30 = getLastNDays(30);
  const calendarDays = last30.map((date) => {
    const rec = allRecords.find((r) => r.date === date);
    return { date, status: rec ? (rec.status as 'done' | 'partial' | 'failed') : ('empty' as const) };
  });

  // ── 月タブ用データ ──────────────────────────────────────
  const monthDays = getCurrentMonthDays();
  const monthWeekGroups = groupDaysByWeek(monthDays);
  const monthWeekData = monthWeekGroups.map((grp) => ({
    label: grp.label,
    minutes: grp.dates.reduce((sum, d) => {
      const rec = allRecords.find((r) => r.date === d);
      return sum + Math.floor((rec?.elapsedSeconds ?? 0) / 60);
    }, 0),
  }));
  const monthRecords = allRecords.filter((r) => monthDays.includes(r.date));
  const totalMinutesMonth = monthRecords.reduce((s, r) => s + Math.floor((r.elapsedSeconds ?? 0) / 60), 0);
  const activeDaysMonth = monthRecords.filter((r) => (r.elapsedSeconds ?? 0) > 0).length;
  const doneCountMonth = monthRecords.filter((r) => r.status === 'done' || r.status === 'partial').length;
  const achieveRateMonth = monthRecords.length > 0 ? Math.round((doneCountMonth / monthRecords.length) * 100) : 0;
  const monthCalendarDays = monthDays.map((date) => {
    const rec = allRecords.find((r) => r.date === date);
    return { date, status: rec ? (rec.status as 'done' | 'partial' | 'failed') : ('empty' as const) };
  });

  // ── 年タブ用データ ──────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const yearMonths = getCurrentYearMonths();
  const yearMonthData = yearMonths.map((ym) => ({
    label: getMonthLabel(ym),
    minutes: allRecords
      .filter((r) => r.date.startsWith(ym))
      .reduce((sum, r) => sum + Math.floor((r.elapsedSeconds ?? 0) / 60), 0),
  }));
  const yearRecords = allRecords.filter((r) => r.date.startsWith(String(currentYear)));
  const totalMinutesYear = yearRecords.reduce((s, r) => s + Math.floor((r.elapsedSeconds ?? 0) / 60), 0);
  const activeDaysYear = yearRecords.filter((r) => (r.elapsedSeconds ?? 0) > 0).length;
  const doneCountYear = yearRecords.filter((r) => r.status === 'done' || r.status === 'partial').length;
  const achieveRateYear = yearRecords.length > 0 ? Math.round((doneCountYear / yearRecords.length) * 100) : 0;
  const bestMonthEntry = yearMonthData.reduce(
    (best, cur) => (cur.minutes > best.minutes ? cur : best),
    { label: '-', minutes: 0 }
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>レポート</Text>

        <TabSelector tabs={TABS} activeKey={activeTab} onSelect={(k) => setActiveTab(k as PeriodTab)} />

        {/* ── 日タブ ────────────────────────────────────── */}
        {activeTab === 'day' && (
          <>
            <View style={styles.periodHeader}>
              <Text style={styles.periodTitle}>{formatDateJa(todayStr)}</Text>
            </View>

            {todayAction && (
              <Card>
                <Text style={styles.sectionLabel}>今日のアクション</Text>
                <Text style={styles.actionTitle}>{todayAction.title}</Text>
              </Card>
            )}

            {todayRec ? (
              <>
                {/* ステータス */}
                <Card style={styles.statusCard}>
                  {(() => {
                    const s = STATUS_MAP[todayRec.status];
                    return (
                      <View style={[styles.statusBadge, { backgroundColor: s?.color + '20' }]}>
                        <Text style={styles.statusEmoji}>{s?.emoji ?? '❓'}</Text>
                        <Text style={[styles.statusLabel, { color: s?.color ?? Colors.textMuted }]}>
                          {s?.label ?? todayRec.status}
                        </Text>
                      </View>
                    );
                  })()}
                </Card>

                {/* 時間 + 気分 */}
                <View style={styles.rowCards}>
                  <Card style={styles.halfCard}>
                    <Text style={styles.sectionLabel}>実行時間</Text>
                    <Text style={styles.bigValue}>
                      {formatMinutes(todayRec.elapsedSeconds ?? 0)}
                    </Text>
                  </Card>
                  {todayRec.mood && (
                    <Card style={styles.halfCard}>
                      <Text style={styles.sectionLabel}>気分</Text>
                      <Text style={styles.moodEmoji}>
                        {MOOD_MAP[todayRec.mood]?.emoji ?? '😐'}
                      </Text>
                      <Text style={styles.moodLabel}>
                        {MOOD_MAP[todayRec.mood]?.label ?? todayRec.mood}
                      </Text>
                    </Card>
                  )}
                </View>

                {/* メモ */}
                {todayRec.memo ? (
                  <Card>
                    <Text style={styles.sectionLabel}>メモ</Text>
                    <Text style={styles.bodyText}>{todayRec.memo}</Text>
                  </Card>
                ) : null}

                {/* 明日のアクション */}
                {todayRec.nextAction ? (
                  <Card>
                    <Text style={styles.sectionLabel}>明日の改善アクション</Text>
                    <Text style={styles.bodyText}>{todayRec.nextAction}</Text>
                  </Card>
                ) : null}

                {/* AIコーチ */}
                {todayRec.aiCoachMsg ? <AiCoachCard message={todayRec.aiCoachMsg} /> : null}
              </>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyTitle}>今日の記録はまだありません</Text>
                <Text style={styles.emptyHint}>
                  アクションを完了したら記録を残しましょう
                </Text>
              </Card>
            )}
          </>
        )}

        {/* ── 週タブ ────────────────────────────────────── */}
        {activeTab === 'week' && (
          <>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>今週のサマリー</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem label="達成日数" value={`${activeDaysWeek}日`} emoji="📅" />
                <SummaryItem label="累計時間" value={`${totalMinutesWeek}分`} emoji="⏱" />
                <SummaryItem label="達成率" value={`${achieveRateWeek}%`} emoji="🎯" />
                <SummaryItem label="連続日数" value={`${streak.current}日`} emoji="🔥" />
              </View>
            </Card>

            <Card>
              <Text style={styles.chartTitle}>曜日別の実施時間（分）</Text>
              <BarChartWeekly data={weekData} />
            </Card>

            <Card>
              <Text style={styles.chartTitle}>直近30日の記録</Text>
              <CalendarHeatmap days={calendarDays} />
            </Card>
          </>
        )}

        {/* ── 月タブ ────────────────────────────────────── */}
        {activeTab === 'month' && (
          <>
            <View style={styles.periodHeader}>
              <Text style={styles.periodTitle}>{getCurrentMonthTitle()}</Text>
            </View>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>今月のサマリー</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem label="達成日数" value={`${activeDaysMonth}日`} emoji="📅" />
                <SummaryItem label="累計時間" value={`${totalMinutesMonth}分`} emoji="⏱" />
                <SummaryItem label="達成率" value={`${achieveRateMonth}%`} emoji="🎯" />
                <SummaryItem label="連続日数" value={`${streak.current}日`} emoji="🔥" />
              </View>
            </Card>

            <Card>
              <Text style={styles.chartTitle}>週別の実施時間（分）</Text>
              <BarChartWeekly data={monthWeekData} />
            </Card>

            <Card>
              <Text style={styles.chartTitle}>今月の記録</Text>
              <CalendarHeatmap days={monthCalendarDays} />
            </Card>
          </>
        )}

        {/* ── 年タブ ────────────────────────────────────── */}
        {activeTab === 'year' && (
          <>
            <View style={styles.periodHeader}>
              <Text style={styles.periodTitle}>{getCurrentYearTitle()}</Text>
            </View>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>今年のサマリー</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem label="達成日数" value={`${activeDaysYear}日`} emoji="📅" />
                <SummaryItem label="累計時間" value={`${totalMinutesYear}分`} emoji="⏱" />
                <SummaryItem label="達成率" value={`${achieveRateYear}%`} emoji="🎯" />
                <SummaryItem label="最多月" value={bestMonthEntry.label} emoji="🏆" />
              </View>
            </Card>

            <Card>
              <Text style={styles.chartTitle}>月別の実施時間（分）</Text>
              <BarChartWeekly data={yearMonthData} />
            </Card>

            <Card style={styles.streakCard}>
              <View style={styles.streakRow}>
                <View style={styles.streakItem}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakValue}>{streak.current}日</Text>
                  <Text style={styles.streakLabel}>現在の連続</Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakItem}>
                  <Text style={styles.streakEmoji}>🏆</Text>
                  <Text style={styles.streakValue}>{streak.longest}日</Text>
                  <Text style={styles.streakLabel}>最長記録</Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakItem}>
                  <Text style={styles.streakEmoji}>📅</Text>
                  <Text style={styles.streakValue}>{activeDaysYear}日</Text>
                  <Text style={styles.streakLabel}>今年の実施日</Text>
                </View>
              </View>
            </Card>
          </>
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

  periodHeader: { alignItems: 'center' },
  periodTitle: { ...Typography.cardTitle, fontSize: 17, color: Colors.primaryDark },

  summaryCard: { gap: Spacing.md },
  summaryTitle: { ...Typography.cardTitle },
  summaryGrid: { flexDirection: 'row', gap: Spacing.sm },
  chartTitle: { ...Typography.cardTitle, marginBottom: Spacing.sm },

  // 日タブ
  statusCard: { alignItems: 'center', paddingVertical: Spacing.md },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
  },
  statusEmoji: { fontSize: 28 },
  statusLabel: { fontSize: 18, fontWeight: '700' },
  rowCards: { flexDirection: 'row', gap: Spacing.md },
  halfCard: { flex: 1, gap: 4, alignItems: 'center' },
  sectionLabel: { ...Typography.label },
  bigValue: { ...Typography.bigNumber, fontSize: 22 },
  moodEmoji: { fontSize: 28 },
  moodLabel: { ...Typography.caption, fontWeight: '600' },
  bodyText: { ...Typography.body, lineHeight: 22 },
  actionTitle: { ...Typography.cardTitle, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...Typography.cardTitle, textAlign: 'center' },
  emptyHint: { ...Typography.caption, textAlign: 'center' },

  // 年タブ ストリークカード
  streakCard: { gap: Spacing.md },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  streakItem: { flex: 1, alignItems: 'center', gap: 4 },
  streakEmoji: { fontSize: 22 },
  streakValue: { ...Typography.bigNumber, fontSize: 22 },
  streakLabel: { ...Typography.caption },
  streakDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.border,
  },
});
