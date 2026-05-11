import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AiCoachCard } from '../../components/home/AiCoachCard';
import { ActionCard } from '../../components/home/ActionCard';
import type { ActionStatus } from '../../components/home/ResultButtons';
import { ResultButtons } from '../../components/home/ResultButtons';
import { StatsRow } from '../../components/home/StatsRow';
import { TimerWidget } from '../../components/home/TimerWidget';
import { VisionCard } from '../../components/home/VisionCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { CATEGORIES } from '../../constants/categories';
import { Colors, Radius, Spacing } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { createTodayAction } from '../../db/queries';
import { calcStreak } from '../../hooks/useStreak';
import { useTimer } from '../../hooks/useTimer';
import { formatDateJa, getTodayKey } from '../../lib/dateUtils';
import { useActionStore } from '../../store/actionStore';
import { useGoalStore } from '../../store/goalStore';
import { useRecordStore } from '../../store/recordStore';

const MINUTE_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function TodayHomeScreen() {
  const { goal, fetchGoal } = useGoalStore();
  const { todayAction, fetchTodayAction, updateTitle } = useActionStore();
  const { todayRecord, allRecords, fetchTodayRecord, fetchAllRecords } = useRecordStore();
  const timer = useTimer();

  const today = getTodayKey();

  // 簡易アクション入力の state
  const [showActionInput, setShowActionInput] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionMinutes, setActionMinutes] = useState(15);
  const [savingAction, setSavingAction] = useState(false);

  // フォーカス時にデータを再取得
  useFocusEffect(
    useCallback(() => {
      fetchGoal();
      fetchTodayAction(today);
      fetchTodayRecord(today);
      fetchAllRecords();
    }, [today])
  );

  const streak = calcStreak(allRecords);

  // カテゴリをパース（複数選択・後方互換対応）
  const parsedCategoryIds = (() => {
    if (!goal) return [];
    try {
      const p = JSON.parse(goal.category);
      return Array.isArray(p) ? p : [goal.category];
    } catch {
      return [goal.category];
    }
  })();
  const firstCat = CATEGORIES.find((c) => c.id === parsedCategoryIds[0]);
  const categoryEmoji = firstCat?.emoji ?? '⭐';
  const categoryLabel = parsedCategoryIds
    .map((id) => CATEGORIES.find((c) => c.id === id)?.label ?? id)
    .join(' / ');

  // アクションを保存（新規作成 or 既存更新）
  const handleSaveAction = async () => {
    if (!goal || !actionTitle.trim()) {
      Alert.alert('入力してください', '行動を入力してください');
      return;
    }
    setSavingAction(true);
    try {
      if (todayAction) {
        // 既存アクションのタイトル・時間を更新
        await updateTitle(todayAction.id, actionTitle.trim(), actionMinutes);
      } else {
        const now = new Date().toISOString();
        await createTodayAction({
          id: `action-${today}`,
          goalId: goal.id,
          date: today,
          title: actionTitle.trim(),
          targetMinutes: actionMinutes,
          createdAt: now,
        });
        await fetchTodayAction(today);
      }
      setShowActionInput(false);
      setActionTitle('');
      timer.reset();
    } catch (e) {
      console.error('Action save error:', e);
    } finally {
      setSavingAction(false);
    }
  };

  // 結果ボタンタップ → record モーダルへ遷移
  const handleResultSelect = (status: ActionStatus) => {
    router.push({
      pathname: '/record',
      params: {
        status,
        elapsed: String(timer.elapsed),
        actionId: todayAction?.id ?? '',
        actionTitle: todayAction?.title ?? '',
        date: today,
      },
    });
  };

  // 目標未設定
  if (!goal) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.noGoalContainer}>
          <Text style={styles.noGoalEmoji}>🎯</Text>
          <Text style={styles.noGoalTitle}>まず目標を設定しましょう</Text>
          <Text style={styles.noGoalHint}>叶えたい未来を決めることで{'\n'}毎日の行動が変わります</Text>
          <Button
            label="目標を設定する →"
            onPress={() => router.push('/(auth)/goal-setup')}
            style={styles.noGoalBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 挨拶 + ストリークバッジ */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>今日も一歩前へ 🌅</Text>
              <Text style={styles.date}>{formatDateJa(today)}</Text>
            </View>
            {streak.current > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 {streak.current}日</Text>
              </View>
            )}
          </View>

          {/* ビジョンカード */}
          <VisionCard
            vision={goal.vision}
            categoryEmoji={categoryEmoji}
            categoryLabel={categoryLabel}
            streakDays={streak.current}
          />

          {/* 今日のアクションカード */}
          {showActionInput ? (
            /* 行動入力フォーム（新規作成 or 変更） */
            <Card style={styles.actionFormCard}>
              <Text style={styles.inputSectionLabel}>
                {todayAction ? '行動を変更する' : '今日やる最低限の行動'}
              </Text>
              <TextInput
                style={styles.actionInput}
                placeholder="例：副業の企画を30分だけ書き出す"
                placeholderTextColor={Colors.primaryMid}
                value={actionTitle}
                onChangeText={setActionTitle}
                multiline
                textAlignVertical="top"
              />
              <Text style={[styles.inputSectionLabel, styles.minuteLabel]}>目標時間</Text>
              <View style={styles.chipWrap}>
                {MINUTE_OPTIONS.map((m) => (
                  <Chip
                    key={m}
                    label={`${m}分`}
                    selected={actionMinutes === m}
                    onPress={() => setActionMinutes(m)}
                  />
                ))}
              </View>
              <Button
                label={savingAction ? '保存中...' : (todayAction ? '行動を更新する →' : '今日はこれをやる！ →')}
                onPress={handleSaveAction}
                disabled={savingAction}
                loading={savingAction}
                style={styles.saveActionBtn}
              />
              {todayAction && (
                <TouchableOpacity
                  onPress={() => setShowActionInput(false)}
                  activeOpacity={0.7}
                  style={styles.cancelLink}
                >
                  <Text style={styles.cancelLinkText}>キャンセル</Text>
                </TouchableOpacity>
              )}
            </Card>
          ) : todayAction ? (
            /* アクションあり：通常表示 */
            <Card style={styles.actionSection}>
              <ActionCard
                title={todayAction.title}
                targetMinutes={todayAction.targetMinutes ?? 15}
                elapsedSeconds={timer.elapsed}
              />

              {/* タイマー */}
              {!todayRecord && (
                <TimerWidget
                  elapsed={timer.elapsed}
                  isRunning={timer.isRunning}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onReset={timer.reset}
                />
              )}

              {/* 記録済み表示 */}
              {todayRecord ? (
                <View style={styles.doneBox}>
                  <Text style={styles.doneText}>
                    ✅ 今日の記録は完了しています（
                    {Math.floor((todayRecord.elapsedSeconds ?? 0) / 60)}分）
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/record',
                        params: {
                          status: todayRecord.status,
                          elapsed: String(todayRecord.elapsedSeconds),
                          actionId: todayAction.id,
                          actionTitle: todayAction.title,
                          date: today,
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.updateLink}>振り返りを更新する →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* 結果ボタン */
                <ResultButtons onSelect={handleResultSelect} />
              )}

              {/* 行動変更リンク */}
              <TouchableOpacity
                onPress={() => {
                  setActionTitle(todayAction.title);
                  setActionMinutes(todayAction.targetMinutes ?? 15);
                  setShowActionInput(true);
                }}
                activeOpacity={0.7}
                style={styles.changeLink}
              >
                <Text style={styles.changeLinkText}>行動を変更する</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            /* アクション未設定 */
            <Card style={styles.noActionCard}>
              <Text style={styles.noActionEmoji}>⚡</Text>
              <Text style={styles.noActionTitle}>今日の最低限アクションを決めましょう</Text>
              <Text style={styles.noActionHint}>最小の一歩が未来を変えます</Text>
              <Button
                label="行動を決める →"
                onPress={() => setShowActionInput(true)}
                style={styles.noActionBtn}
              />
            </Card>
          )}

          {/* 今日の統計カード */}
          <StatsRow
            items={[
              { label: '連続', value: `${streak.current}日`, emoji: '🔥' },
              { label: '最長', value: `${streak.longest}日`, emoji: '🏆' },
              { label: '目標', value: `${goal.dailyMinutes}分`, emoji: '⏱' },
            ]}
          />

          {/* AIコーチカード */}
          {todayRecord?.aiCoachMsg ? (
            <AiCoachCard message={todayRecord.aiCoachMsg} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  date: { ...Typography.caption, marginTop: 2 },
  streakBadge: {
    backgroundColor: Colors.streak,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  streakBadgeText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  actionSection: { gap: Spacing.lg },
  actionFormCard: { gap: Spacing.sm },
  doneBox: {
    backgroundColor: '#F1FBF2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  doneText: { ...Typography.body, color: Colors.success, fontWeight: '600' },
  updateLink: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },
  changeLink: { alignItems: 'center', paddingTop: Spacing.xs },
  changeLinkText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  cancelLink: { alignItems: 'center', paddingTop: Spacing.xs },
  cancelLinkText: { ...Typography.caption, color: Colors.textMuted },

  noActionCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl },
  noActionEmoji: { fontSize: 48 },
  noActionTitle: { ...Typography.cardTitle, textAlign: 'center' },
  noActionHint: { ...Typography.caption, textAlign: 'center' },
  noActionBtn: { width: '100%', marginTop: Spacing.sm },

  inputSectionLabel: { ...Typography.cardTitle, marginBottom: Spacing.sm },
  minuteLabel: { marginTop: Spacing.md },
  actionInput: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 14,
    color: Colors.primaryDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 72,
    marginBottom: Spacing.sm,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  saveActionBtn: { marginTop: Spacing.lg },

  noGoalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.lg,
  },
  noGoalEmoji: { fontSize: 64 },
  noGoalTitle: { ...Typography.screenTitle, textAlign: 'center' },
  noGoalHint: { ...Typography.body, textAlign: 'center', lineHeight: 24 },
  noGoalBtn: { width: '100%', marginTop: Spacing.sm },
});
