import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Mood } from '../components/record/MoodSelector';
import { MoodSelector } from '../components/record/MoodSelector';
import { MemoInput } from '../components/record/MemoInput';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Colors, Radius, Spacing } from '../constants/colors';
import { Typography } from '../constants/typography';
import { updateStreak } from '../db/queries';
import { useAiCoach } from '../hooks/useAiCoach';
import { calcStreak } from '../hooks/useStreak';
import { formatSeconds, getTodayKey } from '../lib/dateUtils';
import { useGoalStore } from '../store/goalStore';
import { useRecordStore } from '../store/recordStore';
import { useSettingsStore } from '../store/settingsStore';

type RecordStatus = 'done' | 'partial' | 'failed';

const STATUS_OPTIONS: { value: RecordStatus; label: string; emoji: string; color: string }[] = [
  { value: 'done', label: 'できた', emoji: '✅', color: Colors.success },
  { value: 'partial', label: '一部できた', emoji: '🌓', color: Colors.warning },
  { value: 'failed', label: 'できなかった', emoji: '😔', color: Colors.danger },
];

export default function RecordScreen() {
  const params = useLocalSearchParams<{
    status: RecordStatus;
    elapsed: string;
    actionId: string;
    actionTitle: string;
    date: string;
  }>();

  const { goal } = useGoalStore();
  const { saveRecord, setAiCoachMsg, allRecords, todayRecord } = useRecordStore();
  const { aiCoachEnabled } = useSettingsStore();
  const { generate, loading: aiLoading } = useAiCoach();

  const today = params.date || getTodayKey();
  const initialElapsed = parseInt(params.elapsed ?? '0', 10);

  // 既存記録がある場合はプリフィル（振り返り更新フロー）
  const [status, setStatus] = useState<RecordStatus>(params.status ?? 'done');
  const [mood, setMood] = useState<Mood | null>((todayRecord?.mood as Mood) ?? null);
  const [memo, setMemo] = useState(todayRecord?.memo ?? '');
  const [nextAction, setNextAction] = useState(todayRecord?.nextAction ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!params.actionId) {
      Alert.alert('エラー', 'アクション情報が見つかりません');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const newRecordId = `rec-${today}-${Date.now()}`;

      // 1. 記録を保存。更新の場合は既存IDが返される
      const actualRecordId = await saveRecord({
        id: newRecordId,
        actionId: params.actionId,
        date: today,
        elapsedSeconds: initialElapsed,
        status,
        mood: mood ?? 'normal',
        memo: memo.trim(),
        nextAction: nextAction.trim(),
        aiCoachMsg: null,
        createdAt: now,
      });

      // 2. ストリーク更新
      const isSuccess = status === 'done' || status === 'partial';
      await updateStreak(today, isSuccess);

      // 3. AIコーチメッセージを生成（設定ON かつ goal あり）
      if (aiCoachEnabled && goal) {
        const streak = calcStreak(allRecords);
        const msg = await generate({
          vision: goal.vision,
          actionTitle: params.actionTitle || params.actionId,
          elapsedMinutes: Math.floor(initialElapsed / 60),
          status,
          streakDays: streak.current,
          mood: mood ?? 'normal',
        });
        if (msg) {
          await setAiCoachMsg(actualRecordId, msg);
        }
      }

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Record save error:', e);
      Alert.alert('保存エラー', '記録の保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ハンドルバー */}
          <View style={styles.handle} />

          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.title}>今日の記録</Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* アクション名 */}
          {params.actionTitle ? (
            <Card>
              <Text style={styles.actionTitleLabel}>今日のアクション</Text>
              <Text style={styles.actionTitleText}>{params.actionTitle}</Text>
            </Card>
          ) : null}

          {/* 実行時間 */}
          <Card>
            <View style={styles.elapsedRow}>
              <Text style={styles.elapsedLabel}>実行時間</Text>
              <Text style={styles.elapsedValue}>{formatSeconds(initialElapsed)}</Text>
            </View>
          </Card>

          {/* 達成状態 */}
          <Card style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>達成状態</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusBtn,
                    status === opt.value && {
                      backgroundColor: opt.color,
                      borderColor: opt.color,
                    },
                  ]}
                  onPress={() => setStatus(opt.value)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.statusEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      status === opt.value && styles.statusLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* 気分 */}
          <Card style={styles.fieldCard}>
            <MoodSelector value={mood} onChange={setMood} />
          </Card>

          {/* メモ */}
          <Card style={styles.fieldCard}>
            <MemoInput
              label="ひとことメモ"
              placeholder="今日の気づき、工夫したことなど（任意）"
              value={memo}
              onChangeText={setMemo}
              maxLength={200}
            />
          </Card>

          {/* 明日の改善アクション */}
          <Card style={styles.fieldCard}>
            <MemoInput
              label="明日の改善アクション"
              placeholder="例：朝7時に起きてすぐ30分だけやる（任意）"
              value={nextAction}
              onChangeText={setNextAction}
              maxLength={200}
            />
          </Card>

          {/* 保存ボタン */}
          <Button
            label={
              saving
                ? aiLoading
                  ? '🤖 AIコーチが考え中...'
                  : '保存中...'
                : '記録を保存する →'
            }
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            style={styles.saveBtn}
          />
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
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...Typography.screenTitle },
  closeBtn: { fontSize: 20, color: Colors.textMuted },
  actionTitleLabel: { ...Typography.label, marginBottom: 4 },
  actionTitleText: { ...Typography.cardTitle },
  elapsedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  elapsedLabel: { ...Typography.cardTitle },
  elapsedValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  fieldCard: { gap: Spacing.md },
  fieldLabel: { ...Typography.cardTitle },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  statusEmoji: { fontSize: 22 },
  statusLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  statusLabelActive: { color: '#FFFFFF' },
  saveBtn: { marginTop: Spacing.sm },
});
